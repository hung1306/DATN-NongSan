import os
import numpy as np
import pandas as pd
from PIL import Image
from tensorflow.keras.applications import InceptionV3
from tensorflow.keras.applications.inception_v3 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize, LabelEncoder
from umap import UMAP

# Load InceptionV3 pre-trained model
model = InceptionV3(weights='imagenet', include_top=False, pooling='avg')

# Load CSV
data = pd.read_csv('../newImageProduct.csv')

# Label Encoding for products (in case needed for further fine-tuning)
le = LabelEncoder()
data['label'] = le.fit_transform(data['productid'])

# Function to load and preprocess image for InceptionV3
def load_and_preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((299, 299))  # InceptionV3 expects 299x299 images
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array = preprocess_input(img_array)
    return img_array

# Function to extract features from an image using InceptionV3
def extract_features(img_path):
    img_array = load_and_preprocess_image(img_path)
    features = model.predict(img_array)
    return features

# Apply UMAP for feature reduction
def apply_umap(features, n_components=128, n_neighbors=15, min_dist=0.1):
    if np.any(np.isnan(features)) or np.any(np.isinf(features)):
        features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
    umap = UMAP(n_components=n_components, n_neighbors=n_neighbors, min_dist=min_dist)
    features_umap = umap.fit_transform(features)
    return features_umap

# Data augmentation for robust feature extraction
datagen = ImageDataGenerator(
    rotation_range=40,
    width_shift_range=0.4,
    height_shift_range=0.4,
    zoom_range=0.4,
    horizontal_flip=True,
    brightness_range=[0.6, 1.4],
    fill_mode='nearest')

# Build feature database with augmented features
def build_feature_database(data):
    feature_database = {}
    for index, row in data.iterrows():
        img_path = os.path.join('../', row['imagepath'])
        product_id = row['productid']
        product_name = row['productname']
        img_array = load_and_preprocess_image(img_path)
        img_gen = datagen.flow(img_array)
        augmented_features = []
        for _ in range(5):  # Create 5 augmented versions
            aug_img = next(img_gen)
            aug_features = model.predict(aug_img)
            augmented_features.append(aug_features)
        avg_features = np.mean(augmented_features, axis=0)
        if avg_features.shape[0] > 1 and avg_features.shape[1] > 1:
            avg_features_umap = apply_umap(avg_features)
            avg_features_normalized = normalize(avg_features_umap)
        else:
            avg_features_normalized = normalize(avg_features)
        feature_database[product_id] = {
            'product_name': product_name,
            'features': avg_features_normalized
        }
    return feature_database

# Initialize the model with dummy data
dummy_data = np.zeros((1, 299, 299, 3))
_ = model.predict(dummy_data)

# Build and save the feature database
feature_database = build_feature_database(data)
# np.save('feature_database.npy', feature_database)
np.save('InceptionV3.npy', feature_database)