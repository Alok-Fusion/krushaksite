const Product = require("../model/product");
const Lands = require("../model/lands");
const Shop = require("../model/shop");
const { computeSourceHash, detectLang, translateFields } = require("./translate");

class TranslationQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.activeWorkers = 0;
    this.queue = [];
  }

  /**
   * Enqueue a translation job
   * @param {"product" | "lands" | "shop"} modelType
   * @param {string} documentId
   */
  enqueue(modelType, documentId) {
    if (!modelType || !documentId) return;
    
    // Avoid duplicate pending jobs for the same doc
    const existing = this.queue.find(
      (j) => j.modelType === modelType && j.documentId.toString() === documentId.toString()
    );
    if (!existing) {
      this.queue.push({
        modelType,
        documentId: documentId.toString(),
        retries: 0,
      });
    }

    this.processNext();
  }

  processNext() {
    if (this.activeWorkers >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.activeWorkers++;

    this.executeJob(job)
      .catch((err) => {
        console.error(`[TranslationQueue] Error processing ${job.modelType} ${job.documentId}:`, err.message);
        if (job.retries < 2) {
          job.retries++;
          // Re-enqueue after 1s
          setTimeout(() => {
            this.queue.push(job);
            this.processNext();
          }, 1000);
        }
      })
      .finally(() => {
        this.activeWorkers--;
        this.processNext();
      });
  }

  async executeJob(job) {
    const { modelType, documentId } = job;
    let Model;
    if (modelType === "product") Model = Product;
    else if (modelType === "lands") Model = Lands;
    else if (modelType === "shop") Model = Shop;
    else return;

    const doc = await Model.findById(documentId);
    if (!doc) return;

    // Extract translatable fields according to model
    let fields = {};
    if (modelType === "product") {
      fields = {
        name: doc.name || "",
        description: doc.description || "",
        category: doc.category || "",
        tags: doc.tags || "",
      };
    } else if (modelType === "lands") {
      fields = {
        name: doc.name || "",
        description: doc.description || "",
        landlocation: doc.landlocation || "",
        address: doc.address || "",
      };
    } else if (modelType === "shop") {
      fields = {
        name: doc.name || "",
        description: doc.description || "",
      };
    }

    const currentHash = computeSourceHash(fields);
    const sourceLang = doc.sourceLang || detectLang((fields.name || "") + " " + (fields.description || ""));
    doc.sourceLang = sourceLang;

    if (!doc.translations) {
      doc.translations = { en: {}, hi: {}, mr: {} };
    }
    if (!doc.edited) {
      doc.edited = { en: false, hi: false, mr: false };
    }

    // Set source language translations directly to source fields
    doc.translations[sourceLang] = { ...fields };

    const targetLanguages = ["en", "hi", "mr"].filter((lang) => lang !== sourceLang);

    for (const targetLang of targetLanguages) {
      // 1. Skip if user manually edited this translation
      if (doc.edited[targetLang] === true) {
        continue;
      }

      // 2. Skip if sourceHash is unchanged and translation already exists
      if (
        doc.sourceHash === currentHash &&
        doc.translations[targetLang] &&
        Object.keys(doc.translations[targetLang]).length > 0
      ) {
        continue;
      }

      // 3. Otherwise, perform translation
      const translated = await translateFields(fields, sourceLang, targetLang);
      doc.translations[targetLang] = translated;
    }

    // Handle review comments on products
    if (modelType === "product" && Array.isArray(doc.reviews)) {
      for (const rev of doc.reviews) {
        if (!rev.comment || typeof rev.comment !== "string") continue;
        const revHash = computeSourceHash({ comment: rev.comment });
        const revSourceLang = rev.sourceLang || detectLang(rev.comment);
        rev.sourceLang = revSourceLang;
        if (!rev.translations) rev.translations = { en: {}, hi: {}, mr: {} };
        if (!rev.edited) rev.edited = { en: false, hi: false, mr: false };
        rev.translations[revSourceLang] = { comment: rev.comment };

        for (const tLang of ["en", "hi", "mr"].filter((l) => l !== revSourceLang)) {
          if (rev.edited[tLang] === true) continue;
          if (rev.sourceHash === revHash && rev.translations[tLang]?.comment) continue;

          const translatedComment = await translateFields({ comment: rev.comment }, revSourceLang, tLang);
          rev.translations[tLang] = translatedComment;
        }
        rev.sourceHash = revHash;
      }
    }

    doc.sourceHash = currentHash;
    doc.markModified("translations");
    doc.markModified("edited");
    if (modelType === "product") doc.markModified("reviews");

    await doc.save({ validateBeforeSave: false });
  }
}

const translationQueue = new TranslationQueue(2);

module.exports = {
  translationQueue,
  enqueueTranslation: (modelType, documentId) => translationQueue.enqueue(modelType, documentId),
};
