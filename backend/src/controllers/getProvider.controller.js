// Main: public provider listing and filtering.
import { ServiceProvider } from '../models/serviceProvider.model.js';
import { Service } from '../models/service.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

//get all service providers

const getallServiceProvides = asyncHandler(async (req, res) => {

    const { serviceType } = req.query;  //will take servicetype from user as query parameter to filter the providers by service type

    const filter = {
        isApproved: true,
        isActive: true,
        isAvailable: true
    }

    if(serviceType){
        filter.serviceType = serviceType
    }


    const providers = await ServiceProvider.find(filter)
        .populate({
            path: 'user',
            select: 'fullname'
        })
        .select('serviceType rating totalReviews')
        .lean(); // optional but recommended will get plain JavaScript objects instead of Mongoose documents faster

    const serviceTypes = [...new Set(providers.map((provider) => provider.serviceType))];
    const services = await Service.find({ serviceType: { $in: serviceTypes } })
        .select('serviceType price')
        .lean();
    const priceByType = new Map(services.map((service) => [service.serviceType, service.price]));

    if (providers.length === 0) {
        throw new ApiError(404, "No service providers found");
    }

    const formattedProviders = providers.map(provider => ({
        id: provider._id,
        name: provider.user.fullname,
        serviceType: provider.serviceType,
        rating: provider.rating,
        totalReviews: provider.totalReviews,
        price: priceByType.get(provider.serviceType) ?? null
    }));

    res.status(200).json(
        new ApiResponse(200, formattedProviders, "Service Providers fetched successfully")
    );
});


export {
    getallServiceProvides
}