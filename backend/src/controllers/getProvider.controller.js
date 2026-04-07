// Main: public provider listing and filtering.
import { ServiceProvider } from '../models/serviceProvider.model.js';
import { Service } from '../models/service.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

//get all service providers

const getallServiceProvides = asyncHandler(async (req, res) => {

    const { serviceType, page = 1, limit = 10 } = req.query;  //will take servicetype from user as query parameter to filter the providers by service type

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
        isApproved: true,
        isActive: true,
        isAvailable: true
    }

    if(serviceType){
        filter.serviceType = String(serviceType).toLowerCase();
    }

    const total = await ServiceProvider.countDocuments(filter);

    const providers = await ServiceProvider.find(filter)
        .populate({
            path: 'user',
            select: 'fullname'
        })
        .select('serviceType rating totalReviews image')
        .skip(skip)
        .limit(limitNum)
        .lean(); // optional but recommended will get plain JavaScript objects instead of Mongoose documents faster

    const serviceTypes = [...new Set(providers.map((provider) => provider.serviceType))];
    const services = await Service.find({ serviceType: { $in: serviceTypes } })
        .select('serviceType price')
        .lean();
    const priceByType = new Map(services.map((service) => [service.serviceType, service.price]));

    const formattedProviders = providers.map(provider => ({
        id: provider._id,
        name: provider?.user?.fullname || 'Service Provider',
        fullname: provider?.user?.fullname || 'Service Provider',
        serviceType: provider.serviceType,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
        image: provider.image || null,
        price: priceByType.get(provider.serviceType) ?? null
    }));

    res.status(200).json(
        new ApiResponse(200, {
            data: formattedProviders,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        }, "Service Providers fetched successfully")
    );
});


export {
    getallServiceProvides
}