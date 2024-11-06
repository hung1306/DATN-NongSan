from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.applications import InceptionV3
from PIL import Image
from sklearn.metrics.pairwise import cosine_similarity
from tensorflow.keras.applications.inception_v3 import preprocess_input
from sklearn.preprocessing import normalize
import os
import sys
import logging

sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Load InceptionV3 pre-trained model
model = InceptionV3(weights='imagenet', include_top=False, pooling='avg')

# Function to load and preprocess image for InceptionV3
def load_and_preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((299, 299))
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# Function to extract features from an image using InceptionV3
def extract_features(img_path):
    img_array = load_and_preprocess_image(img_path)
    features = model.predict(img_array)
    features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
    features = normalize(features)
    return features

# Load feature database from .npy file
base_dir = os.path.dirname(os.path.abspath(__file__))
feature_database_path = os.path.join(base_dir, './InceptionV3.npy')

if not os.path.exists(feature_database_path):
    logging.error(f"Feature database file not found at {feature_database_path}")
    sys.exit(1)

feature_database = np.load(feature_database_path, allow_pickle=True).item()

# API for image search
@app.route('/search-image', methods=['POST'])
def search_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image_file = request.files['image']
    image_path = os.path.join(base_dir, "tempImage.jpg")
    image_file.save(image_path)
    try:
        logging.debug("Extracting features from the uploaded image")
        query_features = extract_features(image_path)
        similarities = []
        for product_id, data in feature_database.items():
            product_features = data['features']
            similarity = cosine_similarity(query_features, product_features)
            if similarity[0][0] > 0.7: 
                similarities.append((product_id, similarity[0][0]))
        similarities = sorted(similarities, key=lambda x: x[1], reverse=True)
        top_product_ids = [item[0] for item in similarities]
        similaritiesScore = [item[1] for item in similarities]
        logging.debug(f"Similarities: {similaritiesScore}")
        return jsonify({'product_ids': top_product_ids})
    except Exception as e:
        logging.error(f"Error during image search: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=12000)