from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class PDFService:
    def __init__(self):
        pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
        pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

        self.styles = getSampleStyleSheet()

        self.title_style = ParagraphStyle(
            name="TitleCyr",
            parent=self.styles["Title"],
            fontName="Arial-Bold",
            fontSize=18,
            leading=22,
        )

        self.normal_style = ParagraphStyle(
            name="NormalCyr",
            parent=self.styles["Normal"],
            fontName="Arial",
            fontSize=10,
            leading=12,
        )

    def _build_table_pdf(self, title: str, headers: list[str], rows: list[list[str]]):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)

        elements = []
        elements.append(Paragraph(title, self.title_style))
        elements.append(Spacer(1, 16))

        data = [headers] + rows
        table = Table(data, repeatRows=1)

        table.setStyle(
            TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "Arial"),
                ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ])
        )

        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_published_internships_pdf(self, internships):
        rows = []
        for item in internships:
            rows.append([
                str(item.id),
                item.title or "",
                item.company_name or "",
                item.city or "",
                item.direction or "",
                str(item.salary) if item.salary is not None else "-",
                item.status.value if item.status else "",
            ])

        return self._build_table_pdf(
            "Отчет по опубликованным стажировкам",
            ["ID", "Название", "Компания", "Город", "Направление", "Зарплата", "Статус"],
            rows,
        )

    def generate_internships_by_city_pdf(self, cities_report):
        rows = []
        for city_item in cities_report:
            city_name = city_item.city or "Не указан"
            if city_item.internships:
                for internship in city_item.internships:
                    rows.append([
                        city_name,
                        str(internship.id),
                        internship.title or "",
                        internship.status.value if internship.status else "",
                    ])
            else:
                rows.append([city_name, "-", "-", "-"])

        return self._build_table_pdf(
            "Отчет по местам расположения стажировок",
            ["Город", "ID стажировки", "Название", "Статус"],
            rows,
        )

    def generate_companies_and_internships_pdf(self, companies_report):
        rows = []
        for company in companies_report:
            company_name = company.company_name or "Не указана"
            if company.internships:
                for internship in company.internships:
                    rows.append([
                        company_name,
                        str(internship.id),
                        internship.title or "",
                        internship.city or "",
                        internship.direction or "",
                        internship.status.value if internship.status else "",
                    ])
            else:
                rows.append([company_name, "-", "-", "-", "-", "-"])

        return self._build_table_pdf(
            "Отчет о компаниях и стажировках",
            ["Компания", "ID", "Стажировка", "Город", "Направление", "Статус"],
            rows,
        )

    def generate_applications_by_internship_pdf(self, report):
        rows = []
        for item in report:
            rows.append([
                str(item.internship_id),
                item.internship_title or "",
                item.company_name or "",
                str(item.applications_count),
            ])

        return self._build_table_pdf(
            "Отчет по откликам на стажировки",
            ["ID стажировки", "Стажировка", "Компания", "Количество откликов"],
            rows,
        )

    def generate_students_count_pdf(self, report):
        rows = []
        for student in report.students:
            rows.append([
                str(student.id),
                student.full_name,
            ])

        rows.append(["", f"Итого студентов: {report.total_students}"])

        return self._build_table_pdf(
            "Отчет по количеству студентов",
            ["ID студента", "ФИО"],
            rows,
        )

    def generate_students_education_pdf(self, report):
        rows = []
        for student in report.students:
            rows.append([
                str(student.id),
                student.full_name,
                student.university or "",
            ])

        return self._build_table_pdf(
            "Отчет по местам обучения студентов",
            ["ID студента", "ФИО", "Учебное заведение"],
            rows,
        )

    def generate_employers_info_pdf(self, report):
        rows = []
        for employer in report.employers:
            rows.append([
                str(employer.employer_id),
                employer.company_name or "",
                str(employer.internships_count),
                str(employer.applications_count),
            ])

        return self._build_table_pdf(
            "Отчет по информации о работодателях",
            ["ID работодателя", "Компания", "Количество стажировок", "Количество откликов"],
            rows,
        )

    def generate_student_applications_pdf(self, report):
        rows = []
        for item in report.applications:
            rows.append([
                str(item.application_id),
                item.student_full_name,
                item.internship_title or "",
                item.company_name or "",
                str(item.applied_at) if item.applied_at else "",
                item.status or "",
            ])

        return self._build_table_pdf(
            "Отчет по откликам студентов",
            ["ID отклика", "Студент", "Стажировка", "Компания", "Дата отклика", "Статус"],
            rows,
        )

    def generate_directions_popularity_pdf(self, report):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)

        elements = []

        elements.append(Paragraph("Отчет по популярности направлений", self.title_style))
        elements.append(Spacer(1, 16))

        elements.append(Paragraph("Статистика по направлениям", self.normal_style))
        elements.append(Spacer(1, 8))

        direction_data = [[
            "Направление",
            "Количество стажировок",
            "Количество откликов",
            "Среднее число откликов",
        ]]

        for item in report.directions:
            direction_data.append([
                item.direction or "",
                str(item.internships_count),
                str(item.applications_count),
                str(item.average_applications_per_internship),
            ])

        direction_table = Table(direction_data, repeatRows=1)
        direction_table.setStyle(
            TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "Arial"),
                ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ])
        )
        elements.append(direction_table)
        elements.append(Spacer(1, 16))

        elements.append(Paragraph("Наиболее популярные города", self.normal_style))
        elements.append(Spacer(1, 8))

        city_data = [["Город", "Количество стажировок"]]
        for item in report.most_popular_cities:
            city_data.append([
                item.city or "",
                str(item.internships_count),
            ])

        city_table = Table(city_data, repeatRows=1)
        city_table.setStyle(
            TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "Arial"),
                ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ])
        )
        elements.append(city_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer