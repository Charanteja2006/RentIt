import {Router} from 'express';
import {registerUser,login,logoutUser,getCurrentUser,changeCurrentPassword,refreshAccessToken} from '../controllers/auth.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

//Public routes
router.route('/register').post(registerUser);
router.route('/login').post(login);
router.route('/refresh-token').post(refreshAccessToken);

//Protected routes
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/current-user').get(verifyJWT,getCurrentUser);

export default router;

