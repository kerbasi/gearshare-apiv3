import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1700000000001 implements MigrationInterface {
  name = 'SeedInitialData1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert default user roles
    await queryRunner.query(`
      INSERT INTO "user_roles" ("name", "description", "permissions") VALUES
      ('admin', 'System Administrator', '{"all": true}'),
      ('manager', 'Store Manager', '{"inventory": true, "orders": true, "reports": true}'),
      ('client', 'Regular Customer', '{"orders": true, "profile": true}'),
      ('guest', 'Guest User', '{"view": true}')
    `);

    // Insert default order statuses
    await queryRunner.query(`
      INSERT INTO "order_statuses" ("name", "description", "sortOrder") VALUES
      ('pending', 'Order placed, awaiting confirmation', 1),
      ('confirmed', 'Order confirmed by store', 2),
      ('processing', 'Order being prepared', 3),
      ('shipped', 'Order shipped to customer', 4),
      ('delivered', 'Order delivered successfully', 5),
      ('cancelled', 'Order cancelled', 6),
      ('returned', 'Order returned by customer', 7)
    `);

    // Insert default payment statuses
    await queryRunner.query(`
      INSERT INTO "payment_statuses" ("name", "description", "sortOrder") VALUES
      ('pending', 'Payment pending', 1),
      ('paid', 'Payment completed', 2),
      ('failed', 'Payment failed', 3),
      ('refunded', 'Payment refunded', 4),
      ('partial_refund', 'Partial refund issued', 5)
    `);

    // Insert default transaction types
    await queryRunner.query(`
      INSERT INTO "transaction_types" ("name", "description", "direction") VALUES
      ('purchase', 'Stock purchased from supplier', 'in'),
      ('sale', 'Stock sold to customer', 'out'),
      ('return', 'Stock returned by customer', 'in'),
      ('adjustment', 'Manual stock adjustment', 'neutral'),
      ('damage', 'Stock damaged/lost', 'out'),
      ('transfer_in', 'Stock transferred in', 'in'),
      ('transfer_out', 'Stock transferred out', 'out')
    `);

    // Insert sample manufacturers
    await queryRunner.query(`
      INSERT INTO "manufacturers" ("name", "country", "website", "contactEmail") VALUES
      ('ACME Auto Parts', 'USA', 'https://acme-auto.com', 'contact@acme-auto.com'),
      ('Global Parts Ltd', 'Germany', 'https://global-parts.de', 'info@global-parts.de'),
      ('Asian Motors', 'Japan', 'https://asian-motors.jp', 'support@asian-motors.jp'),
      ('Euro Components', 'Italy', 'https://euro-components.it', 'sales@euro-components.it'),
      ('Tech Auto', 'South Korea', 'https://tech-auto.kr', 'info@tech-auto.kr')
    `);

    // Insert sample categories
    await queryRunner.query(`
      INSERT INTO "categories" ("name", "description", "slug", "sortOrder") VALUES
      ('Engine Parts', 'Engine components and accessories', 'engine-parts', 1),
      ('Brake System', 'Brake pads, rotors, and related components', 'brake-system', 2),
      ('Suspension', 'Shocks, struts, and suspension components', 'suspension', 3),
      ('Electrical', 'Batteries, alternators, and electrical components', 'electrical', 4),
      ('Transmission', 'Transmission parts and accessories', 'transmission', 5),
      ('Exhaust System', 'Exhaust pipes, mufflers, and related parts', 'exhaust-system', 6),
      ('Body Parts', 'Body panels, bumpers, and exterior components', 'body-parts', 7),
      ('Interior', 'Seats, dashboards, and interior accessories', 'interior', 8)
    `);

    // Insert sample vehicle models
    await queryRunner.query(`
      INSERT INTO "vehicle_models" ("make", "model", "yearStart", "yearEnd", "engineType", "fuelType", "transmissionType", "bodyType") VALUES
      ('Toyota', 'Camry', 2018, 2024, 'V6', 'Gasoline', 'Automatic', 'Sedan'),
      ('Honda', 'Civic', 2016, 2024, 'I4', 'Gasoline', 'Manual', 'Sedan'),
      ('Ford', 'F-150', 2015, 2024, 'V8', 'Gasoline', 'Automatic', 'Pickup'),
      ('BMW', '3 Series', 2019, 2024, 'I4 Turbo', 'Gasoline', 'Automatic', 'Sedan'),
      ('Audi', 'A4', 2017, 2024, 'I4 Turbo', 'Gasoline', 'Automatic', 'Sedan'),
      ('Mercedes-Benz', 'C-Class', 2016, 2024, 'I4 Turbo', 'Gasoline', 'Automatic', 'Sedan'),
      ('Nissan', 'Altima', 2019, 2024, 'I4', 'Gasoline', 'CVT', 'Sedan'),
      ('Hyundai', 'Elantra', 2021, 2024, 'I4', 'Gasoline', 'Automatic', 'Sedan')
    `);

    // Create a default admin user (password: 'admin123' - should be hashed in real implementation)
    const adminRoleId = await queryRunner.query(`SELECT id FROM "user_roles" WHERE name = 'admin' LIMIT 1`);
    if (adminRoleId.length > 0) {
      await queryRunner.query(`
        INSERT INTO "users" ("email", "username", "passwordHash", "firstName", "lastName", "roleId", "emailVerified") VALUES
        ('admin@autoparts.com', 'admin', '$2b$10$hashedpassword', 'Admin', 'User', '${adminRoleId[0].id}', true)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete sample data
    await queryRunner.query(`DELETE FROM "users" WHERE email = 'admin@autoparts.com'`);
    await queryRunner.query(`DELETE FROM "vehicle_models"`);
    await queryRunner.query(`DELETE FROM "categories"`);
    await queryRunner.query(`DELETE FROM "manufacturers"`);
    await queryRunner.query(`DELETE FROM "transaction_types"`);
    await queryRunner.query(`DELETE FROM "payment_statuses"`);
    await queryRunner.query(`DELETE FROM "order_statuses"`);
    await queryRunner.query(`DELETE FROM "user_roles"`);
  }
}
