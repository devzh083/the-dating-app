"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

"""
ASGI config for config project.
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import OriginValidator
from django.conf import settings
from django.core.asgi import get_asgi_application

from login.middleware import JWTAuthMiddlewareStack
from login.routing import websocket_urlpatterns

# AllowedHostsOriginValidator checks the WebSocket Origin header against
# ALLOWED_HOSTS — which is the *backend's own* hostname. That's correct only
# when frontend and backend share a host; here the frontend (Vercel) and
# backend (Render) are on entirely different domains, so it rejected every
# real browser connection with 403. OriginValidator checks against the
# actual frontend origins instead (the same list CORS already trusts).
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": OriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
        settings.CORS_ALLOWED_ORIGINS,
    ),
})
