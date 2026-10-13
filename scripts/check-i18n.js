/**
 * i18n Key Parity Checker for Krushak
 * Recursively verifies that every key present in en.json exists in hi.json and mr.json.
 * Exits with code 1 if any missing key is found.
 */

const fs = require("fs");
const path = require("path");

const i18nDir = path.resolve(__dirname, "../frontend/src/i18n");
const enPath = path.join(i18nDir, "en.json");
const hiPath = path.join(i18nDir, "hi.json");
const mrPath = path.join(i18nDir, "mr.json");

if (!fs.existsSync(enPath) || !fs.existsSync(hiPath) || !fs.existsSync(mrPath)) {
  console.error("Missing translation files in frontend/src/i18n/");
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const hi = JSON.parse(fs.readFileSync(hiPath, "utf8"));
const mr = JSON.parse(fs.readFileSync(mrPath, "utf8"));

function getKeys(obj, prefix = "") {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys = keys.concat(getKeys(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

function getValue(obj, pathStr) {
  return pathStr.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

const enKeys = getKeys(en);
let missingInHi = [];
let missingInMr = [];

for (const key of enKeys) {
  if (getValue(hi, key) === undefined) {
    missingInHi.push(key);
  }
  if (getValue(mr, key) === undefined) {
    missingInMr.push(key);
  }
}

console.log(`Audited ${enKeys.length} translation keys from en.json.`);

let failed = false;

if (missingInHi.length > 0) {
  console.error(`\n[ERROR] ${missingInHi.length} keys missing in hi.json:`);
  missingInHi.forEach((k) => console.error(`  - ${k}`));
  failed = true;
} else {
  console.log("✓ hi.json: All keys present and matched.");
}

if (missingInMr.length > 0) {
  console.error(`\n[ERROR] ${missingInMr.length} keys missing in mr.json:`);
  missingInMr.forEach((k) => console.error(`  - ${k}`));
  failed = true;
} else {
  console.log("✓ mr.json: All keys present and matched.");
}

if (failed) {
  console.error("\ni18n verification failed. Please synchronize missing translation keys.");
  process.exit(1);
} else {
  console.log("\nAll translations in sync across English, Hindi, and Marathi! Passed.\n");
  process.exit(0);
}
