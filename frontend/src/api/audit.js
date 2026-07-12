import api from "./axios";

export const getAuditLogs = async (params = {}) => {
  const { data } = await api.get("audit-logs/", { params });
  return data;
};

export const exportAuditLogs = async (params = {}) => {
  const response = await api.get("audit-logs/export/", {
    params,
    responseType: "blob",
  });
  return response.data;
};
