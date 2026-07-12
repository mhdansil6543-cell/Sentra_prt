import { Chip } from "@mui/material";

function RoleChip({ roles }) {
  if (!roles?.length) {
    return (
      <Chip
        label="No Role"
        size="small"
        sx={{
          backgroundColor: "#d1fae5",
          color: "#047857",
          fontWeight: 500,
        }}
      />
    );
  }

  const role = roles[0];

  return (
    <Chip
      label={role}
      size="small"
      sx={{
        backgroundColor: "#d1fae5",
        color: "#047857",
        fontWeight: 500,
      }}
    />
  );
}

export default RoleChip;