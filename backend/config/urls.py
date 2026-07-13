"""
URL configuration for config project.
"""

from django.contrib import admin
from django.contrib.auth.models import Group
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from .views import home

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

# ==========================================================
# Django Admin Customization
# ==========================================================

admin.site.site_header = "Sentra Administration"
admin.site.site_title = "Sentra Admin"
admin.site.index_title = "Welcome to Sentra Admin Portal"

# Remove Django's built-in Group model
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

# ==========================================================
# URL Patterns
# ==========================================================

urlpatterns = [
    path("", home),
    
    # Admin
    path("admin/", admin.site.urls),

    # Authentication
    path(
        "api/v1/auth/",
        include("authentication.urls"),
    ),

    # Accounts
    path(
        "api/v1/",
        include("accounts.urls"),
    ),

    # RBAC
    path(
        "api/v1/",
        include("rbac.urls"),
    ),

    # Audit
    path(
        "api/v1/",
        include("audit.urls"),
    ),

    # Swagger
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
