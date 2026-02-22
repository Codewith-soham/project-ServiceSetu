import { ServiceProvider } from "../models/serviceProvider.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const becomeProvider = asyncHandler(async (req, res) => {

    const { serviceType } = req.body;

    // improved validation
    if (!serviceType || serviceType.trim() === "") {
        throw new ApiError(400, "Service type is required");
    }

    const userId = req.user._id;

    // extra safety check
    const user = await User.findById(userId);
    if (user.role === "provider") {
        throw new ApiError(400, "You are already a provider");
    }

    const existingProvider = await ServiceProvider.findOne({ user: userId });

    if (existingProvider) {
        throw new ApiError(400, "You are already a provider");
    }

    const provider = await ServiceProvider.create({
        user: userId,
        serviceType: serviceType.trim(),
    });

    // update user role
    await User.findByIdAndUpdate(
        userId,
        { role: "provider" },
        { new: true }
    );

    return res.status(201).json(
        new ApiResponse(201, provider, "You are now a provider")
    );
});

export { becomeProvider };