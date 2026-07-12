import { useEffect, useState } from "react";
import { getRoles } from "../../api/roles";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { createUser } from "../../api/users";
import useAuth from "../../auth/useAuth";
import { getPrimaryRole } from "../../auth/permissions";

function AddUserDialog({ open, onClose, onSuccess }) {
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "",
    is_active: true,
    is_staff: false,
  });

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await getRoles();
        setRoles(response.results || response);
      } catch (err) {
        console.error(err);
      }
    }

    loadRoles();
  }, []);

  function handleChange(e) {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      await createUser(form);

      onSuccess();
      onClose();

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "",
        is_active: true,
        is_staff: false,
      });
    } catch (err) {
      console.error(err.response?.data || err);

      alert(
        JSON.stringify(
          err.response?.data,
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add New User</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Full Name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>

            <Select
              name="role"
              value={form.role}
              label="Role"
              onChange={handleChange}
            >
              <MenuItem value="">
                Select Role
              </MenuItem>

              {roles.filter((role) => getPrimaryRole(currentUser) === "Admin" || role.name !== "Admin").map((role) => (
                <MenuItem
                  key={role.id}
                  value={role.name}
                >
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_active}
                name="is_active"
                onChange={handleChange}
              />
            }
            label="Active"
          />

          {getPrimaryRole(currentUser) === "Admin" ? <FormControlLabel
            control={<Checkbox checked={form.is_staff} name="is_staff" onChange={handleChange} />}
            label="Staff"
          /> : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserDialog;
