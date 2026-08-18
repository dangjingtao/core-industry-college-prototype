from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output/pdf/经营决策体验-首期方案确认.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FONT_REGULAR = "/System/Library/Fonts/STHeiti Light.ttc"
FONT_BOLD = "/System/Library/Fonts/STHeiti Medium.ttc"
pdfmetrics.registerFont(TTFont("Heiti", FONT_REGULAR, subfontIndex=0))
pdfmetrics.registerFont(TTFont("Heiti-Bold", FONT_BOLD, subfontIndex=0))

PAGE_W, PAGE_H = A4
BLUE = colors.HexColor("#244B74")
BLUE_LIGHT = colors.HexColor("#EAF1F7")
GOLD = colors.HexColor("#B88736")
INK = colors.HexColor("#1F2933")
MUTED = colors.HexColor("#5F6B76")
LINE = colors.HexColor("#D9E0E7")
PAPER = colors.HexColor("#F7F9FB")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 15 * mm, PAGE_W - 20 * mm, 15 * mm)
    canvas.setFont("Heiti", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 9 * mm, "产业核心学院 · 产品方案确认")
    canvas.drawRightString(PAGE_W - 20 * mm, 9 * mm, f"第 {doc.page} 页")
    canvas.restoreState()


frame = Frame(20 * mm, 19 * mm, PAGE_W - 40 * mm, PAGE_H - 36 * mm, id="main")
doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=20 * mm,
    rightMargin=20 * mm,
    topMargin=17 * mm,
    bottomMargin=19 * mm,
    title="经营决策体验｜首期方案确认",
    author="产业核心学院产品团队",
)
doc.addPageTemplates([PageTemplate(id="default", frames=[frame], onPage=footer)])

styles = getSampleStyleSheet()
title = ParagraphStyle(
    "TitleCN", parent=styles["Title"], fontName="Heiti-Bold", fontSize=24,
    leading=32, textColor=BLUE, alignment=TA_LEFT, spaceAfter=7 * mm,
)
meta = ParagraphStyle(
    "Meta", fontName="Heiti", fontSize=9.5, leading=15, textColor=MUTED,
    backColor=PAPER, borderColor=LINE, borderWidth=0.5, borderPadding=8,
    spaceAfter=6 * mm,
)
h1 = ParagraphStyle(
    "H1CN", fontName="Heiti-Bold", fontSize=14, leading=21,
    textColor=BLUE, spaceBefore=4 * mm, spaceAfter=2.5 * mm,
)
body = ParagraphStyle(
    "BodyCN", fontName="Heiti", fontSize=10.5, leading=18,
    textColor=INK, spaceAfter=2.2 * mm,
)
small = ParagraphStyle(
    "SmallCN", fontName="Heiti", fontSize=9, leading=15,
    textColor=MUTED, spaceAfter=1.5 * mm,
)
callout = ParagraphStyle(
    "Callout", fontName="Heiti-Bold", fontSize=11.5, leading=19,
    textColor=BLUE, backColor=BLUE_LIGHT, borderColor=BLUE,
    borderWidth=0, borderLeftWidth=3, borderPadding=10, spaceBefore=2 * mm,
    spaceAfter=4 * mm,
)
bullet = ParagraphStyle(
    "BulletCN", parent=body, leftIndent=4 * mm, firstLineIndent=-3.5 * mm,
    bulletIndent=0, spaceAfter=1.2 * mm,
)
check = ParagraphStyle(
    "CheckCN", parent=body, leftIndent=7 * mm, firstLineIndent=-6 * mm,
    spaceAfter=2 * mm,
)


def P(text, style=body):
    return Paragraph(text, style)


def H(text):
    return Paragraph(text, h1)


def bullets(items):
    return [P(f"• {item}", bullet) for item in items]


story = [
    P("经营决策体验", title),
    P("首期方案确认", ParagraphStyle(
        "Subtitle", fontName="Heiti-Bold", fontSize=16, leading=22,
        textColor=GOLD, spaceAfter=5 * mm,
    )),
    P("文档用途：供负责人确认产品方向与首期范围<br/>当前状态：待确认", meta),
    H("一、我们准备做什么"),
    P("我们建议把现有“运营沙盒”调整为一个独立的轻量互动活动，名称暂定为“经营决策体验”。"),
    P("用户进入后，扮演一家社区团购店的经营者，在几个备选方案中做选择，例如调整价格、选择商品或开展推广，然后查看选择带来的结果。"),
    P("它可以理解为一个几分钟完成的模拟经营小游戏，但产品表达保持克制，不把整个平台做成游戏。", callout),
    H("二、它在平台里的位置"),
    P("它不是产业核心学院的首页主功能，也不占一级导航。首期作为一次独立活动出现："),
]

flow = Table(
    [[P("活动入口", body), P("经营决策体验", body), P("完成或退出", body), P("返回活动页面", body)]],
    colWidths=[38 * mm, 48 * mm, 38 * mm, 45 * mm],
)
flow.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), BLUE_LIGHT),
    ("TEXTCOLOR", (0, 0), (-1, -1), BLUE),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("BOX", (0, 0), (-1, -1), 0.7, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("TOPPADDING", (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
]))
story.extend([
    flow,
    Spacer(1, 3 * mm),
    P("活动结束后可以直接关闭入口，不影响平台其他功能。未来如有真实赛事或课程需要，可以单独接入，但不属于首期范围。"),
    H("三、为什么建议这样处理"),
])

reasons = [
    ("保留想法的价值", "它比纯文字课程更直观，用户可以通过自己的选择看到不同结果。"),
    ("控制产品风险", "当前玩法还没有证明能够长期使用。直接做成核心板块，容易让产品显得像游戏化培训工具。"),
    ("控制开发投入", "首期只验证用户是否愿意进入、能否理解和愿意完成，不提前建设积分、排行、成绩保存和赛事系统。"),
    ("保留退出空间", "效果不好可以下线；效果好再逐步扩展，不需要推翻主平台结构。"),
]
reason_rows = [[P(a, ParagraphStyle("CellHead", parent=body, fontName="Heiti-Bold", textColor=BLUE)), P(b, body)] for a, b in reasons]
reason_table = Table(reason_rows, colWidths=[38 * mm, 131 * mm], repeatRows=0)
reason_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), BLUE_LIGHT),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
]))
story.extend([reason_table, H("四、首期做什么")])
story.extend(bullets([
    "一个独立活动入口和一个社区团购经营场景；",
    "一次几分钟可以完成的体验；",
    "用户做若干经营选择，页面反馈选择带来的结果；",
    "支持重新体验、随时退出并返回活动页；",
    "活动可以随时启用或关闭。",
]))

story.append(H("五、首期明确不做什么"))
story.extend(bullets([
    "不进入首页或一级导航；不作为正式赛事或课程考试；",
    "不记录或评价用户能力，不保存游戏成绩和过程；",
    "不接入全局学力值、算力、签到和任务；",
    "不建设排行榜、商城和徽章体系；",
    "不关联简历、证书和长期资产；",
    "不承诺真实商业经营结果，不把 AI 作为首期卖点。",
]))

story.extend([
    H("六、产品气质要求"),
    P("这个活动可以轻松、有互动感，但不能显得幼稚或廉价。整体感觉应更接近“轻量商业案例体验”，而不是“升级打怪小游戏”。", callout),
])

tone_data = [
    [P("建议保留", ParagraphStyle("TH", parent=body, fontName="Heiti-Bold", textColor=colors.white, alignment=TA_CENTER)),
     P("建议避免", ParagraphStyle("TH2", parent=body, fontName="Heiti-Bold", textColor=colors.white, alignment=TA_CENTER))],
    [P("清楚的经营情境<br/>简单但需要思考的选择<br/>选择后的结果变化<br/>容易理解的结果说明", body),
     P("夸张庆祝和大量表情符号<br/>无意义的升级、金币和抽奖<br/>强制签到和每日任务<br/>没有依据的 AI 能力测评", body)],
]
tone_table = Table(tone_data, colWidths=[84.5 * mm, 84.5 * mm])
tone_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, 0), BLUE),
    ("BACKGROUND", (1, 0), (1, 0), GOLD),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("LEFTPADDING", (0, 0), (-1, -1), 9),
    ("RIGHTPADDING", (0, 0), (-1, -1), 9),
]))
story.extend([
    tone_table,
    H("七、如何接入平台"),
    P("小游戏作为独立 H5 页面开发，主平台只提供活动入口和返回按钮。这样小游戏可以独立调整，活动可以随时启停，发生故障也不会影响报名、参赛、课程和就业等主要功能。首期不需要建设复杂的插件平台。"),
    H("八、首期验证什么"),
])
story.extend(bullets([
    "用户看到活动后是否愿意进入？",
    "用户是否能在没有讲解的情况下理解玩法？",
    "用户是否愿意完成一次体验？",
    "用户完成后是否愿意再体验一次？",
]))
story.extend([
    P("如果用户没有明显兴趣，就停止扩展；如果反馈较好，再讨论更多场景、课程练习或赛事应用。", small),
    KeepTogether([
        H("九、建议的确认结论"),
        P("同意将“运营沙盒”调整为独立活动形式的“经营决策体验”。首期只做社区团购单场景 Demo，以独立 H5 接入产业核心学院，不进入平台核心导航，不保存成绩，不关联赛事、课程和长期资产。完成用户兴趣和基本体验验证后，再决定是否继续投入。", callout),
    ]),
    H("十、需要负责人确认"),
])

checks = [
    "同意产品名称暂用“经营决策体验”",
    "同意首期定位为独立活动 Demo",
    "同意不进入首页和一级导航",
    "同意首期不保存成绩、不做能力评价",
    "同意首期只做一个社区团购场景",
    "同意验证后再决定是否扩展",
]
story.extend([P(f"□　{x}", check) for x in checks])
story.append(Spacer(1, 2 * mm))
story.append(P("如以上六项确认，即可进入首期原型设计和开发评估。", ParagraphStyle(
    "End", parent=body, fontName="Heiti-Bold", alignment=TA_CENTER,
    textColor=BLUE, backColor=BLUE_LIGHT, borderPadding=9,
)))

doc.build(story)
print(OUTPUT)
