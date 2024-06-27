from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    # This is the serializer for the User model
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
        extra_kwargs = {"password": {"write_only": True, "min_length": 8}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class AuthSerializer(serializers.Serializer):
    # This is the serializer for the AuthToken model
    username = serializers.CharField()
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False
    )

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(
                request=self.context.get("request"),
                username=username,
                password=password,
            )

            if not user:
                msg = "Unable to authenticate with provided credentials"
                raise serializers.ValidationError(msg, code="authentication")
        else:
            msg = "Must include 'username' and 'password'"
            raise serializers.ValidationError(msg, code="authentication")

        attrs["user"] = user
        return attrs
