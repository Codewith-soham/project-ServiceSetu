import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyToken = asyncHandler(async (req, res, next) => {

    //extract token from cookie
    const token = req.cookies?.accessToken;

    if(!token){
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    //verify token
     try {
       const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
       const user = await User.findById(decodedToken?.id).select("-password -refreshToken")

       if(!user){
        throw new ApiError(401, "Unauthorised")
       }

       req.user = user 

       //transfer the flow control
       next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})
