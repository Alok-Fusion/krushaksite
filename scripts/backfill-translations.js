/**
 * Idempotent, rate-limited, resumable backfill script for Krushak listings.
 * Backfills translations (English, Hindi, Marathi) for existing Products, Lands, and Shops.
 *
 * Usage:
 *   node scripts/backfill-translations.js
 */

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config({
  path: path.join(__dirname, "../backend/config/.env"),
});

const Product = require("../backend/model/product");
const Lands = require("../backend/model/lands");
const Shop = require("../backend/model/shop");
const { computeSourceHash, detectLang, translateFields } = require("../backend/utils/translate");

const CHECKPOINT_FILE = path.join(__dirname, ".backfill-checkpoint.json");
const DELAY_MS = 600; // Rate limit delay between Gemini calls

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf-8"));
    } catch (e) {
      console.warn("Could not read checkpoint file, starting fresh.");
    }
  }
  return { products: [], lands: [], shops: [] };
}

function saveCheckpoint(checkpoint) {
  try {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), "utf-8");
  } catch (err) {
    console.warn("Warning: Could not save checkpoint:", err.message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillCollection(name, Model, checkpointKey, checkpoint, extractFields) {
  console.log(`\n=== Processing ${name} ===`);
  const docs = await Model.find({});
  console.log(`Found ${docs.length} ${name} documents.`);

  let processedCount = 0;
  let skippedCount = 0;

  for (const doc of docs) {
    const docId = doc._id.toString();

    // Checkpoint check
    if (checkpoint[checkpointKey].includes(docId)) {
      skippedCount++;
      continue;
    }

    const fields = extractFields(doc);
    const currentHash = computeSourceHash(fields);
    const sourceLang = doc.sourceLang || detectLang((fields.name || "") + " " + (fields.description || ""));
    doc.sourceLang = sourceLang;

    if (!doc.translations) doc.translations = { en: {}, hi: {}, mr: {} };
    if (!doc.edited) doc.edited = { en: false, hi: false, mr: false };

    doc.translations[sourceLang] = { ...fields };

    let modified = false;
    const targetLangs = ["en", "hi", "mr"].filter((l) => l !== sourceLang);

    for (const targetLang of targetLangs) {
      // Never overwrite manually edited translations
      if (doc.edited[targetLang] === true) continue;

      // Skip if unchanged and already populated
      if (
        doc.sourceHash === currentHash &&
        doc.translations[targetLang] &&
        Object.keys(doc.translations[targetLang]).length > 0
      ) {
        continue;
      }

      console.log(`[${name} ${docId}] Translating ${sourceLang} -> ${targetLang}...`);
      await sleep(DELAY_MS);
      const translated = await translateFields(fields, sourceLang, targetLang);
      doc.translations[targetLang] = translated;
      modified = true;
    }

    doc.sourceHash = currentHash;
    doc.markModified("translations");
    doc.markModified("edited");

    if (modified || !doc.sourceHash) {
      await doc.save({ validateBeforeSave: false });
      processedCount++;
    } else {
      skippedCount++;
    }

    // Save checkpoint
    checkpoint[checkpointKey].push(docId);
    saveCheckpoint(checkpoint);
  }

  console.log(`Finished ${name}: ${processedCount} translated, ${skippedCount} skipped.`);
}

async function run() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("Error: DB_URL is missing in backend/config/.env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB successfully.");

  const checkpoint = loadCheckpoint();

  // 1. Backfill Products
  await backfillCollection(
    "Products",
    Product,
    "products",
    checkpoint,
    (p) => ({
      name: p.name || "",
      description: p.description || "",
      category: p.category || "",
      tags: p.tags || "",
    })
  );

  // 2. Backfill Lands
  await backfillCollection(
    "Lands",
    Lands,
    "lands",
    checkpoint,
    (l) => ({
      name: l.name || "",
      description: l.description || "",
      landlocation: l.landlocation || "",
      address: l.address || "",
    })
  );

  // 3. Backfill Shops
  await backfillCollection(
    "Shops",
    Shop,
    "shops",
    checkpoint,
    (s) => ({
      name: s.name || "",
      description: s.description || "",
    })
  );

  console.log("\n✓ All listings backfilled successfully!");
  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch((err) => {
    console.error("Fatal backfill error:", err);
    process.exit(1);
  });
}

module.exports = { run, loadCheckpoint, saveCheckpoint };
