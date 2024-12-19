import pandas as pd
from surprise import SVD, Dataset, Reader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
from sqlalchemy import create_engine

# Connection string
DB_CONNECTION = "postgresql://postgres:hung123dac@localhost:5432/Nongsan"

# Load data from database
def load_data():
    engine = create_engine(DB_CONNECTION)
    interactions_query = "SELECT user_id, productid, interaction_score FROM user_item_interactions"
    product_query = "SELECT productid, productname, categoryname, farmname, farmprovince FROM product_contents"

    interactions_df = pd.read_sql(interactions_query, engine)
    product_df = pd.read_sql(product_query, engine)
    return interactions_df, product_df

# Train SVD model
def train_svd(interactions_df):
    reader = Reader(rating_scale=(0, 5))
    data = Dataset.load_from_df(interactions_df[['user_id', 'productid', 'interaction_score']], reader)
    trainset = data.build_full_trainset()
    svd_model = SVD()
    svd_model.fit(trainset)
    return svd_model

# Train TF-IDF and calculate cosine similarity
def train_cbf(product_df):
    # Combine product content into a single string
    product_df['content'] = (
        product_df['productname'] + ' ' +
        product_df['categoryname'] + ' ' +
        product_df['farmname'] + ' ' +
        product_df['farmprovince']
    )
    # Preprocess text
    product_df['content'] = product_df['content'].str.lower().str.replace(r'[^\w\s]', '', regex=True)
    
    # Generate TF-IDF matrix
    tfidf = TfidfVectorizer(max_features=10000, ngram_range=(1, 2), stop_words='english')
    tfidf_matrix = tfidf.fit_transform(product_df['content'])
    
    # Calculate cosine similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    return tfidf, cosine_sim

# Save models
def save_models(svd_model, tfidf, cosine_sim):
    with open('./src/svd_model.pkl', 'wb') as f:
        pickle.dump(svd_model, f)
    with open('./src/tfidf_vectorizer.pkl', 'wb') as f:
        pickle.dump(tfidf, f)
    with open('./src/cosine_similarity.pkl', 'wb') as f:
        pickle.dump(cosine_sim, f)

# Main function
if __name__ == "__main__":
    interactions_df, product_df = load_data()
    svd_model = train_svd(interactions_df)
    tfidf, cosine_sim = train_cbf(product_df)
    save_models(svd_model, tfidf, cosine_sim)
    print("Models trained and saved successfully!")