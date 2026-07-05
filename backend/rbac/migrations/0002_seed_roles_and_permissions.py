from django.db import migrations


def seed_roles_and_permissions(apps, schema_editor):
    Role = apps.get_model("rbac", "Role")
    Permission = apps.get_model("rbac", "Permission")
    RolePermission = apps.get_model("rbac", "RolePermission")

    permissions = [
        ("users.view", "View users"),
        ("users.create", "Create users"),
        ("users.edit", "Edit users"),
        ("users.delete", "Delete users"),
        ("roles.view", "View roles"),
        ("roles.manage", "Manage roles"),
        ("permissions.view", "View permissions"),
        ("audit.view", "View audit logs"),
    ]

    created_permissions = {}
    for codename, description in permissions:
        permission, _ = Permission.objects.get_or_create(
            codename=codename,
            defaults={"description": description},
        )
        created_permissions[codename] = permission

    role_permissions = {
        "Admin": list(created_permissions.keys()),
        "Manager": [
            "users.view",
            "users.create",
            "users.edit",
            "users.delete",
            "roles.view",
            "audit.view",
        ],
        "Viewer": [
            "users.view",
            "roles.view",
            "permissions.view",
            "audit.view",
        ],
    }

    for role_name, assigned_permissions in role_permissions.items():
        role, _ = Role.objects.get_or_create(
            name=role_name,
            defaults={
                "description": f"{role_name} role",
                "is_system": True,
            },
        )

        for codename in assigned_permissions:
            permission = created_permissions[codename]
            RolePermission.objects.get_or_create(role=role, permission=permission)


def reverse_seed(apps, schema_editor):
    Role = apps.get_model("rbac", "Role")
    Permission = apps.get_model("rbac", "Permission")
    RolePermission = apps.get_model("rbac", "RolePermission")

    for role_name in ["Admin", "Manager", "Viewer"]:
        role = Role.objects.filter(name=role_name).first()
        if role:
            RolePermission.objects.filter(role=role).delete()
            role.delete()

    for codename in [
        "users.view",
        "users.create",
        "users.edit",
        "users.delete",
        "roles.view",
        "roles.manage",
        "permissions.view",
        "audit.view",
    ]:
        Permission.objects.filter(codename=codename).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("rbac", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_roles_and_permissions, reverse_seed),
    ]
