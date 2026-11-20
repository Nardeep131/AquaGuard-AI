"""
AquaGuard AI PDF Report Generator
Uses ReportLab to produce enterprise-grade water quality test certificates.
"""
import io
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from backend.app.services.standards import BIS_DRINKING_LIMITS

def generate_water_quality_pdf(sample_record, analysis_record, user_record=None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles matching AquaGuard aesthetic
    primary_color = colors.HexColor("#0879D9")
    dark_navy = colors.HexColor("#061426")
    cyan_accent = colors.HexColor("#0E7490")
    success_color = colors.HexColor("#059669")
    danger_color = colors.HexColor("#DC2626")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color
    )

    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569")
    )

    heading2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=dark_navy,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E293B")
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#64748B")
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>AQUAGUARD AI</b><br/><font size=8 color='#0879D9'>INTELLIGENT WATER QUALITY & SAFETY PLATFORM</font>", title_style),
            Paragraph(f"<b>CERTIFICATE ID:</b> {sample_record.sample_uid}<br/><b>Date:</b> {sample_record.collected_at.strftime('%Y-%m-%d %H:%M UTC')}<br/><b>Standard:</b> BIS IS 10500:2012 / WHO", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=4, spaceAfter=8))

    # 2. Sample Metadata Summary
    inspector_name = user_record.full_name if user_record else "System Inspector"
    inspector_org = user_record.organization if (user_record and user_record.organization) else "AquaGuard Diagnostic Network"
    inspector_role = user_record.role.replace("_", " ").title() if user_record else "Certified Quality Analyst"

    meta_data = [
        ["Sample Source:", sample_record.source_name, "Category:", sample_record.category.title()],
        ["Location / Facility:", sample_record.location, "Source Type:", (sample_record.source_type or "N/A").title()],
        ["Investigating Officer:", f"{inspector_name} ({inspector_role})", "Organization:", inspector_org],
        ["Laboratory Verification:", "Pending NABL / In-Vitro Confirmation" if not analysis_record.lab_verified else "Verified", "Quality Index:", f"{analysis_record.overall_score}/100"]
    ]
    meta_table = Table(meta_data, colWidths=[130, 150, 120, 140])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#1E293B")),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 3. Overall Potability & Safety Verdict Box
    is_potable = analysis_record.potable
    verdict_color = success_color if is_potable else danger_color
    verdict_title = "COMPLIANT WITH DRINKING WATER STANDARDS" if is_potable else "NON-COMPLIANT / TREATMENT REQUIRED"
    
    verdict_data = [
        [Paragraph(f"<b>STATUS EVALUATION: {verdict_title}</b><br/>{analysis_record.status}", ParagraphStyle("V", fontName="Helvetica", fontSize=9, textColor=colors.white))]
    ]
    verdict_table = Table(verdict_data, colWidths=[540])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), verdict_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(verdict_table)
    story.append(Spacer(1, 10))

    # 4. Measured Parameters vs Standards Table
    story.append(Paragraph("Physicochemical & Microbiological Assay Measurements", heading2_style))
    param_headers = ["Parameter", "Measured Value", "Acceptable Limit", "Permissible Limit", "Compliance Verdict"]
    param_rows = [param_headers]

    params = json.loads(sample_record.parameters_json) if sample_record.parameters_json else {}
    violations = json.loads(analysis_record.violations_json) if analysis_record.violations_json else []
    violating_params = {v.get("parameter") for v in violations}

    for p_name, val in params.items():
        limits = BIS_DRINKING_LIMITS.get(p_name, {})
        acc_max = limits.get("acceptable_max", "N/A")
        perm_max = limits.get("permissible_max", "N/A")
        unit = limits.get("unit", "")

        is_violating = p_name in violating_params
        status_label = "NON-COMPLIANT" if is_violating else "PASS"

        acc_str = f"<= {acc_max} {unit}" if acc_max != "N/A" else "N/A"
        perm_str = f"<= {perm_max} {unit}" if perm_max != "N/A" else "N/A"
        if p_name == "ph":
            acc_str = "6.5 - 8.5"
            perm_str = "6.5 - 8.5"

        param_rows.append([
            p_name.replace("_", " ").title(),
            f"{val} {unit}".strip(),
            acc_str,
            perm_str,
            status_label
        ])

    param_table = Table(param_rows, colWidths=[150, 100, 100, 100, 90])
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), dark_navy),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]

    for idx, row in enumerate(param_rows[1:], start=1):
        if row[4] == "NON-COMPLIANT":
            t_style.append(('TEXTCOLOR', (4, idx), (4, idx), danger_color))
            t_style.append(('FONTNAME', (4, idx), (4, idx), 'Helvetica-Bold'))
        else:
            t_style.append(('TEXTCOLOR', (4, idx), (4, idx), success_color))

    param_table.setStyle(TableStyle(t_style))
    story.append(param_table)
    story.append(Spacer(1, 10))

    # 5. Recommended Remediation & Engineering Treatments
    story.append(Paragraph("Engineering Remediation & Water Treatment Recommendations", heading2_style))
    recs = json.loads(analysis_record.recommendations_json) if analysis_record.recommendations_json else []

    if recs:
        rec_data = [["Technology", "Process Details & Operational Guidelines", "Urgency"]]
        for r in recs:
            rec_data.append([
                Paragraph(f"<b>{r.get('title', '')}</b><br/><font color='#0879D9'>{r.get('technology', '')}</font>", body_style),
                Paragraph(r.get('description', ''), body_style),
                r.get('urgency', 'Recommended')
            ])
        rec_table = Table(rec_data, colWidths=[160, 300, 80])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), cyan_accent),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(rec_table)
    else:
        story.append(Paragraph("No active corrective treatment mandated. Baseline maintenance recommended.", body_style))

    story.append(Spacer(1, 12))

    # 6. Scientific Disclaimer and Accreditation Notice
    disclaimer_text = (
        "<b>OFFICIAL SCIENTIFIC DISCLAIMER:</b> This assessment is generated using AquaGuard AI's automated mathematical "
        "and machine-learning analysis engine for preliminary decision-support. It is NOT a substitute for certified laboratory testing "
        "by an ISO/IEC 17025 accredited facility. Microbiological potability requires verified bacterial culture assays. "
        "Neither AquaGuard AI nor the software platform assumes civil liability for direct consumption decisions taken without "
        "independent regulatory health department certification."
    )
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94A3B8"), spaceBefore=4, spaceAfter=4))
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
