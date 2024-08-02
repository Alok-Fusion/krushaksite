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
    createdAt:{
        type:Date,
        default:Date.now(),
    }
});

module.exports = mongoose.model("Lands",landsSchema);