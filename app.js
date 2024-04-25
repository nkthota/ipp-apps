const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors'); // Import the cors package

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Use the cors middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Endpoint to fetch product metadata
app.get('/product-metadata/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const response = await axios.get(`https://archanapopup.myshopify.com/admin/api/2021-10/products/${productId}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a',
      },
    });

    const metadata = response.data.metafields;
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching product metadata:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch product metadata' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});