import axios from "./axios"

export const becomeProvider = async (data) => {
  return axios.post("/providers/become", data)
}