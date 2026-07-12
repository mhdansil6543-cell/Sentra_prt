import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";

import {
  Dashboard,
  People,
  History,
  Logout,
  ShieldOutlined,
} from "@mui/icons-material";

import { NavLink } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import { canViewAuditLogs, canViewRoles, canViewUsers, getPrimaryRole } from "../../auth/permissions";

const drawerWidth = 272;

const menus = [
  {
    text: "Dashboard",
    icon: <Dashboard />,
    path: "/",
  },
  {
    text: "Users",
    icon: <People />,
    path: "/users",
    canAccess: canViewUsers,
  },
  {
    text: "Roles & Permissions",
    icon: <ShieldOutlined />,
    path: "/roles",
    canAccess: canViewRoles,
  },
  {
    text: "Audit Log",
    icon: <History />,
    path: "/audit",
    canAccess: canViewAuditLogs,
  },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const initials = (user?.full_name || user?.email || "S")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const displayName = user?.full_name || user?.email || "Sentra user";
  const roleLabel = getPrimaryRole(user);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#111827",
          color: "#f8fafc",
          borderRight: 0,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 2 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: "#0f8b87",
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          S
        </Avatar>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: 0 }}
        >
          Sentra
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <List sx={{ px: 1.5, pt: 1.5 }}>
          {menus
            .filter((item) => !item.canAccess || item.canAccess(user))
            .map((item) => (
              <ListItemButton
                key={item.text}
                component={NavLink}
                to={item.path}
                end={item.path === "/"}
                sx={{
                  minHeight: 46,
                  borderRadius: 1,
                  mb: 0.75,
                  color: "#bfd0e4",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    minWidth: 34,
                  },
                  "&.active": {
                    bgcolor: "#153f43",
                    color: "#fff",
                  },
                  "&:hover": {
                    bgcolor: "#18343a",
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                />
              </ListItemButton>
            ))}
        </List>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ borderTop: "1px solid #263241", p: 2, display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar
            sx={{
              bgcolor: "#38dcca",
              color: "#052b2c",
              width: 40,
              height: 40,
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ color: "#9bb0c8", fontSize: 13 }} noWrap>
              {roleLabel}
            </Typography>
          </Box>
          <IconButton
            aria-label="Logout"
            onClick={logout}
            sx={{ color: "#94a3b8" }}
            size="small"
          >
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
