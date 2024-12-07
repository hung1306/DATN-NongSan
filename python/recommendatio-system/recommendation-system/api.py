from flask import Flask, request, jsonify
import pickle
import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
from scipy.stats import zscore
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

app = Flask(__name__)

# Tải mô hình và các đối tượng đã lưu từ file
with open('svd_model.pkl', 'rb') as f:
    svd_model = pickle.load(f)

with open('tfidf_vectorizer.pkl', 'rb') as f:
    tfidf = pickle.load(f)

with open('cosine_similarity.pkl', 'rb') as f:
    cosine_sim = pickle.load(f)

# Đọc dữ liệu product_content từ file CSV
product_content_df = pd.read_csv('./data/product_content.csv')
# Tạo cột 'content' bằng cách kết hợp các cột liên quan
product_content_df['content'] = (
    product_content_df['productname'].astype(str) + ' ' +
    product_content_df['categoryname'].astype(str) + ' ' +
    product_content_df['farmname'].astype(str) + ' ' +
    product_content_df['farmprovince'].astype(str)
)

# Tạo Series để ánh xạ productid tới chỉ số trong DataFrame
indices = pd.Series(product_content_df.index, index=product_content_df['productid']).drop_duplicates()

# Đọc dữ liệu user_item_interactions từ file CSV
user_item_df = pd.read_csv('./data/user_item_interactions.csv')

# Hàm đánh giá Precision, Recall và F1-score
def evaluate_content_based(true_labels, pred_labels):
    precision = precision_score(true_labels, pred_labels, average='weighted')
    recall = recall_score(true_labels, pred_labels, average='weighted')
    f1 = f1_score(true_labels, pred_labels, average='weighted')
    return precision, recall, f1

# Hàm tính Mean Average Precision (MAP) với cutoff K
def mean_average_precision(true_labels, pred_scores, k=30):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]  # Chỉ lấy Top-K
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


# Hàm tính Mean Reciprocal Rank (MRR) với cutoff K
def mean_reciprocal_rank(true_labels, pred_scores, k=30):
    sorted_indices = np.argsort(pred_scores)[::-1][:k]  # Chỉ lấy Top-K
    true_labels_sorted = np.array(true_labels)[sorted_indices]
    
    for i, label in enumerate(true_labels_sorted):
        if label == 1:
            return 1.0 / (i + 1)
    return 0.0


# Hàm tính Hit Rate (HR) với cutoff K
# def hit_rate(true_labels, pred_labels, k=30):
#     hits = np.sum((np.array(true_labels) == 1) & (np.array(pred_labels[:k]) == 1))
#     return hits / np.sum(true_labels)


@app.route('/recommendation', methods=['GET'])
def recommend():
    # Lấy user_id từ tham số request
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400
    
    try:
        recommendations = []
        evaluation = None
        
        if user_id in user_item_df['userid'].unique():
            # Collaborative Filtering: Dự đoán điểm cho các sản phẩm mà người dùng chưa tương tác
            interacted_products = user_item_df[user_item_df['userid'] == user_id]['productid'].unique()
            all_products = set(product_content_df['productid'])
            recommendable_products = list(all_products - set(interacted_products))
            
            # Dự đoán điểm từ mô hình SVD cho các sản phẩm có thể gợi ý
            collab_predictions = [svd_model.predict(user_id, pid).est for pid in recommendable_products]
            collab_scores = pd.Series(collab_predictions, index=recommendable_products)
            
            # Content-Based Filtering: Tính điểm similarity trung bình với các sản phẩm đã tương tác
            if len(interacted_products) > 0:
                sim_matrix = cosine_sim[:, [indices[pid] for pid in interacted_products if pid in indices]]
                if sim_matrix.shape[1] > 0:
                    content_scores = sim_matrix.mean(axis=1)
                else:
                    content_scores = pd.Series(0, index=product_content_df['productid'])
            else:
                content_scores = pd.Series(0, index=product_content_df['productid'])
            
            # Chuẩn hóa điểm sử dụng MinMaxScaler
            # scaler = MinMaxScaler()
            # collab_scores_scaled = pd.Series(scaler.fit_transform(collab_scores.values.reshape(-1, 1)).flatten(), index=collab_scores.index)
            # content_scores_scaled = pd.Series(scaler.fit_transform(content_scores.reshape(-1, 1)).flatten(), index=product_content_df['productid'])
            
            # Chuẩn hóa điểm sử dụng Z-score
            collab_scores_scaled = pd.Series(zscore(collab_scores.values), index=collab_scores.index)
            content_scores_scaled = pd.Series(zscore(content_scores), index=product_content_df['productid'])

            # Tạo điểm hybrid bằng cách kết hợp điểm collaborative và content-based
            hybrid_scores = 0.8 * collab_scores_scaled + 0.2 * content_scores_scaled
            
            # Lấy top N sản phẩm dựa trên điểm hybrid
            top_n = 32  # Tăng số lượng gợi ý
            top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
            
            # Lấy thông tin sản phẩm từ DataFrame dựa trên danh sách top sản phẩm
            recommendations = product_content_df[product_content_df['productid'].isin(top_products)].to_dict(orient='records')
            
            # Đánh giá mô hình
            true_labels = [1 if pid in interacted_products else 0 for pid in all_products]
            pred_labels = [1 if pid in top_products else 0 for pid in all_products]
            
            # Precision, Recall, F1
            precision, recall, f1 = evaluate_content_based(true_labels, pred_labels)
            
            # Mean Average Precision (MAP)
            map_score = mean_average_precision(true_labels, hybrid_scores)
            
            # Mean Reciprocal Rank (MRR)
            mrr_score = mean_reciprocal_rank(true_labels, hybrid_scores)
            
            # Hit Rate
            # hr_score = hit_rate(true_labels, pred_labels)
            
            evaluation = {
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'mean_average_precision': map_score,
                'mean_reciprocal_rank': mrr_score,
                # 'hit_rate': hr_score
            }
            
        else:
            # Người dùng mới: Gợi ý các sản phẩm được người dùng tương tác nhiều nhất
            product_popularity = user_item_df.groupby('productid')['interaction_score'].sum().reset_index()
            product_popularity = product_popularity.sort_values(by='interaction_score', ascending=False)
            top_n_popular = 33
            popular_products = product_popularity['productid'].head(top_n_popular).tolist()
            recommendations = product_content_df[product_content_df['productid'].isin(popular_products)].to_dict(orient='records')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'recommendations': recommendations, 'evaluation': evaluation})


if __name__ == '__main__':
    app.run(debug=True, port=8080)