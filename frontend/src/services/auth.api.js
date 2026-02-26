import axios from "./axios"

export const registerUser = async (data) => {
  return axios.post("/auth/register", data)
}