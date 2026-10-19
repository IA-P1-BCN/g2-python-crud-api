"""The only place that sends emails.

No email provider is connected yet: messages are written to the backend log, links included.
Connecting a real provider means changing `send_email` only.
"""

import logging

logger = logging.getLogger("app.email")


def send_email(to: str, subject: str, body: str) -> None:
    logger.info("Email to %s | %s | %s", to, subject, body)
