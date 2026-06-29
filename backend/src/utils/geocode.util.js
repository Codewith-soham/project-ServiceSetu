import axios from "axios";
import { ApiError } from "./ApiError.js";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

const normalizeAddress = (address) => {
    return String(address || "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[;|]+/g, ",");
};

const buildAddressCandidates = (rawAddress) => {
    const normalized = normalizeAddress(rawAddress);
    const compact = normalized.replace(/\s*,\s*/g, ", ");
    const noNearPrefix = compact.replace(/^near\s+/i, "").trim();

    const candidates = [compact];
    if (noNearPrefix && noNearPrefix !== compact) candidates.push(noNearPrefix);
    if (!/india$/i.test(compact)) candidates.push(`${compact}, India`);
    if (noNearPrefix && !/india$/i.test(noNearPrefix)) candidates.push(`${noNearPrefix}, India`);

    return [...new Set(candidates.filter(Boolean))];
};

const scoreResult = (item, address) => {
    const importance = Number(item?.importance || 0);
    const displayName = String(item?.display_name || "").toLowerCase();
    const query = address.toLowerCase();
    const queryTokens = query.split(/[\s,]+/).filter(Boolean);
    const tokenHits = queryTokens.reduce((acc, token) => (displayName.includes(token) ? acc + 1 : acc), 0);
    return importance + tokenHits * 0.1;
};

const fetchCandidateCoordinates = async (queryAddress) => {
    const response = await axios.get(NOMINATIM_SEARCH_URL, {
        params: {
            q: queryAddress,
            format: "jsonv2",
            limit: 5,
            addressdetails: 1,
            countrycodes: "in",
        },
        timeout: 8000,
        headers: {
            "user-agent": "ServiceSetuApp/1.0 (support@servicesetu.com)",
            "accept-language": "en-IN,en;q=0.9",
        },
    });

    const list = Array.isArray(response?.data) ? response.data : [];
    if (!list.length) return null;

    const bestMatch = [...list].sort((a, b) => scoreResult(b, queryAddress) - scoreResult(a, queryAddress))[0];
    const lat = Number(bestMatch?.lat);
    const lon = Number(bestMatch?.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    return {
        latitude: lat,
        longitude: lon,
        matchedAddress: bestMatch?.display_name || queryAddress,
    };
};

export const getCoordinatesFromAddress = async (address) => {
    const normalized = normalizeAddress(address);
    if (!normalized) {
        throw new ApiError(400, "Address is required for geocoding");
    }

    const candidates = buildAddressCandidates(normalized);
    let lastError = null;

    for (const candidate of candidates) {
        try {
            const result = await fetchCandidateCoordinates(candidate);
            if (result) {
                return {
                    latitude: result.latitude,
                    longitude: result.longitude,
                };
            }
        } catch (err) {
            lastError = err;
        }
    }

    if (lastError?.code === "ECONNABORTED") {
        throw new ApiError(503, "Geocoding service timeout. Please try again.");
    }

    throw new ApiError(
        400,
        "We could not detect this area. Please add city/state or a nearby landmark."
    );
};
