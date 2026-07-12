from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from common.services import PermissionService

from .models import RolePermission, UserRole


@receiver([post_save, post_delete], sender=RolePermission)
@receiver([post_save, post_delete], sender=UserRole)
def clear_permission_cache(**kwargs):
    """Keep permission decisions current after role or grant changes."""
    PermissionService.role_permissions.cache_clear()
