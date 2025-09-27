import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  name = 'CreateInitialTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gin"`);

    // Create user_roles table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "description" text,
        "permissions" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("id")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "username" character varying(100) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "phone" character varying(20),
        "roleId" uuid NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastLogin" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create manufacturers table
    await queryRunner.query(`
      CREATE TABLE "manufacturers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "country" character varying(100),
        "website" character varying(255),
        "contactEmail" character varying(255),
        "contactPhone" character varying(20),
        "logoUrl" character varying(500),
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_manufacturers" PRIMARY KEY ("id")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "parentId" uuid,
        "slug" character varying(255) NOT NULL,
        "imageUrl" character varying(500),
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Create parts table
    await queryRunner.query(`
      CREATE TABLE "parts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "partNumber" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "manufacturerId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "cost" numeric(10,2),
        "weight" numeric(8,3),
        "dimensions" jsonb,
        "specifications" jsonb,
        "images" jsonb,
        "stockQuantity" integer NOT NULL DEFAULT '0',
        "minStockLevel" integer NOT NULL DEFAULT '0',
        "maxStockLevel" integer,
        "isActive" boolean NOT NULL DEFAULT true,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "tags" text array DEFAULT '{}',
        "createdById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_parts" PRIMARY KEY ("id")
      )
    `);

    // Create vehicle_models table
    await queryRunner.query(`
      CREATE TABLE "vehicle_models" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "make" character varying(100) NOT NULL,
        "model" character varying(100) NOT NULL,
        "yearStart" integer NOT NULL,
        "yearEnd" integer,
        "engineType" character varying(100),
        "engineSize" character varying(50),
        "fuelType" character varying(50),
        "transmissionType" character varying(50),
        "bodyType" character varying(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vehicle_models" PRIMARY KEY ("id")
      )
    `);

    // Create part_vehicle_compatibility table
    await queryRunner.query(`
      CREATE TABLE "part_vehicle_compatibility" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "partId" uuid NOT NULL,
        "vehicleModelId" uuid NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_part_vehicle_compatibility" UNIQUE ("partId", "vehicleModelId"),
        CONSTRAINT "PK_part_vehicle_compatibility" PRIMARY KEY ("id")
      )
    `);

    // Create order_statuses table
    await queryRunner.query(`
      CREATE TABLE "order_statuses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_order_statuses_name" UNIQUE ("name"),
        CONSTRAINT "PK_order_statuses" PRIMARY KEY ("id")
      )
    `);

    // Create payment_statuses table
    await queryRunner.query(`
      CREATE TABLE "payment_statuses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_payment_statuses_name" UNIQUE ("name"),
        CONSTRAINT "PK_payment_statuses" PRIMARY KEY ("id")
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderNumber" character varying(50) NOT NULL,
        "userId" uuid NOT NULL,
        "statusId" uuid NOT NULL,
        "totalAmount" numeric(10,2) NOT NULL,
        "shippingAddress" jsonb NOT NULL,
        "billingAddress" jsonb,
        "paymentMethod" character varying(50),
        "paymentStatusId" uuid NOT NULL,
        "shippingCost" numeric(10,2) NOT NULL DEFAULT '0',
        "taxAmount" numeric(10,2) NOT NULL DEFAULT '0',
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "shippedAt" TIMESTAMP,
        "deliveredAt" TIMESTAMP,
        CONSTRAINT "UQ_orders_orderNumber" UNIQUE ("orderNumber"),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "partId" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(10,2) NOT NULL,
        "totalPrice" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);

    // Create transaction_types table
    await queryRunner.query(`
      CREATE TABLE "transaction_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "description" text,
        "direction" character varying(10) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_transaction_types_name" UNIQUE ("name"),
        CONSTRAINT "PK_transaction_types" PRIMARY KEY ("id")
      )
    `);

    // Create inventory_transactions table
    await queryRunner.query(`
      CREATE TABLE "inventory_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "partId" uuid NOT NULL,
        "transactionTypeId" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "referenceType" character varying(50),
        "referenceId" uuid,
        "notes" text,
        "createdById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_transactions" PRIMARY KEY ("id")
      )
    `);

    // Create user_sessions table
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "sessionToken" character varying(255) NOT NULL,
        "refreshToken" character varying(255),
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" inet,
        "userAgent" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastAccessed" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_sessions_sessionToken" UNIQUE ("sessionToken"),
        CONSTRAINT "UQ_user_sessions_refreshToken" UNIQUE ("refreshToken"),
        CONSTRAINT "PK_user_sessions" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_roleId" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parentId" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_parts_manufacturerId" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_parts_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_parts_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "part_vehicle_compatibility" ADD CONSTRAINT "FK_part_vehicle_compatibility_partId" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "part_vehicle_compatibility" ADD CONSTRAINT "FK_part_vehicle_compatibility_vehicleModelId" FOREIGN KEY ("vehicleModelId") REFERENCES "vehicle_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_statusId" FOREIGN KEY ("statusId") REFERENCES "order_statuses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_paymentStatusId" FOREIGN KEY ("paymentStatusId") REFERENCES "payment_statuses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_partId" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_inventory_transactions_partId" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_inventory_transactions_transactionTypeId" FOREIGN KEY ("transactionTypeId") REFERENCES "transaction_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_inventory_transactions_createdById" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_user_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_parts_manufacturerId" ON "parts" ("manufacturerId") `);
    await queryRunner.query(`CREATE INDEX "IDX_parts_categoryId" ON "parts" ("categoryId") `);
    await queryRunner.query(`CREATE INDEX "IDX_parts_createdById" ON "parts" ("createdById") `);
    await queryRunner.query(`CREATE INDEX "IDX_parts_isActive" ON "parts" ("isActive") WHERE "isActive" = true `);
    await queryRunner.query(`CREATE INDEX "IDX_parts_tags" ON "parts" USING gin ("tags") `);
    await queryRunner.query(`CREATE INDEX "IDX_vehicle_models_make_model_year" ON "vehicle_models" ("make", "model", "yearStart", "yearEnd") `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_userId" ON "orders" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_statusId" ON "orders" ("statusId") `);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId") `);
    await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_partId" ON "inventory_transactions" ("partId") `);
    await queryRunner.query(`CREATE INDEX "IDX_users_createdAt" ON "users" ("createdAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_parts_createdAt" ON "parts" ("createdAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_createdAt" ON "orders" ("createdAt") `);

    // Create unique index for parts (manufacturer + part number for active parts only)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_parts_manufacturer_part_number" ON "parts" ("manufacturerId", "partNumber") WHERE "isActive" = true `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_parts_manufacturer_part_number"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_parts_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_users_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_inventory_transactions_partId"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_orderId"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_statusId"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_vehicle_models_make_model_year"`);
    await queryRunner.query(`DROP INDEX "IDX_parts_tags"`);
    await queryRunner.query(`DROP INDEX "IDX_parts_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_parts_createdById"`);
    await queryRunner.query(`DROP INDEX "IDX_parts_categoryId"`);
    await queryRunner.query(`DROP INDEX "IDX_parts_manufacturerId"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_user_sessions_userId"`);
    await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_inventory_transactions_createdById"`);
    await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_inventory_transactions_transactionTypeId"`);
    await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_inventory_transactions_partId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_partId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orderId"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_paymentStatusId"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_statusId"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_userId"`);
    await queryRunner.query(`ALTER TABLE "part_vehicle_compatibility" DROP CONSTRAINT "FK_part_vehicle_compatibility_vehicleModelId"`);
    await queryRunner.query(`ALTER TABLE "part_vehicle_compatibility" DROP CONSTRAINT "FK_part_vehicle_compatibility_partId"`);
    await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_parts_createdById"`);
    await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_parts_categoryId"`);
    await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_parts_manufacturerId"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parentId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_roleId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "inventory_transactions"`);
    await queryRunner.query(`DROP TABLE "transaction_types"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "payment_statuses"`);
    await queryRunner.query(`DROP TABLE "order_statuses"`);
    await queryRunner.query(`DROP TABLE "part_vehicle_compatibility"`);
    await queryRunner.query(`DROP TABLE "vehicle_models"`);
    await queryRunner.query(`DROP TABLE "parts"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "manufacturers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
  }
}
