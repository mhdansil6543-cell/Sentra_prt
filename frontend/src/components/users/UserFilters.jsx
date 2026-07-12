import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onRefresh,
}) {
  return (
    <Stack
      direction="row"
      spacing={2.5}
      alignItems="center"
      sx={{
        "@media (max-width: 1024px)": {
          flexWrap: "wrap",
          "& > div": {
            minWidth: "100% !important",
          },
        },
      }}
    >
      <TextField
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        variant="outlined"
        size="small"
        sx={{
          width: 360,
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: "14px",
          },
          "& .MuiOutlinedInput-input::placeholder": {
            color: "#9ca3af",
            opacity: 1,
          },
          "@media (max-width: 1024px)": {
            width: "100%",
          },
        }}
      />

      <FormControl
        size="small"
        sx={{
          width: 170,
          "@media (max-width: 1024px)": {
            width: "100%",
          },
        }}
      >
        <InputLabel sx={{ fontSize: "14px" }}>All roles</InputLabel>
        <Select
          value={role}
          label="All roles"
          onChange={(e) => onRoleChange(e.target.value)}
          sx={{
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <MenuItem value="">All roles</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="Manager">Manager</MenuItem>
          <MenuItem value="Viewer">Viewer</MenuItem>
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{
          width: 170,
          "@media (max-width: 1024px)": {
            width: "100%",
          },
        }}
      >
        <InputLabel sx={{ fontSize: "14px" }}>All statuses</InputLabel>
        <Select
          value={status}
          label="All statuses"
          onChange={(e) => onStatusChange(e.target.value)}
          sx={{
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}

export default UserFilters;
