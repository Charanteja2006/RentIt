import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["cars", "bikes", "properties", "furniture", "stationary", "others"],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
