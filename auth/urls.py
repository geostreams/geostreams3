from django.urls import path

from knox import views as knox_views

from .views import CreateUserView, LoginView, ManageUserView

app_name = "core"

urlpatterns = [
    path("createuser/", CreateUserView.as_view(), name="create"),
    path("userprofile/", ManageUserView.as_view(), name="profile"),
    path("login/", LoginView.as_view(), name="knox_login"),
    path("logout/", knox_views.LogoutView.as_view(), name="knox_logout"),
]
