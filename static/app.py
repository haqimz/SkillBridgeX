from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__, static_folder="static")
CORS(app)

# Inisialisasi OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY"),
)


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/scan", methods=["POST"])
def scan():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Prompt tidak ditemukan"}), 400

    try:
        # Panggil model via OpenRouter
        response = client.chat.completions.create(
            model="meta-llama/llama-3.3-70b-instruct:free",  
            messages=[
                {"role": "user", "content": data["prompt"]}
            ],
        )
        result_text = response.choices[0].message.content
        return jsonify({"result": result_text})

    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "invalid" in err_msg.lower() or "Incorrect API key" in err_msg:
            return jsonify({"error": "API key tidak valid. Cek environment variable OPENROUTER_API_KEY."}), 401
        if "quota" in err_msg.lower() or "rate" in err_msg.lower():
            return jsonify({"error": "Quota/rate limit tercapai. Tunggu sebentar lalu coba lagi."}), 429
        return jsonify({"error": f"Terjadi kesalahan: {err_msg}"}), 500


# Cek API key saat startup
api_key = os.environ.get("OPENROUTER_API_KEY")
if not api_key:
    print("⚠️ WARNING: OPENROUTER_API_KEY tidak ditemukan!")
else:
    print("✅ OpenRouter API key ditemukan.")

# Hanya untuk menjalankan secara LOKAL
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 SkillBridge X berjalan di http://localhost:{port}")
    app.run(debug=True, host="0.0.0.0", port=port)