import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Service } from '../models/service.model.js';

const setPrice = asyncHandler(async (req, res) => {
    const { serviceType, price } = req.body;

    if(!serviceType || typeof price !== 'number' || price <= 0) {
        throw new ApiError(400, "Service type and valid price are required");
    }

    const updateService = await Service.findOneAndUpdate(
        {
            serviceType
        },
        {
            price   
        },
        {new: true}
    )

    if(!updateService) {
        throw new ApiError(404, "Service not found");
    }

    res.status(200).json(new ApiResponse(true, updateService, `Price updated ${serviceType} successfully`));
})

export {
    setPrice
}