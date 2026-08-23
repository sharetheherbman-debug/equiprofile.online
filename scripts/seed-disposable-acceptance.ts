/*
 * Disposable local acceptance seed.
 *
 * This script is deliberately fail-closed: it will run only with an explicit
 * DISPOSABLE_ACCEPTANCE=1 opt-in and a localhost database whose name contains
 * "acceptance". It is for synthetic test evidence only—never for a deployed
 * environment, never for real customer data, and never for provider payments.
 */
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

const requiredFlag = process.env.DISPOSABLE_ACCEPTANCE;
const databaseUrl = process.env.DATABASE_URL;

if (requiredFlag !== "1" || !databaseUrl) {
  throw new Error(
    "Refusing to seed. Set DISPOSABLE_ACCEPTANCE=1 and a disposable local DATABASE_URL.",
  );
}

const parsedUrl = new URL(databaseUrl);
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const databaseName = parsedUrl.pathname.replace(/^\//, "");
if (!localHosts.has(parsedUrl.hostname) || !/acceptance/i.test(databaseName)) {
  throw new Error(
    "Refusing to seed. DATABASE_URL must target localhost and a database name containing 'acceptance'.",
  );
}

const fixturePrefix = "EQA_LOCAL_ACCEPTANCE";
const fixturePassword = "DisposableAcceptanceOnly!2026";
const now = new Date();

const accounts = [
  {
    key: "admin",
    email: "admin.acceptance@equiprofile.local",
    name: "Disposable Commerce Administrator",
    role: "admin",
    preferences: { fixture: fixturePrefix },
  },
  {
    key: "owner",
    email: "owner.acceptance@equiprofile.local",
    name: "Disposable Academy Owner",
    role: "user",
    // `school_owner` is a retained database compatibility value; Academy is
    // the public product term. This exercises the real owner authorization path.
    preferences: { planTier: "school_owner", fixture: fixturePrefix },
  },
  {
    key: "teacher",
    email: "teacher.acceptance@equiprofile.local",
    name: "Disposable Academy Teacher",
    role: "user",
    preferences: { selectedExperience: "teacher", fixture: fixturePrefix },
  },
  {
    key: "student",
    email: "student.acceptance@equiprofile.local",
    name: "Disposable Academy Student",
    role: "user",
    preferences: { selectedExperience: "student", fixture: fixturePrefix },
  },
] as const;

async function getId(
  connection: mysql.Connection,
  sql: string,
  params: readonly unknown[],
): Promise<number> {
  const [rows] = await connection.execute(sql, params);
  const row = (rows as Array<{ id: number }>)[0];
  if (!row?.id) {
    throw new Error(`Expected a generated fixture identifier for: ${sql}`);
  }
  return row.id;
}

async function main() {
  const connection = await mysql.createConnection(databaseUrl);
  try {
    await connection.beginTransaction();

    const userIds = new Map<string, number>();
    for (const account of accounts) {
      const passwordHash = await bcrypt.hash(fixturePassword, 10);
      const openId = `${fixturePrefix}_${account.key}`.slice(0, 64);
      await connection.execute(
        `INSERT INTO users (
          openId, name, email, loginMethod, role, passwordHash, emailVerified,
          isActive, isSuspended, preferences, createdAt, updatedAt, lastSignedIn
        ) VALUES (?, ?, ?, 'password', ?, ?, TRUE, TRUE, FALSE, ?, NOW(), NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), role = VALUES(role), passwordHash = VALUES(passwordHash),
          emailVerified = TRUE, isActive = TRUE, isSuspended = FALSE,
          preferences = VALUES(preferences), updatedAt = NOW()`,
        [
          openId,
          account.name,
          account.email,
          account.role,
          passwordHash,
          JSON.stringify(account.preferences),
        ],
      );
      const userId = await getId(
        connection,
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [account.email],
      );
      userIds.set(account.key, userId);
    }

    const ownerId = userIds.get("owner")!;
    const teacherId = userIds.get("teacher")!;
    const studentId = userIds.get("student")!;
    const adminId = userIds.get("admin")!;

    await connection.execute(
      `INSERT INTO organizations (
        ownerId, name, description, planTier, maxStudents, maxTeachers, isActive,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, 'school_20', 20, 5, TRUE, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        description = VALUES(description), maxStudents = VALUES(maxStudents),
        maxTeachers = VALUES(maxTeachers), isActive = TRUE, updatedAt = NOW()`,
      [
        ownerId,
        "Disposable Acceptance Academy",
        "Synthetic local-only organisation for authenticated Academy acceptance checks.",
      ],
    );
    const organizationId = await getId(
      connection,
      "SELECT id FROM organizations WHERE ownerId = ? AND name = ? LIMIT 1",
      [ownerId, "Disposable Acceptance Academy"],
    );

    for (const [userId, memberRole] of [
      [ownerId, "school_owner"],
      [teacherId, "teacher"],
      [studentId, "student"],
    ] as const) {
      await connection.execute(
        `INSERT INTO organizationMembers (organizationId, userId, role, joinedAt)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [organizationId, userId, memberRole],
      );
    }

    const supplierSlug = "eqp-local-acceptance-supplier";
    await connection.execute(
      `INSERT INTO commerceSuppliers (
        slug, name, status, fulfilmentModel, imageRightsStatus, configurationJson,
        createdAt, updatedAt
      ) VALUES (?, ?, 'active', 'supplier_direct', 'licensed', ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name), status = VALUES(status),
        imageRightsStatus = VALUES(imageRightsStatus), configurationJson = VALUES(configurationJson),
        updatedAt = NOW()`,
      [
        supplierSlug,
        "Disposable Acceptance Supplier",
        JSON.stringify({
          fixture: fixturePrefix,
          note: "Synthetic local-only source; no external account, catalogue, credentials, or order routing.",
        }),
      ],
    );
    const supplierId = await getId(
      connection,
      "SELECT id FROM commerceSuppliers WHERE slug = ? LIMIT 1",
      [supplierSlug],
    );

    await connection.execute(
      `INSERT INTO commerceSupplierSources (
        supplierId, sourceType, sourceName, sourceUrl, isEnabled, createdAt
      ) VALUES (?, 'synthetic', ?, NULL, FALSE, NOW())
      ON DUPLICATE KEY UPDATE sourceName = VALUES(sourceName), isEnabled = FALSE`,
      [supplierId, "Disposable local acceptance fixture"],
    );

    const categorySlug = "disposable-acceptance";
    await connection.execute(
      `INSERT INTO commerceCategories (slug, name, description, sortOrder, isActive)
       VALUES (?, ?, ?, 9999, TRUE)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), isActive = TRUE`,
      [
        categorySlug,
        "Disposable Acceptance",
        "Synthetic local-only category used for regression evidence. Never seed this outside the guarded acceptance database.",
      ],
    );
    const categoryId = await getId(
      connection,
      "SELECT id FROM commerceCategories WHERE slug = ? LIMIT 1",
      [categorySlug],
    );

    const productSlug = "disposable-acceptance-grooming-kit";
    const factualProvenance = JSON.stringify({
      fixture: fixturePrefix,
      source: "locally authored acceptance data",
      factualClaims: "No performance, health, or safety claims.",
      generatedAt: now.toISOString(),
    });
    await connection.execute(
      `INSERT INTO commerceProducts (
        slug, title, description, status, brand, retailPricePence, vatRateBasisPoints,
        availabilityStatus, imageRightsStatus, factualProvenanceJson, generatedCopyJson,
        developmentOnly, isArchived, createdAt, updatedAt
      ) VALUES (?, ?, ?, 'published', ?, 2499, 2000, 'in_stock', 'licensed', ?, NULL, FALSE, FALSE, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title), description = VALUES(description), status = 'published',
        availabilityStatus = 'in_stock', imageRightsStatus = 'licensed',
        factualProvenanceJson = VALUES(factualProvenanceJson), developmentOnly = FALSE,
        isArchived = FALSE, updatedAt = NOW()`,
      [
        productSlug,
        "Disposable Acceptance Grooming Kit",
        "Synthetic local-only acceptance fixture used to verify catalogue, product, cart, and admin flows. This record is not a real product and cannot trigger fulfilment or payment.",
        "EquiProfile local acceptance",
        factualProvenance,
      ],
    );
    const productId = await getId(
      connection,
      "SELECT id FROM commerceProducts WHERE slug = ? LIMIT 1",
      [productSlug],
    );

    await connection.execute(
      `INSERT INTO commerceProductCategories (productId, categoryId) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE categoryId = VALUES(categoryId)`,
      [productId, categoryId],
    );

    const sku = "EQA-LOCAL-GROOM-001";
    await connection.execute(
      `INSERT INTO commerceProductVariants (
        productId, sku, ean, title, attributesJson, retailPricePence, salePricePence, isActive
      ) VALUES (?, ?, NULL, ?, ?, 2499, NULL, TRUE)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title), attributesJson = VALUES(attributesJson), retailPricePence = 2499,
        salePricePence = NULL, isActive = TRUE`,
      [
        productId,
        sku,
        "Disposable Acceptance Grooming Kit",
        JSON.stringify({ fixture: true, size: "acceptance fixture" }),
      ],
    );
    const variantId = await getId(
      connection,
      "SELECT id FROM commerceProductVariants WHERE sku = ? LIMIT 1",
      [sku],
    );

    const imageUrl =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%230f1d2e'/%3E%3Ctext x='400' y='285' text-anchor='middle' fill='%23c5a55a' font-family='serif' font-size='38'%3EDisposable%20Acceptance%3C/text%3E%3Ctext x='400' y='335' text-anchor='middle' fill='white' font-family='sans-serif' font-size='24'%3ELocal-only%20fixture%3C/text%3E%3C/svg%3E";
    await connection.execute(
      `INSERT INTO commerceProductImages (
        productId, variantId, storageUrl, altText, sortOrder, rightsStatus, provenanceJson, sourceUpdatedAt
      ) VALUES (?, ?, ?, ?, 0, 'licensed', ?, NOW())
      ON DUPLICATE KEY UPDATE storageUrl = VALUES(storageUrl), altText = VALUES(altText),
        rightsStatus = 'licensed', provenanceJson = VALUES(provenanceJson), sourceUpdatedAt = NOW()`,
      [
        productId,
        variantId,
        imageUrl,
        "Graphic identifying a disposable local acceptance fixture",
        JSON.stringify({
          fixture: fixturePrefix,
          rights: "locally authored test SVG",
          licensed: true,
        }),
      ],
    );

    await connection.execute(
      `INSERT INTO commerceProductAttributes (
        productId, variantId, attributeName, attributeValue, sourceType, provenanceJson
      ) VALUES (?, ?, 'Fixture status', 'Local acceptance only', 'merchant', ?)
      ON DUPLICATE KEY UPDATE attributeValue = VALUES(attributeValue), provenanceJson = VALUES(provenanceJson)`,
      [productId, variantId, JSON.stringify({ fixture: fixturePrefix })],
    );

    const supplierSku = "EQA-SUPPLIER-GROOM-001";
    await connection.execute(
      `INSERT INTO commerceSupplierProducts (
        supplierId, productId, variantId, supplierSku, sourcePayloadJson, supplierCostPence,
        rrpPence, leadTimeDays, sourceUpdatedAt
      ) VALUES (?, ?, ?, ?, ?, 1500, 2499, 2, NOW())
      ON DUPLICATE KEY UPDATE
        productId = VALUES(productId), variantId = VALUES(variantId), sourcePayloadJson = VALUES(sourcePayloadJson),
        supplierCostPence = 1500, rrpPence = 2499, leadTimeDays = 2, sourceUpdatedAt = NOW()`,
      [
        supplierId,
        productId,
        variantId,
        supplierSku,
        JSON.stringify({ fixture: fixturePrefix }),
      ],
    );
    const supplierProductId = await getId(
      connection,
      "SELECT id FROM commerceSupplierProducts WHERE supplierId = ? AND supplierSku = ? LIMIT 1",
      [supplierId, supplierSku],
    );

    await connection.execute(
      `INSERT INTO commerceSupplierInventory (
        supplierProductId, quantity, availabilityStatus, stockUpdatedAt, freshUntil
      ) VALUES (?, 12, 'in_stock', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))
      ON DUPLICATE KEY UPDATE quantity = 12, availabilityStatus = 'in_stock',
        stockUpdatedAt = NOW(), freshUntil = DATE_ADD(NOW(), INTERVAL 1 DAY)`,
      [supplierProductId],
    );

    await connection.execute(
      `INSERT INTO commerceProductApprovals (
        productId, status, proposedBy, reviewedByUserId, reason, reviewedAt
      ) VALUES (?, 'approved', 'system', ?, ?, NOW())
      ON DUPLICATE KEY UPDATE status = 'approved', reviewedByUserId = VALUES(reviewedByUserId),
        reason = VALUES(reason), reviewedAt = NOW()`,
      [
        productId,
        adminId,
        "Synthetic disposable-local acceptance fixture. This is not a supplier or merchant production approval.",
      ],
    );

    await connection.execute(
      `INSERT INTO commerceAddresses (userId, fullName, line1, city, postcode, countryCode, phone)
       SELECT ?, 'Disposable Acceptance Student', '1 Local Test Lane', 'Testville', 'TE5 7AA', 'GB', NULL
       WHERE NOT EXISTS (
         SELECT 1 FROM commerceAddresses WHERE userId = ? AND line1 = '1 Local Test Lane'
       )`,
      [studentId, studentId],
    );
    const addressId = await getId(
      connection,
      "SELECT id FROM commerceAddresses WHERE userId = ? AND line1 = '1 Local Test Lane' LIMIT 1",
      [studentId],
    );

    await connection.execute(
      `INSERT INTO commerceOrders (
        orderNumber, userId, status, currency, subtotalPence, shippingPence, vatPence,
        totalPence, idempotencyKey, shippingAddressId, billingAddressId, storePaymentStatus,
        storePaymentReference
      ) VALUES (?, ?, 'delivered', 'GBP', 2499, 0, 0, 2499, ?, ?, ?, 'paid', NULL)
      ON DUPLICATE KEY UPDATE status = 'delivered', storePaymentStatus = 'paid', updatedAt = NOW()`,
      [
        "EQA-LOCAL-ORDER-001",
        studentId,
        `${fixturePrefix}_ORDER_001`,
        addressId,
        addressId,
      ],
    );
    const orderId = await getId(
      connection,
      "SELECT id FROM commerceOrders WHERE orderNumber = ? LIMIT 1",
      ["EQA-LOCAL-ORDER-001"],
    );

    await connection.execute(
      `INSERT INTO commerceOrderItems (
        orderId, variantId, titleSnapshot, skuSnapshot, quantity, unitPricePence, vatPence,
        supplierId, fulfilmentStatus
      ) VALUES (?, ?, ?, ?, 1, 2499, 0, ?, 'delivered')
      ON DUPLICATE KEY UPDATE fulfilmentStatus = 'delivered'`,
      [
        orderId,
        variantId,
        "Disposable Acceptance Grooming Kit",
        sku,
        supplierId,
      ],
    );
    const orderItemId = await getId(
      connection,
      "SELECT id FROM commerceOrderItems WHERE orderId = ? AND variantId = ? LIMIT 1",
      [orderId, variantId],
    );

    await connection.execute(
      `INSERT INTO commerceShipments (
        orderId, supplierId, status, carrier, trackingReference, leadTimeDays,
        estimatedDeliveryAt, dispatchedAt, deliveredAt
      ) VALUES (?, ?, 'delivered', 'Local acceptance carrier', 'EQA-LOCAL-TRACK-001', 2,
        DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW())
      ON DUPLICATE KEY UPDATE status = 'delivered', deliveredAt = NOW(), updatedAt = NOW()`,
      [orderId, supplierId],
    );
    const shipmentId = await getId(
      connection,
      "SELECT id FROM commerceShipments WHERE orderId = ? LIMIT 1",
      [orderId],
    );

    await connection.execute(
      `INSERT INTO commerceShipmentItems (shipmentId, orderItemId, quantity) VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE quantity = 1`,
      [shipmentId, orderItemId],
    );
    await connection.execute(
      `INSERT INTO commerceTrackingEvents (
        shipmentId, eventCode, eventDescription, eventAt, source
      ) VALUES (?, 'delivered', 'Synthetic local-only delivery event for acceptance evidence.', NOW(), 'disposable_acceptance')`,
      [shipmentId],
    );

    await connection.execute(
      `INSERT INTO commerceAuditLog (actorType, actorUserId, entityType, entityId, action, detailsJson)
       VALUES ('system', ?, 'acceptance_fixture', ?, 'seeded', ?)`,
      [
        adminId,
        fixturePrefix,
        JSON.stringify({ fixture: true, database: databaseName }),
      ],
    );

    await connection.commit();
    console.log(
      JSON.stringify(
        {
          status: "seeded",
          database: databaseName,
          fixturePrefix,
          accountEmails: accounts.map((account) => account.email),
          password: fixturePassword,
          organizationId,
          productId,
          orderId,
          note: "Synthetic local-only acceptance data. No provider calls, payment credentials, supplier credentials, or production records were used.",
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

void main();
