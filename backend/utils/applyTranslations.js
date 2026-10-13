/**
 * Extracts target language from query (?lang=en|hi|mr) or Accept-Language header.
 * @param {import('express').Request} req
 * @returns {"en" | "hi" | "mr" | null}
 */
function getRequestedLang(req) {
  if (!req) return null;
  const qLang = (req.query?.lang || "").toLowerCase().trim();
  if (["en", "hi", "mr"].includes(qLang)) {
    return qLang;
  }

  const accept = req.headers?.["accept-language"];
  if (accept && typeof accept === "string") {
    const first = accept.split(",")[0].trim().toLowerCase().slice(0, 2);
    if (["en", "hi", "mr"].includes(first)) {
      return first;
    }
  }

  return null;
}

/**
 * Overlay translated fields for a product document
 */
function overlayProduct(product, targetLang) {
  if (!product) return product;
  const doc = product.toObject ? product.toObject() : { ...product };
  const sourceLang = doc.sourceLang || "en";

  const original = {
    name: doc.name,
    description: doc.description,
    category: doc.category,
    tags: doc.tags,
  };

  if (targetLang && targetLang !== sourceLang && doc.translations?.[targetLang]) {
    const trans = doc.translations[targetLang];
    if (trans.name) doc.name = trans.name;
    if (trans.description) doc.description = trans.description;
    if (trans.category) doc.category = trans.category;
    if (trans.tags) doc.tags = trans.tags;

    doc.isTranslated = true;
    doc.translatedFrom = sourceLang;
    doc.original = original;
  } else {
    doc.isTranslated = false;
    doc.translatedFrom = null;
    doc.original = original;
  }

  // Reviews translation overlay
  if (Array.isArray(doc.reviews) && targetLang) {
    doc.reviews = doc.reviews.map((rev) => {
      const rSourceLang = rev.sourceLang || "en";
      const rObj = { ...rev };
      if (targetLang !== rSourceLang && rev.translations?.[targetLang]?.comment) {
        rObj.originalComment = rev.comment;
        rObj.comment = rev.translations[targetLang].comment;
        rObj.isTranslated = true;
        rObj.translatedFrom = rSourceLang;
      } else {
        rObj.isTranslated = false;
        rObj.originalComment = rev.comment;
      }
      return rObj;
    });
  }

  return doc;
}

/**
 * Overlay translated fields for a land listing
 */
function overlayLand(land, targetLang) {
  if (!land) return land;
  const doc = land.toObject ? land.toObject() : { ...land };
  const sourceLang = doc.sourceLang || "en";

  const original = {
    name: doc.name,
    description: doc.description,
    landlocation: doc.landlocation,
    address: doc.address,
  };

  if (targetLang && targetLang !== sourceLang && doc.translations?.[targetLang]) {
    const trans = doc.translations[targetLang];
    if (trans.name) doc.name = trans.name;
    if (trans.description) doc.description = trans.description;
    if (trans.landlocation) doc.landlocation = trans.landlocation;
    if (trans.address) doc.address = trans.address;

    doc.isTranslated = true;
    doc.translatedFrom = sourceLang;
    doc.original = original;
  } else {
    doc.isTranslated = false;
    doc.translatedFrom = null;
    doc.original = original;
  }

  return doc;
}

/**
 * Overlay translated fields for a shop document
 */
function overlayShop(shop, targetLang) {
  if (!shop) return shop;
  const doc = shop.toObject ? shop.toObject() : { ...shop };
  const sourceLang = doc.sourceLang || "en";

  const original = {
    name: doc.name,
    description: doc.description,
  };

  if (targetLang && targetLang !== sourceLang && doc.translations?.[targetLang]) {
    const trans = doc.translations[targetLang];
    if (trans.name) doc.name = trans.name;
    if (trans.description) doc.description = trans.description;

    doc.isTranslated = true;
    doc.translatedFrom = sourceLang;
    doc.original = original;
  } else {
    doc.isTranslated = false;
    doc.translatedFrom = null;
    doc.original = original;
  }

  return doc;
}

/**
 * Higher-level helper to process single docs or arrays
 */
function applyTranslations(data, targetLang, modelType) {
  if (!data) return data;
  const mapper =
    modelType === "product"
      ? overlayProduct
      : modelType === "lands"
      ? overlayLand
      : modelType === "shop"
      ? overlayShop
      : (d) => d;

  if (Array.isArray(data)) {
    return data.map((item) => mapper(item, targetLang));
  }
  return mapper(data, targetLang);
}

module.exports = {
  getRequestedLang,
  overlayProduct,
  overlayLand,
  overlayShop,
  applyTranslations,
};
