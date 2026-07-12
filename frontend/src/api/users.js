import api from "./axios";

export const getUsers = async (params = {}) => {
  const { data } = await api.get("users/", {
    params,
  });

  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post("users/", payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`users/${id}/`, payload);
  return data;
};

export const assignRoles = async (id, role_ids) => {
  const { data } = await api.put(`users/${id}/roles/`, {
    role_ids,
  });

  return data;
};

export const deactivateUser = async (id) => {
  const { data } = await api.delete(`users/${id}/`);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`users/${id}/`);
  return data;
};

export const exportUsers = async (params = {}) => {
  const response = await api.get("users/export/", {
    params,
    responseType: "blob",
  });

  return response.data;
};