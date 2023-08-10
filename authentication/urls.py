from django.urls import include, path
from .views import login_view, callback_view

urlpatterns = [
    path("login/", login_view, name="login"),
    path("callback/", callback_view, name="callback")
]