from django.urls import path
from .views import AuditLogViewSet

urlpatterns = [
    path(
        "audit-logs/export/",
        AuditLogViewSet.as_view({
            "get": "export",
        }),
        name="audit-log-export",
    ),

    path(
        "audit-logs/",
        AuditLogViewSet.as_view({
            "get": "list",
        }),
        name="audit-log-list",
    ),
]