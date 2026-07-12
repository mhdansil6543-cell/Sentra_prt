import api from "./axios";

export const getRoles = async (params = {}) => {
  const { data } = await api.get("roles/", { params });
  return data;
};

export const createRole = async (payload) => {
  const { data } = await api.post("roles/", payload);
  return data;
};

export const updateRole = async (id, payload) => {
  const { data } = await api.patch(`roles/${id}/`, payload);
  return data;
};

export const updateRolePermissions = async (id, permissions) => {
  const { data } = await api.put(`roles/${id}/permissions/`, { permissions });
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await api.delete(`roles/${id}/`);
  return data;
};

export const exportRoles = async (params = {}) => {
  const response = await api.get("roles/export/", {
    params,
    responseType: "blob",
  });
  return response.data;
};
