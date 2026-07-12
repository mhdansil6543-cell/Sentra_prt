import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <Sidebar />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
  component="main"
  sx={{
    minHeight: "100vh",
    bgcolor: "background.default",
    color: "text.primary",
    px: { xs: 2, md: 4.5 },
    py: { xs: 3, md: 3.5 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
