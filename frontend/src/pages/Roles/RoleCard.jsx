import { Box, Typography } from "@mui/material";

function RoleCard({ role, selected, onSelect }) {
  const userCount = role.users_count ?? 0;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(role.id)}
      sx={{
        width: "100%",
        minHeight: 80,
        border: 0,
        borderBottom: "1px solid #E2E8F0",
        borderLeft: selected ? "4px solid #0F766E" : "4px solid transparent",
        bgcolor: selected ? "#F0FDFA" : "#FFFFFF",
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 2,
        alignItems: "flex-start",
        textAlign: "left",
        px: 2.5,
        py: 2.25,
        transition: "background-color 160ms ease, border-color 160ms ease",
        "&:hover": {
          bgcolor: selected ? "#ECFDF5" : "#F8FAFC",
        },
        "&:last-of-type": {
          borderBottom: 0,
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "#020617", fontSize: 17, fontWeight: 800, lineHeight: 1.25 }} noWrap>
          {role.name}
        </Typography>
        <Typography sx={{ color: "#8290A7", fontSize: 14, lineHeight: 1.45, mt: 0.5 }} noWrap>
          {role.description || "Describe this role"}
        </Typography>
      </Box>
      <Typography sx={{ color: "#718096", fontSize: 14, lineHeight: 1.4, whiteSpace: "nowrap", pt: 0.25 }}>
        {userCount} {userCount === 1 ? "user" : "users"}
      </Typography>
    </Box>
  );
}

export default RoleCard;
