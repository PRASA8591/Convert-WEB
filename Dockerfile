FROM python:3.10-slim

# Prevent interactive prompts during package installations
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860

# Install LibreOffice, FFmpeg, Poppler utilities, fonts, and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    ffmpeg \
    poppler-utils \
    fonts-dejavu-core \
    fonts-liberation \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up user with UID 1000 for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user

# Create application and temp upload directories with write permissions
WORKDIR /app
RUN mkdir -p /tmp/uploads && chown -R user:user /app /tmp/uploads && chmod 777 /tmp/uploads

# Switch to non-root user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Install Python dependencies
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application files and assets
COPY --chown=user:user assets/ ./assets/
COPY --chown=user:user . .

# Expose Hugging Face Spaces default port
EXPOSE 7860

# Run FastAPI backend with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
