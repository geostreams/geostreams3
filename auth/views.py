from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from rest_framework import generics, permissions  # rest_framework imports
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from knox.views import LoginView as KnoxLoginView  # knox imports
from .serializers import UserSerializer, AuthSerializer  # local imports
from .forms import CustomUserCreationForm, CustomLoginForm  # local imports


# Create your views here.


# Create User
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get(self, request, *args, **kwargs):
        form = CustomUserCreationForm()
        return render(request, "register.html", {"form": form})

    def post(self, request, *args, **kwargs):
        if request.content_type.startswith("multipart/form-data"):
            # Handle form data with potential file uploads
            form = CustomUserCreationForm(request.POST, request.FILES)
            if form.is_valid():
                user = form.save()
                login(
                    request, user, backend="django.contrib.auth.backends.ModelBackend"
                )
                return redirect("profile")
            return render(request, "register.html", {"form": form})
        else:
            # Handle JSON API call
            return super().post(request, *args, **kwargs)


# Need to override login method so that it is not dependent on token
class LoginView(KnoxLoginView):
    serializer_class = AuthSerializer
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        form = CustomLoginForm()
        return render(request, "login.html", {"form": form})

    def post(self, request, format=None):
        if request.content_type == "application/json":
            serializer = AuthSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]
            login(request, user)
            return super(LoginView, self).post(request, format=None)
        else:
            # Assume it's a form submission
            form = CustomLoginForm(request.POST)
            if form.is_valid():
                username = form.cleaned_data["username"]
                password = form.cleaned_data["password"]
                user = authenticate(username=username, password=password)
                if user is not None:
                    login(request, user)
                    return redirect(
                        "profile"
                    )  # Redirect to profile page or another suitable route
                else:
                    return render(
                        request,
                        "login.html",
                        {"form": form, "message": "Invalid credentials"},
                    )
            return render(request, "login.html", {"form": form})


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Retrieve and return authenticated user"""
        return self.request.user
