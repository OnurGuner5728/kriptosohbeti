FROM python:3.9-slim

WORKDIR /app

# Dependencies yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY . .

# Port expose et
EXPOSE 5000

# Uygulamayı çalıştır
CMD ["python", "api_server.py"] 