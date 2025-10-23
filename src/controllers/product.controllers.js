import {Product} from '../models/product.model.js';
import {ApiResponse} from '../utils/api-response.js';
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from '../utils/async-handler.js';


const createProduct = asyncHandler(async (req, res) => {
    const {name, category, price, description} = req.body;
    const user = req.user;

    const product = await Product.create({name, category, price, description,owner: user._id});
    await product.save({validateBeforeSave: false});

    const CreatedProduct = await Product.findById(product._id).populate('owner', '-password -refreshToken');
    if(!CreatedProduct){
        throw new ApiError(500,"Something went wrong. Please try again.")
    }

    return res
        .status(201)
        .json(new ApiResponse(201,{
            product: CreatedProduct},
            "Product created successfully."
        ));

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

export {createProduct, getAllProducts};