import { TableRow, TableCell, Stack, Typography, Box } from "@mui/material";
import UserAvatar from "./UserAvatar";
import RoleChip from "./RoleChip";
import StatusChip from "./StatusChip";
import UserActions from "./UserActions";

function UserRow({ user, onActionSuccess }) {
  const lastLogin = user.last_login
    ? new Date(user.last_login).toLocaleString()
    : "Never";

  return (
    <TableRow
      hover
      sx={{
        "& td": {
          borderColor: "#e5e7eb",
          py: 2,
        },
      }}
    >
      {/* USER COLUMN */}
      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <UserAvatar user={user} />

          <Box>
            <Typography
  fontWeight={700}
  fontSize={16}
  sx={{
    color: "#111827",
  }}
>
  {user.full_name}
</Typography>

<Typography
  fontSize={14}
  sx={{
    color: "#6B7280",
  }}
>
  {user.email}
</Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* ROLE */}
      <TableCell>
        <RoleChip roles={user.roles} />
      </TableCell>

      {/* STATUS */}
      <TableCell>
        <StatusChip active={user.is_active} />
      </TableCell>

      {/* LAST LOGIN */}
      <TableCell
  sx={{
    color: "#6B7280",
    fontSize: 14,
  }}
>
  {lastLogin}
</TableCell>

      {/* ACTIONS */}
      <TableCell align="right">
        <UserActions
          user={user}
          onSuccess={onActionSuccess}
        />
      </TableCell>
    </TableRow>
  );
}

export default UserRow;