import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import { DataGrid } from "@mui/x-data-grid";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import { canManageUser } from "../../auth/permissions";

function StatusChip({ active }) {
  return (
    <Chip
      label={active ? "Active" : "Inactive"}
      color={active ? "success" : "error"}
      size="small"
      variant="filled"
    />
  );
}

function RoleChip({ roles }) {
  const role = roles?.[0] || "Viewer";

  let color = "default";

  if (role === "Admin") color = "secondary";
  else if (role === "Manager") color = "primary";
  else color = "success";

  return (
    <Chip
      label={role}
      color={color}
      size="small"
    />
  );
}

function ActionMenu({ row }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const canManage = canManageUser(currentUser, row);

  if (!canManage) {
    return null;
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    navigate(`/users/edit/${row.id}`);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleEdit}>
          Edit User
        </MenuItem>

        <MenuItem onClick={handleClose}>
          Assign Role
        </MenuItem>

        <MenuItem
          onClick={handleClose}
          sx={{ color: "error.main" }}
        >
          Deactivate
        </MenuItem>
      </Menu>
    </>
  );
}

const baseColumns = [
  
  {
  field: "full_name",
  headerName: "User",
  flex: 1.6,

  renderCell: (params) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Avatar
        src={params.row.avatar}
        sx={{
          width: 44,
          height: 44,
          mr: 2,
          bgcolor: "#6366F1",
        }}
      >
        {params.row.full_name?.charAt(0)}
      </Avatar>

      <Box>
        <Typography fontWeight={700}>
          {params.row.full_name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {params.row.email}
        </Typography>
      </Box>
    </Box>
  ),
},

  

  {
    field: "roles",
    headerName: "Role",
    width: 150,

    renderCell: (params) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            height: "100%",
        }}
    >
        <RoleChip roles={params.value} />
    </Box>
),
  },

  {
    field: "is_active",
    headerName: "Status",
    width: 130,

    renderCell=(params)=>(
    <Box
        sx={{
            display:"flex",
            alignItems:"center",
            justifyContent:"flex-start",
            width:"100%",
            height:"100%",
        }}
    >
        <StatusChip active={params.value}/>
    </Box>
)
  },

  {
    field: "last_login",
    headerName: "Last Login",
    width: 220,

    renderCell: (params) => (
    <Box
        sx={{
            display:"flex",
            alignItems:"center",
            width:"100%",
            height:"100%",
        }}
    >
        <Typography>
            {params.value
                ? new Date(params.value).toLocaleString()
                : "Never"}
        </Typography>
    </Box>
),
  },

];

function UserTable({ users }) {
  const { user: currentUser } = useAuth();
  const canShowActions = users.some((targetUser) => canManageUser(currentUser, targetUser));
  const columns = canShowActions ? [...baseColumns, {
    field: "actions", headerName: "", width: 70, sortable: false,
    renderCell: (params) => <Box sx={{ display: "flex", alignItems: "center", width: "100%", height: "100%" }}><ActionMenu row={params.row} /></Box>,
  }] : baseColumns;
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,.08)",
      }}
    >
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.id}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
      />
    </Box>
  );
}

export default UserTable;
