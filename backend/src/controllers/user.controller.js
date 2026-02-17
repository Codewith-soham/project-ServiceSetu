import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';

//registering a user
const registerUser = asyncHandler(async (req, res) => {

    console.log("BODY: ", req.body);

    const {fullname, email, username, password} = req.body;

    //validation input
    if([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check weather user exists or not
    const existedUser = await User.findOne(
        {
            $or: [{username}, {email}]
        }
    );

    if(existedUser) {
        throw new ApiError(400, "User already exists");
    }

    //create user 
    try{
        const user = await User.create({
            fullname,
            email,
            username: username.toLowerCase(),
            password
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
        console.error("Error during user creation: ", error);
    }

})


export {
    registerUser
}