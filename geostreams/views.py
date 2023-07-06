from rest_framework.decorators import api_view, renderer_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework import viewsets
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Importing libraries related to authentication
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.db import IntegrityError
from django.shortcuts import redirect, render
# from django.core.cache import cache
# from rest_framework.authtoken.serializers import AuthTokenSerializer
from .utils import send_email_verification

# Importing serializers and models
from .serializers import SensorsSerializer, ParametersSerializer, DatapointsSerializer
from .models import Sensors, Parameters, Datapoints


# Views from serializers and models
class SensorsViewSet(viewsets.ModelViewSet):
    queryset = Sensors.objects.all()
    serializer_class = SensorsSerializer
    permission_classes = [IsAuthenticated]


class DatapointsViewSet(viewsets.ModelViewSet):
    queryset = Datapoints.objects.all()
    serializer_class = DatapointsSerializer


class ParametersViewSet(viewsets.ModelViewSet):
    queryset = Parameters.objects.all()
    serializer_class = ParametersSerializer
    permission_classes = [IsAuthenticated]

    def delete_by_name(self, name):
        print("Look here")
        print(name)
        self.queryset.filter(name=name).delete()
        return Response({'message': 'Parameter' + str(name) + ' deleted successfully!'})


# Authentication views
class SignupAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return render(request, 'signup.html')

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        if not username or not password or not email:
            return Response(
                {"error": "Username, password and email are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.is_active = False  # Deactivate account till it is confirmed
            user.save()

            # Generate email verification token and send the email
            email_verification_token = default_token_generator.make_token(user)
            send_email_verification(request, user, email_verification_token)

            return Response(
                {
                    "user": {"id": user.id, "username": user.username, "email": user.email}
                },
                status=status.HTTP_201_CREATED
            )
        except IntegrityError as e:
            if 'auth_user_username_key' in str(e):
                # Handle the duplicate username error
                return Response({'detail': 'Username already exists. Please choose a different username.'},
                                status=status.HTTP_400_BAD_REQUEST)
            else:
                print("An IntegrityError occurred:", e)
                return Response({'detail': 'An IntegrityError occurred ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return render(request, 'login.html')

    def post(self, request, *args, **kwargs):
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # refresh = RefreshToken.for_user(user)
            # access_token = str(refresh.access_token)
            login(request, user)
            return redirect('home')
            # return Response({
            #     'user_id': user.id,
            #     'username': user.username,
            #     'token': access_token
            # }, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# Change password API view
class ChangePasswordAPI(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return render(request, 'change_password.html')

    def post(self, request, *args, **kwargs):
        new_password = request.data.get('new_password')
        user = request.user

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)


# Verify email API
@api_view(['GET'])
@renderer_classes([JSONRenderer])
@permission_classes([AllowAny])
def verify_email(request):
    token = request.GET.get('token')
    username = request.GET.get('username')
    if token is None:
        return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        if not user.is_active:
            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({'detail': 'Email verified successfully!'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'Email already verified!'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


# Helper functions

def home(request):
    base_url = request.build_absolute_uri('/')
    links = [
        {'title': 'Change Password', 'url': base_url + 'api/auth/change-password'},
    ]
    return render(request, 'home.html', {'links': links})


# Function to cache the login token for two hours after login
# def generate_cache_token(user):
#     _, token = AuthToken.objects.create(user)
#     cache_key = 'token_' + str(user.id)
#     cache.set(cache_key, token, timeout=7200)
#
#     return token
#
#
# # Function to retrieve the cached token
# def get_cache_token(user):
#     cache_key = 'token_' + str(user.id)
#     token = cache.get(cache_key)
#
#     return token


# @api_view(['POST'])
# @renderer_classes([JSONRenderer])
# @permission_classes([AllowAny])
# def reset_password(request):
#     email = request.data.get('email')
#     if email is None:
#         return Response({'detail': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
#
#     try:
#         user = User.objects.get(email=email)
#         if user.is_active:
#             # Generate password reset token and send the email
#             password_reset_token = default_token_generator.make_token(user)
#             reset_password_email(request, user, password_reset_token)
#         else:
#             return Response({'detail': 'User not verified!'}, status=status.HTTP_400_BAD_REQUEST)
#     except User.DoesNotExist:
#         return Response({'detail': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)
