import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from deepface import DeepFace
import cv2
import numpy as np
import base64

app = Flask(__name__)
# Allow CORS for all domains so the mobile app can connect easily
CORS(app, resources={r"/*": {"origins": "*"}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

@app.route('/detect_emotion', methods=['POST'])
@limiter.limit("15 per minute")
def detect_emotion():
    # comprehensive Tamil song playlists for each emotion
    playlists = {
        'happy': [
            {'id': 'h1', 'title': 'Arabic Kuthu', 'artist': 'Anirudh', 'movie': 'Beast'},
            {'id': 'h2', 'title': 'Vaathi Coming', 'artist': 'Anirudh', 'movie': 'Master'},
            {'id': 'h3', 'title': 'Chill Bro', 'artist': 'Vivek-Mervin', 'movie': 'Pattas'},
            {'id': 'h4', 'title': 'Selfie Pulla', 'artist': 'Vijay', 'movie': 'Kaththi'},
            {'id': 'h5', 'title': 'Kutty Story', 'artist': 'Vijay', 'movie': 'Master'},
            {'id': 'h6', 'title': 'Vaadi Pulla Vaadi', 'artist': 'Hiphop Tamizha', 'movie': 'Meesaya Murukku'},
            {'id': 'h7', 'title': 'Jolly O Gymkhana', 'artist': 'Vijay', 'movie': 'Beast'},
            {'id': 'h8', 'title': 'Aaluma Doluma', 'artist': 'Anirudh', 'movie': 'Vedalam'},
            {'id': 'h9', 'title': 'Donu Donu Donu', 'artist': 'Anirudh', 'movie': 'Maari'},
            {'id': 'h10', 'title': 'Jimikki Ponnu', 'artist': 'Thaman S', 'movie': 'Varisu'},
            {'id': 'h11', 'title': 'Google Google', 'artist': 'Vijay', 'movie': 'Thuppakki'},
            {'id': 'h12', 'title': 'Marana Mass', 'artist': 'Anirudh', 'movie': 'Petta'}
        ],
        'sad': [
            {'id': 's1', 'title': 'Why This Kolaveri Di', 'artist': 'Anirudh', 'movie': '3'},
            {'id': 's2', 'title': 'Po Nee Po', 'artist': 'Anirudh', 'movie': '3'},
            {'id': 's3', 'title': 'Kanave Kanave', 'artist': 'Anirudh', 'movie': 'David'},
            {'id': 's4', 'title': 'Maruvaarthai', 'artist': 'Sid Sriram', 'movie': 'Enai Noki Paayum Thota'},
            {'id': 's5', 'title': 'Nallai Allai', 'artist': 'A.R. Rahman', 'movie': 'Kaatru Veliyidai'},
            {'id': 's6', 'title': 'Munbe Vaa', 'artist': 'A.R. Rahman', 'movie': 'Sillunu Oru Kadhal'},
            {'id': 's7', 'title': 'New York Nagaram', 'artist': 'A.R. Rahman', 'movie': 'Sillunu Oru Kadhal'},
            {'id': 's8', 'title': 'Unakkenna Venum Sollu', 'artist': 'Harris Jayaraj', 'movie': 'Yennai Arindhaal'},
            {'id': 's9', 'title': 'Oru Naalil', 'artist': 'Yuvan Shankar Raja', 'movie': 'Pudhupettai'},
            {'id': 's10', 'title': 'Kadhal Anukkal', 'artist': 'A.R. Rahman', 'movie': 'Enthiran'},
            {'id': 's11', 'title': 'Vennilave Vennilave', 'artist': 'A.R. Rahman', 'movie': 'Minsara Kanavu'},
            {'id': 's12', 'title': 'Uyire Uyire', 'artist': 'A.R. Rahman', 'movie': 'Bombay'},
            {'id': 's13', 'title': 'Kadhaippoma', 'artist': 'Leon James', 'movie': 'Oh My Kadavule'}
        ],
        'angry': [
            {'id': 'a1', 'title': 'Neruppu Da', 'artist': 'Santhosh Narayanan', 'movie': 'Kabali'},
            {'id': 'a2', 'title': 'Surviva', 'artist': 'Anirudh', 'movie': 'Vivegam'},
            {'id': 'a3', 'title': 'Aalaporan Thamizhan', 'artist': 'A.R. Rahman', 'movie': 'Mersal'},
            {'id': 'a4', 'title': 'Karuppu Vellai', 'artist': 'Sam C.S.', 'movie': 'Vikram Vedha'},
            {'id': 'a5', 'title': 'Petta Paraak', 'artist': 'Anirudh', 'movie': 'Petta'},
            {'id': 'a6', 'title': 'Arjunar Villu', 'artist': 'Vidyasagar', 'movie': 'Ghilli'},
            {'id': 'a7', 'title': 'Vaathi Raid', 'artist': 'Anirudh', 'movie': 'Master'},
            {'id': 'a8', 'title': 'Sultan Title Track', 'artist': 'Yuvan Shankar Raja', 'movie': 'Sultan'},
            {'id': 'a9', 'title': 'Ethir Neechal', 'artist': 'Anirudh', 'movie': 'Ethir Neechal'},
            {'id': 'a10', 'title': 'Oru Mugamo', 'artist': 'Harris Jayaraj', 'movie': 'Bheema'}
        ],
        'neutral': [
            {'id': 'n1', 'title': 'Vaseegara', 'artist': 'Harris Jayaraj', 'movie': 'Minnale'},
            {'id': 'n2', 'title': 'Nenjukkul Peidhidum', 'artist': 'Harris Jayaraj', 'movie': 'Vaaranam Aayiram'},
            {'id': 'n3', 'title': 'Pachai Nirame', 'artist': 'A.R. Rahman', 'movie': 'Alaipayuthey'},
            {'id': 'n4', 'title': 'Oru Deivam Thantha Poove', 'artist': 'A.R. Rahman', 'movie': 'Kannathil Muthamittal'},
            {'id': 'n5', 'title': 'Thalli Pogathey', 'artist': 'A.R. Rahman', 'movie': 'Achcham Yenbadhu Madamaiyada'},
            {'id': 'n6', 'title': 'Kadhal Rojave', 'artist': 'A.R. Rahman', 'movie': 'Roja'},
            {'id': 'n7', 'title': 'Anbil Avan', 'artist': 'A.R. Rahman', 'movie': 'Vinnaithaandi Varuvaayaa'},
            {'id': 'n8', 'title': 'Hosanna', 'artist': 'A.R. Rahman', 'movie': 'Vinnaithaandi Varuvaayaa'}
        ],
        'surprise': [
            {'id': 'su1', 'title': 'Rowdy Baby', 'artist': 'Yuvan Shankar Raja', 'movie': 'Maari 2'},
            {'id': 'su2', 'title': 'Otha Sollaala', 'artist': 'G.V. Prakash Kumar', 'movie': 'Aadukalam'},
            {'id': 'su3', 'title': 'Danga Maari Oodhari', 'artist': 'Harris Jayaraj', 'movie': 'Anegan'},
            {'id': 'su4', 'title': 'Private Party', 'artist': 'Anirudh', 'movie': 'Don'},
            {'id': 'su5', 'title': 'Appadi Podu', 'artist': 'Vidyasagar', 'movie': 'Ghilli'},
            {'id': 'su6', 'title': 'Sodakku', 'artist': 'Anirudh', 'movie': 'Thaanaa Serndha Koottam'}
        ]
    }
    
    # Map any missing emotions (fear/disgust) to the closest matching playlist 
    # (or you can expand these with their own custom songs later)
    playlists['fear'] = playlists['angry']      # Powerful/confidence boosting for fear
    playlists['disgust'] = playlists['neutral'] # Calming/distracting for disgust

    try:
        # Input Validation (payload size restriction)
        if request.content_length and request.content_length > 10 * 1024 * 1024:
            return jsonify({'error': 'Payload to large. Max 10MB.'}), 413

        # Check if the file is in the request
        if 'image' in request.files:
            file = request.files['image']
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif 'image_base64' in request.form or (request.json and 'image_base64' in request.json):
            # Try to get from JSON (React Native might send JSON with base64)
            data = request.json['image_base64'] if request.json else request.form['image_base64']
            
            # Remove header if present (e.g. data:image/jpeg;base64,)
            if ',' in data:
                data = data.split(',')[1]
                
            # Replace whitespace/newlines that might come from React Native
            data = data.replace('\n', '').replace('\r', '').replace(' ', '+')
            
            # Add padding back if necessary
            missing_padding = len(data) % 4
            if missing_padding:
                data += '=' * (4 - missing_padding)
                
            img_bytes = base64.b64decode(data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            return jsonify({'error': 'No image provided. Please send "image" file or "image_base64" data.'}), 400

        if img is None:
            return jsonify({'error': 'Invalid image format.'}), 400

        # Perform emotion detection using DeepFace
        # enforce_detection=False so it doesn't throw if face is slightly cropped
        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
        
        # DeepFace returns a list if multiple faces are detected. We take the first one.
        if isinstance(result, list):
            result = result[0]
            
        dominant_emotion = result.get('dominant_emotion')
        emotion_scores = result.get('emotion')
        
        # DeepFace sometimes returns float32 which is not JSON serializable
        if emotion_scores:
            emotion_scores = {k: float(v) for k, v in emotion_scores.items()}
        
        return jsonify({
            'success': True,
            'dominant_emotion': dominant_emotion,
            'emotion_scores': emotion_scores,
            'playlist': playlists.get(dominant_emotion, playlists['neutral'])
        })

    except Exception as e:
        print("Error during emotion detection:", str(e))
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Face Emotion Detection API is running. Use /detect_emotion POST endpoint."})

if __name__ == '__main__':
    # Listen on all interfaces so the mobile app can reach it over the local network
    app.run(host='0.0.0.0', port=5000, debug=True)
