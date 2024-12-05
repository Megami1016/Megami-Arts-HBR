import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename, os


app = Flask(__name__)
# redis_host = os.environ.get("redis_host","redis://localhost")
# r = redis.from_url(redis_host)

# データファイルを提供するエンドポイント
@app.route('/data/cards.json')
def get_cards():
    return send_from_directory('data', 'cards.json')

# 画像の保存先を設定
UPLOAD_FOLDER = 'static/images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# アップロードするファイルの拡張子を確認する関数
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/select_deck', methods=['POST'])
def select_deck():
    data = request.json
    selected_deck = data.get('deck')
    return jsonify({"message": f"You selected {selected_deck}!"})

@app.route('/api/add_card', methods=['POST'])
def add_card():
    data = request.json
    card = data.get('card')
    return jsonify({"message": f"Added {card} to your deck!"})

if __name__ == '__main__':
    app.run(debug=True)
