from flask import Flask, request, jsonify
import pickle
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from scipy.stats import zscore
import numpy as np

app = Flask(__name__)

# Load saved model and objects
with open('./src/svd_model.pkl', 'rb') as f:
    svd_model = pickle.load(f)

with open('./src/tfidf_vectorizer.pkl', 'rb') as f:
    tfidf = pickle.load(f)

with open('./src/cosine_similarity.pkl', 'rb') as f:
    cosine_sim = pickle.load(f)

# Load product content data
product_content_df = pd.read_csv('./data/product_contents.csv')
product_content_df['content'] = (
    product_content_df['productname'].astype(str) + ' ' +
    product_content_df['categoryname'].astype(str) + ' ' +
    product_content_df['farmname'].astype(str) + ' ' +
    product_content_df['farmprovince'].astype(str)
)

indices = pd.Series(product_content_df.index, index=product_content_df['productid']).drop_duplicates()

# Load user interactions data
user_item_df = pd.read_csv('./data/user_item_interactions.csv')

# Evaluation metrics
def precision_at_k(true_labels, pred_labels, k):
    return sum(pred_labels[:k]) / k if k > 0 else 0

def recall_at_k(true_labels, pred_labels, k):
    relevant_items = sum(true_labels)
    return sum(pred_labels[:k]) / relevant_items if relevant_items > 0 else 0

def f1_score_at_k(precision, recall):
    return 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

def mean_average_precision(true_labels, pred_scores, k):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    precision_at_i = [sum(true_labels_sorted[:i+1]) / (i + 1) for i in range(len(true_labels_sorted)) if true_labels_sorted[i] == 1]
    return np.mean(precision_at_i) if precision_at_i else 0.0

def mean_reciprocal_rank(true_labels, pred_scores, k):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    for i, label in enumerate(true_labels_sorted):
        if label == 1:
            return 1.0 / (i + 1)
    return 0.0

def hit_rate_at_k(true_labels, pred_scores, k):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    return 1 if np.sum(true_labels_sorted) > 0 else 0

def coverage(recommended_products, total_products):
    return len(set(recommended_products)) / len(set(total_products)) if len(total_products) > 0 else 0

@app.route('/recommendation', methods=['GET'])
def recommend():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400

    try:
        recommendations = []
        evaluation = None

        if user_id in user_item_df['user_id'].unique():
            interacted_products = user_item_df[user_item_df['user_id'] == user_id]['product_id'].unique()
            all_products = set(product_content_df['productid'])
            recommendable_products = list(all_products - set(interacted_products))
            
            collab_predictions = [svd_model.predict(user_id, pid).est for pid in product_content_df['productid']]
            collab_scores = pd.Series(collab_predictions, index=product_content_df['productid']).fillna(0)

            if len(interacted_products) > 0:
                sim_matrix = cosine_sim[:, [indices[pid] for pid in interacted_products if pid in indices]]
                content_scores = sim_matrix.mean(axis=1) if sim_matrix.shape[1] > 0 else np.zeros(len(product_content_df))
            else:
                content_scores = np.zeros(len(product_content_df))

            # Ensure the scores have the same length
            assert len(collab_scores) == len(content_scores), "Score arrays have different lengths!"

            # Normalize scores
            scaler = MinMaxScaler()
            collab_scores_scaled = scaler.fit_transform(collab_scores.values.reshape(-1, 1)).flatten()
            content_scores_scaled = scaler.fit_transform(content_scores.reshape(-1, 1)).flatten()

            # Calculate hybrid scores
            hybrid_scores = 0.6 * zscore(collab_scores_scaled) + 0.4 * zscore(content_scores_scaled)
            hybrid_scores = pd.Series(hybrid_scores, index=product_content_df['productid']).fillna(0)

            top_n = 32
            top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
            recommendations = product_content_df[product_content_df['productid'].isin(top_products)].to_dict(orient='records')

            true_labels = [1 if pid in interacted_products else 0 for pid in product_content_df['productid']]
            pred_labels = [1 if pid in top_products else 0 for pid in product_content_df['productid']]
            pred_scores = hybrid_scores.values

            precision = precision_at_k(true_labels, pred_labels, top_n)
            recall = recall_at_k(true_labels, pred_labels, top_n)
            f1 = f1_score_at_k(precision, recall)
            map_score = mean_average_precision(true_labels, pred_scores, top_n)
            mrr_score = mean_reciprocal_rank(true_labels, pred_scores, top_n)
            hit_rate_score = hit_rate_at_k(true_labels, pred_scores, top_n)
            coverage_score = coverage(top_products, product_content_df['productid'])

            evaluation = {
                'precision@k': precision,
                'recall@k': recall,
                'f1_score@k': f1,
                'mean_average_precision': map_score,
                'mean_reciprocal_rank': mrr_score,
                'hit_rate@k': hit_rate_score,
                'coverage': coverage_score
            }

        return jsonify({'recommendations': recommendations, 'evaluation': evaluation})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)