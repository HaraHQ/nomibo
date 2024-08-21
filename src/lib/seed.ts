require('dotenv').config();
const t = require('@libsql/client');
const bcrypt = require('bcrypt');
const { v7: uuidv7 } = require('uuid');

function makeOrderCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

const _t = t.createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

const insertData = async () => {
  try {
    // Insert 1 dummy role
    const roleId = uuidv7();
    const roleTitle = 'Admin';
    const roleDescription = 'Administrator role';
    const roleScopes = JSON.stringify(['users', 'user-roles', 'products', 'orders']);
    const roleCreatedAt = new Date().getTime();
    const roleUpdatedAt = new Date().getTime();

    await _t.execute(`
      INSERT INTO roles (id, title, description, scopes, created_at, updated_at)
      VALUES ('${roleId}', '${roleTitle}', '${roleDescription}', '${roleScopes}', ${roleCreatedAt}, ${roleUpdatedAt});
    `);

    console.log('Dummy role inserted successfully.');

    // Insert 5 dummy users using the generated role ID
    const userStatuses = ['active', 'active', 'active', 'turnoff', 'turnoff'];
    const users = await Promise.all(
      userStatuses.map(async (status, i) => {
        const id = uuidv7();
        const email = `user${i + 1}@example.com`;
        const password = await bcrypt.hash(`password${i + 1}`, 10);
        const name = `User ${i + 1}`;
        const createdAt = new Date().getTime();
        const updatedAt = new Date().getTime();

        await _t.execute(`
          INSERT INTO users (id, email, password, name, role_id, status, created_at, updated_at)
          VALUES ('${id}', '${email}', '${password}', '${name}', '${roleId}', '${status}', ${createdAt}, ${updatedAt});
        `);

        return { id, email, name, status };
      })
    );

    console.log('Dummy users inserted successfully.');

    // Insert 10 dummy products
    const products = await Promise.all(
      Array.from({ length: 10 }).map(async (_, i) => {
        const id = uuidv7();
        const title = `Product ${i + 1}`;
        const description = `Description for Product ${i + 1}`;
        const price = (i + 1) * 10.0;
        const discountType = 'none';
        const discountRate = 0.0;
        const imageUrls = JSON.stringify([`https://example.com/product${i + 1}.jpg`]);
        const features = JSON.stringify([`Feature 1`, `Feature 2`]);
        const userId = users[i % users.length].id;
        const weight = (i + 1) * 0.5;
        const dimension = JSON.stringify({ length: 10, width: 5, height: 3 });
        const status = 'active';
        const createdAt = new Date().getTime();
        const updatedAt = new Date().getTime();

        await _t.execute(`
          INSERT INTO products (id, title, description, price, discount_type, discount_rate, image_urls, features, user_id, weight, dimension, status, created_at, updated_at)
          VALUES ('${id}', '${title}', '${description}', ${price}, '${discountType}', ${discountRate}, '${imageUrls}', '${features}', '${userId}', ${weight}, '${dimension}', '${status}', ${createdAt}, ${updatedAt});
        `);

        return { id, title, price, userId };
      })
    );

    console.log('Dummy products inserted successfully.');

    // Insert 20 dummy customers
    const customers = await Promise.all(
      Array.from({ length: 20 }).map(async (_, i) => {
        const id = uuidv7();
        const name = `Customer ${i + 1}`;
        const email = `customer${i + 1}@example.com`;
        const password = await bcrypt.hash(`password${i + 1}`, 10);
        const phone = `+1234567890${i + 1}`;
        const address = `Address ${i + 1}`;
        const createdAt = new Date().getTime();
        const updatedAt = new Date().getTime();

        await _t.execute(`
          INSERT INTO customers (id, name, email, password, phone, address, created_at, updated_at)
          VALUES ('${id}', '${name}', '${email}', '${password}', '${phone}', '${address}', ${createdAt}, ${updatedAt});
        `);

        return { id, name };
      })
    );

    console.log('Dummy customers inserted successfully.');

    const getRandomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const getRandomInt = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Insert 25 dummy orders and associated order items
    await Promise.all(
      Array.from({ length: 25 }).map(async (_, i) => {
        const orderId = uuidv7();
        const orderCode = `ORDER-${i + 1}`;
        
        // Generate random cart items
        const numberOfItems = getRandomInt(1, 5);
        const cartItems = Array.from({ length: numberOfItems }).map(() => {
          const product = products[Math.floor(Math.random() * products.length)];
          return { 
            product_id: product.id, 
            quantity: 1, 
            price: product.price,
          };
        });
        const cart = JSON.stringify(cartItems);  // Convert the cart items to JSON string
    
        const userId = users[i % users.length].id;
        const orderType = 'INTERNAL';
        const customerId = customers[i % customers.length].id;
        const paymentType = 'cash';
        const status = 'DONE';
    
        // Generate a random date between 1 Jan 2024 and now
        const startDate = new Date('2024-01-01T00:00:00.000Z');
        const endDate = new Date();
        const createdAt = getRandomDate(startDate, endDate).getTime();
        const updatedAt = createdAt; // Assuming updatedAt is the same as createdAt
    
        await _t.execute(`
          INSERT INTO orders (id, order_code, cart, user_id, order_type, customer_id, payment_type, status, created_at, updated_at)
          VALUES ('${orderId}', '${orderCode}', '${cart}', '${userId}', '${orderType}', '${customerId}', '${paymentType}', '${status}', ${createdAt}, ${updatedAt});
        `);
    
        // Insert order items
        await Promise.all(
          cartItems.map(async (item) => {
            const orderItemId = uuidv7();
    
            await _t.execute(`
              INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, updated_at)
              VALUES ('${orderItemId}', '${orderId}', '${item.product_id}', ${item.quantity}, ${item.price}, ${createdAt}, ${updatedAt});
            `);
          })
        );
    
        console.log(`Dummy order ${i + 1} inserted successfully.`);
      })
    );

    console.log('Dummy orders and order items inserted successfully.');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  }
};

insertData();
