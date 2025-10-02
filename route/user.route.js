import { Router } from 'express';
import { 
    forgotPasswordController, 
    loginController, 
    logoutController, 
    refreshToken, 
    registerUserController, 
    resetpassword, 
    uploadAvtar, 
    verifyForgotPasswordOtp, 
    verifyEmailController,       // ✅ added
    updateUserDetails            // ✅ added
} from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';    // ✅ fixed import
import upload from '../middleware/multer.js';

const userRouter = Router();

userRouter.post('/register', registerUserController);
userRouter.post('/verify-email', verifyEmailController);
userRouter.post('/login', loginController);
userRouter.get('/logout', auth, logoutController);
userRouter.put('/upload-avtar', auth, upload.single('avtar'), uploadAvtar);
userRouter.put('/update-user', auth, updateUserDetails);
userRouter.put('/forgot-password', forgotPasswordController);
userRouter.put('/verify-forgot-password', verifyForgotPasswordOtp);
userRouter.put('/reset-password', resetpassword);
userRouter.post('/refresh-token', refreshToken);

export default userRouter;
