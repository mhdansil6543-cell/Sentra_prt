from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Permission(models.Model):

    codename = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.CharField(
        max_length=255
    )

    def __str__(self):
        return self.codename

from django.conf import settings

class UserRole(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles"
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="user_roles"
    )

    assigned_at = models.DateTimeField(auto_now_add=True) 

class RolePermission(models.Model):

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_permissions"
    )

    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name="role_permissions"
    )
    
        