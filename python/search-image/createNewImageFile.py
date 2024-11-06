import pandas as pd

# Load the CSV file
df = pd.read_csv('./dataImageProduct.csv')

# Function to clean the product name
def clean_product_name(name):
    return ''.join(e for e in name if e.isalnum())

# Create the 'imagepath' column
df['imagepath'] = df.apply(lambda row: f"productImage/{row['productid']}_{clean_product_name(row['productname'])}.jpg", axis=1)

df.drop(columns=['productimage1'], inplace=True)

# Save the updated DataFrame back to CSV
df.to_csv('./src/newImageProduct.csv', index=False)