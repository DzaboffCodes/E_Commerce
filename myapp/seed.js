require('dotenv').config();
const db = require('./src/config/database');

const seed = async () => {
  try {
    // DummyJSON returns up to 100 products with ?limit=100
    const res = await fetch('https://dummyjson.com/products?limit=100');
    const data = await res.json();
    const products = data.products;

    console.log(`Seeding ${products.length} products...`);

    for (const p of products) {
      await db.query(
        `INSERT INTO products (name, description, price, category, stock_quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.title, p.description, parseFloat(p.price), p.category, p.stock, p.thumbnail]
      );
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();