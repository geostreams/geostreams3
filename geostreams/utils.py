from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse


def send_email_verification(request, user, token):
    subject = "Email Verification for Geostreams API Framework"
    message = f"""
    Hi {user.username},
    Thank you for registering to use Geostreams API Framework. In order to activate your account, please click on the link below:
    http://{request.build_absolute_uri(reverse('verify-email'))}?token={token}&username={user.username}
    
    Thank you,
    Geostreams Team
    """

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list)
