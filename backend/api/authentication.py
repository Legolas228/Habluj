from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication


class ExpiringTokenAuthentication(TokenAuthentication):
    """Reject bearer tokens that have outlived the configured session window."""

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        max_age = int(getattr(settings, 'AUTH_TOKEN_MAX_AGE_SECONDS', 86400))
        if token.created < timezone.now() - timedelta(seconds=max_age):
            token.delete()
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed('Token has expired.')
        return user, token
