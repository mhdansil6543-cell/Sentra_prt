import { getRoles } from "../../api/roles";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

import { getUsers, updateUser, deleteUser } from "../../api/users";
import useAuth from "../../auth/useAuth";
import { canAssignRoles, canDeleteUsers, canEditUsers, canManageUser, getPrimaryRole } from "../../auth/permissions";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roles, setRoles] = useState([]);
  const [targetUser, setTargetUser] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "",
    is_active: true,
    is_staff: false,
  });

  useEffect(() => {
   async function loadUser() {
  try {
    // Load roles
    const roleResponse = await getRoles();
    const roleData = roleResponse.results || roleResponse;
    setRoles(roleData);

    // Load users
    const response = await getUsers();
    const users = response.results || response;

    const user = users.find((u) => String(u.id) === String(id));

    if (user) {
      setTargetUser(user);
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        password: "",
        role: user.roles?.[0] || "",
        is_active: user.is_active,
        is_staff: user.is_staff,
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

    loadUser();
  }, [id]);

  const { user: currentUser } = useAuth();
  const canManageTarget = canManageUser(currentUser, targetUser);
  const canEdit = canEditUsers(currentUser) && canManageTarget;
  const canDelete = canDeleteUsers(currentUser) && canManageTarget;
  const canAssignRole = canAssignRoles(currentUser) && canManageTarget;

 function handleChange(e) {
  const { name, value, type, checked } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
}

  async function handleDelete() {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${form.full_name}"?`
  );

  if (!confirmed) return;

    if (!canDelete) {
      alert("You do not have permission to delete users.");
      return;
    }

    try {
      await deleteUser(id);

      alert("User deleted successfully!");

      navigate("/users", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
}

async function handleSubmit(e) {
  e.preventDefault();

    if (!canEdit) {
      alert("You do not have permission to edit users.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        full_name: form.full_name,
        email: form.email,
        role: canAssignRole ? form.role : undefined,
        is_active: form.is_active,
        is_staff: form.is_staff,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await updateUser(id, payload);

      alert("User updated successfully.");

      navigate("/users");
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-xl">
        Loading...
      </div>
    );
  }

  if (targetUser && !canManageTarget) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-8 text-center shadow-xl text-slate-900">
        <h3 className="text-xl font-semibold">Protected administrator account</h3>
        <p className="mt-2 text-sm text-slate-500">Managers may view users, but cannot modify an Admin account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 mb-6 text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="rounded-[32px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-10">

        <div className="mb-10">
    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
        Edit User
    </h1>

    <p className="mt-2 text-slate-500 dark:text-slate-400">
        Update user details, password and access permissions.
    </p>
</div>

        <form
    onSubmit={handleSubmit}
    className="space-y-8"
>

         <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">

    <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
        👤 Personal Information
    </h2>

    <div className="space-y-5">

        <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                Full Name
            </label>

            <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
        </div>

        <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                Email
            </label>

            <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
        </div>

    </div>

</div>
         <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">

    <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
    </h2>

    <div>

        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
            Password (optional)
        </label>

        <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
           className="w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
        />

    </div>

</div>
<div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-6">

    <h2 className="text-lg font-semibold mb-5 text-slate-900 dark:text-white">
        Role & Permissions
    </h2>

    <div className="space-y-5">

        <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                User Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={!canAssignRole}
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            >
                <option value="">Select Role</option>

                {roles.filter((role) => getPrimaryRole(currentUser) === "Admin" || role.name !== "Admin").map((role) => (
                    <option
                        key={role.id}
                        value={role.name}
                    >
                        {role.name}
                    </option>
                ))}
            </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

            {getPrimaryRole(currentUser) === "Admin" ? <label className="flex items-center justify-between rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4 cursor-pointer">

                <div>

                    <h4 className="font-semibold text-slate-900 dark:text-white">
                        Active User
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        User can login
                    </p>

                </div>

                <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-5 w-5"
                />

            </label> : null}

            <label className="flex items-center justify-between rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4 cursor-pointer">

                <div>

                    <h4 className="font-semibold">
                        Staff Access
                    </h4>

                    <p className="text-sm text-gray-500">
                        Admin dashboard access
                    </p>

                </div>

                <input
                    type="checkbox"
                    name="is_staff"
                    checked={form.is_staff}
                    onChange={handleChange}
                    className="h-5 w-5"
                />

            </label>

        </div>

    </div>

</div>
          

          <div className="flex items-center justify-between pt-6">

  {canDelete ? <button
    type="button"
    onClick={handleDelete}
    className="flex items-center gap-2 rounded-xl border border-red-500 px-5 py-3 text-red-600 hover:bg-red-50 transition"
  >
    <Trash2 size={18} />
    Delete User
  </button> : <span />}

  <div className="flex gap-4">

    <button
      type="submit"
      disabled={saving}
      className="bg-teal-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 hover:bg-teal-700 transition"
    >
      <Save size={18} />
      {saving ? "Saving..." : "Save Changes"}
    </button>

    <button
      type="button"
      onClick={() => navigate("/users")}
      className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-3 transition"
    >
      Cancel
    </button>

  </div>

</div>
        </form>

      </div>

    </div>
  );
}

export default EditUser;
