import time
from dataclasses import dataclass
from typing import Any


@dataclass
class CacheEntry:
    value: Any
    expires_at: float


class LocalCache:
    """
    Simple in-memory TTL cache.

    The cache belongs to the application using the SDK.
    It does not use FeatureOps Redis.
    """

    def __init__(self, ttl: int = 300):
        self.ttl = ttl
        self._cache: dict[str, CacheEntry] = {}

    def get(self, key: str):
        entry = self._cache.get(key)

        if entry is None:
            return None

        if time.time() >= entry.expires_at:
            del self._cache[key]
            return None

        return entry.value

    def set(self, key: str, value):
        self._cache[key] = CacheEntry(
            value=value,
            expires_at=time.time() + self.ttl,
        )

    def delete(self, key: str):
        self._cache.pop(key, None)

    def clear(self):
        self._cache.clear()

    def __len__(self):
        return len(self._cache)