import {Router} from 'express';
import {createProduct,getAllProducts} from '../controllers/product.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';


const router = Router();

// Public routes
router.route('/all').get(getAllProducts);

//Protected routes
router.route('/create').post(verifyJWT,createProduct);

export default router;
