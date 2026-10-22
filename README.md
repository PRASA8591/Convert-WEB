# ⚡ SupiriConvertPRO

> **100% Free & Unlimited All-in-One File Converter & Utility Web Application — Powered by PrasaTek System Solutions**  
> Fast, Secure, Enterprise-Grade • Zero paid third-party APIs • Zero limits • Self-cleaning container storage

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🌟 Key Features

### 📄 Tab 1: Full Matrix Document Converter (Backend)
- **Any-to-Any Matrix:** Seamless conversion between **Word (`.docx`)**, **Excel (`.xlsx`)**, **PowerPoint (`.pptx`)**, and **PDF (`.pdf`)**:
  - **Word TO:** PDF, Excel (`.xlsx`), PowerPoint (`.pptx`)
  - **Excel TO:** PDF, Word (`.docx`), PowerPoint (`.pptx`)
  - **PowerPoint TO:** PDF, Word (`.docx`), Excel (`.xlsx`)
  - **PDF TO:** Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`)
- **Dual Engine Architecture:** Uses headless **LibreOffice** where available, with automatic pure-Python fallbacks (**python-docx**, **openpyxl**, **python-pptx**, **PyMuPDF**, and **fpdf2**) so conversions work 100% out-of-the-box on local Windows, Linux, and Hugging Face Spaces!

### 📑 Tab 2: PDF Studio (Backend)
- **Merge PDFs:** Upload multiple PDF documents, customize ordering, and merge them into a single PDF using **pypdf**.
- **Images to PDF:** Select multiple images (`.png`, `.jpg`, `.webp`, `.bmp`) and combine them into a consolidated PDF booklet using **Pillow**.

### 🎬 Tab 3: Media Converter (Backend)
- **Video to Audio:** Extract audio from `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm` into `.mp3`, `.wav`, `.aac`, `.ogg`, or `.flac`.
- **Transcode Video:** Convert between major video formats using **FFmpeg**.
- **Animated GIF:** Convert video clips into smooth animated `.gif` files with custom frame-rate settings and two-pass Lanczos palette optimization.

### 🖼️ Tab 4: Image Studio (Client-Side & Backend)
- **Format Conversion:** Convert between `.png`, `.jpg`, `.webp`, and `.bmp`.
- **Compression & Quality Control:** Interactive slider (10% to 100%) to compress file size while preserving visual quality.

### 🔤 Tab 5: Case Converter & Text Studio (100% Client-Side)
- **Comprehensive Case Transformations:** Instant, zero-latency conversion for:
  - **`UPPER CASE`**: All uppercase letters
  - **`lower case`**: All lowercase letters
  - **`Sentence case`**: Automatic capitalization of initial letters and characters following punctuation (`.`, `!`, `?`, or newlines)
  - **`Capitalized Case`**: Title Case capitalization of each word
  - **`aLtErNaTiNg cAsE`**: Alternating letter casing
  - **`iNVERSE cASE`**: Flip existing uppercase and lowercase letters
  - **`Clean Extra Spaces`**: Remove duplicate spaces and trim line edges
  - **`kebab-case (Slug)`**: Clean URL-friendly slug generation
- **Real-Time Text Statistics:** Live counters for Total Characters, Characters (No Spaces), Words, Sentences, Lines, and Reading Time.
- **Client-Side Actions:** 1-Click Clipboard Copy, Download as `.txt` (`SupiriConvert_Text.txt`), Multi-level Undo stack, Sample text loader, and Clear.

### 🛠️ Tab 6: Free Offline Utilities (Client-Side)
- **Instant QR Code Generator:** Generate and download crisp QR codes from text/URLs with custom foreground and background colors (`qrcode.js`).
- **Strong Password Generator:** Cryptographically secure password generator with customizable length, character sets, and live strength indicator.
- **Quick Studio Launcher:** Direct 1-click launcher linking into Case Converter & Text Studio.

---

## 🔒 Security & Self-Cleaning Storage

- **Unique File Isolation:** All uploaded and converted files are tagged with a unique UUID (`doc_out_<uuid>_<filename>`) in `/tmp/uploads` to eliminate collisions.
- **FastAPI BackgroundTasks:** Once the converted `FileResponse` is delivered to the client, the backend automatically deletes both the input and output files from disk.

---

## 🚀 Deployment to Hugging Face Spaces (Port 7860)

This project is pre-configured for **Hugging Face Spaces** using the **Docker SDK**:

1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/new-space).
2. Set Space SDK to **Docker** (Blank template).
3. Push or upload your application files:
   - `Dockerfile`
   - `requirements.txt`
   - `app.py`
   - `index.html`
   - `assets/` (containing `logo.png` and `favicon.png`)
4. Hugging Face Spaces will automatically build the container and launch the web app on port **7860**.

---

## 🐳 Running with Docker Locally

Build and run the container locally:

```bash
# Build Docker image
docker build -t prasatek-supiriconvertpro .

# Run container on port 7860
docker run -p 7860:7860 prasatek-supiriconvertpro
```

Access the app in your browser at `http://localhost:7860`.

---

## 💻 Local Development Setup (Without Docker)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+**
- **FFmpeg** (added to system PATH)
- **LibreOffice** (installed in standard location or PATH)
- **Poppler** (`pdftoppm` in PATH)

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
python app.py
# Or with uvicorn directly:
uvicorn app:app --host 127.0.0.1 --port 7860 --reload
```

Open `http://127.0.0.1:7860` in your web browser.

---

## 📜 Copyright
© PrasaTek SupiriConvertPRO. 100% Free to Use. All Rights Reserved.
