import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

//user profile

const getCurrentUserProfile = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id).select('-password');
     
    if(!user){
        throw new ApiError(404,'User not found');
    }

    res
    .status(200)
    .json(new ApiResponse(200,'User profile retrieved successfully',user));
}) 

//user update profile

const updateUserProfile = asyncHandler(async (req,res) => {
    const { fullname, phone, address } = req.body;

    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {fullname, phone, address}
        },
        {
            new: true,
            runValidators: true // to ensure that the updated data is validated against the schema
        }
    ).select('-password')

    res
    .status(200)
    .json(new ApiResponse(200,'User profile updated successfully',updateUser));
})

//change password

const changeUserPassword = asyncHandler(async (req,res) => {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Both passwords are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200)
        .json(new ApiResponse(200, "Password changed successfully"));
});

export {
    getCurrentUserProfile,
    updateUserProfile,
    changeUserPassword
}