import api from "./axios";

export const getPermissions = async (params = {}) => {
  const { data } = await api.get("permissions/", { params });
  return data;
};
