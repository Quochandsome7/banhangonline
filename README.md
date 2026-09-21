# 📱 Cellphone X - Website Bán Hàng Điện Tử

Website bán hàng trực tuyến cho cửa hàng điện tử Cellphone X. Được xây dựng hoàn toàn bằng HTML, CSS, JavaScript thuần - không framework, tối ưu hiệu suất và SEO.

## ✨ Tính năng

- 🏠 **Trang chủ**: Banner hero, danh mục sản phẩm, sản phẩm nổi bật
- 📦 **Trang sản phẩm**: Hiển thị grid, tìm kiếm real-time, lọc theo danh mục
- 🔍 **Chi tiết sản phẩm**: Ảnh lớn, thông tin chi tiết, sản phẩm liên quan
- 🛒 **Giỏ hàng**: Thêm/xóa/sửa số lượng, tính tổng tiền, thanh toán giả lập
- 📱 **Responsive**: Tối ưu hiển thị trên mọi thiết bị
- ⚡ **Hiệu suất cao**: Không framework nặng, load nhanh
- 🔒 **localStorage**: Giỏ hàng được lưu trữ trong trình duyệt

## 🛠️ Công nghệ sử dụng

- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- JavaScript ES6+ (Vanilla)
- Google Fonts (Inter)
- localStorage API

## 📁 Cấu trúc thư mục

```
banhangonline/
├── index.html              # Trang chủ
├── products.html            # Trang danh sách sản phẩm
├── product-detail.html      # Trang chi tiết sản phẩm
├── cart.html                # Trang giỏ hàng
├── css/
│   └── style.css            # Stylesheet chính
├── js/
│   └── app.js               # JavaScript chính
├── data/
│   └── products.json        # Dữ liệu sản phẩm
├── _headers                 # Cấu hình headers cho Cloudflare Pages
├── _redirects               # Cấu hình redirects cho Cloudflare Pages
└── README.md                # Hướng dẫn
```

## 🚀 Chạy Local

### Cách 1: Mở trực tiếp
Mở file `index.html` trong trình duyệt. 
> **Lưu ý**: Một số trình duyệt có thể chặn fetch request khi mở file trực tiếp. Nên dùng local server.

### Cách 2: Dùng Live Server (VS Code)
1. Cài extension **Live Server** trong VS Code
2. Click chuột phải vào `index.html` → **Open with Live Server**

### Cách 3: Dùng Python
```bash
# Python 3
python -m http.server 8000

# Sau đó mở http://localhost:8000
```

### Cách 4: Dùng Node.js
```bash
npx serve .
```

## ☁️ Deploy lên Cloudflare Pages

### Bước 1: Đẩy code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit - Cellphone X website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cellphonex.git
git push -u origin main
```

### Bước 2: Kết nối Cloudflare Pages
1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vào **Workers & Pages** → **Create application** → **Pages**
3. Chọn **Connect to Git** → Authorize GitHub
4. Chọn repository `cellphonex`
5. Cấu hình build:
   - **Project name**: cellphonex
   - **Production branch**: main
   - **Build command**: *(để trống)*
   - **Build output directory**: `/` hoặc `.`
6. Click **Save and Deploy**

### Bước 3: Truy cập website
Sau khi deploy thành công, website sẽ có URL dạng:
`https://cellphonex.pages.dev`

### Cập nhật website
Mỗi khi push code mới lên GitHub, Cloudflare Pages sẽ tự động re-deploy.

```bash
git add .
git commit -m "Update: mô tả thay đổi"
git push
```

## 📝 Tùy chỉnh

### Thêm sản phẩm mới
Chỉnh sửa file `data/products.json` theo format:
```json
{
  "id": 6,
  "name": "Tên sản phẩm",
  "slug": "ten-san-pham",
  "category": "Danh mục",
  "price": 10000000,
  "originalPrice": 12000000,
  "image": "URL ảnh",
  "description": "Mô tả sản phẩm",
  "features": ["Tính năng 1", "Tính năng 2"],
  "rating": 4.5,
  "reviews": 100,
  "inStock": true
}
```

### Đổi màu chủ đạo
Chỉnh sửa CSS variables trong `css/style.css`:
```css
:root {
  --primary: #2563eb;        /* Màu chính */
  --primary-dark: #1e40af;   /* Màu tối hơn */
  --primary-light: #3b82f6;  /* Màu sáng hơn */
}
```

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.
