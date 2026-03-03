import api, { extractApiData } from "./api";

export const registerUser = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return extractApiData(response);
};

export const loginUser = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return extractApiData(response);
};

export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return extractApiData(response);
};
