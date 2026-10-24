import {Router} from 'express';
import { register, verifyEmail, login, getMe, resendVerification, forgotPassword, resetPassword } from '../controller/auth.controller.js';
import { validateRegister, validateLogin, validateVerifyEmail, validateEmailOnly, validateResetPassword } from '../validator/validate.js';
import { userAuth } from '../middleware/auth.middleware.js';
const authRouter = Router();


/** @route POST api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', validateRegister,register);


/** @route POST api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', validateLogin ,login);


/** @route POST api/auth/verify-email
 * @desc Verify a user's email address (token comes from the emailed link)
 * @access Public
 */
authRouter.post('/verify-email', validateVerifyEmail, verifyEmail);

/** @route POST api/auth/resend-verification
 * @desc Send a fresh verification email
 * @access Public
 */
authRouter.post('/resend-verification', validateEmailOnly, resendVerification);

/** @route POST api/auth/forgot-password
 * @desc Email a password reset link
 * @access Public
 */
authRouter.post('/forgot-password', validateEmailOnly, forgotPassword);

/** @route POST api/auth/reset-password
 * @desc Set a new password using the emailed token
 * @access Public
 */
authRouter.post('/reset-password', validateResetPassword, resetPassword);

/** @route GET api/auth/getMe
 * @desc Get the authenticated user's information
 * @access Private
 */
authRouter.get('/getMe', userAuth, getMe)



export default authRouter;