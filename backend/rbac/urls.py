from django.urls import path

from .views import PermissionCatalogViewSet, RoleViewSet

urlpatterns = [
    path("permissions/", PermissionCatalogViewSet.as_view({"get": "list"}), name="permission-catalog"),
    path("roles/", RoleViewSet.as_view({"get": "list", "post": "create"}), name="role-list"),
    path("roles/<int:pk>/", RoleViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="role-detail"),
    path("roles/<int:pk>/permissions/", RoleViewSet.as_view({"put": "assign_permissions"}), name="role-permissions"),
    path("roles/permissions/", RoleViewSet.as_view({"get": "permissions_matrix"}), name="role-permissions-matrix"),
    path("roles/export/", RoleViewSet.as_view({"get": "export"}), name="role-export"),
]
