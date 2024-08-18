require('dotenv').config();
const turso = require('@libsql/client');

const _turso = turso.createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

const data = [
  {
    key: 'users',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'email', t: 'TEXT' },
      { f: 'password', t: 'TEXT' },
      { f: 'name', t: 'TEXT' },
      { f: 'role_id', t: 'TEXT' },
      { f: 'status', t: 'TEXT' },
    ],
  },
  {
    key: 'roles',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'title', t: 'TEXT' },
      { f: 'description', t: 'TEXT' },
      { f: 'scopes', t: 'TEXT' },
    ],
  },
  {
    key: 'products',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'title', t: 'TEXT' },
      { f: 'description', t: 'TEXT' },
      { f: 'price', t: 'REAL' },
      { f: 'discount_type', t: 'TEXT' },
      { f: 'discount_rate', t: 'REAL' },
      { f: 'image_urls', t: 'TEXT' },
      { f: 'features', t: 'TEXT' },
      { f: 'user_id', t: 'TEXT' },
      { f: 'weight', t: 'REAL' },
      { f: 'dimension', t: 'TEXT' },
      { f: 'status', t: 'TEXT' },
      { f: 'created_at', t: 'REAL' },
      { f: 'updated_at', t: 'REAL' },
    ],
  },
  {
    key: 'orders',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'order_code', t: 'TEXT' },
      { f: 'cart', t: 'TEXT' },
      { f: 'user_id', t: 'TEXT' },
      { f: 'order_type', t: 'TEXT' },
      { f: 'customer_id', t: 'TEXT' },
      { f: 'payment_type', t: 'TEXT' },
      { f: 'status', t: 'TEXT' },
      { f: 'created_at', t: 'REAL' },
      { f: 'updated_at', t: 'REAL' },
    ],
  },
  {
    key: 'order_items',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'order_id', t: 'TEXT' },
      { f: 'product_id', t: 'TEXT' },
      { f: 'quantity', t: 'INTEGER' },
      { f: 'price', t: 'REAL' },
      { f: 'created_at', t: 'REAL' },
      { f: 'updated_at', t: 'REAL' },
    ],
  },
  {
    key: 'customers',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'name', t: 'TEXT' },
      { f: 'email', t: 'TEXT' },
      { f: 'password', t: 'TEXT' },
      { f: 'phone', t: 'TEXT' },
      { f: 'address', t: 'TEXT' },
      { f: 'created_at', t: 'REAL' },
      { f: 'updated_at', t: 'REAL' },
    ],
  },
  {
    key: 'payments',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'order_id', t: 'TEXT' },
      { f: 'amount', t: 'REAL' },
      { f: 'payment_method', t: 'TEXT' },
      { f: 'status', t: 'TEXT' },
      { f: 'created_at', t: 'REAL' },
      { f: 'updated_at', t: 'REAL' },
    ],
  },
  {
    key: 'transactions',
    fields: [
      { f: 'id', t: 'TEXT', pk: true },
      { f: 'order_id', t: 'TEXT' },
      { f: 'amount', t: 'REAL' },
      { f: 'status', t: 'TEXT' },
      { f: 'note', t: 'TEXT' },
      { f: 'created_at', t: 'REAL' },
      { f: 'updated_at', t: 'REAL' },
    ],
  }
];

const generateCreateTableStatements = (data: any) => {
  return data.map(async (table: any) => {
    const fields = table.fields.map((field: any) => {
      const primaryKey = field.pk ? ' PRIMARY KEY' : '';
      return `${field.f} ${field.t}${primaryKey}`;
    }).join(', ');

    try {
      await _turso.execute(`CREATE TABLE IF NOT EXISTS ${table.key} (${fields});`);
      console.log(`Migration table: ${table.key} => successful`);
    } catch (error) {
      console.error(`Migration table: ${table.key} => failed:`, error);
    }
  });
};

generateCreateTableStatements(data);
