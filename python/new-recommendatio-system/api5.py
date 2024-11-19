from flask import Flask, request, jsonify
import pickle
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from scipy.special import softmax
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

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

# Phân loại người dùng dựa trên mức độ tương tác
def classify_user(user_id):
    interaction_score = user_item_df[user_item_df['user_id'] == user_id]['interaction_score'].sum()
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
    else:  # low
        return 0.2

# Evaluation functions
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
            
            collab_predictions = [svd_model.predict(user_id, pid).est for pid in recommendable_products]
            collab_scores = pd.Series(collab_predictions, index=recommendable_products).fillna(0)

            if len(interacted_products) > 0:
                sim_matrix = cosine_sim[:, [indices[pid] for pid in interacted_products if pid in indices]]
                content_scores = sim_matrix.mean(axis=1) if sim_matrix.shape[1] > 0 else pd.Series(0, index=product_content_df['productid'])
            else:
                content_scores = pd.Series(0, index=product_content_df['productid'])

            # Apply softmax normalization
            collab_scores = pd.Series(softmax(collab_scores), index=collab_scores.index)
            content_scores = pd.Series(softmax(content_scores), index=product_content_df['productid'])

            # Phân loại người dùng và điều chỉnh alpha
            user_group = classify_user(user_id)
            alpha = get_alpha(user_group)
            
            hybrid_scores = alpha * collab_scores + (1 - alpha) * content_scores
            hybrid_scores = hybrid_scores.fillna(0)

            top_n = 36
            top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
            recommendations = product_content_df[product_content_df['productid'].isin(top_products)].to_dict(orient='records')

            true_labels = [1 if pid in interacted_products else 0 for pid in all_products]
            pred_labels = [1 if pid in top_products else 0 for pid in all_products]
            precision, recall, f1 = evaluate_content_based(true_labels, pred_labels)
            map_score = mean_average_precision(true_labels, hybrid_scores)
            ndcg = ndcg_score(true_labels, hybrid_scores)

            evaluation = {
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'mean_average_precision': map_score,
                'ndcg_score': ndcg,
                'alpha': alpha
            }
        
        return jsonify({'recommendations': recommendations, 'evaluation': evaluation}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
