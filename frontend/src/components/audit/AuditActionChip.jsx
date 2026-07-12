import { Chip } from "@mui/material";

const actionStyles = {
  LOGIN: { bgcolor: "#ECFDF5", color: "#047857" },
  LOGOUT: { bgcolor: "#F8FAFC", color: "#475569" },
  "CREATE USER": { bgcolor: "#EFF6FF", color: "#1D4ED8" },
  "UPDATE USER": { bgcolor: "#EEF2FF", color: "#4338CA" },
  "DELETE USER": { bgcolor: "#FEF2F2", color: "#B91C1C" },
  "CREATE ROLE": { bgcolor: "#F0FDFA", color: "#0F766E" },
  "UPDATE ROLE": { bgcolor: "#F5F3FF", color: "#6D28D9" },
  "DELETE ROLE": { bgcolor: "#FFF1F2", color: "#BE123C" },
  "ASSIGN ROLE": { bgcolor: "#FFFBEB", color: "#B45309" },
};

function formatAction(action = "") {
  const normalized = action.replace(/[._-]+/g, " ").trim().toUpperCase();

  if (normalized === "USER CREATE") return "CREATE USER";
  if (normalized === "USER UPDATE") return "UPDATE USER";
  if (normalized === "USER DELETE") return "DELETE USER";
  if (normalized === "ROLE CREATE") return "CREATE ROLE";
  if (normalized === "ROLE UPDATE") return "UPDATE ROLE";
  if (normalized === "ROLE DELETE") return "DELETE ROLE";
  if (normalized === "ROLE ASSIGNMENT") return "ASSIGN ROLE";
  if (normalized === "PERMISSION ASSIGNMENT") return "ASSIGN ROLE";

  return normalized || "UNKNOWN";
}

function AuditActionChip({ action }) {
  const label = formatAction(action);
  const colors = actionStyles[label] || { bgcolor: "#F1F5F9", color: "#334155" };

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        ...colors,
        borderRadius: "8px",
        fontSize: 12,
        fontWeight: 800,
        height: 28,
      }}
    />
  );
}

export default AuditActionChip;
