import multer from "multer";
import { ApiError } from "./ApiError.js";

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const MAX_PROVIDER_IMAGE_SIZE = 5 * 1024 * 1024;

const providerImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_PROVIDER_IMAGE_SIZE
    },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new ApiError(400, "Only JPG, PNG and WEBP images are allowed"));
            return;
        }

        cb(null, true);
    }
});

const providerImageUploadMiddleware = (req, res, next) => {
    providerImageUpload.single("image")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
                next(new ApiError(400, "Provider image must be 5MB or smaller"));
                return;
            }

            next(new ApiError(400, err.message || "Invalid provider image"));
            return;
        }

        next();
    });
};

export {
    providerImageUpload,
    providerImageUploadMiddleware,
    MAX_PROVIDER_IMAGE_SIZE
};