import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
} from "@mui/material";

function Topbar() {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={1}
    >
      <Toolbar>
        <Typography
          variant="h6"
        >
          Dashboard
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Avatar>
          A
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;