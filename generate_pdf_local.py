#!/usr/bin/env python3
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER
from datetime import datetime

pdf_path = "/Users/scg/Desktop/git/itara-launch/ITARA_PAGE_NAMING_WORKFLOW.pdf"
doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                        rightMargin=0.5*inch, leftMargin=0.5*inch,
                        topMargin=0.5*inch, bottomMargin=0.5*inch)

story = []
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=28,
    textColor=HexColor('#6C5CE7'),
    spaceAfter=6,
    alignment=TA_CENTER,
    fontName='Helvetica-Bold'
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=14,
    textColor=HexColor('#6C5CE7'),
    spaceAfter=12,
    spaceBefore=12,
    fontName='Helvetica-Bold'
)

subheading_style = ParagraphStyle(
    'CustomSubHeading',
    parent=styles['Heading3'],
    fontSize=11,
    textColor=HexColor('#4F46E5'),
    spaceAfter=10,
    spaceBefore=8,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=9.5,
    leading=12,
    spaceAfter=8
)

# Title Page
story.append(Spacer(1, 0.8*inch))
story.append(Paragraph("ITARA", title_style))
story.append(Paragraph("PAGE NAMING SYSTEM & WORKFLOW", heading_style))
story.append(Spacer(1, 12))
story.append(Paragraph("Complete Reference Guide for All Pages", body_style))
story.append(Spacer(1, 0.3*inch))
story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", body_style))
story.append(PageBreak())

# Part 1
story.append(Paragraph("PART 1: PAGE NAMING REFERENCE", heading_style))
story.append(Spacer(1, 12))

story.append(Paragraph("Primary Pages", subheading_style))
primary_data = [
    ['#', 'File Name', 'Page Name', 'Description'],
    ['1', 'index.html', 'Homepage', 'Landing page - First touchpoint'],
    ['2', 'dashboard.html', 'Mission Control', 'User dashboard - Account hub'],
]

primary_table = Table(primary_data, colWidths=[0.5*inch, 1.2*inch, 1.2*inch, 2.1*inch])
primary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HexColor('#6C5CE7')),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 8.5),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor('#F8F8F8')]),
]))
story.append(primary_table)
story.append(Spacer(1, 16))

story.append(Paragraph("Platform Feature Pages (Logged-In Only)", subheading_style))
feature_data = [
    ['#', 'File Name', 'Page Name', 'Description'],
    ['3', 'compute.html', 'Compute Terminal', 'GPU Rental Marketplace'],
    ['4', 'market.html', 'Market Terminal', 'AI Models Exchange'],
    ['5', 'neuralwork.html', 'NeuralWork Hub', 'Freelance Tasks'],
    ['6', 'axis.html', 'AXIS Intel Hub', 'AI Intelligence Center'],
]

feature_table = Table(feature_data, colWidths=[0.5*inch, 1.2*inch, 1.2*inch, 2.1*inch])
feature_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HexColor('#4F46E5')),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 8.5),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor('#F8F8F8')]),
]))
story.append(feature_table)
story.append(PageBreak())

# Part 2
story.append(Paragraph("PART 2: QUICK PAGE REFERENCE", heading_style))
story.append(Spacer(1, 12))

quick_ref = [
    '<b>"Go to Homepage"</b> = Send to <b>Page 1</b> (index.html)',
    '<b>"Go to Mission Control"</b> = Send to <b>Page 2</b> (dashboard.html)',
    '<b>"Browse GPUs"</b> = Send to <b>Page 3</b> (compute.html)',
    '<b>"Browse Models"</b> = Send to <b>Page 4</b> (market.html)',
    '<b>"Post a Task"</b> = Send to <b>Page 5</b> (neuralwork.html)',
    '<b>"Compare Models"</b> = Send to <b>Page 6</b> (axis.html)',
]

for item in quick_ref:
    story.append(Paragraph(f"• {item}", body_style))

story.append(PageBreak())

# Part 3
story.append(Paragraph("PART 3: COMMUNICATION EXAMPLES", heading_style))
story.append(Spacer(1, 12))

examples = [
    ('INSTEAD OF:', 'Can you fix the GPU rental page?', 'SAY:', 'Can you fix Compute Terminal (Page 3)?'),
    ('INSTEAD OF:', 'I see a bug in the dashboard', 'SAY:', 'I see a bug in Mission Control (Page 2)'),
    ('INSTEAD OF:', 'Add a button on tasks page', 'SAY:', 'Add a button on NeuralWork Hub (Page 5)'),
    ('INSTEAD OF:', 'Update the home page', 'SAY:', 'Update Homepage (Page 1)'),
]

for old_label, old_text, new_label, new_text in examples:
    story.append(Paragraph(f"<b>{old_label}</b> {old_text}", body_style))
    story.append(Paragraph(f"<b style='color:#059669'>{new_label}</b> {new_text}", body_style))
    story.append(Spacer(1, 8))

story.append(PageBreak())

# Part 4
story.append(Paragraph("PART 4: COMPLETE USER WORKFLOWS", heading_style))
story.append(Spacer(1, 12))

workflows = [
    ('New User Signup', 'Homepage (Page 1) → Sign up → 4-step onboarding → Mission Control (Page 2)'),
    ('Existing User Login', 'Homepage (Page 1) → Session check → Auto-redirect to Page 2 OR manual signin'),
    ('Page Refresh Persistence', 'Any page → Refresh → Check session in browser → Restore automatically'),
    ('List a GPU', 'Page 2 → Click "List GPU" → Fill details → Appears in LISTINGS section'),
    ('Browse & Rent GPUs', 'Page 2 → Navigate to Page 3 (Compute Terminal) → Browse → Rent'),
    ('Browse & Buy Models', 'Page 2 → Navigate to Page 4 (Market Terminal) → Browse → Purchase'),
    ('Post & Manage Tasks', 'Page 2 → Navigate to Page 5 (NeuralWork Hub) → Post → Manage bids'),
    ('Compare AI Models', 'Page 2 → Navigate to Page 6 (AXIS) → View benchmarks → Compare'),
    ('Manage Profile', 'Page 2 → Click avatar → Edit Profile → Update settings → Save'),
    ('Sign Out', 'Page 2 → Click avatar → Sign Out → Redirect to Page 1'),
]

for title, desc in workflows:
    story.append(Paragraph(f"<b>{title}</b>", subheading_style))
    story.append(Paragraph(desc, body_style))
    story.append(Spacer(1, 6))

story.append(PageBreak())

# Part 5
story.append(Paragraph("PART 5: FILE MAPPING", heading_style))
story.append(Spacer(1, 12))

file_data = [
    ['File Name', 'Page #', 'Page Name', 'Purpose'],
    ['index.html', '1', 'Homepage', 'Public landing page'],
    ['dashboard.html', '2', 'Mission Control', 'User dashboard'],
    ['compute.html', '3', 'Compute Terminal', 'GPU marketplace'],
    ['market.html', '4', 'Market Terminal', 'Models exchange'],
    ['neuralwork.html', '5', 'NeuralWork Hub', 'Tasks platform'],
    ['axis.html', '6', 'AXIS Intel Hub', 'AI Intelligence'],
]

file_table = Table(file_data, colWidths=[1.5*inch, 0.8*inch, 1.5*inch, 1.7*inch])
file_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HexColor('#6C5CE7')),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, -1), 8.5),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#E0E0E0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor('#F8F8F8')]),
]))
story.append(file_table)
story.append(Spacer(1, 24))

footer_style = ParagraphStyle('Footer', parent=body_style, alignment=TA_CENTER, textColor=HexColor('#999999'), fontSize=8)
story.append(Paragraph(f"Document Version: 1.0 | {datetime.now().strftime('%B %d, %Y')}", footer_style))

doc.build(story)
print(f"✅ PDF created at: {pdf_path}")
