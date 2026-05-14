# SkillBridge X — Local Setup Guide

Platform AI Career Recovery dengan backend Flask + Google Gemini AI.

## Struktur Project

```
skillbridgex/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── .env.example        # Template API key
├── .gitignore
└── static/
    └── index.html      # Frontend (landing page + scanner)
```

## Cara Menjalankan

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set API Key

Salin `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Buka `.env` dan isi API key Gemini kamu:

```
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Dapatkan API key di: https://aistudio.google.com/app/apikey

### 3. Jalankan Flask

```bash
python app.py
```

### 4. Buka browser

Buka: **http://localhost:5000**

---

## Catatan

- **Jangan commit file `.env`** ke Git — sudah ada di `.gitignore`
- API key hanya ada di server (Flask), tidak terekspos ke browser
- Model yang dipakai: `gemini-2.0-flash` (cepat & gratis dengan quota harian)
