from flask import Flask, request, jsonify
from surprise import SVD, Dataset, Reader
from surprise.model_selection import GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from sqlalchemy import create_engine
import pandas as pd
import pickle
import numpy as np
from scipy.special import softmax
import os
from sklearn.metrics import precision_score, recall_score, f1_score

app = Flask(__name__)

# Database connection
DB_CONNECTION_STRING = "postgresql://postgres:hung123dac@localhost:5432/Nongsan"
engine = create_engine(DB_CONNECTION_STRING)

# Function to fetch data from PostgreSQL
def fetch_data():
    user_item_query = "SELECT user_id, productid, interaction_type, interaction_score FROM user_item_interactions"
    product_content_query = "SELECT productid, productname, categoryname, farmname, farmprovince FROM product_contents"

    user_item_df = pd.read_sql(user_item_query, engine)
    product_content_df = pd.read_sql(product_content_query, engine)

    return user_item_df, product_content_df

# Function to classify user based on interaction
def classify_user(interaction_score):
    if interaction_score >= 150:
        return 'very_high'
    elif interaction_score >= 100:
        return 'high'
    elif interaction_score >= 50:
        return 'medium'
    else:
        return 'low'

def get_alpha(user_group):
    if user_group == 'very_high':
        return 0.8
    elif user_group == 'high':
        return 0.6
    elif user_group == 'medium':
        return 0.4
    else:
        return 0.2

# Function to evaluate recommendation model
def evaluate_content_based(true_labels, pred_labels):
    precision = precision_score(true_labels, pred_labels, average='weighted', zero_division=0)
    recall = recall_score(true_labels, pred_labels, average='weighted', zero_division=0)
    f1 = f1_score(true_labels, pred_labels, average='weighted', zero_division=0)
    return precision, recall, f1

def mean_average_precision(true_labels, pred_scores):
    if len(true_labels) == 0 or len(pred_scores) == 0:
        return 0.0
    sorted_indices = np.argsort(pred_scores)[::-1]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    average_precision = 0.0
    relevant_count = 0
    for i, label in enumerate(true_labels_sorted):
        if label == 1:
            relevant_count += 1
            precision_at_i = relevant_count / (i + 1)
            average_precision += precision_at_i
    return average_precision / relevant_count if relevant_count > 0 else 0.0

def ndcg_score(true_labels, pred_scores):
    if len(true_labels) == 0 or len(pred_scores) == 0:
        return 0.0
    sorted_indices = np.argsort(pred_scores)[::-1]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    dcg = np.sum((2 ** true_labels_sorted - 1) / np.log2(np.arange(2, len(true_labels_sorted) + 2)))
    idcg = np.sum((2 ** np.sort(true_labels)[::-1] - 1) / np.log2(np.arange(2, len(true_labels_sorted) + 2)))
    return dcg / idcg if idcg > 0 else 0.0

# Function to train collaborative filtering model
def train_collaborative_model():
    user_item_df, _ = fetch_data()
    reader = Reader(rating_scale=(user_item_df['interaction_score'].min(), user_item_df['interaction_score'].max()))
    data = Dataset.load_from_df(user_item_df[['user_id', 'productid', 'interaction_score']], reader)

    param_grid = {
        'n_factors': [50, 100, 150],
        'n_epochs': [20, 30, 40],
        'lr_all': [0.002, 0.005, 0.01],
        'reg_all': [0.02, 0.05, 0.1]
    }

    gs = GridSearchCV(SVD, param_grid, measures=['rmse'], cv=5)
    gs.fit(data)
    best_params = gs.best_params['rmse']

    svd_model = SVD(
        n_factors=best_params['n_factors'],
        n_epochs=best_params['n_epochs'],
        lr_all=best_params['lr_all'],
        reg_all=best_params['reg_all']
    )
    trainset = data.build_full_trainset()
    svd_model.fit(trainset)

    with open('svd_model.pkl', 'wb') as f:
        pickle.dump(svd_model, f)

# Function to train content-based model
def train_content_based_model():
    _, product_content_df = fetch_data()

    product_content_df['content'] = (
        product_content_df['productname'].astype(str) + ' ' +
        product_content_df['categoryname'].astype(str) + ' ' +
        product_content_df['farmname'].astype(str) + ' ' +
        product_content_df['farmprovince'].astype(str)
    )
    product_content_df['content'] = product_content_df['content'].str.lower().str.replace('[^\w\s]', '')

    tfidf = TfidfVectorizer(max_features=10000, ngram_range=(1, 2), stop_words='english')
    tfidf_matrix = tfidf.fit_transform(product_content_df['content'])

    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    with open('tfidf_vectorizer.pkl', 'wb') as f:
        pickle.dump(tfidf, f)
    with open('cosine_similarity.pkl', 'wb') as f:
        pickle.dump(cosine_sim, f)

@app.route('/retrain', methods=['POST'])
def retrain_models():
    try:
        train_collaborative_model()
        train_content_based_model()
        return jsonify({"message": "Models retrained successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendation', methods=['GET'])
def recommend():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400

    try:
        if not os.path.exists('svd_model.pkl'):
            train_collaborative_model()
        if not os.path.exists('tfidf_vectorizer.pkl') or not os.path.exists('cosine_similarity.pkl'):
            train_content_based_model()

        with open('svd_model.pkl', 'rb') as f:
            svd_model = pickle.load(f)
        with open('tfidf_vectorizer.pkl', 'rb') as f:
            tfidf = pickle.load(f)
        with open('cosine_similarity.pkl', 'rb') as f:
            cosine_sim = pickle.load(f)

        user_item_df, product_content_df = fetch_data()

        product_content_df['content'] = (
            product_content_df['productname'].astype(str) + ' ' +
            product_content_df['categoryname'].astype(str) + ' ' +
            product_content_df['farmname'].astype(str) + ' ' +
            product_content_df['farmprovince'].astype(str)
        )
        indices = pd.Series(product_content_df.index, index=product_content_df['productid']).drop_duplicates()

        interacted_products = user_item_df[user_item_df['user_id'] == user_id]['productid'].unique()
        all_products = set(product_content_df['productid'])
        recommendable_products = list(all_products - set(interacted_products))

        collab_predictions = [svd_model.predict(user_id, pid).est for pid in recommendable_products]
        collab_scores = pd.Series(collab_predictions, index=recommendable_products).fillna(0)

        if len(interacted_products) > 0:
            sim_matrix = cosine_sim[:, [indices[pid] for pid in interacted_products if pid in indices]]
            content_scores = sim_matrix.mean(axis=1) if sim_matrix.shape[1] > 0 else pd.Series(0, index=product_content_df['productid'])
        else:
            content_scores = pd.Series(0, index=product_content_df['productid'])

        collab_scores = pd.Series(softmax(collab_scores), index=collab_scores.index)
        content_scores = pd.Series(softmax(content_scores), index=product_content_df['productid'])

        interaction_score = user_item_df[user_item_df['user_id'] == user_id]['interaction_score'].sum()
        user_group = classify_user(interaction_score)
        alpha = get_alpha(user_group)

        hybrid_scores = alpha * collab_scores + (1 - alpha) * content_scores
        hybrid_scores = hybrid_scores.fillna(0)

        top_n = 16
        top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
        recommendations = product_content_df[product_content_df['productid'].isin(top_products)].to_dict(orient='records')

        true_labels = [1 if pid in interacted_products else 0 for pid in all_products]
        pred_scores = [hybrid_scores.get(pid, 0) for pid in all_products]
        pred_labels = [1 if pid in top_products else 0 for pid in all_products]

        precision, recall, f1 = evaluate_content_based(true_labels, pred_labels)
        map_score = mean_average_precision(true_labels, pred_scores)
        ndcg = ndcg_score(true_labels, pred_scores)

        return jsonify({
            'recommendations': recommendations,
            'evaluation': {
                'alpha': alpha,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'map': map_score,
                'ndcg': ndcg
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
    