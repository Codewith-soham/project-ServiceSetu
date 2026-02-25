import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Service } from "../models/service.model.js";

const getNearbyProviders = asyncHandler(async (req, res) => {
    const { lat, lon , radius = 1000, serviceType } = req.query;

    if (!lat || !lon) {
        throw new ApiError(400, "Latitude and longitude are required");
    }

    const parseLat = parseFloat(lat);
    const parseLon = parseFloat(lon);
    const parseRadius = parseFloat(radius);

    if(isNaN(parseLat) || isNaN(parseLon)){
        throw new ApiError(400, "Invalid latitude, longitude");
    }

    const filter = {
        isApproved: true,
        isActive: true,
        isAvailable: true,
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseLon, parseLat]
                },
                $maxDistance: parseRadius
                }
            }
        }
    
    if(serviceType){
        filter.serviceType = serviceType.toLowerCase();
    }

    const providers = await ServiceProvider.find(filter)
        .populate({
            path: "user",
            select: "fullname"
        })
        .select("serviceType rating totalReviews location")
        .lean();

    const serviceTypes = [...new Set(providers.map((provider) => provider.serviceType))];
    const services = await Service.find({ serviceType: { $in: serviceTypes } })
        .select("serviceType price")
        .lean();
    const priceByType = new Map(services.map((service) => [service.serviceType, service.price]));

    const formattedProviders = providers.map((provider) => ({
        id: provider._id,
        fullname: provider.user.fullname,
        serviceType: provider.serviceType,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
        location: provider.location,
        price: priceByType.get(provider.serviceType) ?? null
    }))

    res.status(200)
        .json(new ApiResponse(
            200,
            formattedProviders,
            "Nearby providers retrieved successfully"
        ))
})

export { getNearbyProviders };