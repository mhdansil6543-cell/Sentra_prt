import { Stack, Box, Typography } from "@mui/material";

function StatusChip({ active }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: active ? "#10b981" : "#ef4444",
        }}
      />

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: active ? "#10b981" : "#ef4444",
        }}
      >
        {active ? "Active" : "Inactive"}
      </Typography>
    </Stack>
  );
}

export default StatusChip;