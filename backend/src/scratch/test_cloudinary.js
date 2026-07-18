const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '../../.env' }); // Adjust path to backend .env

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'database_backups/',
      max_results: 10,
    });
    console.log('Success:', result);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
