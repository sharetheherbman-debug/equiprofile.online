import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  adminUnlockedProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import { getDb } from "./db";
import { getStripe } from "./stripe";
import {
  calculateCartTotals,
  isSellableInventory,
  type CartPriceLine,
} from "./commerce/domain";
import {
  enrichCandidateCopy,
  isDuplicateCandidate,
  normaliseSupplierCandidate,
  priceCandidate,
  scoreCandidate,
} from "./commerce/productManager";

type Rows<T> = [T[], unknown];
const asRows = <T>(result: unknown) => (result as Rows<T>)[0];

async function activeCartId(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
  await db.execute(
    sql`INSERT INTO commerceCarts (userId, currency, status) VALUES (${userId}, 'GBP', 'active') ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP`,
  );
  const rows = asRows<{ id: number }>(
    await db.execute(
      sql`SELECT id FROM commerceCarts WHERE userId = ${userId} AND status = 'active' LIMIT 1`,
    ),
  );
  if (!rows[0])
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not create a cart",
    });
  return rows[0].id;
}

async function audit(
  actorType: "system" | "user" | "ai",
  actorUserId: number | null,
  entityType: string,
  entityId: string,
  action: string,
  details: unknown,
) {
  const db = await getDb();
  if (!db) return;
  await db.execute(
    sql`INSERT INTO commerceAuditLog (actorType, actorUserId, entityType, entityId, action, detailsJson) VALUES (${actorType}, ${actorUserId}, ${entityType}, ${entityId}, ${action}, ${JSON.stringify(details)})`,
  );
}

export const commerceRouter = router({
  catalogue: publicProcedure
    .input(
      z
        .object({
          query: z.string().max(100).optional(),
          category: z.string().max(150).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const term = `%${input?.query?.trim() ?? ""}%`;
      return asRows(
        await db.execute(sql`
        SELECT DISTINCT p.id, p.slug, p.title, p.description, p.brand, p.retailPricePence, p.salePricePence, p.availabilityStatus
        FROM commerceProducts p
        LEFT JOIN commerceProductCategories pc ON pc.productId = p.id
        LEFT JOIN commerceCategories c ON c.id = pc.categoryId
        WHERE p.status = 'published' AND p.developmentOnly = FALSE AND p.isArchived = FALSE
          AND (p.title LIKE ${term} OR p.brand LIKE ${term})
          AND (${input?.category ?? ""} = '' OR c.slug = ${input?.category ?? ""})
        ORDER BY p.createdAt DESC
        LIMIT 48
      `),
      );
    }),

  categories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    return asRows(
      await db.execute(
        sql`SELECT slug, name, description, parentId FROM commerceCategories WHERE isActive = TRUE ORDER BY sortOrder, name`,
      ),
    );
  }),

  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const cartId = await activeCartId(ctx.user.id);
      return asRows(
        await db.execute(sql`
        SELECT ci.id, ci.quantity, pv.id AS variantId, pv.sku, pv.title AS variantTitle, p.title AS productTitle,
          COALESCE(pv.salePricePence, p.salePricePence, pv.retailPricePence, p.retailPricePence) AS unitPricePence,
          p.availabilityStatus, si.freshUntil
        FROM commerceCartItems ci
        JOIN commerceProductVariants pv ON pv.id = ci.variantId
        JOIN commerceProducts p ON p.id = pv.productId
        LEFT JOIN commerceSupplierProducts sp ON sp.variantId = pv.id
        LEFT JOIN commerceSupplierInventory si ON si.supplierProductId = sp.id
        WHERE ci.cartId = ${cartId}
        ORDER BY ci.createdAt DESC
      `),
      );
    }),
    add: protectedProcedure
      .input(
        z.object({
          variantId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
        const eligible = asRows<{
          id: number;
          isActive: number;
          status: string;
          developmentOnly: number;
          isArchived: number;
          availabilityStatus:
            | "in_stock"
            | "low_stock"
            | "on_order"
            | "stale"
            | "unavailable";
          freshUntil: Date | null;
        }>(
          await db.execute(sql`
        SELECT pv.id, pv.isActive, p.status, p.developmentOnly, p.isArchived,
          COALESCE(si.availabilityStatus, 'unavailable') AS availabilityStatus, si.freshUntil
        FROM commerceProductVariants pv
        JOIN commerceProducts p ON p.id = pv.productId
        LEFT JOIN commerceSupplierProducts sp ON sp.variantId = pv.id
        LEFT JOIN commerceSupplierInventory si ON si.supplierProductId = sp.id
        WHERE pv.id = ${input.variantId} LIMIT 1
      `),
        )[0];
        if (
          !eligible ||
          !eligible.isActive ||
          eligible.status !== "published" ||
          eligible.developmentOnly ||
          eligible.isArchived ||
          !isSellableInventory({
            availabilityStatus: eligible.availabilityStatus,
            freshUntil: eligible.freshUntil
              ? new Date(eligible.freshUntil)
              : null,
          })
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "This product variant is unavailable or has stale supplier stock.",
          });
        }
        const cartId = await activeCartId(ctx.user.id);
        await db.execute(
          sql`INSERT INTO commerceCartItems (cartId, variantId, quantity) VALUES (${cartId}, ${input.variantId}, ${input.quantity}) ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), 20), updatedAt = CURRENT_TIMESTAMP`,
        );
        await audit("user", ctx.user.id, "cart", String(cartId), "item_added", {
          variantId: input.variantId,
          quantity: input.quantity,
        });
        return { success: true };
      }),
    setQuantity: protectedProcedure
      .input(
        z.object({
          itemId: z.number().int().positive(),
          quantity: z.number().int().min(0).max(20),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
        const cartId = await activeCartId(ctx.user.id);
        if (input.quantity === 0)
          await db.execute(
            sql`DELETE FROM commerceCartItems WHERE id = ${input.itemId} AND cartId = ${cartId}`,
          );
        else
          await db.execute(
            sql`UPDATE commerceCartItems SET quantity = ${input.quantity}, updatedAt = CURRENT_TIMESTAMP WHERE id = ${input.itemId} AND cartId = ${cartId}`,
          );
        return { success: true };
      }),
  }),

  checkout: protectedProcedure
    .input(z.object({ idempotencyKey: z.string().min(12).max(160) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const existing = asRows<{
        id: number;
        orderNumber: string;
        status: string;
      }>(
        await db.execute(
          sql`SELECT id, orderNumber, status FROM commerceOrders WHERE userId = ${ctx.user.id} AND idempotencyKey = ${input.idempotencyKey} LIMIT 1`,
        ),
      );
      if (existing[0])
        return {
          order: existing[0],
          idempotent: true,
          paymentConfigurationRequired: true,
        };
      const cartId = await activeCartId(ctx.user.id);
      const rows = asRows<any>(
        await db.execute(sql`
      SELECT ci.quantity, pv.id AS variantId, pv.sku, pv.title AS variantTitle, p.title AS productTitle, p.vatRateBasisPoints,
        COALESCE(pv.retailPricePence, p.retailPricePence) AS retailPricePence,
        COALESCE(pv.salePricePence, p.salePricePence) AS salePricePence,
        COALESCE(si.availabilityStatus, 'unavailable') AS availabilityStatus, si.freshUntil, sp.supplierId
      FROM commerceCartItems ci JOIN commerceProductVariants pv ON pv.id = ci.variantId JOIN commerceProducts p ON p.id = pv.productId
      LEFT JOIN commerceSupplierProducts sp ON sp.variantId = pv.id LEFT JOIN commerceSupplierInventory si ON si.supplierProductId = sp.id
      WHERE ci.cartId = ${cartId} AND p.status = 'published' AND p.developmentOnly = FALSE AND p.isArchived = FALSE AND pv.isActive = TRUE
    `),
      );
      if (rows.length === 0)
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Your cart has no checkout-eligible items.",
        });
      let totals;
      try {
        totals = calculateCartTotals(
          rows.map(
            (row: any): CartPriceLine => ({
              ...row,
              freshUntil: row.freshUntil ? new Date(row.freshUntil) : null,
            }),
          ),
          0,
        );
      } catch (error) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            error instanceof Error ? error.message : "Cart validation failed",
        });
      }
      const orderNumber = `EPS-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;
      await db.execute(
        sql`INSERT INTO commerceOrders (orderNumber, userId, status, currency, subtotalPence, shippingPence, vatPence, totalPence, idempotencyKey) VALUES (${orderNumber}, ${ctx.user.id}, 'checkout_pending', 'GBP', ${totals.subtotalPence}, ${totals.shippingPence}, ${totals.vatPence}, ${totals.totalPence}, ${input.idempotencyKey})`,
      );
      const order = asRows<{ id: number }>(
        await db.execute(
          sql`SELECT id FROM commerceOrders WHERE idempotencyKey = ${input.idempotencyKey} LIMIT 1`,
        ),
      )[0];
      for (const row of rows)
        await db.execute(
          sql`INSERT INTO commerceOrderItems (orderId, variantId, titleSnapshot, skuSnapshot, quantity, unitPricePence, vatPence, supplierId) VALUES (${order.id}, ${row.variantId}, ${`${row.productTitle} — ${row.variantTitle}`}, ${row.sku}, ${row.quantity}, ${row.salePricePence ?? row.retailPricePence}, ${Math.round(((row.salePricePence ?? row.retailPricePence) * row.quantity * row.vatRateBasisPoints) / 10000)}, ${row.supplierId ?? null})`,
        );
      await audit(
        "user",
        ctx.user.id,
        "order",
        String(order.id),
        "checkout_prepared",
        totals,
      );
      const storeStripeEnabled = process.env.ENABLE_STORE_STRIPE === "true";
      const stripe = storeStripeEnabled ? getStripe() : null;
      if (!stripe) {
        return {
          orderNumber,
          totals,
          idempotent: false,
          paymentConfigurationRequired: true,
          checkoutUrl: null,
        };
      }
      const publicBaseUrl = (
        process.env.STORE_PUBLIC_URL ?? "https://shop.equiprofile.online"
      ).replace(/\/$/, "");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: String(order.id),
        metadata: {
          commerceScope: "store",
          orderId: String(order.id),
          orderNumber,
        },
        success_url: `${publicBaseUrl}/?store_checkout=success&order=${encodeURIComponent(orderNumber)}`,
        cancel_url: `${publicBaseUrl}/?store_checkout=cancelled&order=${encodeURIComponent(orderNumber)}`,
        line_items: rows.map((row: any) => ({
          quantity: row.quantity,
          price_data: {
            currency: "gbp",
            unit_amount: row.salePricePence ?? row.retailPricePence,
            product_data: { name: `${row.productTitle} — ${row.variantTitle}` },
          },
        })),
      });
      await db.execute(
        sql`UPDATE commerceOrders SET status = 'payment_pending', storePaymentStatus = 'pending', storePaymentReference = ${session.payment_intent ? String(session.payment_intent) : null} WHERE id = ${order.id}`,
      );
      await audit(
        "system",
        null,
        "order",
        String(order.id),
        "store_checkout_session_created",
        { stripeSessionId: session.id },
      );
      return {
        orderNumber,
        totals,
        idempotent: false,
        paymentConfigurationRequired: false,
        checkoutUrl: session.url,
      };
    }),

  product: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const product = asRows<any>(
        await db.execute(
          sql`SELECT id, slug, title, description, brand, retailPricePence, salePricePence, availabilityStatus FROM commerceProducts WHERE slug = ${input.slug} AND status = 'published' AND developmentOnly = FALSE AND isArchived = FALSE LIMIT 1`,
        ),
      )[0];
      if (!product)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      const [variants, images, attributes] = await Promise.all([
        asRows(
          await db.execute(
            sql`SELECT id, sku, title, attributesJson, retailPricePence, salePricePence FROM commerceProductVariants WHERE productId = ${product.id} AND isActive = TRUE ORDER BY id`,
          ),
        ),
        asRows(
          await db.execute(
            sql`SELECT storageUrl, altText, sortOrder FROM commerceProductImages WHERE productId = ${product.id} AND rightsStatus = 'licensed' ORDER BY sortOrder`,
          ),
        ),
        asRows(
          await db.execute(
            sql`SELECT attributeName, attributeValue FROM commerceProductAttributes WHERE productId = ${product.id} AND sourceType != 'generated' ORDER BY attributeName`,
          ),
        ),
      ]);
      return { ...product, variants, images, attributes };
    }),

  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return asRows(
        await db.execute(
          sql`SELECT id, fullName, line1, line2, city, postcode, countryCode, phone FROM commerceAddresses WHERE userId = ${ctx.user.id} ORDER BY updatedAt DESC`,
        ),
      );
    }),
    save: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(2).max(200),
          line1: z.string().min(2).max(250),
          line2: z.string().max(250).optional(),
          city: z.string().min(2).max(120),
          postcode: z.string().min(2).max(32),
          countryCode: z.string().length(2),
          phone: z.string().max(64).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
        await db.execute(
          sql`INSERT INTO commerceAddresses (userId, fullName, line1, line2, city, postcode, countryCode, phone) VALUES (${ctx.user.id}, ${input.fullName}, ${input.line1}, ${input.line2 ?? null}, ${input.city}, ${input.postcode}, ${input.countryCode.toUpperCase()}, ${input.phone ?? null})`,
        );
        await audit(
          "user",
          ctx.user.id,
          "address",
          String(ctx.user.id),
          "saved",
          { countryCode: input.countryCode.toUpperCase() },
        );
        return { success: true };
      }),
  }),

  orders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    return asRows(
      await db.execute(
        sql`SELECT id, orderNumber, status, totalPence, currency, createdAt FROM commerceOrders WHERE userId = ${ctx.user.id} ORDER BY createdAt DESC`,
      ),
    );
  }),

  orderDetail: protectedProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const order = asRows<any>(
        await db.execute(
          sql`SELECT id, orderNumber, status, subtotalPence, shippingPence, vatPence, totalPence, currency, createdAt FROM commerceOrders WHERE id = ${input.orderId} AND userId = ${ctx.user.id} LIMIT 1`,
        ),
      )[0];
      if (!order)
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      const [items, shipments, returns] = await Promise.all([
        asRows(
          await db.execute(
            sql`SELECT titleSnapshot, skuSnapshot, quantity, unitPricePence, vatPence, fulfilmentStatus FROM commerceOrderItems WHERE orderId = ${order.id}`,
          ),
        ),
        asRows(
          await db.execute(
            sql`SELECT id, status, carrier, trackingReference, estimatedDeliveryAt, dispatchedAt, deliveredAt FROM commerceShipments WHERE orderId = ${order.id}`,
          ),
        ),
        asRows(
          await db.execute(
            sql`SELECT id, status, reason, requestedAt FROM commerceReturns WHERE orderId = ${order.id} AND userId = ${ctx.user.id}`,
          ),
        ),
      ]);
      return { ...order, items, shipments, returns };
    }),

  requestReturn: protectedProcedure
    .input(
      z.object({
        orderId: z.number().int().positive(),
        reason: z.string().min(5).max(2000),
        items: z
          .array(
            z.object({
              orderItemId: z.number().int().positive(),
              quantity: z.number().int().min(1).max(20),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const owned = asRows<{ id: number }>(
        await db.execute(
          sql`SELECT id FROM commerceOrders WHERE id = ${input.orderId} AND userId = ${ctx.user.id} LIMIT 1`,
        ),
      )[0];
      if (!owned)
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      await db.execute(
        sql`INSERT INTO commerceReturns (orderId, userId, reason) VALUES (${input.orderId}, ${ctx.user.id}, ${input.reason})`,
      );
      const returnRow = asRows<{ id: number }>(
        await db.execute(
          sql`SELECT id FROM commerceReturns WHERE orderId = ${input.orderId} AND userId = ${ctx.user.id} ORDER BY id DESC LIMIT 1`,
        ),
      )[0];
      for (const item of input.items) {
        const valid = asRows<{ id: number }>(
          await db.execute(
            sql`SELECT id FROM commerceOrderItems WHERE id = ${item.orderItemId} AND orderId = ${input.orderId} LIMIT 1`,
          ),
        )[0];
        if (!valid)
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "A return item does not belong to this order",
          });
        await db.execute(
          sql`INSERT INTO commerceReturnItems (returnId, orderItemId, quantity) VALUES (${returnRow.id}, ${item.orderItemId}, ${item.quantity})`,
        );
      }
      await audit(
        "user",
        ctx.user.id,
        "return",
        String(returnRow.id),
        "requested",
        { orderId: input.orderId },
      );
      return { id: returnRow.id, status: "requested" };
    }),

  admin: router({
    dashboard: adminUnlockedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const metrics = asRows<any>(
        await db.execute(
          sql`SELECT COUNT(*) AS orderCount, COALESCE(SUM(CASE WHEN status IN ('paid','acknowledged','processing','partially_fulfilled','fulfilled','dispatched','delivered') THEN totalPence ELSE 0 END), 0) AS realisedRevenuePence, COALESCE(SUM(CASE WHEN status IN ('checkout_pending','payment_pending') THEN 1 ELSE 0 END), 0) AS pendingOrderCount FROM commerceOrders`,
        ),
      )[0];
      return {
        ...metrics,
        supplierMode: "NOT_CONFIGURED",
        note: "All values derive from persisted Commerce records; no supplier is active.",
      };
    }),
    createSyntheticCandidate: adminUnlockedProcedure.mutation(
      async ({ ctx }) => {
        if (process.env.NODE_ENV === "production")
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Synthetic supplier data is disabled in production.",
          });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
        await db.execute(
          sql`INSERT INTO commerceSuppliers (slug, name, status, fulfilmentModel, imageRightsStatus) VALUES ('synthetic-development', 'Synthetic Development Supplier', 'not_configured', 'supplier_direct', 'review_required') ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        );
        const supplier = asRows<{ id: number }>(
          await db.execute(
            sql`SELECT id FROM commerceSuppliers WHERE slug = 'synthetic-development' LIMIT 1`,
          ),
        )[0];
        const slug = `development-haynet-${nanoid(6).toLowerCase()}`;
        await db.execute(
          sql`INSERT INTO commerceProducts (slug, title, description, status, retailPricePence, vatRateBasisPoints, availabilityStatus, imageRightsStatus, factualProvenanceJson, developmentOnly) VALUES (${slug}, 'Synthetic development haynet', 'Synthetic non-commercial product used solely to verify the governed catalogue pipeline.', 'review_required', 1899, 2000, 'in_stock', 'review_required', ${JSON.stringify({ source: "synthetic-development", factual: false })}, TRUE)`,
        );
        const product = asRows<{ id: number }>(
          await db.execute(
            sql`SELECT id FROM commerceProducts WHERE slug = ${slug} LIMIT 1`,
          ),
        )[0];
        const sku = `DEV-${nanoid(8).toUpperCase()}`;
        await db.execute(
          sql`INSERT INTO commerceProductVariants (productId, sku, title, attributesJson) VALUES (${product.id}, ${sku}, 'Standard', '{}')`,
        );
        const variant = asRows<{ id: number }>(
          await db.execute(
            sql`SELECT id FROM commerceProductVariants WHERE sku = ${sku} LIMIT 1`,
          ),
        )[0];
        await db.execute(
          sql`INSERT INTO commerceSupplierProducts (supplierId, productId, variantId, supplierSku, sourcePayloadJson, supplierCostPence) VALUES (${supplier.id}, ${product.id}, ${variant.id}, ${sku}, ${JSON.stringify({ synthetic: true })}, 900)`,
        );
        await db.execute(
          sql`INSERT INTO commerceProductApprovals (productId, status, proposedBy, reason) VALUES (${product.id}, 'pending', 'system', 'Synthetic development candidate requires human approval and remains non-public.')`,
        );
        await audit(
          "system",
          ctx.user.id,
          "product",
          String(product.id),
          "synthetic_candidate_created",
          { developmentOnly: true },
        );
        return {
          productId: product.id,
          status: "review_required",
          publicCatalogueVisible: false,
        };
      },
    ),
    proposeProduct: adminUnlockedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
        const source = asRows<any>(
          await db.execute(sql`
          SELECT p.id, p.title, p.description, p.brand, sp.supplierSku, sp.supplierCostPence,
            si.availabilityStatus, si.sourceUpdatedAt
          FROM commerceProducts p
          JOIN commerceSupplierProducts sp ON sp.productId = p.id
          LEFT JOIN commerceSupplierInventory si ON si.supplierProductId = sp.id
          WHERE p.id = ${input.productId} LIMIT 1
        `),
        )[0];
        if (!source)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Supplier-backed product candidate not found",
          });
        const candidate = normaliseSupplierCandidate({
          supplierSku: source.supplierSku,
          title: source.title,
          factualDescription: source.description,
          brand: source.brand,
          supplierCostPence: source.supplierCostPence,
          availabilityStatus: source.availabilityStatus ?? "unavailable",
          sourceUpdatedAt: source.sourceUpdatedAt
            ? new Date(source.sourceUpdatedAt)
            : new Date(0),
        });
        const existing = asRows<any>(
          await db.execute(
            sql`SELECT supplierSku, ean, title FROM commerceSupplierProducts sp JOIN commerceProducts p ON p.id = sp.productId WHERE p.id != ${input.productId} LIMIT 500`,
          ),
        );
        const duplicate = isDuplicateCandidate(candidate, existing);
        const score = scoreCandidate(candidate, duplicate);
        const pricing = priceCandidate(candidate, null, {
          targetGrossMarginBasisPoints: 4000,
          minimumGrossMarginBasisPoints: 2500,
          minimumAbsoluteProfitPence: 300,
          maxAutomaticMovementBasisPoints: 1000,
        });
        const enrichment = await enrichCandidateCopy(candidate);
        await db.execute(
          sql`INSERT INTO commerceProductManagerActions (productId, actionType, actorType, status, inputJson, outputJson) VALUES (${input.productId}, 'propose', 'ai', 'completed', ${JSON.stringify(candidate)}, ${JSON.stringify({ duplicate, score, pricing, enrichmentStatus: enrichment.status })})`,
        );
        await audit(
          "ai",
          ctx.user.id,
          "product",
          String(input.productId),
          "proposal_generated",
          {
            duplicate,
            score: score.total,
            needsHumanReview: pricing.needsHumanReview,
            enrichmentStatus: enrichment.status,
          },
        );
        return {
          candidate,
          duplicate,
          score,
          pricing,
          enrichment,
          humanApprovalRequired: true,
        };
      }),
    approveProduct: adminUnlockedProcedure
      .input(
        z.object({
          productId: z.number().int().positive(),
          approve: z.boolean(),
          reason: z.string().min(3).max(1000),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
        const status = input.approve ? "approved" : "rejected";
        await db.execute(
          sql`UPDATE commerceProductApprovals SET status = ${status}, reviewedByUserId = ${ctx.user.id}, reason = ${input.reason}, reviewedAt = CURRENT_TIMESTAMP WHERE productId = ${input.productId} AND status = 'pending'`,
        );
        if (input.approve)
          await db.execute(
            sql`UPDATE commerceProducts SET status = 'published' WHERE id = ${input.productId}`,
          );
        await audit(
          "user",
          ctx.user.id,
          "product",
          String(input.productId),
          input.approve ? "approved" : "rejected",
          { reason: input.reason, developmentOnlyRemainsExcluded: true },
        );
        return { success: true, publicCatalogueVisible: false };
      }),
  }),
});
