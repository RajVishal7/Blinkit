import sendEmail from "../Config/sendEmail.js";
import UserModel from "../models/user.models.js";
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from "../utilis/verifyEmailTemplate.js";
import generatedAccessToken from "../utilis/generatedAccessToken.js";
import generatedRefreshToken from "../utilis/generatedRefreshToken.js";
import upload from "../middleware/multer.js";
import uploadImageClodinary from "../utilis/uploadImageClodinary.js";
import generatedOtp from "../utilis/generatedOtp.js";
import jwt from 'jsonwebtoken'


export async function registerUserController(request, response) {

    try {
        const { name, email, password } = request.body

        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if (user) {
            return response.json({
                message: "Already register email",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashpassword = await bcryptjs.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashpassword
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        const verifyEmailUrl = '${process.env.FRONTEND_URL}/verify-email?code=${saveUser._id}';

        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: "verify email from blinkiit",
            html: "verify email from blinkiit",
            name,
            url: verifyEmailUrl
        })
        return response.json(
            {
                message: false,
                error: false,
                success: true,
                data: save
            }
        )
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body
        const user = await UserModel.findOne({ _id: code });

        if (!user) {
            return response.status(400).json({
                message: "Invalid code",
                error: true,
                sucess: false
            })
        }
        const updateUser = await UserModel.updateOne({ _id: code }, {
            verify_email: true
        })

        return response.json({
            message: "verify email done",
            success: true,
            error: false
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function loginController(request, response) {
    try {

        const { email, password } = request.body
        

        if (!email || !password) {
            return response.status(400).json({
                message: "provided email, password",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })
        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }
        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to Admin",
                error: true,
                success: false
            })
        }
        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return response.status(400).json({
                message: "check your password",
                error: true,
                success: false
            })
        }
        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await generatedrefreshToken(user._id);

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            semesite: "None"
        }
        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken ', refreshToken, cookiesOption)

        return response.json({
            message: "Login sucessfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
//logout controller

export async function logoutController(request, response) {
    try {
        const userid = request.userid

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            semesite: "None"
        }

        response.clearCookie("accessToken", cookiesOption);
        response.clearCookie("refreshToken", cookiesOption);

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: " "
        })

        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//uplload user avtar
export async function uploadAvtar(request, response) {
    try {
        const userId = request.userId // auth middlware
        const image = request.file //multer middleware

        const upload = await uploadImageClodinary(image)

        const updateUser = await UserModel.findByIdAndUpdate(userId, {
            avatar: upload.url
        })

        return response.json({
            message: "upload profile",
            data: {
                _id: userId,
                avatar: upload.url
            }

        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//upload user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body

        let hashpassword = " "

        if (password) {
            const salt = await bcryptjs.genSalt(10)
            const hashpassword = await bcryptjs.hash(password, salt)
        }

        const updateUser = await UserModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashpassword })

        })
        return response.json({
            message: "updated user successfully",
            error: false,
            success: true,
            data: updateUser
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// forgot password not login
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }
        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        const update = await UserModel.findByIdAndUpdate(user._id, {

            forgot_password_otp: otp,
            forgot_password_expiry: new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo: email,
            subject: "Forgot password fromm Blinkiit",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp
            })
        })

        return response.json({
            message: "check your email",
            error: false,
            success: true
        })
    }
    catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body

        if (!email || !otp) {
            return response.status(400).json({
                message: "provided required field email, otp.",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        const currenTime = new Date().toISOString()

        if (user.forgot_password_expiry < currenTime) {
            return response.status(400).json({
                message: "otp is expired",
                error: true,
                success: false
            })
        }
        if (otp !== user.forgot_password_expiry) {
            return response.status(400).json({
                message: "Invalid otp",
                error: true,
                success: false
            })
        }

        // if otp is not expired
        // otp === user.forgot_password_otp

        return response.json({
            message: "verify otp successfully",
            error: false,
            success: true,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
export async function resetpassword(request, response) {
    try {

        const { email, newpassword, confirmPassword } = request.body

        if (!email || !newpassword || !confirmPassword) {
            return response.status(400).json({
                message: "provided required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }
        if (newpassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same",
                error: true,
                success: false,
            })
        }
        const salt = await bcryptjs.genSalt(10)

        const hashpassword = await bcryptjs.hash(newpassword, salt)

        const update = await UserModel.findOneAndDelete(user._id, {
            password: hashpassword
        })
        return response.json({
            message: "password updated sucessfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
//  refresh token controller
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.header?.
            authorization?.split(" ")[1]
        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }
        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }


        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            semesite: "None" 
        }


        response.cookie('accesstoken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accesstoken: newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}