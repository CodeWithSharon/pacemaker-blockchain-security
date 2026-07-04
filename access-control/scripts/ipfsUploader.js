// scripts/ipfsUploader.js

const axios = require("axios");
require("dotenv").config();
const FormData = require("form-data");

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  throw new Error("❌ PINATA_JWT is missing from .env");
}

async function uploadToIPFS(data) {
  try {
    const jsonData = JSON.stringify(data);

    const formData = new FormData();
    formData.append("file", Buffer.from(jsonData), {
      filename: "alert.json",
      contentType: "application/json"
    });

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders(),
      },
    });

    const cid = res.data.IpfsHash;
    console.log(`📤 Uploaded to IPFS via Pinata. CID: ${cid}`);
    return cid;
  } catch (err) {
    console.error("❌ Failed to upload to Pinata:", err.response?.data || err.message);
    return "QmErrorUpload";
  }
}

module.exports = { uploadToIPFS };
