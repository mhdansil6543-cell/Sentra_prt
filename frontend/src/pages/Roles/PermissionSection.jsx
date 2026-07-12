import { Box, Typography } from "@mui/material";

import PermissionCard from "./PermissionCard";

function PermissionSection({ title, permissions }) {
  if (!permissions.length) {
    return null;
  }

  return (
    <Box>
      <Typography
        sx={{
          color: "#8290A7",
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1.3,
          mb: 1.5,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(280px, 1fr))",
            lg: "repeat(auto-fit, minmax(280px, 1fr))",
          },
          gap: 2,
        }}
      >
        {permissions.map((permission) => (
          <PermissionCard key={permission.label} permission={permission} />
        ))}
      </Box>
    </Box>
  );
}

export default PermissionSection;
