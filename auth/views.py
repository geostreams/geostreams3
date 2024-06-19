from django.contrib.auth import login

# rest_framework imports
from rest_framework import generics, permissions

# knox imports
from knox.views import LoginView as KnoxLoginView

# local imports
from .serializers import UserSerializer, AuthSerializer


# Create your views here.


# Create User
class CreateUserView(generics.CreateAPIView):
    # This is the API for creating a new user
    serializer_class = UserSerializer


# Need to override login method so that it is not dependent on token
class LoginView(KnoxLoginView):
    # This is the API for logging in a user
    serializer_class = AuthSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = AuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Retrieve and return authenticated user"""
        return self.request.user
