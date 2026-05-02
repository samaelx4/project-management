import {User} from '../models/user.models.js'
import {ApiError} from '../utils/api-error.js'
import {ApiResponse} from '../utils/api-response.js'
import {asyncHandler} from '../utils/async-handler.js'
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from '../utils/mail.js'

const generateAccessandRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {refreshToken,accessToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    const {email, username, password, role} = req.body;
    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409, "User with email or username is already there", [])
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTempToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user?.email,
        subject: "please verify ur email",
        mailgenContent: emailVerificationMailgenContent(user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    })

    const createduser = await User.findById(user._id).select("-password -refreshToken")
    if(!createduser){
        throw new ApiError(500,"something went wrong while registring the user")
    }
    return res
        .status(201)
        .json(
        new ApiResponse(
                200,
                { user: createduser },
                "User registered successfully"
            )
        )
})

const login = asyncHandler(async(req,res)=>{
    const {email,password,username} = req.body;
    if(!email){
        throw new ApiError(400," email is required")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400,"user not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(400,"password is incorrect")
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        ))
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(200,{},"User logged out succefully")
})

const forgotPasswordRequest = asyncHandler(async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404, "user not found")
    }
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user?.email,
        subject: "password reset request",
        mailgenContent: forgotPasswordMailgenContent(user.username,
            `${process.env.FORGOT_PASSOWORD_REDIRECT_URL}/${unHashedToken}`
        )
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "password has been sent to ur email"
            )
        )
})

const forgotPasswordRequest = asyncHandler(async(req,res)=>{
    const {resetToken} = req.params
    const {newPassword} = req.body
    
    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })
    if(!user){
        throw new ApiError(489, "Token is invalid or expired")
    }
    
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res
        .status(200)
        .json(new ApiResponse(200,{},"password reset successfully"))
})



export {registerUser, login, logoutUser}