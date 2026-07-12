from django.urls import path
from .views import UserViewSet

urlpatterns = [
    path(
        "users/",
        UserViewSet.as_view({
            "get": "list",
            "post": "create",
        }),
        name="user-list",
    ),

    path(
        "users/export/",
        UserViewSet.as_view({
            "get": "export",
        }),
        name="user-export",
    ),

    path(
        "users/<uuid:pk>/roles/",
        UserViewSet.as_view({
            "put": "assign_roles",
        }),
        name="user-roles",
    ),

    path(
        "users/<uuid:pk>/",
        UserViewSet.as_view({
            "get": "retrieve",
            "patch": "partial_update",
            "delete": "destroy",
        }),
        name="user-detail",
    ),
]