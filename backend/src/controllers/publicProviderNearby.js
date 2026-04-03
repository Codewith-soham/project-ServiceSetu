import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Service } from "../models/service.model.js";

const getNearbyProviders = asyncHandler(async (req, res) => {
    const { lat, lon , radius = 1000, serviceType, page = 1, limit = 10 } = req.query;

    if (!lat || !lon) {
        throw new ApiError(400, "Latitude and longitude are required");
    }

    const parseLat = parseFloat(lat);
    const parseLon = parseFloat(lon);
    const parseRadius = parseFloat(radius);
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

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
    };
    
    if(serviceType){
        filter.serviceType = serviceType.toLowerCase();
    }

    const total = await ServiceProvider.countDocuments(filter);

    const providers = await ServiceProvider.find(filter)
        .populate({
            path: "user",
            select: "fullname"
        })
        .select("serviceType rating totalReviews location")
        .skip(skip)
        .limit(limitNum)
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
    }));

    res.status(200)
        .json(new ApiResponse(
            200,
            {
                data: formattedProviders,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            },
            "Nearby providers retrieved successfully"
        ));
})

export { getNearbyProviders };