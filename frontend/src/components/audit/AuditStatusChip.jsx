import { Chip } from "@mui/material";

function AuditStatusChip({ status = "Success" }) {
  const failed = String(status).toLowerCase() === "failed";

  return (
    <Chip
      label={failed ? "Failed" : "Success"}
      size="small"
      sx={{
        bgcolor: failed ? "#FEF2F2" : "#ECFDF5",
        color: failed ? "#B91C1C" : "#047857",
        borderRadius: "8px",
        fontSize: 12,
        fontWeight: 800,
        height: 28,
      }}
    />
  );
}

export default AuditStatusChip;
