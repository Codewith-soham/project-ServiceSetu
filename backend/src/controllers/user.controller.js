import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';

//registering a user
const registerUser = asyncHandler(async (req, res) => {

    console.log("BODY: ", req.body);

    const {fullname, email, username, password, phone, address} = req.body;

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
            address
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if(!createdUser) {
            throw new ApiError(500, "User creation failed");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, createdUser, "User created successfully"));
    }
    catch(error) {
        console.error(error);
        
        throw new ApiError(500, "User creation failed");
    }

})

//login user 
const loginUser = asyncHandler(async (req, res) => {
    const {email , phone , password} = req.body;

    //validation input
     if (!password || (!email && !phone)) {
        throw new ApiError(400, "Email or phone and password are required");
    }

    //finding user with email or phone
    const user = await User.findOne(
        {
            $or: [{email}, {phone}]
        }
    );

    if(!user) {
        throw new ApiError(400, "User does not exist");
    }

    //compare password
    const isPasswordCorrect = await user.checkPassword(password);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    //generate tokens 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //saving refresh token in database
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    //cookie configuration
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }
    
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200,
            {
                user: {
                    id: user._id,
                    email: user.email,
                    fullname: user.fullname, 
                },
                accessToken
            },
            "User logged in successfully"
        ))


})


export {
    registerUser,
    loginUser
}