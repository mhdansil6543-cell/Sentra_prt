from rest_framework import filters, serializers, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from audit.models import AuditLog
from common.permissions import HasPermission
from common.services import ExcelExportService


class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.CharField(source="actor.email", default="", read_only=True)

    class Meta:
        model = AuditLog
        fields = ("id", "actor", "action", "target_type", "target_id", "changes", "ip", "created_at")
        read_only_fields = fields


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by("-created_at")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["action", "target_type", "target_id"]
    ordering_fields = ["created_at", "action", "target_type"]
    ordering = ["-created_at"]

    def get_permissions(self):
        self.required_permission = "audit.view"
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        actor_id = self.request.query_params.get("actor")
        action = self.request.query_params.get("action")
        target_type = self.request.query_params.get("target_type")

        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)
        if action:
            queryset = queryset.filter(action__icontains=action)
        if target_type:
            queryset = queryset.filter(target_type__icontains=target_type)
        return queryset

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        self.request.required_permission = "audit.view"
        try:
            return ExcelExportService.export_queryset(
                request,
                queryset,
                "audit-logs.xlsx",
                ["id", "actor", "action", "target_type", "target_id", "changes", "ip", "created_at"],
                lambda qs: [
                    [
                        str(entry.id),
                        str(entry.actor_id) if entry.actor_id else "",
                        entry.action,
                        entry.target_type,
                        entry.target_id,
                        entry.changes,
                        entry.ip,
                        entry.created_at,
                    ]
                    for entry in qs
                ],
                "Audit Logs",
                "audit.view",
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
