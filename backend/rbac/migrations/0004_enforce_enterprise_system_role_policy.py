from django.db import migrations


SYSTEM_ROLE_PERMISSIONS = {
    "Admin": [
        "users.view", "users.create", "users.edit", "users.delete", "users.export",
        "roles.view", "roles.manage", "permissions.view", "audit.view",
    ],
    "Manager": ["users.view", "users.create", "users.edit", "users.export", "roles.view"],
    "Viewer": ["users.view", "roles.view"],
}


def apply_policy(apps, schema_editor):
    Role = apps.get_model("rbac", "Role")
    Permission = apps.get_model("rbac", "Permission")
    RolePermission = apps.get_model("rbac", "RolePermission")

    descriptions = {
        "users.view": "View users",
        "users.create": "Create users",
        "users.edit": "Edit users and change account status",
        "users.delete": "Deactivate users",
        "users.export": "Export users to Excel",
        "roles.view": "View roles",
        "roles.manage": "Create, edit, delete roles and assign permissions",
        "permissions.view": "View the permission catalogue",
        "audit.view": "View audit logs",
    }
    permissions = {
        codename: Permission.objects.get_or_create(codename=codename, defaults={"description": description})[0]
        for codename, description in descriptions.items()
    }
    for role_name, codenames in SYSTEM_ROLE_PERMISSIONS.items():
        role, _ = Role.objects.get_or_create(
            name=role_name,
            defaults={"description": f"{role_name} system role", "is_system": True},
        )
        role.is_system = True
        role.save(update_fields=["is_system"])
        RolePermission.objects.filter(role=role).delete()
        RolePermission.objects.bulk_create([
            RolePermission(role=role, permission=permissions[codename]) for codename in codenames
        ])


class Migration(migrations.Migration):
    dependencies = [("rbac", "0003_alter_permission_options_alter_role_options_and_more")]

    operations = [migrations.RunPython(apply_policy, migrations.RunPython.noop)]
