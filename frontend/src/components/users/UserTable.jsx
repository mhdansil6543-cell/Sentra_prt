import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
} from "@mui/material";
import UserRow from "./UserRow";

function UserTable({ users, onActionSuccess, pageSize = 4 }) {
  if (!users.length) {
    return (
      <Paper
        sx={{
          borderRadius: "16px",
          padding: 4,
          textAlign: "center",
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <Typography color="text.secondary">No users found</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "16px",
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #e5e7eb",
              height: 56,
            }}
          >
            <TableCell
              sx={{
                fontWeight: 700,
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "16px",
                borderColor: "#e5e7eb",
                verticalAlign: "middle",
              }}
            >
              USER
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "16px",
                borderColor: "#e5e7eb",
                verticalAlign: "middle",
              }}
            >
              ROLES
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "16px",
                borderColor: "#e5e7eb",
                verticalAlign: "middle",
              }}
            >
              STATUS
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 700,
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "16px",
                borderColor: "#e5e7eb",
                verticalAlign: "middle",
              }}
            >
              LAST LOGIN
            </TableCell>

            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                color: "#6b7280",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "16px",
                borderColor: "#e5e7eb",
                verticalAlign: "middle",
              }}
            >
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onActionSuccess={onActionSuccess}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserTable;
