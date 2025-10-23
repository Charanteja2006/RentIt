import {Router} from 'express';
import {createProduct,getAllProducts,getUserProducts} from '../controllers/product.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';


const router = Router();

// Public routes
router.route('/all').get(getAllProducts);

//Protected routes
router.route('/create').post(verifyJWT,createProduct);
router.route('/my-products').get(verifyJWT,getUserProducts);

export default router;
