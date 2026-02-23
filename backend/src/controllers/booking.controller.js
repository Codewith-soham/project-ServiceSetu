import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";

const createBooking = asyncHandler(async (req, res) => {

    const { providerId, bookingDate, address, note} = req.body;

    //check provider exist or not
    const existingProvider = await ServiceProvider.findById(providerId)

    if(!existingProvider){
        throw new ApiError(404, "Provider not found");
    }

    if(!existingProvider.isAvailable || !existingProvider.isApproved || !existingProvider.isActive){ 
        throw new ApiError(404, "Provider not available or not found");
    }

    const booking = await Booking.create({
        user: req.user._id,
        provider: providerId,
        category: existingProvider.serviceType,
        bookingDate,
        address,
        note
    })

    res
    .status(201)
    .json(new ApiResponse(
        201,
        booking,
        "Booking created successfully"
    ))
})

const bookingStatus = asyncHandler (async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    if(!["accepted","rejected","pending"].includes(status)){
        throw new ApiError(400, "Invalid status value");
    }

    const booking = await Booking.findById(bookingId);

    if(!booking){
        throw new ApiError(404, "Booking not found");
    }

    booking.status = status;
    await booking.save();

    res
    .status(200)
    .json(new ApiResponse(
        200,
        booking,
        `Booking ${status} successfully`
    ))
})

export {
    createBooking,
    bookingStatus
}