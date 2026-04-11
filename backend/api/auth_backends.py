from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class UsernameOrEmailBackend(ModelBackend):
    """Allow authentication with either username or email."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(get_user_model().USERNAME_FIELD)
        if username is None or password is None:
            return None

        UserModel = get_user_model()
        candidates = list(
            UserModel.objects.filter(Q(username__iexact=username) | Q(email__iexact=username))
        )
        if not candidates:
            # Run default hasher once to reduce timing differences.
            UserModel().set_password(password)
            return None

        lower_username = str(username).lower()
        # Prefer exact username matches first, then exact email matches.
        candidates.sort(key=lambda user: (
            str(getattr(user, 'username', '')).lower() != lower_username,
            str(getattr(user, 'email', '')).lower() != lower_username,
            getattr(user, 'id', 0),
        ))

        for user in candidates:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
