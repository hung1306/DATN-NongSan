import os
import pandas as pd
import requests

# Đường dẫn tới file CSV chứa thông tin sản phẩm
csv_file = './dataImageProduct.csv'

# Đọc file CSV chứa productid, productname và URL của hình ảnh (productimage1)
df = pd.read_csv(csv_file)

# Tạo folder để lưu hình ảnh tải về
image_dir = 'productImage'
if not os.path.exists(image_dir):
    os.makedirs(image_dir)

# Hàm tải hình ảnh từ URL
def download_image(image_url, image_path):
    try:
        response = requests.get(image_url, stream=True)
        if response.status_code == 200:
            with open(image_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"Downloaded {image_path} successfully.")
        else:
            print(f"Failed to download {image_path} (Status code: {response.status_code})")
    except Exception as e:
        print(f"Error downloading {image_path}: {e}")

# Duyệt qua từng dòng trong DataFrame và tải hình ảnh
for index, row in df.iterrows():
    productid = row['productid']
    productname = row['productname']
    image_url = row['productimage1']

    # Tạo tên file cho hình ảnh dựa trên productid và productname
    # Loại bỏ các ký tự không hợp lệ trong tên file
    productname_clean = ''.join(e for e in productname if e.isalnum())
    image_filename = f"{productid}_{productname_clean}.jpg"
    image_path = os.path.join(image_dir, image_filename)

    # Gọi hàm tải hình ảnh
    download_image(image_url, image_path)
