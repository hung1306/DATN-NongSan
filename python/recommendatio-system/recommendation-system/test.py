import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score
import numpy as np

# 1. Load dữ liệu từ file CSV
user_item_interactions = pd.read_csv('./data/user_item_interactions.csv')
product_content = pd.read_csv('./data/product_content.csv')

# 2. Chuẩn hóa dữ liệu
user_item_interactions['interaction_score'] = user_item_interactions['interaction_score'].astype(float)

# 3. Tách dữ liệu thành tập huấn luyện và tập kiểm tra
train_data, test_data = train_test_split(user_item_interactions, test_size=0.2, random_state=42)

# 4. Tính toán độ tương đồng giữa các sản phẩm dựa trên nội dung (Content-based Filtering)
def recommend_content_based(user_id, n=5):
    user_interactions = train_data[train_data['userid'] == user_id]
    interacted_products = user_interactions['productid'].tolist()

    # Chỉ chọn các cột số để tính toán độ tương đồng
    numeric_columns = product_content.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_columns:
        raise ValueError("product_content không chứa cột số nào để tính toán độ tương đồng.")
    
    content_sim = cosine_similarity(product_content[numeric_columns])

    # Lấy top n sản phẩm tương tự dựa trên sản phẩm mà user đã tương tác
    product_ids = product_content['productid'].tolist()
    recommended_products = []
    for product in interacted_products:
        if product in product_ids:
            similar_products = sorted(list(enumerate(content_sim[product_ids.index(product)])), key=lambda x: -x[1])[1:n+1]
            recommended_products.extend([product_ids[i[0]] for i in similar_products])

    return list(set(recommended_products))  # Loại bỏ sản phẩm trùng lặp

# 5. Collaborative Filtering
# Bạn có thể dùng matrix factorization hoặc các mô hình như SVD hoặc ALS. Đây là một mô hình đơn giản.
# Aggregate interaction scores to handle duplicates
train_data_agg = train_data.groupby(['userid', 'productid'])['interaction_score'].sum().reset_index()
user_item_matrix = train_data_agg.pivot(index='userid', columns='productid', values='interaction_score').fillna(0)

# Tính toán độ tương đồng giữa các user
user_similarity = cosine_similarity(user_item_matrix)
user_similarity_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)

def recommend_collaborative(user_id, n=5):
    if user_id in user_similarity_df.index:
        similar_users = user_similarity_df.loc[user_id].sort_values(ascending=False)[1:].index[:n]
        similar_users_interactions = train_data[train_data['userid'].isin(similar_users)]
        top_products = similar_users_interactions['productid'].value_counts().index[:n].tolist()
        return top_products
    return []

# 6. Hybrid Model (kết hợp Content-based và Collaborative Filtering)
def recommend_hybrid(user_id, n=5, weight_cb=0.5, weight_cf=0.5):
    recommendations_cb = recommend_content_based(user_id, n=n)
    recommendations_cf = recommend_collaborative(user_id, n=n)

    # Kết hợp hai phương pháp
    final_recommendations = list(set(recommendations_cb + recommendations_cf))
    
    return final_recommendations[:n]  # Lấy top n sản phẩm

# 7. Các chỉ số đánh giá: Precision, Recall, F1, MAP, MRR, Hit Rate
def evaluate_recommendations(user_id, top_k):
    true_interactions = test_data[test_data['userid'] == user_id]['productid'].tolist()
    if len(true_interactions) == 0:
        return 0, 0, 0, 0, 0, 0

    recommended_products = recommend_hybrid(user_id, n=top_k)

    # Tính Precision@K, Recall@K, F1-Score
    tp = len(set(recommended_products) & set(true_interactions))
    precision = tp / len(recommended_products) if recommended_products else 0
    recall = tp / len(true_interactions) if true_interactions else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) != 0 else 0

    # Tính Mean Average Precision (MAP)
    precisions = []
    for i, product in enumerate(recommended_products):
        if product in true_interactions:
            precisions.append(len(set(recommended_products[:i+1]) & set(true_interactions)) / (i+1))
    map_score = np.mean(precisions) if precisions else 0

    # Tính Mean Reciprocal Rank (MRR)
    rr = 0
    for i, product in enumerate(recommended_products):
        if product in true_interactions:
            rr = 1 / (i + 1)
            break
    mrr = rr

    # Tính Hit Rate
    hit_rate = 1 if tp > 0 else 0

    return precision, recall, f1, map_score, mrr, hit_rate

# 8. Tính toán chỉ số cho toàn bộ user
def evaluate_all_users(top_k=5):
    user_ids = test_data['userid'].unique()
    metrics = {
        'Precision': [],
        'Recall': [],
        'F1-Score': [],
        'MAP': [],
        'MRR': [],
        'Hit Rate': []
    }

    for user_id in user_ids:
        precision, recall, f1, map_score, mrr, hit_rate = evaluate_recommendations(user_id, top_k)
        metrics['Precision'].append(precision)
        metrics['Recall'].append(recall)
        metrics['F1-Score'].append(f1)
        metrics['MAP'].append(map_score)
        metrics['MRR'].append(mrr)
        metrics['Hit Rate'].append(hit_rate)

    # Tính trung bình các chỉ số
    avg_metrics = {metric: np.mean(values) for metric, values in metrics.items()}
    return avg_metrics

# Chạy đánh giá cho tất cả người dùng với top K sản phẩm gợi ý
top_k = 5
results = evaluate_all_users(top_k=top_k)

# In ra kết quả
print(f"Evaluation results for Top-{top_k} recommendations:")
for metric, value in results.items():
    print(f"{metric}: {value:.4f}")