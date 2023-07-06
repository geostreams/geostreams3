from django.urls import include,path
from rest_framework.authtoken import views as auth_views
from rest_framework import routers
from .views import SensorsViewSet, ParametersViewSet, SignupAPI, LoginAPI, verify_email, ChangePasswordAPI, home

router = routers.DefaultRouter()
router.register(r'sensors', SensorsViewSet, basename='sensors')
router.register(r'parameters', ParametersViewSet, basename='parameters')

urlpatterns = [
    path('auth/signup/', SignupAPI.as_view(), name='signup'),
    path('auth/login/', LoginAPI.as_view(), name='login'),
    path('auth/verify-email/', verify_email, name='verify-email'),
    path('auth/change-password/', ChangePasswordAPI.as_view(), name='change-password'),
    path("", include(router.urls)),
    path('home/', home, name='home'),
    path('parameters/delete_by_name/<str:name>/', ParametersViewSet.as_view({'delete': 'delete_by_name'}),
         name='delete_by_name'),
]
