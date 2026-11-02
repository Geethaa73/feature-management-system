import redis


redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True,
)


def get_redis_client():
    return redis_client


def set_cache(key: str, value: str, ttl: int = 300):
    redis_client.set(key, value, ex=ttl)


def get_cache(key: str):
    return redis_client.get(key)


def delete_cache(key: str):
    redis_client.delete(key)


def delete_flag_cache(flag_key: str):
    pattern = f"flag:{flag_key}:*"
    keys = redis_client.keys(pattern)

    if keys:
        redis_client.delete(*keys)


def build_evaluation_cache_key(
    flag_key: str,
    user_id: str | None,
    environment: str,
):
    user_part = user_id if user_id else "anonymous"

    return (
        f"flag:{flag_key}:"
        f"user_{user_part}:"
        f"{environment.strip().lower()}"
    )