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

// PUT endpoint to remove a tag from a product
app.put('/products/:productId/remove-tag', async (req, res) => {
  const productId = req.params.productId;
  const tagToRemove = req.body.tag; // The tag to be removed is passed in the request body

  if (!tagToRemove) {
    return res.status(400).json({ error: 'Tag to remove is required.' });
  }

  const url = `https://archanapopup.myshopify.com/admin/api/2023-01/products/${productId}.json`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a'
  };

  try {
    // First, retrieve the current product data to get the existing tags
    const productResponse = await axios.get(url, { headers });
    const product = productResponse.data.product;

    // Get the existing tags
    const existingTags = product.tags.split(', ').filter(tag => tag);

    // Check if the tag exists
    if (!existingTags.includes(tagToRemove)) {
      return res.status(404).json({ message: 'Tag not found on product.' });
    }

    // Remove the tag
    const updatedTags = existingTags.filter(tag => tag !== tagToRemove).join(', ');

    // Update the product with the new tags
    const updateData = {
      product: {
        id: productId,
        tags: updatedTags
      }
    };

    const updateResponse = await axios.put(url, updateData, { headers });

    res.json({
      message: `Tag "${tagToRemove}" removed successfully.`,
      product: updateResponse.data.product
    });
  } catch (error) {
    console.error('Error updating product tags:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to update product tags',
      details: error.response ? error.response.data : error.message
    });
  }
});



// PUT route to add a tag to a Shopify product
app.put('/products/:id/tag', async (req, res) => {
  const productId = req.params.id;
  const { newTag } = req.body; // New tag to be added passed in request body

  if (!newTag) {
    return res.status(400).json({ error: 'New tag is required' });
  }

  try {
    // Fetch the product first to get the existing tags
    const productUrl = `https://archanapopup.myshopify.com/admin/api/2023-01/products/${productId}.json`;

    const productResponse = await axios.get(productUrl, {
      headers: {
        'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a',
        'Content-Type': 'application/json',
      },
    });

    const product = productResponse.data.product;

    // Update the tags
    let existingTags = product.tags ? product.tags.split(', ') : [];
    if (!existingTags.includes(newTag)) {
      existingTags.push(newTag);
    }

    // Prepare the updated product data
    const updatedProduct = {
      product: {
        id: productId,
        tags: existingTags.join(', '), // Shopify expects tags as a comma-separated string
      },
    };

    // Send the PUT request to update the product with new tags
    const updateResponse = await axios.put(productUrl, updatedProduct, {
      headers: {
    'X-Shopify-Access-Token': 'a8d0702d1a40bcff3405b9ba4c3ef42a',
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json({
      message: 'Tag added successfully',
      updatedTags: updateResponse.data.product.tags,
    });
  } catch (error) {
    console.error('Error adding tag to product:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add tag to product' });
  }
});

// PUT endpoint to update product status to 'draft'
app.put('/products/:productId/draft', async (req, res) => {
  const productId = req.params.productId;
  
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
    res.json({
      message: 'Product status updated to draft',
      product: response.data.product
    });
  } catch (error) {
    console.error('Error updating product status:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: 'Failed to update product status',
      details: error.response ? error.response.data : error.message
    });
  }
});



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