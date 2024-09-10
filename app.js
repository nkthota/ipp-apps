const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
  origin: true
}))

async function getMetaFieldId(productId) {
  try {
    const response = await axios.get(`https://archanapopup.myshopify.com/admin/api/2021-10/products/${productId}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a',
      },
    });
    var jp = require('jsonpath');  
    const jsonPathValue = jp.query(response.data, '$.metafields[?(@.key=="picks")].id').value;
    return jsonPathValue

  } catch (error) {
    throw new Error('Failed to fetch product data');
  }
}


async function updateProductStatusToDraft(productId) {
  const url = `https://archanapopup.myshopify.com/admin/api/2023-01/products/${productId}.json`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a'
  };

  const data = {
    product: {
      id: productId,
      status: 'draft'
    }
  };

  try {
    const response = await axios.put(url, data, { headers });
    console.log('Product status updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating product status:', error.response.data);
  }
}


// Endpoint to fetch product metadata
app.get('/product-metadata/:productId', cors(), async (req, res) => {
  const { productId } = req.params;
  try {
    const response = await axios.get(`https://archanapopup.myshopify.com/admin/api/2021-10/products/${productId}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a',
      },
    });

    const metadata = response.data;
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
        value: '["Archana"]',
        type: 'list.single_line_text_field',
        namespace: 'custom',
        key: 'picks'
      }
    };

    // Make PUT request to Shopify's API to update the metafield
    const response = await axios.post(`https://archanapopup.myshopify.com/admin/api/2021-10/products/${productId}/metafields.json`, metafieldData, {
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