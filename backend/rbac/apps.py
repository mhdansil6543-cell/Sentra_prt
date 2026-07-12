from django.apps import AppConfig


class RbacConfig(AppConfig):
    name = 'rbac'

    def ready(self):
        from . import signals  # noqa: F401
