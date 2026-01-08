require('dotenv').config();
const { S3Client } = require("@aws-sdk/client-s3");

// 1. Initialize the Client
const s3Client = new S3Client({
    region: "de", // or your specific region
    endpoint: process.env.BUNNY_S3_ENDPOINT || "https://storage.bunnycdn.com",
    credentials: {
        accessKeyId: process.env.BUNNY_STORAGE_NAME,     // "images412026"
        secretAccessKey: process.env.BUNNY_STORAGE_PASSWORD, // "3dfd0f42..."
    },
    forcePathStyle: true,
});

// 2. Export it using Named Export (The curly braces are important!)
module.exports = { s3Client };