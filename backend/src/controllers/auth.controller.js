// Main: auth registration and login handlers.
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';

//registering a user
const registerUser = asyncHandler(async (req, res) => {

    console.log("BODY: ", req.body);

    const {fullname, email, username, password, phone, address } = req.body;

    //validation input
   if ([fullname, email, username, password, phone, address]
    .some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }


    //check weather user exists or not
    const existedUser = await User.findOne(
        {
            $or: [{username}, {email}]
        }
    ).select("+password") //selecting password field explicitly as it is not selected by default in user model;

    if(existedUser) {
        throw new ApiError(400, "User already exists");
    }

    //create user 
    try{
        const user = await User.create({
            fullname,
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password,
            phone,
            address,
            role: "user" 
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if(!createdUser) {
            throw new ApiError(500, "User creation failed");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "User created successfully"));
    }
    catch(error) {
        console.error(error);
        
        throw new ApiError(500, "User creation failed");
    }
})

//login user 
const loginUser = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
        throw new ApiError(400, "Email or phone and password are required");
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const normalizedPhone = phone ? phone.trim() : null;

    const user = await User.findOne({
        $or: [
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ]
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordCorrect = await user.checkPassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: {
                    id: user._id,
                    email: user.email,
                    fullname: user.fullname,
                    role: user.role
                },
                accessToken
            }, "Login successful")
        );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Clear refreshToken in database
    await User.findByIdAndUpdate(userId, { refreshToken: "" });

    // Clear cookies
    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookies or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token not provided");
    }

    // Verify refresh token
    let decodedToken;
    try {
        decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Find user
    const user = await User.findById(decodedToken.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify refresh token matches stored token
    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Refresh token mismatch");
    }

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update user with new refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(new ApiResponse(200, {
            accessToken,
            refreshToken: newRefreshToken
        }, "Access token refreshed successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
