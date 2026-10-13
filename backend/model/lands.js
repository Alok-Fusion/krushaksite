const mongoose = require("mongoose");
const landsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter the land owner name!"],
    },
    description:{
        type:String,
        required:[true,"Please enter the lands description!"],
    },
    address:{
        type:String,
        required:[true,"Please enter the land owner address!"],
    },
    landlocation:{
        type:String,
        required:[true,"Please enter the land location!"],
    },
    price:{
        type:Number,
        required:[true,"Please enter the land asking price!"],
    },
    area:{
        type:Number,
        required:[true,"Please enter the total area of lands"],
    },
    statusland:{
        type:String,
        required:[true,"Please enter the status of the land!"],
    },
    images: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
    ],
    sellerId: {
        type: String,
        required: true,
    },
    shop: {
        type: Object,
        required: true,
    },
    translations: {
        en: { type: Object, default: {} },
        hi: { type: Object, default: {} },
        mr: { type: Object, default: {} },
    },
    sourceLang: {
        type: String,
        enum: ["en", "hi", "mr"],
        default: "en",
    },
    sourceHash: {
        type: String,
        default: "",
    },
    edited: {
        en: { type: Boolean, default: false },
        hi: { type: Boolean, default: false },
        mr: { type: Boolean, default: false },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Lands", landsSchema);