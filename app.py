import os
import shutil
import tempfile
import uuid
import re
import logging
import subprocess
from urllib.parse import quote
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.concurrency import run_in_threadpool

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SupiriConvertPRO")

# Base and Temporary Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

# Prefer /tmp/uploads for Linux/Docker environments, fallback to OS temp on Windows
if os.name == "nt":
    UPLOAD_DIR = os.path.join(tempfile.gettempdir(), "supiriconvert_uploads")
else:
    UPLOAD_DIR = "/tmp/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)
logger.info(f"Initialized temporary upload directory at: {UPLOAD_DIR}")

# Initialize FastAPI App
app = FastAPI(
    title="SupiriConvertPRO",
    description="100% Free & Unlimited All-in-One File Converter and Utility Web Application powered by PrasaTek System Solutions",
    version="2.0.0",
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# CORS Middleware (Enable all origins for local previews and API access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount /assets directory for static assets (logo, favicon, etc.)
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


# --- System Tool Detection Helpers ---

def find_binary(names: list, windows_paths: list = None) -> Optional[str]:
    """Find executable in PATH or standard system paths."""
    for name in names:
        found = shutil.which(name)
        if found:
            return found

    if os.name == "nt" and windows_paths:
        for p in windows_paths:
            if os.path.isfile(p):
                return p
    return None

def get_libreoffice_bin() -> Optional[str]:
    return find_binary(
        ["libreoffice", "soffice"],
        [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
    )

def get_ffmpeg_bin() -> Optional[str]:
    """Find FFmpeg in system PATH, or fallback to bundled imageio-ffmpeg executable."""
    system_ff = find_binary(
        ["ffmpeg"],
        [
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
        ]
    )
    if system_ff:
        return system_ff
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and os.path.exists(exe):
            return exe
    except Exception as e:
        logger.warning(f"imageio_ffmpeg lookup error: {e}")
    return None

def check_poppler_installed() -> bool:
    return find_binary(["pdftoppm"]) is not None


# --- Cleanup Helper ---

def remove_temp_paths(*paths: Optional[str]):
    """Background task to remove temporary files and directories safely."""
    for path in paths:
        if path and os.path.exists(path):
            try:
                if os.path.isfile(path):
                    os.remove(path)
                    logger.debug(f"Removed temp file: {path}")
                elif os.path.isdir(path):
                    shutil.rmtree(path)
                    logger.debug(f"Removed temp dir: {path}")
            except Exception as e:
                logger.warning(f"Error removing temporary path '{path}': {e}")


def sanitize_filename(filename: str) -> str:
    """Sanitize original filename to prevent path traversal and odd chars."""
    basename = os.path.basename(filename or "file")
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', basename)
    return clean or f"file_{uuid.uuid4().hex[:6]}"


async def save_upload_file(upload_file: UploadFile, custom_prefix: str = "") -> str:
    """Save an incoming UploadFile to the temporary uploads directory."""
    uid = uuid.uuid4().hex
    safe_name = sanitize_filename(upload_file.filename)
    prefix = f"{custom_prefix}_" if custom_prefix else ""
    target_path = os.path.join(UPLOAD_DIR, f"{prefix}{uid}_{safe_name}")
    
    with open(target_path, "wb") as buffer:
        while chunk := await upload_file.read(1024 * 1024):  # 1MB chunks
            buffer.write(chunk)
            
    return target_path


# MIME type mapping dictionary
MIME_MAP = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".flac": "audio/flac",
    ".mp4": "video/mp4",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".gif": "image/gif",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
}


# =====================================================================
# FULL MATRIX OFFICE CONVERSION HELPERS (PURE-PYTHON ENGINES)
# =====================================================================

def docx_to_pdf_pure_python(input_path: str, output_path: str):
    """Pure-Python fallback to render DOCX to PDF using python-docx and fpdf2."""
    from docx import Document
    from fpdf import FPDF
    doc = Document(input_path)
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("helvetica", size=10)

    for p in doc.paragraphs:
        txt = p.text.strip()
        if not txt:
            continue
        clean_txt = txt.encode('latin-1', 'replace').decode('latin-1')
        if p.style.name.startswith("Heading 1"):
            pdf.set_font("helvetica", style="B", size=15)
            pdf.ln(3)
            pdf.multi_cell(0, 8, clean_txt)
            pdf.set_font("helvetica", size=10)
            pdf.ln(2)
        elif p.style.name.startswith("Heading"):
            pdf.set_font("helvetica", style="B", size=12)
            pdf.ln(2)
            pdf.multi_cell(0, 7, clean_txt)
            pdf.set_font("helvetica", size=10)
            pdf.ln(1)
        else:
            pdf.multi_cell(0, 6, clean_txt)
            pdf.ln(1)

    for tbl in doc.tables:
        pdf.ln(3)
        for r_idx, row in enumerate(tbl.rows):
            cells = [c.text.strip().encode('latin-1', 'replace').decode('latin-1') for c in row.cells]
            col_w = (pdf.w - 30) / max(1, len(cells))
            pdf.set_font("helvetica", style="B" if r_idx == 0 else "", size=9)
            for c_txt in cells:
                pdf.cell(col_w, 7, c_txt[:35], border=1)
            pdf.ln()
        pdf.set_font("helvetica", size=10)
        pdf.ln(2)

    pdf.output(output_path)


def xlsx_to_pdf_pure_python(input_path: str, output_path: str):
    """Pure-Python fallback to render XLSX to PDF using pandas and fpdf2."""
    import pandas as pd
    from fpdf import FPDF
    xl = pd.ExcelFile(input_path)
    pdf = FPDF(orientation="landscape")
    pdf.set_auto_page_break(auto=True, margin=15)

    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        pdf.add_page()
        pdf.set_font("helvetica", style="B", size=14)
        pdf.cell(0, 10, f"Sheet: {sheet_name}", ln=True)
        pdf.ln(2)

        if df.empty:
            pdf.set_font("helvetica", size=10)
            pdf.cell(0, 8, "(Empty Sheet)", ln=True)
            continue

        headers = [str(c) for c in df.columns]
        num_cols = len(headers)
        col_w = max(18, min(45, (pdf.w - 30) / max(1, num_cols)))

        # Headers
        pdf.set_font("helvetica", style="B", size=8)
        for h in headers:
            pdf.cell(col_w, 7, str(h)[:20].encode('latin-1', 'replace').decode('latin-1'), border=1)
        pdf.ln()

        # Data rows
        pdf.set_font("helvetica", size=8)
        for _, row in df.head(100).iterrows():
            for val in row:
                v_str = "" if pd.isna(val) else str(val)
                pdf.cell(col_w, 6, v_str[:20].encode('latin-1', 'replace').decode('latin-1'), border=1)
            pdf.ln()

    pdf.output(output_path)


def pptx_to_pdf_pure_python(input_path: str, output_path: str):
    """Pure-Python fallback to render PPTX to PDF using python-pptx and fpdf2."""
    from pptx import Presentation
    from fpdf import FPDF
    prs = Presentation(input_path)
    pdf = FPDF(orientation="landscape")
    pdf.set_auto_page_break(auto=True, margin=15)

    for idx, slide in enumerate(prs.slides):
        pdf.add_page()
        pdf.set_font("helvetica", style="B", size=15)
        pdf.cell(0, 10, f"Slide {idx + 1}", ln=True)
        pdf.ln(3)

        pdf.set_font("helvetica", size=11)
        for shape in slide.shapes:
            if shape.has_text_frame:
                for p in shape.text_frame.paragraphs:
                    txt = p.text.strip()
                    if txt:
                        pdf.multi_cell(0, 7, txt.encode('latin-1', 'replace').decode('latin-1'))
                        pdf.ln(1)
            elif shape.has_table:
                tbl = shape.table
                col_w = (pdf.w - 30) / max(1, len(tbl.columns))
                for r_idx, row in enumerate(tbl.rows):
                    pdf.set_font("helvetica", style="B" if r_idx == 0 else "", size=9)
                    for cell in row.cells:
                        c_txt = cell.text.strip().encode('latin-1', 'replace').decode('latin-1')
                        pdf.cell(col_w, 7, c_txt[:25], border=1)
                    pdf.ln()
                pdf.set_font("helvetica", size=11)
                pdf.ln(2)

    pdf.output(output_path)


def docx_to_xlsx(input_path: str, output_path: str):
    """Convert Word Document to Excel Workbook."""
    from docx import Document
    import pandas as pd
    doc = Document(input_path)
    all_dfs = []

    for t_idx, table in enumerate(doc.tables):
        rows_data = []
        for row in table.rows:
            rows_data.append([c.text.strip() for c in row.cells])
        if rows_data:
            df = pd.DataFrame(rows_data[1:], columns=rows_data[0] if len(rows_data) > 1 else None)
            all_dfs.append((f"Table_{t_idx + 1}", df))

    para_rows = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if t:
            para_rows.append([p.style.name, t])

    if para_rows:
        df_para = pd.DataFrame(para_rows, columns=["Style", "Text"])
        all_dfs.append(("Document_Text", df_para))

    if not all_dfs:
        all_dfs.append(("Content", pd.DataFrame({"Message": ["No text or tables in Word document."]})))

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        for name, df in all_dfs:
            df.to_excel(writer, sheet_name=name[:31], index=False)


def docx_to_pptx(input_path: str, output_path: str):
    """Convert Word Document to PowerPoint Presentation."""
    from docx import Document
    from pptx import Presentation
    from pptx.util import Inches, Pt
    doc = Document(input_path)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    title_slide = prs.slides.add_slide(prs.slide_layouts[0])
    doc_title = "Converted Word Document"
    for p in doc.paragraphs:
        if p.text.strip():
            doc_title = p.text.strip()
            break
    title_slide.shapes.title.text = doc_title[:80]
    if len(title_slide.placeholders) > 1:
        title_slide.placeholders[1].text = "Converted by PrasaTek SupiriConvertPRO"

    current_slide = None
    tf = None
    para_count = 0

    for p in doc.paragraphs:
        txt = p.text.strip()
        if not txt or txt == doc_title:
            continue
        is_heading = p.style.name.startswith("Heading") or (len(txt) < 50 and txt.isupper())
        if is_heading or current_slide is None or para_count >= 5:
            current_slide = prs.slides.add_slide(prs.slide_layouts[1])
            current_slide.shapes.title.text = txt[:60] if is_heading else "Content"
            tf = current_slide.placeholders[1].text_frame
            tf.word_wrap = True
            para_count = 0
            if is_heading:
                continue
        p_shape = tf.add_paragraph() if para_count > 0 else tf.paragraphs[0]
        p_shape.text = txt
        p_shape.font.size = Pt(16)
        para_count += 1

    prs.save(output_path)


def xlsx_to_docx(input_path: str, output_path: str):
    """Convert Excel Workbook to Word Document."""
    import pandas as pd
    from docx import Document
    from docx.shared import Pt
    doc = Document()
    xl = pd.ExcelFile(input_path)

    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        doc.add_heading(f"Sheet: {sheet_name}", level=1)
        if df.empty:
            doc.add_paragraph("(Empty Sheet)")
            continue

        table = doc.add_table(rows=len(df) + 1, cols=len(df.columns))
        table.style = 'Table Grid'

        # Headers
        for c_idx, col in enumerate(df.columns):
            cell = table.cell(0, c_idx)
            cell.text = str(col)
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.bold = True
                    run.font.size = Pt(9)

        # Rows
        for r_idx, (_, row) in enumerate(df.iterrows()):
            for c_idx, val in enumerate(row):
                cell = table.cell(r_idx + 1, c_idx)
                cell.text = "" if pd.isna(val) else str(val)
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.size = Pt(8.5)
        doc.add_paragraph()
    doc.save(output_path)


def xlsx_to_pptx(input_path: str, output_path: str):
    """Convert Excel Workbook to PowerPoint Slides."""
    import pandas as pd
    from pptx import Presentation
    from pptx.util import Inches, Pt
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    xl = pd.ExcelFile(input_path)
    title_layout = prs.slide_layouts[5]

    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        if df.empty:
            continue
        chunk_size = 8
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i:i + chunk_size]
            slide = prs.slides.add_slide(title_layout)
            slide.shapes.title.text = f"{sheet_name} (Rows {i+1} to {min(i+chunk_size, len(df))})"

            rows_cnt = len(chunk) + 1
            cols_cnt = min(8, len(chunk.columns))
            sub_chunk = chunk.iloc[:, :cols_cnt]

            table_shape = slide.shapes.add_table(
                rows_cnt, cols_cnt, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8)
            )
            tbl = table_shape.table

            for c_idx, col in enumerate(sub_chunk.columns):
                cell = tbl.cell(0, c_idx)
                cell.text = str(col)[:25]
                for p in cell.text_frame.paragraphs:
                    p.font.size = Pt(11)
                    p.font.bold = True

            for r_idx, (_, r_data) in enumerate(sub_chunk.iterrows()):
                for c_idx, val in enumerate(r_data):
                    cell = tbl.cell(r_idx + 1, c_idx)
                    cell.text = "" if pd.isna(val) else str(val)[:30]
                    for p in cell.text_frame.paragraphs:
                        p.font.size = Pt(10)
    prs.save(output_path)


def pptx_to_docx(input_path: str, output_path: str):
    """Convert PowerPoint Presentation to Word Document."""
    from pptx import Presentation
    from docx import Document
    prs = Presentation(input_path)
    doc = Document()

    for idx, slide in enumerate(prs.slides):
        doc.add_heading(f"Slide {idx + 1}", level=1)
        for shape in slide.shapes:
            if shape.has_text_frame:
                for p in shape.text_frame.paragraphs:
                    txt = p.text.strip()
                    if txt:
                        doc.add_paragraph(txt)
            elif shape.has_table:
                tbl = shape.table
                word_tbl = doc.add_table(rows=len(tbl.rows), cols=len(tbl.columns))
                word_tbl.style = 'Table Grid'
                for r_idx, row in enumerate(tbl.rows):
                    for c_idx, cell in enumerate(row.cells):
                        word_tbl.cell(r_idx, c_idx).text = cell.text.strip()
        doc.add_paragraph()
    doc.save(output_path)


def pptx_to_xlsx(input_path: str, output_path: str):
    """Convert PowerPoint Presentation to Excel Workbook."""
    from pptx import Presentation
    import pandas as pd
    prs = Presentation(input_path)
    slide_rows = []
    table_dfs = []

    for idx, slide in enumerate(prs.slides):
        slide_title = f"Slide {idx + 1}"
        slide_text_chunks = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                for p in shape.text_frame.paragraphs:
                    t = p.text.strip()
                    if t:
                        slide_text_chunks.append(t)
            elif shape.has_table:
                tbl = shape.table
                t_data = []
                for row in tbl.rows:
                    t_data.append([c.text.strip() for c in row.cells])
                if t_data:
                    df = pd.DataFrame(t_data[1:], columns=t_data[0] if len(t_data) > 1 else None)
                    table_dfs.append((f"S{idx+1}_Table", df))

        slide_rows.append({
            "Slide": idx + 1,
            "Title": slide_title,
            "Content": "\n".join(slide_text_chunks)
        })

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        pd.DataFrame(slide_rows).to_excel(writer, sheet_name="Presentation_Outline", index=False)
        for name, df in table_dfs:
            df.to_excel(writer, sheet_name=name[:31], index=False)


def pdf_to_pptx_pymupdf(input_path: str, output_path: str):
    """Convert PDF to PowerPoint using PyMuPDF (No Poppler required)."""
    import pymupdf
    from pptx import Presentation
    from pptx.util import Inches

    pdf_doc = pymupdf.open(input_path)
    prs = Presentation()
    blank_layout = prs.slide_layouts[6]

    if len(pdf_doc) > 0:
        first_page = pdf_doc[0]
        rect = first_page.rect
        if rect.width >= rect.height:
            prs.slide_width = Inches(13.333)
            prs.slide_height = Inches(7.5)
        else:
            prs.slide_width = Inches(7.5)
            prs.slide_height = Inches(10)

    temp_imgs = []
    try:
        for idx, page in enumerate(pdf_doc):
            pix = page.get_pixmap(dpi=150)
            img_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_slide_{idx}.png")
            pix.save(img_path)
            temp_imgs.append(img_path)

            slide = prs.slides.add_slide(blank_layout)
            slide.shapes.add_picture(img_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
        prs.save(output_path)
    finally:
        remove_temp_paths(*temp_imgs)


def pdf_to_xlsx(input_path: str, output_path: str):
    """Convert PDF to Excel using pdfplumber with text fallback."""
    import pdfplumber
    import pandas as pd
    with pdfplumber.open(input_path) as pdf:
        extracted_tables = []
        for p_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for t_idx, tbl in enumerate(tables):
                if tbl and len(tbl) > 0:
                    if len(tbl) > 1:
                        header = tbl[0]
                        data = tbl[1:]
                        df = pd.DataFrame(data, columns=header)
                    else:
                        df = pd.DataFrame(tbl)
                    extracted_tables.append((f"P{p_idx+1}_T{t_idx+1}", df))

        if extracted_tables:
            with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
                for sheet_name, df in extracted_tables:
                    safe_sheet = sheet_name[:31]
                    df.to_excel(writer, sheet_name=safe_sheet, index=False)
        else:
            rows = []
            for page in pdf.pages:
                txt = page.extract_text() or ""
                for line in txt.splitlines():
                    cols = [c.strip() for c in re.split(r'\s{2,}|\t', line) if c.strip()]
                    if cols:
                        rows.append(cols)
                    elif line.strip():
                        rows.append([line.strip()])

            if rows:
                max_len = max(len(r) for r in rows)
                norm_rows = [r + [""] * (max_len - len(r)) for r in rows]
                df = pd.DataFrame(norm_rows)
                df.to_excel(output_path, engine="openpyxl", index=False, header=False)
            else:
                df = pd.DataFrame({"Status": ["No extractable text or tables found in this PDF."]})
                df.to_excel(output_path, engine="openpyxl", index=False)


# =====================================================================
# API ROUTES
# =====================================================================

@app.get("/")
def serve_index():
    """Serve the single-page application."""
    index_path = os.path.join(BASE_DIR, "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="index.html not found.")
    return FileResponse(index_path, media_type="text/html")


@app.get("/favicon.png")
def get_favicon_png():
    """Direct route for favicon.png from assets or root."""
    for path in [os.path.join(ASSETS_DIR, "favicon.png"), os.path.join(BASE_DIR, "favicon.png")]:
        if os.path.exists(path):
            return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.get("/favicon.ico")
def get_favicon_ico():
    """Direct route for favicon.ico."""
    for path in [os.path.join(ASSETS_DIR, "favicon.png"), os.path.join(BASE_DIR, "favicon.png")]:
        if os.path.exists(path):
            return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.get("/logo.png")
def get_logo_png():
    """Direct route for logo.png from assets or root."""
    for path in [os.path.join(ASSETS_DIR, "logo.png"), os.path.join(BASE_DIR, "logo.png")]:
        if os.path.exists(path):
            return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Logo not found")


@app.get("/api/health")
@app.get("/health")
def get_health():
    """Health check endpoint for frontend status indicator."""
    return {
        "status": "online",
        "app": "SupiriConvertPRO",
        "provider": "PrasaTek System Solutions",
        "healthy": True,
    }


@app.get("/api/status")
def get_system_status():
    """Check availability of LibreOffice, FFmpeg, and Poppler."""
    lo = get_libreoffice_bin()
    ff = get_ffmpeg_bin()
    pop = check_poppler_installed()
    return {
        "status": "online",
        "app": "SupiriConvertPRO",
        "provider": "PrasaTek System Solutions",
        "libreoffice": bool(lo),
        "libreoffice_path": lo or "Using Pure-Python High-Accuracy Fallback",
        "ffmpeg": bool(ff),
        "ffmpeg_path": ff or "Not found",
        "poppler": pop or True,  # PyMuPDF engine active
        "upload_dir": UPLOAD_DIR,
    }


# =====================================================================
# TAB 1: FULL MATRIX DOCUMENT CONVERTER
# =====================================================================

def sync_convert_document(input_path: str, output_path: str, orig_ext: str, target_format: str):
    """Synchronous CPU-bound document conversion executed in worker threadpool."""
    # 1. Any Office / Text to PDF
    if target_format == "pdf":
        lo_bin = get_libreoffice_bin()
        lo_success = False
        if lo_bin:
            try:
                cmd = [lo_bin, "--headless", "--convert-to", "pdf", "--outdir", UPLOAD_DIR, input_path]
                logger.info(f"Running LibreOffice headless: {' '.join(cmd)}")
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
                if res.returncode == 0:
                    lo_output = os.path.splitext(input_path)[0] + ".pdf"
                    if not os.path.exists(lo_output):
                        base_no_ext = os.path.splitext(os.path.basename(input_path))[0]
                        candidates = [
                            os.path.join(UPLOAD_DIR, f)
                            for f in os.listdir(UPLOAD_DIR)
                            if f.startswith(base_no_ext) and f.endswith(".pdf")
                        ]
                        if candidates:
                            lo_output = candidates[0]
                    if os.path.exists(lo_output):
                        shutil.move(lo_output, output_path)
                        lo_success = True
            except Exception as lo_err:
                logger.warning(f"LibreOffice failed, falling back to pure-Python: {lo_err}")

        if not lo_success:
            logger.info(f"Using pure-Python engine for {orig_ext} -> pdf")
            if orig_ext in [".docx", ".doc"]:
                docx_to_pdf_pure_python(input_path, output_path)
            elif orig_ext in [".xlsx", ".xls"]:
                xlsx_to_pdf_pure_python(input_path, output_path)
            elif orig_ext in [".pptx", ".ppt"]:
                pptx_to_pdf_pure_python(input_path, output_path)
            elif orig_ext == ".txt":
                from fpdf import FPDF
                with open(input_path, "r", encoding="utf-8", errors="ignore") as f:
                    lines = f.readlines()
                pdf = FPDF()
                pdf.set_auto_page_break(auto=True, margin=15)
                pdf.add_page()
                pdf.set_font("helvetica", size=10)
                for l in lines:
                    pdf.multi_cell(0, 6, l.strip().encode('latin-1', 'replace').decode('latin-1'))
                pdf.output(output_path)
            else:
                raise ValueError(f"Cannot convert '{orig_ext}' to PDF.")

    # 2. Word (DOCX) -> Excel (XLSX)
    elif orig_ext in [".docx", ".doc"] and target_format == "xlsx":
        docx_to_xlsx(input_path, output_path)

    # 3. Word (DOCX) -> PowerPoint (PPTX)
    elif orig_ext in [".docx", ".doc"] and target_format == "pptx":
        docx_to_pptx(input_path, output_path)

    # 4. Excel (XLSX) -> Word (DOCX)
    elif orig_ext in [".xlsx", ".xls"] and target_format == "docx":
        xlsx_to_docx(input_path, output_path)

    # 5. Excel (XLSX) -> PowerPoint (PPTX)
    elif orig_ext in [".xlsx", ".xls"] and target_format == "pptx":
        xlsx_to_pptx(input_path, output_path)

    # 6. PowerPoint (PPTX) -> Word (DOCX)
    elif orig_ext in [".pptx", ".ppt"] and target_format == "docx":
        pptx_to_docx(input_path, output_path)

    # 7. PowerPoint (PPTX) -> Excel (XLSX)
    elif orig_ext in [".pptx", ".ppt"] and target_format == "xlsx":
        pptx_to_xlsx(input_path, output_path)

    # 8. PDF -> Word (DOCX)
    elif orig_ext == ".pdf" and target_format == "docx":
        from pdf2docx import Converter
        cv = Converter(input_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()

    # 9. PDF -> Excel (XLSX)
    elif orig_ext == ".pdf" and target_format == "xlsx":
        pdf_to_xlsx(input_path, output_path)

    # 10. PDF -> PowerPoint (PPTX) using PyMuPDF (fast 150 DPI)
    elif orig_ext == ".pdf" and target_format == "pptx":
        pdf_to_pptx_pymupdf(input_path, output_path)

    else:
        raise ValueError(
            f"Unsupported conversion matrix path from '{orig_ext}' to '{target_format}'."
        )


@app.post("/api/convert/document")
async def convert_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    """
    Handle Full Matrix Document Conversions (Word, Excel, PowerPoint, PDF):
    - DOCX to: PDF, XLSX, PPTX
    - XLSX to: PDF, DOCX, PPTX
    - PPTX to: PDF, DOCX, XLSX
    - PDF to: DOCX, XLSX, PPTX
    Executes in high-performance worker threadpool to prevent blocking the event loop.
    """
    orig_name = file.filename or "document"
    orig_root, orig_ext = os.path.splitext(orig_name)
    orig_ext = orig_ext.lower()
    target_format = target_format.lower().replace(".", "").strip()

    if not orig_ext:
        raise HTTPException(status_code=400, detail="Uploaded file lacks a valid extension.")

    input_path = await save_upload_file(file, "doc_in")
    out_uid = uuid.uuid4().hex
    output_filename = f"{orig_root}.{target_format}"
    output_path = os.path.join(UPLOAD_DIR, f"doc_out_{out_uid}_{output_filename}")

    try:
        await run_in_threadpool(sync_convert_document, input_path, output_path, orig_ext, target_format)

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise HTTPException(status_code=500, detail="Conversion completed, but output file is missing or empty.")

        background_tasks.add_task(remove_temp_paths, input_path, output_path)

        media_type = MIME_MAP.get(f".{target_format}", "application/octet-stream")
        safe_dl_name = quote(output_filename)
        return FileResponse(
            output_path,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{output_filename}\"; filename*=UTF-8''{safe_dl_name}"
            },
        )

    except ValueError as ve:
        remove_temp_paths(input_path, output_path)
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        remove_temp_paths(input_path, output_path)
        raise
    except Exception as e:
        logger.exception("Unexpected error during document conversion:")
        remove_temp_paths(input_path, output_path)
        raise HTTPException(status_code=500, detail=f"Document conversion failed: {str(e)}")


# =====================================================================
# TAB 2: PDF STUDIO (Merge & Images to PDF)
# =====================================================================

@app.post("/api/pdf/merge")
async def merge_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """Merge multiple PDF files into one using pypdf.PdfWriter.append in threadpool."""
    if not files or len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 PDF files to merge.")

    try:
        from pypdf import PdfWriter
    except ImportError:
        raise HTTPException(status_code=500, detail="pypdf library is required for merging PDFs.")

    saved_inputs = []
    out_uid = uuid.uuid4().hex
    output_path = os.path.join(UPLOAD_DIR, f"merged_{out_uid}.pdf")

    try:
        for idx, file in enumerate(files):
            ext = os.path.splitext(file.filename or "")[1].lower()
            if ext != ".pdf":
                raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not a valid PDF.")
            
            fpath = await save_upload_file(file, f"merge_{idx}")
            saved_inputs.append(fpath)

        def sync_merge(paths: List[str], target: str):
            writer = PdfWriter()
            for p in paths:
                writer.append(p)
            with open(target, "wb") as f_out:
                writer.write(f_out)

        await run_in_threadpool(sync_merge, saved_inputs, output_path)

        background_tasks.add_task(remove_temp_paths, *saved_inputs, output_path)

        output_filename = "merged_document.pdf"
        return FileResponse(
            output_path,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=\"{output_filename}\"; filename*=UTF-8''{output_filename}"
            },
        )
    except HTTPException:
        remove_temp_paths(*saved_inputs, output_path)
        raise
    except Exception as e:
        logger.exception("Error merging PDFs:")
        remove_temp_paths(*saved_inputs, output_path)
        raise HTTPException(status_code=500, detail=f"Failed to merge PDFs: {str(e)}")


@app.post("/api/pdf/images-to-pdf")
async def images_to_pdf(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """Combine multiple images (.png, .jpg, .webp, .bmp) into a single PDF using Pillow in threadpool."""
    if not files:
        raise HTTPException(status_code=400, detail="Please upload at least 1 image.")

    try:
        from PIL import Image
    except ImportError:
        raise HTTPException(status_code=500, detail="Pillow library is required.")

    saved_inputs = []
    out_uid = uuid.uuid4().hex
    output_path = os.path.join(UPLOAD_DIR, f"images_combined_{out_uid}.pdf")

    try:
        for idx, file in enumerate(files):
            fpath = await save_upload_file(file, f"img2pdf_{idx}")
            saved_inputs.append(fpath)

        def sync_images_to_pdf(paths: List[str], target: str):
            rgb_images = []
            for p in paths:
                img = Image.open(p)
                if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                    bg = Image.new("RGB", img.size, (255, 255, 255))
                    alpha = img.convert("RGBA").split()[-1]
                    bg.paste(img.convert("RGBA"), mask=alpha)
                    rgb_images.append(bg)
                else:
                    rgb_images.append(img.convert("RGB"))

            if not rgb_images:
                raise ValueError("No valid images processed.")

            rgb_images[0].save(
                target,
                "PDF",
                resolution=150.0,
                save_all=True,
                append_images=rgb_images[1:],
            )

        await run_in_threadpool(sync_images_to_pdf, saved_inputs, output_path)

        background_tasks.add_task(remove_temp_paths, *saved_inputs, output_path)

        output_filename = "images_combined.pdf"
        return FileResponse(
            output_path,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=\"{output_filename}\"; filename*=UTF-8''{output_filename}"
            },
        )
    except HTTPException:
        remove_temp_paths(*saved_inputs, output_path)
        raise
    except Exception as e:
        logger.exception("Error converting images to PDF:")
        remove_temp_paths(*saved_inputs, output_path)
        raise HTTPException(status_code=500, detail=f"Failed to convert images to PDF: {str(e)}")


# =====================================================================
# TAB 3: MEDIA CONVERTER (FFmpeg Video & Audio - Ultrafast Engine)
# =====================================================================

@app.post("/api/convert/media")
async def convert_media(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),
    fps: Optional[int] = Form(12),
):
    """
    Handle media conversions using FFmpeg with maximum speed optimization:
    - Ultrafast presets and multithreading (-preset ultrafast -threads 0)
    - High-speed MP3 encoding (-q:a 2 -threads 0)
    - Offloaded to threadpool to keep event loop 100% responsive
    """
    ff_bin = get_ffmpeg_bin()
    if not ff_bin:
        raise HTTPException(
            status_code=500,
            detail="FFmpeg engine not available. Please verify imageio-ffmpeg installation."
        )

    orig_name = file.filename or "media"
    orig_root, orig_ext = os.path.splitext(orig_name)
    target_format = target_format.lower().replace(".", "").strip()

    input_path = await save_upload_file(file, "media_in")
    out_uid = uuid.uuid4().hex
    output_filename = f"{orig_root}.{target_format}"
    output_path = os.path.join(UPLOAD_DIR, f"media_out_{out_uid}_{output_filename}")

    try:
        cmd = [ff_bin, "-y", "-i", input_path]

        # Case 1: Audio extraction / transcode (Fast MP3 with -q:a 2 -threads 0)
        if target_format == "mp3":
            cmd += ["-vn", "-c:a", "libmp3lame", "-q:a", "2", "-threads", "0", output_path]
        elif target_format == "wav":
            cmd += ["-vn", "-c:a", "pcm_s16le", "-threads", "0", output_path]
        elif target_format in ("aac", "m4a"):
            cmd += ["-vn", "-c:a", "aac", "-b:a", "192k", "-threads", "0", output_path]
        elif target_format == "ogg":
            cmd += ["-vn", "-c:a", "libvorbis", "-q:a", "5", "-threads", "0", output_path]
        elif target_format == "flac":
            cmd += ["-vn", "-c:a", "flac", "-threads", "0", output_path]

        # Case 2: Animated GIF
        elif target_format == "gif":
            valid_fps = max(5, min(fps or 12, 30))
            filter_chain = (
                f"fps={valid_fps},scale=480:-1:flags=lanczos,split[s0][s1];"
                f"[s0]palettegen=max_colors=128[p];"
                f"[s1][p]paletteuse=dither=bayer"
            )
            cmd += ["-threads", "0", "-vf", filter_chain, output_path]

        # Case 3: Video Transcoding (ultrafast preset + all threads)
        elif target_format == "mp4":
            cmd += ["-c:v", "libx264", "-preset", "ultrafast", "-threads", "0", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", output_path]
        elif target_format == "webm":
            cmd += ["-c:v", "libvpx-vp9", "-deadline", "realtime", "-threads", "0", "-crf", "30", "-b:v", "0", "-c:a", "libopus", output_path]
        elif target_format == "mkv":
            cmd += ["-c:v", "libx264", "-preset", "ultrafast", "-threads", "0", "-c:a", "aac", output_path]
        elif target_format == "avi":
            cmd += ["-c:v", "mpeg4", "-threads", "0", "-q:v", "5", "-c:a", "mp3", output_path]
        elif target_format == "mov":
            cmd += ["-c:v", "libx264", "-preset", "ultrafast", "-threads", "0", "-c:a", "aac", output_path]
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported target media format: {target_format}")

        def run_ffmpeg_sync(command: list):
            logger.info(f"Executing FFmpeg: {' '.join(command)}")
            return subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)

        res = await run_in_threadpool(run_ffmpeg_sync, cmd)

        if res.returncode != 0:
            logger.error(f"FFmpeg failed: {res.stderr}")
            raise HTTPException(status_code=500, detail=f"FFmpeg conversion failed: {res.stderr.strip()[-300:] or 'Unknown error'}")

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise HTTPException(status_code=500, detail="Converted media file is missing or empty.")

        background_tasks.add_task(remove_temp_paths, input_path, output_path)

        media_type = MIME_MAP.get(f".{target_format}", "application/octet-stream")
        safe_dl_name = quote(output_filename)
        return FileResponse(
            output_path,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{output_filename}\"; filename*=UTF-8''{safe_dl_name}"
            },
        )

    except HTTPException:
        remove_temp_paths(input_path, output_path)
        raise
    except Exception as e:
        logger.exception("Error converting media:")
        remove_temp_paths(input_path, output_path)
        raise HTTPException(status_code=500, detail=f"Failed to convert media: {str(e)}")


# =====================================================================
# TAB 4: IMAGE STUDIO (Pillow Conversion & Compression in Threadpool)
# =====================================================================

@app.post("/api/image/convert")
async def convert_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),
    quality: int = Form(85),
):
    """
    Convert image formats (.png, .jpg, .webp, .bmp) and compress with quality slider (10% to 100%).
    Executes in high-performance worker threadpool to maximize speed and responsiveness.
    """
    try:
        from PIL import Image
    except ImportError:
        raise HTTPException(status_code=500, detail="Pillow library is required.")

    orig_name = file.filename or "image"
    orig_root, _ = os.path.splitext(orig_name)
    target_format = target_format.lower().replace(".", "").strip()
    if target_format == "jpeg":
        target_format = "jpg"

    valid_targets = ["png", "jpg", "webp", "bmp"]
    if target_format not in valid_targets:
        raise HTTPException(status_code=400, detail=f"Invalid target format. Supported: {', '.join(valid_targets)}")

    quality_val = max(10, min(quality, 100))
    input_path = await save_upload_file(file, "img_in")
    out_uid = uuid.uuid4().hex
    output_filename = f"{orig_root}.{target_format}"
    output_path = os.path.join(UPLOAD_DIR, f"img_out_{out_uid}_{output_filename}")

    try:
        def sync_convert_image(in_p: str, out_p: str, t_fmt: str, q_val: int):
            with Image.open(in_p) as img:
                if t_fmt in ("jpg", "bmp"):
                    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                        bg = Image.new("RGB", img.size, (255, 255, 255))
                        alpha = img.convert("RGBA").split()[-1]
                        bg.paste(img.convert("RGBA"), mask=alpha)
                        processed_img = bg
                    else:
                        processed_img = img.convert("RGB")
                else:
                    processed_img = img

                if t_fmt == "jpg":
                    processed_img.save(out_p, "JPEG", quality=q_val, optimize=True)
                elif t_fmt == "webp":
                    processed_img.save(out_p, "WEBP", quality=q_val, method=4)
                elif t_fmt == "png":
                    comp_level = int((100 - q_val) / 100 * 9)
                    processed_img.save(out_p, "PNG", compress_level=comp_level, optimize=True)
                elif t_fmt == "bmp":
                    processed_img.save(out_p, "BMP")

        await run_in_threadpool(sync_convert_image, input_path, output_path, target_format, quality_val)

        background_tasks.add_task(remove_temp_paths, input_path, output_path)

        media_type = MIME_MAP.get(f".{target_format}", "image/jpeg")
        safe_dl_name = quote(output_filename)
        return FileResponse(
            output_path,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{output_filename}\"; filename*=UTF-8''{safe_dl_name}"
            },
        )

    except HTTPException:
        remove_temp_paths(input_path, output_path)
        raise
    except Exception as e:
        logger.exception("Error converting image:")
        remove_temp_paths(input_path, output_path)
        raise HTTPException(status_code=500, detail=f"Failed to convert image: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=7860, reload=True)
