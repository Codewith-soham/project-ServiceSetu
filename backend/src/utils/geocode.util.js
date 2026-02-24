import axios from "axios";

export const getCoordinatesFromAddress = async (address) => {
    const respponse = await axios.get(
        "hhttps://maps.googleapis.com/maps/api/geocode/json",
        {
            params: {
                q: address,
                format: "json",
                limit: 1
            },
            Headers: {
                "user-agent": "ServiceSetuApp"
            }
        }
    )

    if(!Response.data.length){
        throw new Error("Unable to geocode the provided address.")
    }

    const { lat, lon } = Response.data[0];

    return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
    }
}
