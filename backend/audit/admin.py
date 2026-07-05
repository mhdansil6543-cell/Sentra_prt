from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):

    list_display = (
        "actor",
        "action",
        "target_type",
        "target_id",
        "created_at",
    )

    search_fields = (
        "action",
        "target_type",
    )

    ordering = ("-created_at",)