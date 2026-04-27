import smtplib
from email.message import EmailMessage

from app.core.config import settings


class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str) -> None:
        try:
            message = EmailMessage()
            message["From"] = settings.SMTP_FROM
            message["To"] = to_email
            message["Subject"] = subject
            message.set_content(body)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
        except Exception as e:
            print(f"Warning: Failed to send email to {to_email}: {type(e).__name__}: {e}")

    @staticmethod
    def send_verification_code(to_email: str, code: str) -> None:
        EmailService.send_email(
            to_email=to_email,
            subject="Подтверждение аккаунта Your Job",
            body=f"Ваш код подтверждения: {code}\n\nКод действует 10 минут.",
        )

    @staticmethod
    def send_student_approved(to_email: str) -> None:
        EmailService.send_email(
            to_email=to_email,
            subject="Профиль подтвержден",
            body="Ваш профиль студента был подтвержден администратором.",
        )

    @staticmethod
    def send_student_rejected(to_email: str, reason: str) -> None:
        EmailService.send_email(
            to_email=to_email,
            subject="Профиль отклонен",
            body=f"Ваш профиль студента был отклонен.\n\nПричина: {reason}",
        )

    @staticmethod
    def send_application_status_changed(
            to_email: str,
            internship_title: str,
            status: str,
    ) -> None:

        if status == "APPROVED":
            subject = "Ваша заявка одобрена"
            body = (
                f'Работодатель одобрил ваш отклик на стажировку "{internship_title}".\n\n'
                "Поздравляем! \n"
                "Скоро с вами могут связаться для дальнейших этапов.\n"
                "Удачи на собеседовании!"
            )

        elif status == "REJECTED":
            subject = "Заявка отклонена"
            body = (
                f'К сожалению, ваш отклик на стажировку "{internship_title}" был отклонен.\n\n'
                "Не расстраивайтесь — попробуйте подать заявку на другие стажировки!"
            )

        else:
            subject = "Обновление статуса заявки"
            body = (
                f'Статус вашей заявки на стажировку "{internship_title}" изменен: {status}.'
            )

        EmailService.send_email(
            to_email=to_email,
            subject=subject,
            body=body,
        )