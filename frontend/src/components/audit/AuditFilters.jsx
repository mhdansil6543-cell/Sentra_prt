import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";

const actionOptions = [
  { value: "", label: "All actions" },
  { value: "login", label: "LOGIN" },
  { value: "logout", label: "LOGOUT" },
  { value: "USER", label: "USER" },
  { value: "ROLE", label: "ROLE" },
  { value: "PERMISSION", label: "PERMISSION" },
];

function AuditFilters({ filters, users, onFilterChange, onRefresh }) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "minmax(260px, 1.4fr) minmax(150px, 0.8fr) minmax(190px, 1fr) minmax(150px, 0.75fr) minmax(150px, 0.75fr) auto",
          },
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          value={filters.search}
          onChange={(event) => onFilterChange("search", event.target.value)}
          placeholder="Search username, email, action, target..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: 14,
              bgcolor: "#FFFFFF",
            },
          }}
        />

        <FormControl size="small">
          <InputLabel sx={{ fontSize: 14 }}>Action</InputLabel>
          <Select
            value={filters.action}
            label="Action"
            onChange={(event) => onFilterChange("action", event.target.value)}
            sx={{ borderRadius: "8px", fontSize: 14 }}
          >
            {actionOptions.map((option) => (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel sx={{ fontSize: 14 }}>User</InputLabel>
          <Select
            value={filters.actor}
            label="User"
            onChange={(event) => onFilterChange("actor", event.target.value)}
            sx={{ borderRadius: "8px", fontSize: 14 }}
          >
            <MenuItem value="">All users</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.full_name || user.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="From"
          type="date"
          value={filters.from}
          onChange={(event) => onFilterChange("from", event.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: 14,
            },
          }}
        />

        <TextField
          label="To"
          type="date"
          value={filters.to}
          onChange={(event) => onFilterChange("to", event.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: 14,
            },
          }}
        />

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          sx={{
            borderColor: "#D1D5DB",
            borderRadius: "10px",
            color: "#374151",
            fontSize: 14,
            fontWeight: 700,
            minHeight: 40,
            px: 2.5,
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: "#F9FAFB",
              borderColor: "#9CA3AF",
            },
          }}
        >
          Refresh
        </Button>
      </Box>
    </Paper>
  );
}

export default AuditFilters;
