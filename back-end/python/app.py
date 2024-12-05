from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from transformers import ViTImageProcessor, ViTModel  # Updated import
import numpy as np
import torch
import os
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import logging
import random
import time  # Thêm thư viện time để đo thời gian

# Khởi tạo Flask app
app = Flask(__name__)

# Khởi tạo ViT model và image processor
image_processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224-in21k')  # Changed to image processor
model = ViTModel.from_pretrained('google/vit-base-patch16-224-in21k')

# Tải đặc trưng của sản phẩm từ file .npz
base_dir = os.path.dirname(os.path.abspath(__file__))
feature_database_path = os.path.join(base_dir, './vit_features_preprocess_image.npz')
feature_database = np.load(feature_database_path, allow_pickle=True)
feature_database = {key: value for key, value in feature_database.items()}

# Hàm để tải và tiền xử lý ảnh nâng cao
def load_and_preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = ImageOps.exif_transpose(img)  # Điều chỉnh orientation
    img = img.resize((224, 224))  # Resize ảnh về 224x224 để nhất quán với ViT

    # Tăng cường hình ảnh: Lật ngang, Xoay, Điều chỉnh độ sáng, Độ tương phản
    if random.random() > 0.5:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    img = img.rotate(random.uniform(-10, 10))  # Xoay nhỏ ngẫu nhiên trong khoảng -10 đến 10 độ

    # Điều chỉnh độ sáng và độ tương phản
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(random.uniform(0.8, 1.2))
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(random.uniform(0.8, 1.2))

    # Áp dụng Gaussian Blur nhẹ để giảm nhiễu
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))

    # Sử dụng image processor để chuẩn bị dữ liệu cho ViT
    inputs = image_processor(images=img, return_tensors="pt")
    return inputs['pixel_values']

# Hàm trích xuất đặc trưng của ảnh
def extract_features(image_path):
    pixel_values = load_and_preprocess_image(image_path)
    with torch.no_grad():
        outputs = model(pixel_values)
        feature_vector = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
    return normalize([feature_vector])[0]

# API nhận diện ảnh
@app.route('/search-image', methods=['POST'])
def search_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    image_file = request.files['image']
    image_path = os.path.join("tempImage.jpg")
    image_file.save(image_path)

    try:
        # Đo thời gian bắt đầu
        start_time = time.time()

        # Trích xuất đặc trưng của ảnh tải lên
        query_features = extract_features(image_path)
        
        # Tính độ tương đồng cosine
        similarities = []
        for product_id, product_features in feature_database.items():
            if product_features.shape[0] > 1:  # Ensure there are enough samples
                similarity = cosine_similarity([query_features], [product_features])
                similarity_score = similarity[0][0]
                if similarity_score > 0.5:  # Ngưỡng độ tương đồng
                    similarities.append((product_id, similarity_score))

        # Sắp xếp danh sách sản phẩm theo độ tương đồng, lấy top 5 sản phẩm
        similarities = sorted(similarities, key=lambda x: x[1], reverse=True)
        top_product_ids = [item[0] for item in similarities][:5]  # Limit to top 5
        similarities_score = [item[1] for item in similarities][:5]  # Limit to top 5
        # logging.debug(f"Similarities: {similarities_score}")

        # Đo thời gian kết thúc
        end_time = time.time()
        elapsed_time = end_time - start_time
        logging.debug(f"Processing time: {elapsed_time:.2f} seconds")
        return jsonify({
            'product_ids': top_product_ids,
            'processing_time': f"{elapsed_time:.2f} seconds"
        })

    except Exception as e:
        logging.error(f"Error during image search: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True, host='0.0.0.0', port=12000)
