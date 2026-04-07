import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";

let isConfigured = false;

const configureCloudinary = () => {
    if (isConfigured) {
        return cloudinary;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new ApiError(
            500,
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
        );
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });

    isConfigured = true;
    return cloudinary;
};

const uploadBufferToCloudinary = (buffer, options = {}) => {
    const client = configureCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(options, (error, result) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(result);
        });

        uploadStream.end(buffer);
    });
};

const deleteCloudinaryAsset = async (publicId) => {
    if (!publicId) {
        return false;
    }

    const client = configureCloudinary();
    await client.uploader.destroy(publicId, { resource_type: "image" });
    return true;
};

export {
    configureCloudinary,
    uploadBufferToCloudinary,
    deleteCloudinaryAsset
};