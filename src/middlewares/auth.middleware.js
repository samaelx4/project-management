import {User} from '../models/user.models.js'
import {ApiError} from '../utils/api-error.js'
import {asyncHandler} from '../utils/async-handler.js'
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedTOken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedTOken?._id).select("-password -refreshTOken -emailVerificationToken")
        if(!user){
            throw new ApiError(401, "invalid access token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "invalid access token")
    }
})
