import { createHmac, randomUUID } from "node:crypto";

type ProductLine = "management" | "academy" | "shop";
type ConsentState =
  | "marketing_opt_in"
  | "transactional_only"
  | "withdrawn"
  | "unknown";

export type MarketingEventEnvelope = {
  sourceApp: "equiprofile.online";
  productLine: ProductLine;
  eventType: string;
  entityType: string;
  entityId: string;
  publicUrl: string;
  timestamp: string;
  consentState: ConsentState;
  idempotencyKey: string;
  payloadVersion: "1.0";
  payload: Record<string, unknown>;
};

export type MarketingPublishResult =
  | { delivered: true; statusCode: number; nonce: string }
  | {
      delivered: false;
      reason:
        | "CONSENT_NOT_GRANTED"
        | "DELIVERY_DISABLED"
        | "INVALID_EVENT"
        | "DELIVERY_FAILED";
      detail: string;
    };

const EVENT_ALLOW_LIST: Record<
  ProductLine,
  Record<string, { entityType: string; payloadKeys: readonly string[] }>
> = {
  management: {},
  academy: {
    academy_public_plans_viewed: {
      entityType: "plan_catalogue",
      payloadKeys: ["planIds", "currency"],
    },
    academy_pathway_catalogue_viewed: {
      entityType: "pathway",
      payloadKeys: ["pathwaySlug", "pathwayTitle", "level"],
    },
    academy_pricing_viewed: {
      entityType: "pricing",
      payloadKeys: ["planId", "pricePence", "currency", "billingInterval"],
    },
    academy_registration_completed: {
      entityType: "account_registration",
      payloadKeys: ["registrationSurface", "planInterest"],
    },
    academy_plan_purchase_completed: {
      entityType: "plan_purchase",
      payloadKeys: ["planId", "currency", "purchaseState"],
    },
  },
  shop: {
    shop_approved_product_published: {
      entityType: "product",
      payloadKeys: [
        "slug",
        "title",
        "brand",
        "canonicalPricePence",
        "currency",
        "availabilityStatus",
        "imageUrl",
      ],
    },
    shop_product_availability_changed: {
      entityType: "product",
      payloadKeys: [
        "slug",
        "availabilityStatus",
        "canonicalPricePence",
        "currency",
      ],
    },
    shop_product_viewed: {
      entityType: "product",
      payloadKeys: ["slug", "categorySlugs"],
    },
    shop_checkout_started: {
      entityType: "checkout",
      payloadKeys: ["currency", "itemCount", "subtotalPence"],
    },
    shop_order_paid: {
      entityType: "order",
      payloadKeys: [
        "orderNumber",
        "currency",
        "totalPence",
        "itemCount",
        "purchaseState",
      ],
    },
  },
};

const PROHIBITED_KEY =
  /(?:email|address|phone|password|token|secret|card|payment|stripe|supplier(?:cost|agreement|key|account)?|progress|competenc|feedback|tutor|health|medical|vet(?:erinary)?|insurance|refund|chargeback|session|jwt|ip(?:address)?)/i;

function validateHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isPrimitiveOrPrimitiveArray(value: unknown): boolean {
  if (value === null) return true;
  if (["string", "number", "boolean"].includes(typeof value)) return true;
  return (
    Array.isArray(value) &&
    value.every((item) => ["string", "number", "boolean"].includes(typeof item))
  );
}

function validateEnvelope(envelope: MarketingEventEnvelope): string | null {
  if (envelope.sourceApp !== "equiprofile.online")
    return "Unexpected source application.";
  if (!validateHttpsUrl(envelope.publicUrl))
    return "Public URL must use HTTPS.";
  if (!envelope.entityId || !envelope.idempotencyKey) {
    return "Entity and idempotency identifiers are required.";
  }
  if (Number.isNaN(Date.parse(envelope.timestamp)))
    return "Timestamp must be ISO-8601 compatible.";
  const event = EVENT_ALLOW_LIST[envelope.productLine]?.[envelope.eventType];
  if (!event) return "Event is not allow-listed for this product line.";
  if (event.entityType !== envelope.entityType)
    return "Event entity type does not match the contract.";
  for (const [key, value] of Object.entries(envelope.payload)) {
    if (!event.payloadKeys.includes(key) || PROHIBITED_KEY.test(key)) {
      return "Payload contains an unapproved or restricted field.";
    }
    if (!isPrimitiveOrPrimitiveArray(value)) {
      return "Payload values must be primitive values or arrays of primitive values.";
    }
  }
  return null;
}

function marketingConfig() {
  return {
    endpoint: process.env.MARKETING_CONNECTOR_URL?.trim() ?? "",
    signingSecret: process.env.MARKETING_CONNECTOR_SIGNING_SECRET ?? "",
    timeoutMs: Math.min(
      Math.max(Number(process.env.MARKETING_CONNECTOR_TIMEOUT_MS ?? 3000), 250),
      10_000,
    ),
  };
}

/**
 * Publish one consented, allow-listed Core event. This function never throws for
 * remote configuration or delivery errors: Core transactions must complete even
 * when the future standalone Marketing service is unavailable.
 */
export async function publishMarketingEvent(
  envelope: MarketingEventEnvelope,
): Promise<MarketingPublishResult> {
  if (envelope.consentState !== "marketing_opt_in") {
    return {
      delivered: false,
      reason: "CONSENT_NOT_GRANTED",
      detail: "Marketing consent is not granted for this event.",
    };
  }
  const validationError = validateEnvelope(envelope);
  if (validationError) {
    return {
      delivered: false,
      reason: "INVALID_EVENT",
      detail: validationError,
    };
  }

  const { endpoint, signingSecret, timeoutMs } = marketingConfig();
  if (!endpoint || !signingSecret || !validateHttpsUrl(endpoint)) {
    return {
      delivered: false,
      reason: "DELIVERY_DISABLED",
      detail:
        "Marketing connector endpoint or signing credential is not configured.",
    };
  }

  const nonce = randomUUID();
  const body = JSON.stringify(envelope);
  const signature = createHmac("sha256", signingSecret)
    .update(`${envelope.timestamp}.${nonce}.${body}`)
    .digest("hex");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-EquiProfile-Signature": `sha256=${signature}`,
        "X-EquiProfile-Timestamp": envelope.timestamp,
        "X-EquiProfile-Nonce": nonce,
        "Idempotency-Key": envelope.idempotencyKey,
      },
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      return {
        delivered: false,
        reason: "DELIVERY_FAILED",
        detail: `Marketing connector returned HTTP ${response.status}.`,
      };
    }
    return { delivered: true, statusCode: response.status, nonce };
  } catch {
    return {
      delivered: false,
      reason: "DELIVERY_FAILED",
      detail: "Marketing connector could not be reached.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const MARKETING_EVENT_ALLOW_LIST = EVENT_ALLOW_LIST;
