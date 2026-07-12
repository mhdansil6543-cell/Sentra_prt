from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from accounts.models import User
from rbac.models import Role, UserRole


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True, write_only=True)


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.DictField(read_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = (
            "email",
            "full_name",
            "password",
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
        )

        try:
            viewer_role = Role.objects.get(name="Viewer")
            UserRole.objects.create(
                user=user,
                role=viewer_role,
            )
        except Role.DoesNotExist:
            pass

        return user


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "created_at",
            "updated_at",
            "roles",
            "permissions",
        )
        read_only_fields = fields

    def get_roles(self, obj):
        return [ur.role.name for ur in obj.user_roles.select_related("role").all()]

    def get_permissions(self, obj):
        # Aggregate permissions from the user's assigned roles
        perms = set()
        for user_role in obj.user_roles.select_related("role").all():
            role = user_role.role
            for rp in getattr(role, "role_permissions", []).all() if hasattr(role, "role_permissions") else []:
                perms.add(rp.permission.codename)
        return sorted(list(perms))


class LoginSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields.pop("username", None)
        self.fields["email"] = serializers.EmailField(required=True)
        self.fields["password"] = serializers.CharField(
            write_only=True,
            trim_whitespace=False,
        )

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
