from flask import Flask, request, jsonify
import pickle
import psycopg2
import pandas as pd
import numpy as np
from scipy.special import softmax

app = Flask(__name__)

# Load models
with open('./src/svd_model.pkl', 'rb') as f:
    svd_model = pickle.load(f)
with open('./src/tfidf_vectorizer.pkl', 'rb') as f:
    tfidf = pickle.load(f)
with open('./src/cosine_similarity.pkl', 'rb') as f:
    cosine_sim = pickle.load(f)

# Connection string
DB_CONNECTION = "postgresql://postgres:hung123dac@localhost:5432/Nongsan"

# Load data from database
def load_interactions():
    conn = psycopg2.connect(DB_CONNECTION)
    query = "SELECT user_id, productid, interaction_score FROM user_item_interactions"
    interactions_df = pd.read_sql(query, conn)
    conn.close()
    return interactions_df

def load_products():
    conn = psycopg2.connect(DB_CONNECTION)
    query = "SELECT productid, productname, categoryname, farmname, farmprovince FROM product_contents"
    products_df = pd.read_sql(query, conn)
    conn.close()
    return products_df

# Classify user by interaction score
def classify_user(user_id, interactions_df):
    interaction_score = interactions_df[interactions_df['user_id'] == user_id]['interaction_score'].sum()
    if interaction_score >= 150:
        return 'very_high'
    elif interaction_score >= 100:
        return 'high'
    elif interaction_score >= 50:
        return 'medium'
    else:
        return 'low'

# Get alpha based on user classification
def get_alpha(user_group):
    if user_group == 'very_high':
        return 0.8
    elif user_group == 'high':
        return 0.6
    elif user_group == 'medium':
        return 0.4
    else:
        return 0.2

@app.route('/recommendation', methods=['GET'])
def recommend():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400

    try:
        interactions_df = load_interactions()
        products_df = load_products()

        if user_id in interactions_df['user_id'].unique():
            # Collaborative Filtering (SVD)
            interacted_products = interactions_df[interactions_df['user_id'] == user_id]['productid'].unique()
            all_products = set(products_df['productid'])
            recommendable_products = list(all_products - set(interacted_products))

            collab_scores = [
                (product_id, svd_model.predict(user_id, product_id).est)
                for product_id in recommendable_products
            ]
            collab_scores = pd.Series(dict(collab_scores))

            # Content-Based Filtering (CBF)
            indices = pd.Series(products_df.index, index=products_df['productid']).drop_duplicates()
            sim_matrix = cosine_sim[:, [indices[pid] for pid in interacted_products if pid in indices]]
            content_scores = sim_matrix.mean(axis=1) if sim_matrix.shape[1] > 0 else np.zeros(cosine_sim.shape[0])
            content_scores = pd.Series(content_scores, index=products_df['productid'])

            # Normalize scores
            collab_scores = pd.Series(softmax(collab_scores), index=collab_scores.index)
            content_scores = pd.Series(softmax(content_scores), index=content_scores.index)

            # Hybrid Scoring
            user_group = classify_user(user_id, interactions_df)
            alpha = get_alpha(user_group)
            hybrid_scores = alpha * collab_scores + (1 - alpha) * content_scores
            hybrid_scores = hybrid_scores.fillna(0)

            # Top-N recommendations
            top_n = 12
            top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
            recommendations = products_df[products_df['productid'].isin(top_products)].to_dict(orient='records')

            return jsonify({'recommendations': recommendations, 'alpha': alpha}), 200

        else:
            # Default recommendations based on popularity
            product_popularity = interactions_df.groupby('productid')['interaction_score'].sum().reset_index()
            top_n_popular = 12
            popular_products = product_popularity.sort_values(by='interaction_score', ascending=False).head(top_n_popular)['productid'].tolist()
            recommendations = products_df[products_df['productid'].isin(popular_products)].to_dict(orient='records')
            return jsonify({'recommendations': recommendations}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
