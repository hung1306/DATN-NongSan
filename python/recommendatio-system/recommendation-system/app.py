from flask import Flask, request, jsonify
import pickle
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
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
    product_content_df['categoryname'].astype(str) + ' ' +
    product_content_df['farmname'].astype(str) + ' ' +
    product_content_df['farmprovince'].astype(str)
)

# Tạo Series để ánh xạ productid tới chỉ số trong DataFrame
indices = pd.Series(product_content_df.index, index=product_content_df['productid']).drop_duplicates()

# Đọc dữ liệu user_item_interactions từ file CSV
user_item_df = pd.read_csv('./data/user_item_interactions.csv')

def evaluate_content_based(true_labels, pred_labels):
    # Precision
    precision = precision_score(true_labels, pred_labels, average='binary')
    
    # Recall
    recall = recall_score(true_labels, pred_labels, average='binary')
    
    # F1-score
    f1 = f1_score(true_labels, pred_labels, average='binary')
    
    return precision, recall, f1

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
            scaler = MinMaxScaler()
            collab_scores_scaled = pd.Series(scaler.fit_transform(collab_scores.values.reshape(-1, 1)).flatten(), index=collab_scores.index)
            content_scores_scaled = pd.Series(scaler.fit_transform(content_scores.reshape(-1, 1)).flatten(), index=product_content_df['productid'])
            
            # Tạo điểm hybrid bằng cách kết hợp điểm collaborative và content-based
            hybrid_scores = 0.6 * collab_scores_scaled + 0.4 * content_scores_scaled
            
            # Lấy top N sản phẩm dựa trên điểm hybrid
            top_n = 20
            top_products = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()
            
            # Lấy thông tin sản phẩm từ DataFrame dựa trên danh sách top sản phẩm
            recommendations = product_content_df[product_content_df['productid'].isin(top_products)].to_dict(orient='records')
            
            # Đánh giá mô hình
            true_labels = [1 if pid in interacted_products else 0 for pid in all_products]
            pred_labels = [1 if pid in top_products else 0 for pid in all_products]
            
            # In ra các giá trị trung gian để kiểm tra
            print(f"Interacted Products: {interacted_products}")
            print(f"Top Products: {top_products}")
            print(f"True Labels: {true_labels}")
            print(f"Pred Labels: {pred_labels}")
            
            precision, recall, f1 = evaluate_content_based(true_labels, pred_labels)
            
            evaluation = {
                'precision': precision,
                'recall': recall,
                'f1_score': f1
            }
            
        else:
            # Người dùng mới: Gợi ý các sản phẩm được người dùng tương tác nhiều nhất
            product_popularity = user_item_df.groupby('productid')['interaction_score'].sum().reset_index()
            product_popularity = product_popularity.sort_values(by='interaction_score', ascending=False)
            top_n_popular = 20
            popular_products = product_popularity['productid'].head(top_n_popular).tolist()
            recommendations = product_content_df[product_content_df['productid'].isin(popular_products)].to_dict(orient='records')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'recommendations': recommendations, 'evaluation': evaluation})

if __name__ == '__main__':
    app.run(debug=True, port=8080)