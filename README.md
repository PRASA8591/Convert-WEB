<div align="center">

# ⚡ SupiriConvertPRO
### Sri Lanka's #1 All-in-One Free File Conversion & Productivity Suite
**Powered by PrasaTek System Solutions**

[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge&logo=render&logoColor=white)](https://supiriconvert.prasatek.lk)
[![Official Domain](https://img.shields.io/badge/Official%20Domain-supiriconvert.prasatek.lk-06b6d4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://supiriconvert.prasatek.lk)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20PrasaTek-blue?style=for-the-badge)](https://prasatek.lk)

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-FFD43B?style=flat-square&logo=python&logoColor=black)](https://pymupdf.readthedocs.io)
[![pdf2docx](https://img.shields.io/badge/pdf2docx-4B8BBE?style=flat-square&logo=python&logoColor=white)](https://github.com/dothinking/pdf2docx)
[![pypdf](https://img.shields.io/badge/pypdf-E0234E?style=flat-square&logo=adobeacrobatreader&logoColor=white)](https://pypdf.readthedocs.io)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=flat-square&logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-AI_OCR-5C6BC0?style=flat-square&logo=javascript&logoColor=white)](https://tesseract.projectnaptha.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)

---

**[🌐 Visit Official Web App: supiriconvert.prasatek.lk](https://supiriconvert.prasatek.lk)**

</div>

<br/>

## 📖 Overview

**SupiriConvertPRO** is a production-grade, 100% free, unlimited, all-in-one file conversion and productivity web application designed and developed by **PrasaTek System Solutions**. Engineered specifically for office professionals, students, media creators, lawyers, journalists, and everyday digital users in Sri Lanka and worldwide, SupiriConvertPRO eliminates third-party subscription paywalls, data harvesting, and software bloat.

By pairing a blazing-fast **FastAPI** asynchronous backend with state-of-the-art client-side Web APIs, **SupiriConvertPRO** delivers near-instant conversions across documents, PDFs, media streams, and graphics, while providing specialized tools such as real-time **Singlish phonetic typing**, **FM Abhaya legacy font conversion**, and **client-side Sinhala & English AI OCR**.

---

## 🚀 Key Advantages & Architecture Highlights

- 💯 **100% Free & Unlimited:** No hidden fees, no credit cards, zero paywalls, and no daily upload quotas.
- 🔒 **Zero Data Retention & Ephemeral Storage:** Unique UUID isolation (`doc_out_<uuid>_<filename>`) with immediate disk cleanup via `FastAPI.BackgroundTasks` right after file delivery.
- 🛡️ **RAM Protection & Memory Guard:** Strict 50 MB file size limit with asynchronous multi-threaded streams and explicit garbage collection (`gc.collect()`) to run reliably within low-memory cloud container constraints (e.g., Render 512 MB Free Tier, Hugging Face Spaces).
- ⚡ **Dual-Engine Document Core:** Headless **LibreOffice** execution with automated fallbacks to pure-Python engines (**python-docx**, **openpyxl**, **python-pptx**, **PyMuPDF**, and **fpdf2**), ensuring 100% offline uptime even if system binaries are absent.
- 💤 **Anti-Sleep Keep-Alive Heartbeat:** Built-in `/ping` and `/api/health` endpoints coupled with a 4-minute frontend heartbeat pulse to keep free-tier cloud containers warm and responsive.
- 🔍 **Full Search Engine Optimization (SEO):** Native `robots.txt`, XML sitemap (`sitemap.xml`), URL deep-linking hash router, and rich Google Schema.org JSON-LD microdata.

---

## 💎 Complete Feature Matrix (All 6 Core Categories)

```
SupiriConvertPRO
 ├── 📄 1. Full Matrix Document Converter (Word <-> Excel <-> PowerPoint <-> PDF)
 ├── 📚 2. PDF Studio (Merge, Split, Protect & Encrypt, Images to PDF)
 ├── 🎬 3. High-Speed Media Converter (FFmpeg Video/Audio Transcoder, MP3, GIF)
 ├── 🖼️ 4. Image Studio & AI OCR (PNG/JPG/WEBP/BMP + Tesseract.js Sinhala/English OCR)
 ├── 🇱🇰 5. Sinhala Studio (Singlish Phonetic Typer + Unicode <-> FM Abhaya Converter)
 └── 🛠️ 6. Case Converter & Free Utilities (8-Mode Text Casing, QR Code, Passwords)
```

---

### 📄 1. Document Converter (Any-to-Any Office Matrix)
*Deep link: `https://supiriconvert.prasatek.lk/#doc-tab`*

Complete any-to-any matrix conversion between modern document standards with layout fidelity and typography preservation:
- **Word (`.docx`, `.doc`) TO:** PDF, Excel (`.xlsx`), PowerPoint (`.pptx`), HTML, Plain Text (`.txt`).
- **Excel (`.xlsx`, `.xls`, `.csv`) TO:** PDF, Word (`.docx`), PowerPoint (`.pptx`), CSV.
- **PowerPoint (`.pptx`, `.ppt`) TO:** PDF, Word (`.docx`), Excel (`.xlsx`), Text.
- **PDF (`.pdf`) TO:** Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`), Text (`.txt`).
- **Layout Preservation:** High-performance PDF-to-Word reconstruction powered by `pdf2docx`, table extraction via `pdfplumber`, and vector rendering with `PyMuPDF`.

---

### 📚 2. PDF Studio (4-in-1 Toolkit)
*Deep link: `https://supiriconvert.prasatek.lk/#pdf-tab`*

A comprehensive Swiss Army knife for portable document formats:
1. **Merge Multiple PDFs (`#pdf-merge`):** Upload unlimited PDF files, visually arrange their sequence, and merge them into a consolidated document with bookmark integrity via `pypdf`.
2. **Images to PDF (`#pdf-img2pdf`):** Select multiple image files (`.png`, `.jpg`, `.webp`, `.bmp`, `.tiff`) and compile them into a neat digital booklet or multi-page PDF presentation.
3. **Split & Extract Pages (`#pdf-split`):** Extract individual pages, page intervals (e.g., `1-5, 8, 11-14`), or divide chapters into standalone PDF files.
4. **Encrypt & Protect PDF (`#pdf-security`):** Secure sensitive PDF contracts and reports with military-grade 128-bit/256-bit AES password encryption, or decrypt protected PDFs by unlocking owner passwords.

---

### 🎬 3. High-Speed Media Converter (Audio & Video)
*Deep link: `https://supiriconvert.prasatek.lk/#media-tab`*

Hardware-accelerated audio and video transcoding powered by **FFmpeg** and `imageio-ffmpeg`:
- **Video to Audio Extraction:** Extract studio-quality audio streams from `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm` into `.mp3`, `.wav`, `.aac`, `.ogg`, or lossless `.flac`.
- **Video Format Transcoding:** Seamlessly re-encode between `.mp4` (H.264/AAC), `.webm` (VP9/Opus), `.mkv`, and `.avi`.
- **Animated GIF Creator:** Convert video clips into smooth, high-resolution `.gif` animations with custom framerate control (10–30 FPS) and two-pass Lanczos palette optimization for vibrant color reproduction without dithering artifacts.

---

### 🖼️ 4. Image Studio & AI OCR Text Extractor
*Deep link: `https://supiriconvert.prasatek.lk/#image-tab` or `#ocr`*

A multi-purpose graphic utility combining format transcoding with neural text recognition:
- **Format Conversion & Compression:** Convert between `.png`, `.jpg`, `.webp`, `.bmp`, `.ico`, and `.tiff`.
- **Dynamic Quality Slider:** Interactive compression control (10% to 100%) providing instant file-size reduction while maintaining visual clarity.
- **Client-Side AI OCR (Sinhala & English):** Powered by **Tesseract.js**, extract printed or handwritten text directly from receipts, book scans, newspapers, and screenshots. Runs **100% locally in the browser**, ensuring maximum confidentiality and zero server bandwidth usage.

---

### 🇱🇰 5. Sinhala Studio (Phonetic Typer & Font Converter)
*Deep link: `https://supiriconvert.prasatek.lk/#sinhala-tab`*

Specially crafted for Sri Lankan government offices, legal practitioners, universities, desktop publishers, and content creators:
- **Phonetic Singlish to Sinhala Unicode Typer:** Type phonetically in English (e.g., `mama gedara yanawa`) and get real-time, accurate Sinhala Unicode script (`මම ගෙදර යනවා`).
- **Interactive 5-Part Alphabet Reference:** Live on-screen guide ("ශබ්දානුකූල අකුරු සූචිය") covering Vowels (ස්වර), Consonants (ව්‍යඤ්ජන), Diacritics (පිලි), Combined Characters (බැඳි අකුරු / රකාරාංශය), and Special Signs (අනුස්වාරය / විසර්ගය).
- **Bidirectional Unicode <-> FM Abhaya Font Converter:**
  - **Unicode to FM Abhaya:** Convert modern web Sinhala text into legacy FM Abhaya / DL fonts for Adobe Photoshop, Illustrator, InDesign, and CorelDRAW using UCSC standard glyph tables.
  - **FM Abhaya to Unicode:** Convert legacy FM-encoded documents into standardized Sinhala Unicode for websites, mobile apps, and modern word processors using the Pandukabhaya algorithm.

---

### 🛠️ 6. Free Utilities & Case Converter
*Deep link: `https://supiriconvert.prasatek.lk/#text-tab` and `#utils-tab`*

Essential daily productivity micro-tools:
- **8-Mode Case Converter:**
  - `UPPER CASE`: Full capitalized text.
  - `lower case`: All small letters.
  - `Sentence case`: Intelligent sentence beginning and punctuation-aware capitalization.
  - `Capitalized Case (Title Case)`: First letter of each word capitalized.
  - `aLtErNaTiNg cAsE`: Alternating case styling for creative typography.
  - `iNVERSE cASE`: Inverts current letter casing.
  - `Clean Extra Spaces`: Removes trailing whitespaces and redundant spaces.
  - `kebab-case (Slug)`: URL-friendly permalink generator.
- **Live Text Metrics:** Real-time character count (with & without spaces), word count, sentence count, line count, and estimated reading duration.
- **Instant QR Code Generator:** Generate crisp, customizable vector QR codes from any URL, phone number, or text with custom foreground/background colors and instant PNG download.
- **Cryptographic Password Generator:** Generate strong passwords with customizable lengths (8–64 characters), uppercase, lowercase, numbers, symbols, and a real-time entropy strength meter.
- **Base64 & JSON Formatters:** Clean client-side encoders, decoders, and prettifiers.

---

## 🏗️ System Architecture & Reliability Guardrails

```
Client Browser (Edge / Chrome / Firefox / Safari / Mobile)
  │
  ├─► Client-Side Engines (Zero Network Overhead):
  │     ├── Singlish Phonetic Engine (sinhala.js)
  │     ├── FM Abhaya Font Converter (UCSC / Pandukabhaya)
  │     ├── AI OCR Engine (Tesseract.js English + Sinhala)
  │     ├── Client-Side jsPDF & QRCode.js
  │     └── 8-Mode Case Converter & Text Statistics
  │
  └─► REST API (FastAPI Backend @ supiriconvert.prasatek.lk):
        ├── Reverse Proxy & TLS Termination (Render / Cloudflare)
        ├── RAM Protection Guard (50 MB Max File Limit)
        ├── Threadpool Executor (`run_in_threadpool`)
        ├── LibreOffice Headless Daemon + Pure-Python Fallbacks
        ├── FFmpeg Multi-Thread Audio/Video Pipeline
        ├── PyMuPDF & pdf2docx Reconstruction Engine
        ├── Ephemeral Storage with Unique UUID Namespaces
        └── Background Cleanup Task (`remove_temp_paths` + `gc.collect()`)
```

### 1. Memory Safety & Strict RAM Guard (50 MB Limit)
Free-tier container hosts (such as Render Free Tier and Hugging Face Spaces) enforce strict RAM caps (512 MB to 1024 MB). SupiriConvertPRO implements:
- Direct file size validation before ingestion (`MAX_FILE_SIZE = 50 * 1024 * 1024`).
- Python threadpool delegation for CPU-bound tasks (`run_in_threadpool`).
- Explicit forced memory reclamation (`gc.collect()`) inside `finally` blocks of all endpoints.
- Disk-buffered file streaming to avoid holding large media payloads in heap memory.

### 2. Ephemeral Storage & Data Privacy
- Uploaded and converted assets are stored temporarily in `/tmp/uploads` under non-colliding UUID filenames.
- After dispatching `FileResponse`, `FastAPI.BackgroundTasks` immediately executes disk unlinking of both input and output files.
- Zero analytics tracking or document logging ensures GDPR and institutional privacy compliance.

### 3. Anti-Sleep Keep-Alive Pulse
Render free web services spin down after 15 minutes of inactivity. SupiriConvertPRO solves this with:
- Dedicated ultra-lightweight endpoints: `GET /ping` and `GET /api/health`.
- An automated browser heartbeat interval that quietly pings `/api/health` every 4 minutes while a user has the tab open.
- An animated cold-start indicator on the UI that transparently notifies users when the cloud container is waking up.

---

## 🌐 Google Search Engine Optimization (SEO) & Indexing

SupiriConvertPRO is fully primed for high-ranking Google Search Console indexing:

| Tool / Route | URL / Implementation | Purpose |
| :--- | :--- | :--- |
| **Robots Policy** | [`/robots.txt`](https://supiriconvert.prasatek.lk/robots.txt) | Permits Googlebot/Bingbot crawling while shielding private `/api/` endpoints. |
| **XML Sitemap** | [`/sitemap.xml`](https://supiriconvert.prasatek.lk/sitemap.xml) | Full XML sitemap listing priority weightings for all core tools and deep links. |
| **URL Hash Deep-Linking** | `/#doc-tab`, `/#pdf-tab`, `/#media-tab`, `/#image-tab`, `/#ocr`, `/#sinhala-tab`, `/#text-tab`, `/#utils-tab` | Client-side routing with automatic history state tracking and alias resolution. |
| **JSON-LD Schema** | Schema.org `@graph` in `<head>` | Includes `WebApplication`, `Organization`, `FAQPage`, and `SiteNavigationElement`. |
| **Social OpenGraph** | `og:image`, `og:title`, `twitter:card` | Rich preview cards across WhatsApp, Facebook, Telegram, LinkedIn, and X. |

---

## 💻 Local Setup & Development Guide

### 1. System Requirements
- **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 22.04+ recommended)
- **Python:** Python 3.10 or higher
- **FFmpeg:** Installed and added to system `PATH`
- **LibreOffice:** Installed (Optional, pure-Python fallback will activate automatically if absent)

### 2. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/PRASA8591/Convert-WEB.git
cd Convert-WEB

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start Development Server

```bash
# Launch FastAPI backend with hot-reload
uvicorn app:app --host 127.0.0.1 --port 7860 --reload
```

Visit **`http://127.0.0.1:7860`** in your browser.

---

## 🐳 Docker & Cloud Deployment Guide

### Deploying Locally with Docker

```bash
# Build Docker image
docker build -t prasatek/supiriconvertpro:latest .

# Run container on port 7860
docker run -d -p 7860:7860 --name supiriconvert prasatek/supiriconvertpro:latest
```

Open `http://localhost:7860` in your web browser.

---

### Deploying to Render

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your Git repository.
3. Configure the environment:
   - **Environment:** `Docker` (Render will automatically detect the root `Dockerfile`).
   - **Instance Type:** `Free` (512 MB RAM) or `Starter`.
   - **Port:** `7860` (or leave default and bind via `PORT` environment variable).
4. Add Custom Domain: Point `supiriconvert.prasatek.lk` CNAME to your Render service address.
5. Setup an external uptime monitor (e.g., UptimeRobot) pinging `https://supiriconvert.prasatek.lk/ping` every 10 minutes to prevent container sleep.

---

### Deploying to Hugging Face Spaces

1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/new-space).
2. Select **Docker** as the Space SDK (Blank).
3. Commit and push repository contents (`Dockerfile`, `requirements.txt`, `app.py`, `index.html`, `assets/`, `robots.txt`, `sitemap.xml`).
4. Hugging Face Spaces will automatically compile the image and launch on port **7860**.

---

## 🏢 PrasaTek Ecosystem

**SupiriConvertPRO** is proud to be part of the **PrasaTek System Solutions** suite of high-performance cloud applications:

| Application | Domain | Description |
| :--- | :--- | :--- |
| **SupiriConvertPRO** | [supiriconvert.prasatek.lk](https://supiriconvert.prasatek.lk) | 100% Free All-in-One File Conversion & Productivity Suite. |
| **SupiriStudio PRO** | [studio.prasatek.lk](https://studio.prasatek.lk) | Enterprise Cloud Media Editing & Audio/Video Production Suite. |
| **PrasaTime PRO** | [time.prasatek.lk](https://time.prasatek.lk) | Smart Employee Attendance, Shift Scheduling & Payroll Management. |
| **PrasaCash PRO** | [cash.prasatek.lk](https://cash.prasatek.lk) | Cloud Point of Sale (POS), Real-Time Billing & Inventory System. |
| **PrasaTek Corporate** | [prasatek.lk](https://prasatek.lk) | System Solutions, Cloud Infrastructure & Custom Software Development. |

---

## 📄 License & Proprietary Rights

```
Copyright (c) 2026 PrasaTek System Solutions. All Rights Reserved.
Official Portal: https://prasatek.lk | Web App: https://supiriconvert.prasatek.lk
```

SupiriConvertPRO is proprietary software developed and maintained by **PrasaTek System Solutions**. Free access is provided to individual, academic, and commercial users under fair-use terms. Unauthorized duplication, white-label redistribution, or resale of the source code without explicit written permission from PrasaTek System Solutions is strictly prohibited.
