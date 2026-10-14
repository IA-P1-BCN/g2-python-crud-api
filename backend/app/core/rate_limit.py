"""In-memory sliding-window rate limiter.

It lives in the process: it resets on restart and is not shared between several server copies.
Enough for one server; several copies would need a shared store (database or Redis).
"""

import math
import threading
import time
from collections import defaultdict, deque
from collections.abc import Callable


class SlidingWindowLimiter:
    """Allow at most `attempts` hits per key within any `window_seconds` span."""

    def __init__(
        self,
        attempts: int,
        window_seconds: float,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.attempts = attempts
        self.window_seconds = window_seconds
        self._clock = clock
        self._hits: defaultdict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str) -> int | None:
        """Count one hit for `key`. Return None if allowed, else the seconds until it is."""
        now = self._clock()
        with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - self.window_seconds:
                hits.popleft()
            if len(hits) >= self.attempts:
                return max(1, math.ceil(hits[0] + self.window_seconds - now))
            hits.append(now)
            return None

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()
