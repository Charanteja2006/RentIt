import {Router} from 'express';
import {registerUser,login,logoutUser,getCurrentUser,changeCurrentPassword,refreshAccessToken} from '../controllers/auth.controllers.js';
import {validate} from '../middlewares/validator.middleware.js';
import {userRegisterValidator,userLoginValidator} from '../validators/index.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

//Public routes
router.route('/register').post(userRegisterValidator(),validate,registerUser);
router.route('/login').post(userLoginValidator(),validate,login);
router.route('/refresh-token').post(refreshAccessToken);

//Protected routes
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/current-user').get(verifyJWT,getCurrentUser);

export default router;

