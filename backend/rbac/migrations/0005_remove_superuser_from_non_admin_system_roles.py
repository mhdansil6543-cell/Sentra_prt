from django.db import migrations


def remove_legacy_superuser_flags(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    UserRole = apps.get_model("rbac", "UserRole")

    admin_user_ids = UserRole.objects.filter(role__name="Admin").values_list("user_id", flat=True)
    managed_user_ids = UserRole.objects.filter(
        role__name__in=["Manager", "Viewer"]
    ).exclude(user_id__in=admin_user_ids).values_list("user_id", flat=True)

    # A user explicitly assigned Manager or Viewer must not retain a legacy
    # Django superuser bypass. Superusers without a system role are left
    # untouched as bootstrap administrators.
    User.objects.filter(id__in=managed_user_ids, is_superuser=True).update(is_superuser=False)


class Migration(migrations.Migration):
    dependencies = [("rbac", "0004_enforce_enterprise_system_role_policy")]

    operations = [migrations.RunPython(remove_legacy_superuser_flags, migrations.RunPython.noop)]
