from flask import Flask, request, jsonify
import pickle
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from scipy.stats import zscore
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

# Evaluation functions with NaN handling
def evaluate_content_based(true_labels, pred_labels):
    precision = precision_score(true_labels, pred_labels, average='weighted', zero_division=0)
    recall = recall_score(true_labels, pred_labels, average='weighted', zero_division=0)
    f1 = f1_score(true_labels, pred_labels, average='weighted', zero_division=0)
    return precision, recall, f1

def mean_average_precision(true_labels, pred_scores, k=30):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    
    average_precision = 0.0
    relevant_count = 0
    for i in range(len(true_labels_sorted)):
        if true_labels_sorted[i] == 1:
            relevant_count += 1
            precision_at_i = relevant_count / (i + 1)
            average_precision += precision_at_i
    if relevant_count == 0:
        return 0.0
    return average_precision / relevant_count

def mean_reciprocal_rank(true_labels, pred_scores, k=30):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    
    for i, label in enumerate(true_labels_sorted):
        if label == 1:
            return 1.0 / (i + 1)
    return 0.0

def ndcg_score(true_labels, pred_scores, k=30):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    
    dcg = np.sum((2 ** true_labels_sorted - 1) / np.log2(np.arange(2, len(true_labels_sorted) + 2)))
    idcg = np.sum((2 ** np.sort(true_labels)[::-1][:k] - 1) / np.log2(np.arange(2, k + 2)))
    return dcg / idcg if idcg > 0 else 0

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
                if sim_matrix.shape[1] > 0:
                    content_scores = sim_matrix.mean(axis=1)
                else:
                    content_scores = pd.Series(0, index=product_content_df['productid'])
            else:
                content_scores = pd.Series(0, index=product_content_df['productid'])

            scaler = MinMaxScaler()
            collab_scores_scaled = pd.Series(scaler.fit_transform(collab_scores.to_numpy().reshape(-1, 1)).flatten(), index=collab_scores.index)
            content_scores_scaled = pd.Series(scaler.fit_transform(content_scores.reshape(-1, 1)).flatten(), index=product_content_df['productid'])

            collab_scores_z = pd.Series(zscore(collab_scores_scaled.fillna(0)), index=collab_scores.index)
            content_scores_z = pd.Series(zscore(content_scores_scaled.fillna(0)), index=product_content_df['productid'])

            hybrid_scores = 0.6 * collab_scores_z + 0.4 * content_scores_z
            hybrid_scores = hybrid_scores.fillna(0)

            top_n = 32
            top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
            recommendations = product_content_df[product_content_df['productid'].isin(top_products)].to_dict(orient='records')
            
            true_labels = [1 if pid in interacted_products else 0 for pid in all_products]
            pred_labels = [1 if pid in top_products else 0 for pid in all_products]

            precision, recall, f1 = evaluate_content_based(true_labels, pred_labels)
            map_score = mean_average_precision(true_labels, hybrid_scores)
            mrr_score = mean_reciprocal_rank(true_labels, hybrid_scores)
            ndcg = ndcg_score(true_labels, hybrid_scores)

            evaluation = {
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'mean_average_precision': map_score,
                'mean_reciprocal_rank': mrr_score,
                'ndcg_score': ndcg
            }
            
        else:
            product_popularity = user_item_df.groupby('productid')['interaction_score'].sum().reset_index()
            product_popularity = product_popularity.sort_values(by='interaction_score', ascending=False)
            top_n_popular = 33
            popular_products = product_popularity['productid'].head(top_n_popular).tolist()
            recommendations = product_content_df[product_content_df['productid'].isin(popular_products)].to_dict(orient='records')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'recommendations': recommendations, 'evaluation': evaluation})


@app.route('/similar_products', methods=['GET'])
def get_similar_products():
    product_id = request.args.get('productid')
    if not product_id:
        return jsonify({'error': 'Missing productid parameter'}), 400
    
    try:
        if product_id not in indices:
            return jsonify({'error': 'Product ID not found'}), 404

        # Lấy chỉ số của sản phẩm trong ma trận cosine similarity
        idx = indices[product_id]
        
        # Lấy điểm tương đồng của sản phẩm với các sản phẩm khác
        sim_scores = list(enumerate(cosine_sim[idx]))
        
        # Sắp xếp các sản phẩm dựa trên điểm tương đồng
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Lấy top n sản phẩm có điểm tương đồng cao nhất, bỏ qua sản phẩm gốc
        top_n = 20
        top_similar_indices = [i[0] for i in sim_scores[1:top_n + 1]]
        similar_products = product_content_df.iloc[top_similar_indices]
        
        # Chuyển dữ liệu về định dạng dictionary để trả về JSON
        recommendations = similar_products.to_dict(orient='records')

        # Đánh giá (Evaluation)
        true_labels = [1 if pid in similar_products['productid'].values else 0 for pid in product_content_df['productid']]
        pred_scores = [score for _, score in sim_scores[1:top_n + 1]]
        
        precision, recall, f1 = evaluate_content_based(true_labels, [1 if pid in similar_products['productid'].values else 0 for pid in product_content_df['productid']])
        map_score = mean_average_precision(true_labels, pred_scores)
        mrr_score = mean_reciprocal_rank(true_labels, pred_scores)
        ndcg = ndcg_score(true_labels, pred_scores)
        
        evaluation = {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'mean_average_precision': map_score,
            'mean_reciprocal_rank': mrr_score,
            'ndcg_score': ndcg
        }

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'recommendations': recommendations, 'evaluation': evaluation})


if __name__ == '__main__':
    app.run(debug=True, port=8080)
