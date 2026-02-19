import { ServiceProvider } from "../models/serviceProvider.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const becomeProvider = asyncHandler(async (req, res) => {

    const { serviceType, price } = req.body;

    if (!serviceType) {
        throw new ApiError(400, "Service type is required");
    }

    const userId = req.user.id;

    const existingProvider = await ServiceProvider.findOne({ user: userId });

    if (existingProvider) {
        throw new ApiError(400, "You are already a provider");
    }

    const provider = await ServiceProvider.create({
        user: userId,
        serviceType,
        price
    });

    // update user role
    await User.findByIdAndUpdate(userId, { role: "provider" });

    return res.status(201).json(
        new ApiResponse(201, provider, "You are now a provider")
    );
});

export { becomeProvider };
