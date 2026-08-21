import { afterEach, describe, expect, it, vi } from "vitest";
import {
  publishMarketingEvent,
  type MarketingEventEnvelope,
} from "./_core/marketingPublisher";

const validEvent: MarketingEventEnvelope = {
  sourceApp: "equiprofile.online",
  productLine: "academy",
  eventType: "academy_pricing_viewed",
  entityType: "pricing",
  entityId: "academy-10-monthly",
  publicUrl: "https://academy.equiprofile.online/academy/pricing",
  timestamp: "2026-08-21T12:00:00.000Z",
  consentState: "marketing_opt_in",
  idempotencyKey: "academy-pricing-viewed-test-001",
  payloadVersion: "1.0",
  payload: {
    planId: "academy_10",
    pricePence: 4900,
    currency: "GBP",
    billingInterval: "monthly",
  },
};

afterEach(() => {
  delete process.env.MARKETING_CONNECTOR_URL;
  delete process.env.MARKETING_CONNECTOR_SIGNING_SECRET;
  delete process.env.MARKETING_CONNECTOR_TIMEOUT_MS;
  vi.unstubAllGlobals();
});

describe("Core Marketing publisher", () => {
  it("does not emit an event without explicit marketing consent", async () => {
    const result = await publishMarketingEvent({
      ...validEvent,
      consentState: "transactional_only",
    });

    expect(result).toEqual({
      delivered: false,
      reason: "CONSENT_NOT_GRANTED",
      detail: "Marketing consent is not granted for this event.",
    });
  });

  it("rejects restricted or unknown payload fields before remote delivery", async () => {
    const result = await publishMarketingEvent({
      ...validEvent,
      payload: { ...validEvent.payload, email: "person@example.com" },
    });

    expect(result.delivered).toBe(false);
    if (!result.delivered) expect(result.reason).toBe("INVALID_EVENT");
  });

  it("fails safely when the connector has not been configured", async () => {
    const result = await publishMarketingEvent(validEvent);

    expect(result.delivered).toBe(false);
    if (!result.delivered) expect(result.reason).toBe("DELIVERY_DISABLED");
  });

  it("signs a timestamped, nonce-protected request with an idempotency header", async () => {
    process.env.MARKETING_CONNECTOR_URL = "https://marketing.example/ingest";
    process.env.MARKETING_CONNECTOR_SIGNING_SECRET = "test-signing-secret";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishMarketingEvent(validEvent);

    expect(result.delivered).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = request.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe(validEvent.idempotencyKey);
    expect(headers["X-EquiProfile-Timestamp"]).toBe(validEvent.timestamp);
    expect(headers["X-EquiProfile-Nonce"]).toMatch(/^[0-9a-f-]{36}$/i);
    expect(headers["X-EquiProfile-Signature"]).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("contains a remote failure so Core operations are not interrupted", async () => {
    process.env.MARKETING_CONNECTOR_URL = "https://marketing.example/ingest";
    process.env.MARKETING_CONNECTOR_SIGNING_SECRET = "test-signing-secret";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const result = await publishMarketingEvent(validEvent);

    expect(result).toEqual({
      delivered: false,
      reason: "DELIVERY_FAILED",
      detail: "Marketing connector could not be reached.",
    });
  });
});
