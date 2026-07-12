import CheckIcon from "@mui/icons-material/Check";
import { Box, Paper, Typography } from "@mui/material";

function PermissionCard({ permission }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 64,
        border: "1px solid #0F766E",
        borderRadius: "12px",
        bgcolor: "#F0FDFA",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(15, 118, 110, 0.14)",
        },
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "5px",
          bgcolor: "#0F766E",
          color: "#FFFFFF",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <CheckIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "#020617", fontSize: 15, fontWeight: 900, lineHeight: 1.2 }} noWrap>
          {permission.label}
        </Typography>
        <Typography sx={{ color: "#8290A7", fontSize: 14, lineHeight: 1.35, mt: 0.25 }} noWrap>
          {permission.description || "Permission granted"}
        </Typography>
      </Box>
    </Paper>
  );
}

export default PermissionCard;
