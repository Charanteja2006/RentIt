import {Product} from '../models/product.model.js';
import cloudinary from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/api-response.js';
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from '../utils/async-handler.js';


const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, category, price, description} = req.body;
    const file = req.file; 

    if (!name || !category || !price || !description || !file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: "rentit-products" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ message: "Image upload failed" });
        }

        // ✅ Create product in MongoDB
        const newProduct = new Product({
          name,
          category,
          price,
          description,
          image: result.secure_url,
          imagePublicId: result.public_id,
          owner: req.user._id, // coming from auth middleware
        });

        await newProduct.save();
        res.status(201).json({ message: "Product created", product: newProduct });
      }
    );

    // stream the buffer
    if (file && file.buffer) {
      uploadResult.end(file.buffer);
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
})

const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().populate('owner', '-password -refreshToken');

    if(!products){
        throw new ApiError(500,"Something went wrong. Please try again.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{
            products},
            "Products fetched successfully."
        ));
});

const getUserProducts = asyncHandler(async (req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401,"Unauthorized access.");
    }

    const products = await Product.find({owner: user._id}).populate('owner', '-password -refreshToken');

    if(!products){
        throw new ApiError(500,"Something went wrong. Please try again.")
    }

    if(products.length === 0){
        return res
            .status(200)
            .json(new ApiResponse(200,{
                products: []},
                "No products found for this user."
        ));
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{
            products},
            "User's products fetched successfully."
        ));
})

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true} 
    );
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id; 

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProduct = asyncHandler(async (req,res) => {
  try {
    console.log(req.params)
    const { id } = req.params;
    const product = await Product.findById(id).populate('owner', '-password -refreshToken');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        product,
        "Product fetched successfully."
      )
    );
  } catch (error) {
    console.error("Error Finding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export {createProduct, getAllProducts, getUserProducts, updateProduct, deleteProduct, getProduct};