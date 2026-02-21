import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/apiError.js';
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

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    });

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

    return res.status(200).json(
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



export {
    registerUser,
    loginUser
}