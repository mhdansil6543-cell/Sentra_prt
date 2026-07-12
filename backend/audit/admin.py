from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    Professional Django Admin configuration
    for Audit Logs.
    """

    list_display = (
        "actor",
        "action",
        "target_type",
        "target_id",
        "ip",
        "created_at",
    )

    list_filter = (
        "action",
        "target_type",
        "created_at",
    )

    search_fields = (
        "actor__email",
        "actor__full_name",
        "action",
        "target_type",
        "target_id",
        "ip",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "actor",
        "action",
        "target_type",
        "target_id",
        "changes",
        "ip",
        "created_at",
    )

    fieldsets = (
        (
            "Audit Information",
            {
                "fields": (
                    "actor",
                    "action",
                    "created_at",
                ),
            },
        ),
        (
            "Target Object",
            {
                "fields": (
                    "target_type",
                    "target_id",
                ),
            },
        ),
        (
            "Request Information",
            {
                "fields": (
                    "ip",
                ),
            },
        ),
        (
            "Changes",
            {
                "fields": (
                    "changes",
                ),
            },
        ),
    )

    # Prevent creating logs manually
    def has_add_permission(self, request):
        return False

    # Prevent editing existing logs
    def has_change_permission(self, request, obj=None):
        return False

    # Prevent deleting logs
    def has_delete_permission(self, request, obj=None):
        return False