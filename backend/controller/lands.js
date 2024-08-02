const express = require("express");
const router = express.Router();
const {isSeller , isAuthenticated , isAdmin} = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Shop =  require("../model/shop");
const Lands = require("../model/lands");
const cloudinary = require("cloudinary");

//adding land
router.post("/create-lands", catchAsyncErrors(async (req,res,next) => {
    try{
        const sellerId = req.body.sellerId;
        const shop = await Shop.findById(sellerId);
        if(!shop){
            return next(new ErrorHandler("Seller Does not exist!",400))
        } else {
          let images = [];
  
          if (typeof req.body.images === "string") {
            images.push(req.body.images);
          } else {
            images = req.body.images;
          }
        
          const imagesLinks = [];
        
          for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
              folder: "lands",
            });
        
            imagesLinks.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }
        
        
          const landData = req.body;
          landData.images = imagesLinks;
          landData.shop = shop;
  
          const lands = await Lands.create(landData);
  
          res.status(201).json({
            success: true,
            lands,
          });
        }       
    }catch(error){
        return next(new ErrorHandler(error,400));
    }
}));

//get all land of the seller
router.get(
  "/get-all-lands/:id",
  catchAsyncErrors(async (req,res,next) => {
    try{
      const lands = await Lands.find({ sellerId: req.params.id });

      res.status(201).json({
        success: true,
        lands,
      });
    }catch(error){
      return next(new ErrorHandler(error,400));
    }
  })
);

//delet the land of seller
router.delete(
  "/delete-seller-land/:id",
  isSeller,
  catchAsyncErrors(async (req,res,next) =>{
    try{
      const landsId = req.params.id;

      const lands = await Lands.findByIdAndDelete(landsId);
      if(!lands){
        return next(new ErrorHandler("Land not found with this id",400));
      }

      for(let i = 0; 1 < lands.images.length; i++){
        const result = await cloudinary.v2.uploader.destroy(
          lands.images[i].public_id
        );
      }

      await lands.remove();

      res.status(201).json({
        success: true,
        message: "Land deleted successfully"
      });
    }catch(error){
      return next(new ErrorHandler(error,400));
    }
  })
);

//get all lands 
router.get(
  "/get-all-lands",
  catchAsyncErrors(async (req,res,next) => {
    try {
      const lands = await Lands.find();

      res.status(201).json({
        success: true,
        lands,
      });
    }catch(error){
      return next(new ErrorHandler(error,400));
    }
  })
);

//admin all lands
router.get(
  "/admin-all-lands",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req,res,next) => {
    try{
      const lands = await Lands.find().sort({
        createdAt:-1,
      });
      res.status(201).json({
        success:true,
        lands,
      });
    }catch(error){
      return next(new ErrorHandler(error.message,500))
    }
  })
);
module.exports = router;