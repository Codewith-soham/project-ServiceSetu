// Main: user profile actions and user-side booking updates.
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bcrypt from 'bcryptjs';
import { Booking } from '../models/booking.model.js';

//user profile

const getCurrentUserProfile = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id).select('-password');
     
    if(!user){
        throw new ApiError(404,'User not found');
    }

    res
    .status(200)
    .json(new ApiResponse(200, user, 'User profile retrieved successfully'));
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

    if (!updateUser) {
        throw new ApiError(404, 'User not found');
    }

    res
    .status(200)
    .json(new ApiResponse(200, updateUser, 'User profile updated successfully'));
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
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

const getUserBookings = asyncHandler(async (req, res) => {

    const bookings = await Booking.find({ user: req.user._id })
        .populate({
            path: "provider",
            select: "serviceType price rating",
            populate: {
                path: "user",
                select: "fullname address"
            }
        })
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, bookings, "Bookings retrieved successfully")
    );
});

const cancelBookingByUser = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id
    });

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (!["pending", "accepted"].includes(booking.status)) {
        throw new ApiError(400, "Cannot cancel this booking");
    }

    booking.status = "cancelled_by_user";
    await booking.save();

    res.status(200).json(
        new ApiResponse(200, booking, "Booking cancelled successfully")
    );
});

const confirmServiceCompletionByUser = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id
    });

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.status !== "service_completed_by_provider") {
        throw new ApiError(400, "Only bookings marked as completed by provider can be confirmed");
    }

    booking.status = "completed";
    booking.completedAt = new Date();
    await booking.save();

    res.status(200).json(
        new ApiResponse(200, booking, "Booking marked as completed successfully")
    );
});

export {
    getCurrentUserProfile,
    updateUserProfile,
    changeUserPassword,
    getUserBookings,
    cancelBookingByUser,
    confirmServiceCompletionByUser
}