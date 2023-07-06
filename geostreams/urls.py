from django.urls import include,path
from rest_framework.authtoken import views as auth_views
from rest_framework import routers
from .views import SensorsViewSet, ParametersViewSet, SignupAPI, LoginAPI, verify_email, ChangePasswordAPI, HomePageAPI, LogoutAPI

# router = routers.DefaultRouter()
# router.register(r'sensors', SensorsViewSet, basename='sensors')
# router.register(r'parameters', ParametersViewSet, basename='parameters')

urlpatterns = [
    path('signup/', SignupAPI.as_view(), name='signup'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('verify-email/', verify_email, name='verify-email'),
    path('change-password/', ChangePasswordAPI.as_view(), name='change-password'),
    path('', HomePageAPI.as_view(), name='home'),
    # path("", include(router.urls)),
    # path('parameters/delete_by_name/<str:name>/', ParametersViewSet.as_view({'delete': 'delete_by_name'}),
    #      name='delete_by_name'),
]
