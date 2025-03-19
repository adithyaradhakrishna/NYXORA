const cors = require("cors");
const { put } = require("@vercel/blob");

const VERCEL_BLOB_API_KEY = "vercel_blob_rw_QQP5nCCGoSGORAoo_2FN25vB255wb4COnKl9y3rPGpjoZpK"; // Use environment variable for security

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Handle CORS preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = Buffer.from(file, "base64");

    const { url } = await put(`dream-recordings/${Date.now()}.wav`, buffer, {
      access: "public",
      contentType: "audio/wav",
      token: VERCEL_BLOB_API_KEY,
    });

    return res.status(200).json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload audio" });
  }
}
