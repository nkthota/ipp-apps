const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors'); // Import the cors package

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
  origin: true
}))

// Endpoint to fetch product metadata
app.get('/product-metadata/:productId', cors(), async (req, res) => {
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

app.put('/update-product-metafield/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const metafieldData = {
      metafield: {
        id: '30168120525038',
        value: '["Archana"]',
        type: 'list.single_line_text_field'
      }
    };

    // Make PUT request to Shopify's API to update the metafield
    const response = await axios.put(`https://archanapopup.myshopify.com/admin/api/2021-10/products/${productId}/metafields/30168120525038.json`, metafieldData, {
      headers: {
        'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a',
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating product metafield:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to update product metafield' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});