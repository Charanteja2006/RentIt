import {Router} from 'express';
import {createProduct,deleteProduct,getAllProducts,getUserProducts, updateProduct,getProduct,toggleProduct} from '../controllers/product.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import { upload } from "../middlewares/upload.middleware.js";


const router = Router();

// Public routes
router.route('/all').get(getAllProducts);
router.route('/get/:id').get(getProduct);


//Protected routes
router.route('/create').post(verifyJWT, upload.single("image"), createProduct);
router.route('/my-products').get(verifyJWT,getUserProducts);
router.route('/delete/:id').delete(verifyJWT,deleteProduct);
router.route('/update/:id').put(verifyJWT,updateProduct);
router.route('/toggle/:id').put(verifyJWT,toggleProduct);

export default router;
