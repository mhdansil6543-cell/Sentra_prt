import { Box, Paper, Typography } from "@mui/material";

import RoleCard from "./RoleCard";

function RoleList({ roles, selectedRoleId, onSelectRole }) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "18px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E2E8F0" }}>
        <Typography sx={{ color: "#020617", fontSize: 18, fontWeight: 800 }}>Roles</Typography>
      </Box>
      <Box>
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={role.id === selectedRoleId}
            onSelect={onSelectRole}
          />
        ))}
      </Box>
    </Paper>
  );
}

export default RoleList;
