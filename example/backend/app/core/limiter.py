from slowapi import Limiter
from slowapi.util import get_remote_address

# Inicjalizacja limitera - używamy adresu IP jako klucza
limiter = Limiter(key_func=get_remote_address)
