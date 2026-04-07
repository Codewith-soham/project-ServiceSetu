import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Service } from "../models/service.model.js";
import { getCoordinatesFromAddress } from "../utils/geocode.util.js";

const getNearbyProviders = asyncHandler(async (req, res) => {
    const { lat, lon, address, radius = 5000, serviceType, page = 1, limit = 10 } = req.query;

    let parseLat = Number(lat);
    let parseLon = Number(lon);

    if ((!Number.isFinite(parseLat) || !Number.isFinite(parseLon)) && address) {
        const coords = await getCoordinatesFromAddress(address);
        parseLat = Number(coords?.latitude);
        parseLon = Number(coords?.longitude);
    }

    if (!Number.isFinite(parseLat) || !Number.isFinite(parseLon)) {
        throw new ApiError(400, "Latitude/longitude or a valid address is required");
    }

    const parseRadius = parseFloat(radius);
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    if (!Number.isFinite(parseRadius) || parseRadius <= 0) {
        throw new ApiError(400, "Invalid radius");
    }

    const baseFilter = {
        isApproved: true,
        isActive: true,
        isAvailable: true
    };

    const nearFilter = {
        ...baseFilter,
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

    const countFilter = {
        ...baseFilter,
        location: {
            $geoWithin: {
                $centerSphere: [[parseLon, parseLat], parseRadius / 6378137]
            }
        }
    };
    
    if(serviceType){
        const normalizedServiceType = serviceType.toLowerCase();
        nearFilter.serviceType = normalizedServiceType;
        countFilter.serviceType = normalizedServiceType;
    }

    const total = await ServiceProvider.countDocuments(countFilter);

    const providers = await ServiceProvider.find(nearFilter)
        .populate({
            path: "user",
            select: "fullname"
        })
        .select("serviceType rating totalReviews location image")
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
        name: provider?.user?.fullname || "Service Provider",
        fullname: provider?.user?.fullname || "Service Provider",
        serviceType: provider.serviceType,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
        location: provider.location,
        image: provider.image || null,
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