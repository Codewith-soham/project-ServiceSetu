import axios from "axios";

export const getCoordinatesFromAddress = async (address) => {
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: address,
                format: "jsonv2",
                limit: 1
            },
            headers: {
                "user-agent": "ServiceSetuApp"
            }
        }
    );

    if (!response.data.length) {
        throw new Error("Unable to geocode the provided address.")
    }

    const { lat, lon } = response.data[0];

    return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
    }
}
