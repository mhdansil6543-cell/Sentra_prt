from django.conf import settings
from django.db import models


class AuditLog(models.Model):

    # User who performed the action
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )

    # Action performed
    action = models.CharField(
        max_length=100
    )

    # Which model was affected
    target_type = models.CharField(
        max_length=100
    )

    # ID of the affected object
    target_id = models.CharField(
        max_length=100
    )

    # Store old/new values
    changes = models.JSONField(
        default=dict,
        blank=True
    )

    # User IP Address
    ip = models.GenericIPAddressField(
        null=True,
        blank=True
    )

    # Time of action
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.actor} - {self.action}"