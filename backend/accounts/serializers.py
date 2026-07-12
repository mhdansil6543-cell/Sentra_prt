from rest_framework import serializers

from common.permissions import is_manager
from rbac.models import Role, UserRole

from .models import User


class UserListSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "avatar",
            "is_active",
            "is_staff",
            "last_login",
            "roles",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_roles(self, obj):
        return [
            user_role.role.name
            for user_role in obj.user_roles.select_related("role").all()
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    avatar = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    role = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User
        fields = (
            "email",
            "full_name",
            "password",
            "avatar",
            "role",
            "is_active",
            "is_staff",
        )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate_role(self, value):
        try:
            role = Role.objects.get(name=value)
        except Role.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid role selected."
            )

        request = self.context.get("request")
        if request and is_manager(request.user) and role.name == "Admin":
            raise serializers.ValidationError(
                "Managers cannot assign the Admin role."
            )

        return value

    def validate_is_staff(self, value):
        request = self.context.get("request")
        if request and is_manager(request.user) and value:
            raise serializers.ValidationError(
                "Managers cannot grant staff access."
            )
        return value

    def create(self, validated_data):
        role_name = validated_data.pop("role")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        role = Role.objects.get(name=role_name)

        UserRole.objects.create(
            user=user,
            role=role,
        )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    role = serializers.CharField(
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = (
            "email",
            "full_name",
            "avatar",
            "role",
            "is_active",
            "is_staff",
        )

    def validate_email(self, value):
        queryset = User.objects.filter(email__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_role(self, value):
        if not value:
            return value

        try:
            role = Role.objects.get(name=value)
        except Role.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid role selected."
            )

        request = self.context.get("request")
        if request and is_manager(request.user) and role.name == "Admin":
            raise serializers.ValidationError(
                "Managers cannot assign the Admin role."
            )

        return value

    def validate_is_staff(self, value):
        request = self.context.get("request")
        if request and is_manager(request.user) and value:
            raise serializers.ValidationError(
                "Managers cannot grant staff access."
            )
        return value

    def update(self, instance, validated_data):
        role_name = validated_data.pop("role", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if role_name:
            role = Role.objects.get(name=role_name)

            UserRole.objects.filter(user=instance).delete()

            UserRole.objects.create(
                user=instance,
                role=role,
            )

        return instance


class UserRoleSerializer(serializers.Serializer):
    role_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )

    def validate_role_ids(self, value):
        if not value:
            return []

        role_ids = []

        for role_id in value:
            role_ids.append(str(role_id))

        roles = Role.objects.filter(id__in=role_ids)

        if roles.count() != len(role_ids):
            raise serializers.ValidationError(
                "One or more role ids are invalid."
            )

        request = self.context.get("request")
        if request and is_manager(request.user):
            invalid_roles = [role.name for role in roles if role.name == "Admin"]
            if invalid_roles:
                raise serializers.ValidationError(
                    "Managers cannot assign the Admin role."
                )

        return role_ids

    def create(self, validated_data):
        user = self.context["user"]

        UserRole.objects.filter(user=user).delete()

        role_ids = validated_data.get("role_ids", [])

        for role_id in role_ids:
            UserRole.objects.create(
                user=user,
                role=Role.objects.get(id=role_id),
            )

        return user

    def update(self, instance, validated_data):
        return self.create(validated_data)
