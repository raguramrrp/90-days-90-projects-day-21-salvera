import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFExportService:
    @staticmethod
    def generate_offer_comparison_pdf(comparison_data: dict) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        # Custom editorial color palette
        primary_color = colors.HexColor("#286B59")
        dark_text = colors.HexColor("#202723")
        muted_text = colors.HexColor("#6B756F")
        bg_surface = colors.HexColor("#F6F7F5")
        border_color = colors.HexColor("#E3E7E3")

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=primary_color,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=muted_text,
            spaceAfter=15
        )
        section_style = ParagraphStyle(
            "SectionTitle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=dark_text,
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=dark_text
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#8A948E"),
            spaceBefore=16
        )

        elements = []

        # Header
        elements.append(Paragraph("SALVERA — COMPENSATION EVALUATION REPORT", title_style))
        elements.append(Paragraph(
            f"Generated on {datetime.now().strftime('%B %d, %Y')} | Evaluation Model: Total Disposable Income Deconstruction",
            subtitle_style
        ))
        elements.append(Spacer(1, 10))

        # Comparison Name & Meta
        elements.append(Paragraph(f"<b>Comparison Scenario:</b> {comparison_data.get('comparison_name', 'Tech Offer Comparison')}", body_style))
        if comparison_data.get("notes"):
            elements.append(Paragraph(f"<b>Notes:</b> {comparison_data['notes']}", body_style))
        elements.append(Spacer(1, 12))

        # Table of Offers
        offers = comparison_data.get("offers", [])
        if offers:
            headers = ["Metric / Component"] + [f"{o.get('company_name', 'Company')} ({o.get('offer_name')})" for o in offers]
            
            rows = [
                headers,
                ["Role & Location"] + [f"{o.get('role_title')} ({o.get('location_name', 'Bengaluru')})" for o in offers],
                ["Work Mode"] + [o.get("work_mode", "Hybrid") for o in offers],
                ["Fixed Base (Annual)"] + [f"Rs. {o.get('fixed_salary', 0):,.0f}" for o in offers],
                ["Variable Bonus (Annual)"] + [f"Rs. {o.get('variable_salary', 0):,.0f}" for o in offers],
                ["Joining Bonus (One-time)"] + [f"Rs. {o.get('joining_bonus', 0):,.0f}" for o in offers],
                ["Annual Benefits / Perks"] + [f"Rs. {o.get('annual_benefits', 0):,.0f}" for o in offers],
                ["TOTAL STATED CTC"] + [f"Rs. {o.get('financials', {}).get('total_stated_ctc', 0):,.0f}" for o in offers],
                ["Recurring Gross Annual"] + [f"Rs. {o.get('financials', {}).get('recurring_gross_annual', 0):,.0f}" for o in offers],
                ["Monthly Gross Equivalent"] + [f"Rs. {o.get('financials', {}).get('monthly_gross_equivalent', 0):,.0f}" for o in offers],
                ["Est. Monthly Deductions"] + [f"Rs. {o.get('monthly_deductions', 0):,.0f}" for o in offers],
                ["Est. Monthly Take-Home"] + [f"Rs. {o.get('financials', {}).get('estimated_monthly_take_home', 0):,.0f}" for o in offers],
                ["Total Monthly Living Exp."] + [f"Rs. {o.get('financials', {}).get('total_monthly_expenses', 0):,.0f}" for o in offers],
                ["EST. MONTHLY DISPOSABLE"] + [f"Rs. {o.get('financials', {}).get('estimated_monthly_disposable', 0):,.0f}" for o in offers],
            ]

            t = Table(rows, colWidths=[160] + [370 / len(offers)] * len(offers))
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), primary_color),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, border_color),
                ("BACKGROUND", (0, 7), (-1, 7), colors.HexColor("#EAF0ED")),
                ("FONTNAME", (0, 7), (-1, 7), "Helvetica-Bold"),
                ("BACKGROUND", (0, 13), (-1, 13), colors.HexColor("#D8E7DF")),
                ("FONTNAME", (0, 13), (-1, 13), "Helvetica-Bold"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
            ]))
            elements.append(t)

        elements.append(Spacer(1, 14))
        elements.append(Paragraph(
            "<b>Financial Deconstruction Methodology:</b><br/>"
            "1. <b>Total CTC</b> represents full employer commitment including variable incentives and one-time components.<br/>"
            "2. <b>Recurring Gross</b> excludes one-time joining bonuses to represent ongoing annual earning power.<br/>"
            "3. <b>Estimated Monthly Disposable</b> subtracts user-entered monthly living expenses (rent, commute, overhead) and statutory deductions from cash in-hand.<br/>"
            "<i>Note: Calculations are indicative estimates based on user-entered parameters and do not constitute formal legal or tax advisory.</i>",
            body_style
        ))

        elements.append(Paragraph(
            "DEMO DATA / USER SCENARIO — SALVERA Technology Salary & Career Intelligence Platform",
            disclaimer_style
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_career_plan_pdf(plan_data: dict) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        styles = getSampleStyleSheet()
        primary_color = colors.HexColor("#286B59")
        dark_text = colors.HexColor("#202723")
        muted_text = colors.HexColor("#6B756F")
        border_color = colors.HexColor("#E3E7E3")

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=primary_color,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=muted_text,
            spaceAfter=15
        )
        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=dark_text
        )

        elements = []
        elements.append(Paragraph("SALVERA — CAREER ROADMAP & SKILL GAP REPORT", title_style))
        elements.append(Paragraph(
            f"Generated on {datetime.now().strftime('%B %d, %Y')} | Target Role: {plan_data.get('target_role_title', 'Tech Specialist')}",
            subtitle_style
        ))
        elements.append(Spacer(1, 8))

        # Plan Summary Box
        meta_rows = [
            ["Current Role:", plan_data.get("current_role", "Junior Engineer"), "Target Date:", str(plan_data.get("target_date", "2025-12-31"))],
            ["Target Role:", plan_data.get("target_role_title", "Data Scientist"), "Target Salary:", f"Rs. {plan_data.get('target_salary_expectation', 0):,.0f}" if plan_data.get('target_salary_expectation') else "Market Competitive"],
            ["Roadmap Progress:", f"{plan_data.get('completion_percentage', 0)}% Completed", "Skills Tracked:", str(len(plan_data.get("skills_gap", [])))]
        ]
        meta_table = Table(meta_rows, colWidths=[100, 160, 100, 170])
        meta_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (-1, -1), dark_text),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F6F7F5")),
            ("GRID", (0, 0), (-1, -1), 0.5, border_color),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 14))

        # Skills table
        skills = plan_data.get("skills_gap", [])
        if skills:
            skill_rows = [["#", "Skill Name", "Gap Classification", "Priority", "Status", "Benchmark Note"]]
            for s in skills:
                skill_rows.append([
                    str(s.get("order_index", 1)),
                    s.get("skill_name", ""),
                    s.get("category", "").replace("_", " ").title(),
                    s.get("priority", "Medium"),
                    s.get("completion_status", "Planned"),
                    s.get("notes", "") or "-"
                ])

            st = Table(skill_rows, colWidths=[25, 115, 110, 55, 65, 160])
            st.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), primary_color),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, border_color),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            elements.append(st)

        elements.append(Spacer(1, 14))
        elements.append(Paragraph(
            "<b>Methodology & Transparency:</b> Skill gap categorizations are derived from empirical co-occurrence distributions within standardized benchmark datasets. Possession of a skill combination is statistically associated with higher compensation bands, but individual hiring outcomes depend on interview verification and domain execution.",
            body_style
        ))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
