import { Stack, Button } from "@mui/material";
import { useState } from "react";
import useAuth from "../../auth/useAuth";
import { updateUser } from "../../api/users";

function UserActions({ user, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const { user: currentUser } = useAuth();

  const permissionList = currentUser?.permissions || currentUser?.assigned_permissions || [];
  const canEdit = Boolean(currentUser?.is_superuser || currentUser?.is_staff || (Array.isArray(permissionList) && permissionList.includes("users.edit")));

  const handleEdit = () => {
    if (!canEdit) return;
    // Navigate to edit page or open dialog
    window.location.href = `/users/edit/${user.id}`;
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await updateUser(user.id, { is_active: !user.is_active });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {canEdit ? (
        <Button
          size="small"
          variant="text"
          onClick={handleEdit}
          sx={{
            textTransform: "none",
            color: "#6366f1",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#f0f4ff",
            },
          }}
        >
          Edit
        </Button>
      ) : null}

      {canEdit ? (
        <Button
          size="small"
          variant="text"
          onClick={handleToggleStatus}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: user.is_active ? "#ef4444" : "#10b981",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: user.is_active ? "#fef2f2" : "#f0fdf4",
            },
          }}
        >
          {user.is_active ? "Deactivate" : "Activate"}
        </Button>
      ) : null}
    </Stack>
  );
}

export default UserActions;
