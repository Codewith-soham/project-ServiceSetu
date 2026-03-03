import api, { extractApiData } from "./api";

export const getProviders = async (serviceType = "") => {
  const response = await api.get("/getProviders/provider", {
    params: serviceType ? { serviceType } : {},
  });
  return extractApiData(response);
};

export const becomeProvider = async (payload) => {
  const response = await api.post("/providers/become", payload);
  return extractApiData(response);
};

export const createBooking = async (payload) => {
  const response = await api.post("/bookings/create", payload);
  return extractApiData(response);
};

export const getProviderBookings = async () => {
  const response = await api.get("/bookings/provider-bookings");
  return extractApiData(response);
};
