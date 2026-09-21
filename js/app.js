// ============================================================
// Cellphone X - Ứng dụng JavaScript chính
// ============================================================

// ------------------------------------------------------------
// 1. QUẢN LÝ TRẠNG THÁI (State Management)
// ------------------------------------------------------------
const App = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cellphonex-cart')) || [],
  currentPage: '',
  init() {}
};

// ------------------------------------------------------------
// 2. HÀM TIỆN ÍCH (Utility Functions)
// ------------------------------------------------------------

/**
 * Định dạng giá tiền theo chuẩn Việt Nam
 * @param {number} price - Giá tiền cần định dạng
 * @returns {string} Chuỗi giá tiền đã định dạng (VD: '29.990.000₫')
 */
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

/**
 * Tính phần trăm giảm giá
 * @param {number} original - Giá gốc
 * @param {number} current - Giá hiện tại
 * @returns {number} Phần trăm giảm giá (làm tròn)
 */
function getDiscountPercent(original, current) {
  if (!original || original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Hàm debounce - trì hoãn thực thi cho đến khi ngừng gọi
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} Hàm đã được debounce
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Tạo HTML hiển thị sao đánh giá
 * @param {number} rating - Điểm đánh giá (0-5)
 * @returns {string} Chuỗi HTML chứa các icon sao
 */
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= Math.round(rating) ? '<span class="star filled">★</span>' : '<span class="star empty">☆</span>';
  }
  return stars;
}

/**
 * Chuyển đổi văn bản thành URL slug
 * @param {string} text - Văn bản cần chuyển đổi
 * @returns {string} Chuỗi slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ------------------------------------------------------------
// 3. HÀM GIỎ HÀNG (Cart Functions)
// ------------------------------------------------------------

/**
 * Lưu giỏ hàng vào localStorage
 */
function saveCart() {
  localStorage.setItem('cellphonex-cart', JSON.stringify(App.cart));
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number|string} productId - ID sản phẩm
 * @param {number} quantity - Số lượng (mặc định: 1)
 */
function addToCart(productId, quantity = 1) {
  // Tìm sản phẩm trong danh sách
  const product = App.products.find(p => p.id === productId);
  if (!product) {
    showToast('Không tìm thấy sản phẩm!', 'error');
    return;
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItem = App.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    App.cart.push({ id: productId, quantity: quantity });
  }

  saveCart();
  updateCartBadge();
  showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {number|string} productId - ID sản phẩm cần xóa
 */
function removeFromCart(productId) {
  App.cart = App.cart.filter(item => item.id !== productId);
  saveCart();
  updateCartBadge();

  // Nếu đang ở trang giỏ hàng, cập nhật lại giao diện
  if (window.location.pathname.includes('cart')) {
    renderCartPage();
  }
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {number|string} productId - ID sản phẩm
 * @param {number} newQty - Số lượng mới
 */
function updateCartQuantity(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = App.cart.find(item => item.id === productId);
  if (item) {
    item.quantity = newQty;
    saveCart();
    updateCartBadge();

    // Nếu đang ở trang giỏ hàng, cập nhật lại giao diện
    if (window.location.pathname.includes('cart')) {
      renderCartPage();
    }
  }
}

/**
 * Tính tổng giá trị giỏ hàng
 * @returns {number} Tổng giá trị
 */
function getCartTotal() {
  return App.cart.reduce((total, item) => {
    const product = App.products.find(p => p.id === item.id);
    if (product) {
      total += product.price * item.quantity;
    }
    return total;
  }, 0);
}

/**
 * Đếm tổng số lượng sản phẩm trong giỏ hàng
 * @returns {number} Tổng số lượng
 */
function getCartCount() {
  return App.cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Cập nhật badge hiển thị số lượng trên icon giỏ hàng
 */
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = count;

  if (count > 0) {
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ------------------------------------------------------------
// 4. THÀNH PHẦN GIAO DIỆN (UI Components)
// ------------------------------------------------------------

/**
 * Tạo HTML cho thẻ sản phẩm
 * @param {Object} product - Đối tượng sản phẩm
 * @returns {string} Chuỗi HTML của thẻ sản phẩm
 */
function createProductCard(product) {
  const discount = product.originalPrice
    ? getDiscountPercent(product.originalPrice, product.price)
    : 0;

  const discountBadge = discount > 0
    ? `<span class="discount-badge">-${discount}%</span>`
    : '';

  const originalPriceHTML = product.originalPrice
    ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>`
    : '';

  return `
    <a href="product-detail.html?id=${product.id}" class="product-card">
      ${discountBadge}
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-category">${product.category || ''}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          ${generateStars(product.rating || 0)}
          <span class="rating-count">(${product.reviews || 0})</span>
        </div>
        <div class="product-price">
          <span class="current-price">${formatPrice(product.price)}</span>
          ${originalPriceHTML}
          ${discount > 0 ? `<span class="discount-percent">-${discount}%</span>` : ''}
        </div>
        <button class="btn-add-to-cart" onclick="event.stopPropagation(); event.preventDefault(); App.addToCart(${product.id});">
          <span>🛒</span> Thêm vào giỏ
        </button>
      </div>
    </a>
  `;
}

/**
 * Hiển thị thông báo toast
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo: 'success', 'error', 'info'
 */
function showToast(message, type = 'success') {
  // Xác định icon và màu sắc theo loại
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  };

  const icon = icons[type] || icons.info;

  // Tạo phần tử toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  // Thêm toast vào body
  document.body.appendChild(toast);

  // Kích hoạt animation hiển thị
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  // Tự động xóa sau 3 giây
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    // Đợi animation kết thúc rồi xóa phần tử
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

/**
 * Hiển thị modal thông báo (dùng cho đặt hàng thành công)
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung modal
 */
function showModal(title, message) {
  // Tạo overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close">&times;</button>
      <div class="modal-icon">✓</div>
      <h2 class="modal-title">${title}</h2>
      <p class="modal-message">${message}</p>
      <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">Đóng</button>
    </div>
  `;

  // Đóng modal khi click vào overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Đóng modal khi click nút đóng
  const closeBtn = overlay.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });

  document.body.appendChild(overlay);

  // Kích hoạt animation
  requestAnimationFrame(() => {
    overlay.classList.add('modal-show');
  });
}

// ------------------------------------------------------------
// 5. ĐIỀU HƯỚNG (Navigation)
// ------------------------------------------------------------

/**
 * Khởi tạo thanh điều hướng: menu mobile, hiệu ứng scroll, active link
 */
function initNavigation() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  // Toggle menu trên mobile
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  // Thêm hiệu ứng đổ bóng khi cuộn trang
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Đánh dấu link đang active dựa theo trang hiện tại
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // So sánh đường dẫn hiện tại với href của link
    if (
      (href === 'index.html' && (currentPath.endsWith('/') || currentPath.includes('index'))) ||
      (href !== 'index.html' && currentPath.includes(href.replace('.html', '')))
    ) {
      link.classList.add('active');
    }
  });

  // Đóng menu mobile khi click vào link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
      if (menuToggle) menuToggle.classList.remove('active');
    });
  });
}

// ------------------------------------------------------------
// 6. TRANG CHỦ (Home Page - index.html)
// ------------------------------------------------------------

/**
 * Khởi tạo trang chủ: tải sản phẩm và hiển thị sản phẩm nổi bật
 */
async function initHomePage() {
  try {
    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
    App.products = await response.json();

    // Lấy 4 sản phẩm có đánh giá cao nhất làm sản phẩm nổi bật
    const featuredProducts = [...App.products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);

    const container = document.getElementById('featured-products');
    if (container) {
      container.innerHTML = featuredProducts.map(createProductCard).join('');
    }

    // Xử lý sự kiện click vào danh mục
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        if (category) {
          window.location.href = `products.html?category=${encodeURIComponent(category)}`;
        }
      });
    });

  } catch (error) {
    console.error('Lỗi khi tải trang chủ:', error);
    const container = document.getElementById('featured-products');
    if (container) {
      container.innerHTML = '<p class="error-message">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
  }
}

// ------------------------------------------------------------
// 7. TRANG SẢN PHẨM (Products Page - products.html)
// ------------------------------------------------------------

/**
 * Khởi tạo trang danh sách sản phẩm
 */
async function initProductsPage() {
  try {
    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
    App.products = await response.json();

    // Render tất cả sản phẩm ban đầu
    filterProducts();

    // Thiết lập tìm kiếm với debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        filterProducts();
      }, 300));
    }

    // Thiết lập bộ lọc danh mục
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Bỏ active class của tất cả nút
        filterButtons.forEach(b => b.classList.remove('active'));
        // Thêm active class cho nút được click
        btn.classList.add('active');
        filterProducts();
      });
    });

    // Đọc tham số URL để tự động lọc theo danh mục
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      // Tìm và kích hoạt nút lọc tương ứng
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === categoryParam) {
          btn.classList.add('active');
        }
      });
      filterProducts();
    }

  } catch (error) {
    console.error('Lỗi khi tải trang sản phẩm:', error);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = '<p class="error-message">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
  }
}

/**
 * Lọc và hiển thị sản phẩm theo từ khóa tìm kiếm và danh mục
 */
function filterProducts() {
  const searchInput = document.getElementById('search-input');
  const activeFilter = document.querySelector('.filter-btn.active');
  const grid = document.getElementById('products-grid');

  if (!grid) return;

  // Lấy từ khóa tìm kiếm
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // Lấy danh mục đang active
  const activeCategory = activeFilter ? activeFilter.dataset.category : 'all';

  // Lọc sản phẩm
  let filtered = App.products.filter(product => {
    // Lọc theo tên sản phẩm
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm);

    // Lọc theo danh mục
    const matchesCategory = !activeCategory || activeCategory === 'all' || product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Render kết quả
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <span class="no-results-icon">🔍</span>
        <h3>Không tìm thấy sản phẩm</h3>
        <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
      </div>
    `;
  } else {
    grid.innerHTML = filtered.map(createProductCard).join('');
  }
}

// ------------------------------------------------------------
// 8. TRANG CHI TIẾT SẢN PHẨM (Product Detail - product-detail.html)
// ------------------------------------------------------------

/**
 * Khởi tạo trang chi tiết sản phẩm
 */
async function initProductDetail() {
  try {
    // Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
      showProductNotFound();
      return;
    }

    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
    App.products = await response.json();

    // Tìm sản phẩm theo ID
    const product = App.products.find(p => p.id === productId);
    if (!product) {
      showProductNotFound();
      return;
    }

    renderProductDetail(product);
    renderRelatedProducts(product);

  } catch (error) {
    console.error('Lỗi khi tải chi tiết sản phẩm:', error);
    showProductNotFound();
  }
}

/**
 * Hiển thị thông báo không tìm thấy sản phẩm
 */
function showProductNotFound() {
  const container = document.getElementById('product-detail');
  if (container) {
    container.innerHTML = `
      <div class="not-found">
        <span class="not-found-icon">😞</span>
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
        <a href="products.html" class="btn-primary">Xem tất cả sản phẩm</a>
      </div>
    `;
  }
}

/**
 * Render chi tiết sản phẩm
 * @param {Object} product - Đối tượng sản phẩm
 */
function renderProductDetail(product) {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const discount = product.originalPrice
    ? getDiscountPercent(product.originalPrice, product.price)
    : 0;

  // Tạo danh sách tính năng (features)
  const featuresHTML = product.features
    ? product.features.map(f => `<li><span class="feature-icon">✓</span> ${f}</li>`).join('')
    : '';

  container.innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">Trang chủ</a>
      <span>/</span>
      <a href="products.html">Sản phẩm</a>
      <span>/</span>
      <a href="products.html?category=${encodeURIComponent(product.category || '')}">${product.category || ''}</a>
      <span>/</span>
      <span class="current">${product.name}</span>
    </nav>

    <div class="product-detail-content">
      <div class="product-detail-image">
        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>

      <div class="product-detail-info">
        <span class="product-category-tag">${product.category || ''}</span>
        <h1 class="product-detail-name">${product.name}</h1>

        <div class="product-detail-rating">
          ${generateStars(product.rating || 0)}
          <span class="rating-text">${product.rating || 0}/5</span>
          <span class="review-count">(${product.reviews || 0} đánh giá)</span>
        </div>

        <div class="product-detail-price">
          <span class="current-price">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="discount-badge-inline">Giảm ${discount}%</span>` : ''}
        </div>

        <div class="product-description">
          <p>${product.description || 'Chưa có mô tả sản phẩm.'}</p>
        </div>

        ${featuresHTML ? `
          <div class="product-features">
            <h3>Tính năng nổi bật</h3>
            <ul>${featuresHTML}</ul>
          </div>
        ` : ''}

        <div class="product-actions">
          <div class="quantity-selector">
            <button class="qty-btn qty-decrease" id="qty-decrease">−</button>
            <input type="number" id="qty-input" class="qty-input" value="1" min="1" max="99">
            <button class="qty-btn qty-increase" id="qty-increase">+</button>
          </div>
          <button class="btn-add-to-cart-large" id="btn-add-detail">
            <span>🛒</span> Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  `;

  // Xử lý sự kiện cho bộ chọn số lượng
  const qtyInput = document.getElementById('qty-input');
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');
  const btnAddDetail = document.getElementById('btn-add-detail');

  if (qtyDecrease && qtyInput) {
    qtyDecrease.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      if (current > 1) qtyInput.value = current - 1;
    });
  }

  if (qtyIncrease && qtyInput) {
    qtyIncrease.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      if (current < 99) qtyInput.value = current + 1;
    });
  }

  // Nút thêm vào giỏ hàng
  if (btnAddDetail) {
    btnAddDetail.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      addToCart(product.id, qty);
    });
  }
}

/**
 * Hiển thị sản phẩm liên quan (cùng danh mục)
 * @param {Object} currentProduct - Sản phẩm hiện tại
 */
function renderRelatedProducts(currentProduct) {
  const container = document.getElementById('related-products');
  if (!container) return;

  // Lọc sản phẩm cùng danh mục, loại trừ sản phẩm hiện tại
  const related = App.products
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (related.length === 0) {
    container.innerHTML = '<p>Không có sản phẩm liên quan.</p>';
    return;
  }

  container.innerHTML = related.map(createProductCard).join('');
}

// ------------------------------------------------------------
// 9. TRANG GIỎ HÀNG (Cart Page - cart.html)
// ------------------------------------------------------------

/**
 * Khởi tạo trang giỏ hàng
 */
async function initCartPage() {
  try {
    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
    App.products = await response.json();

    renderCartPage();

  } catch (error) {
    console.error('Lỗi khi tải trang giỏ hàng:', error);
    const container = document.getElementById('cart-items');
    if (container) {
      container.innerHTML = '<p class="error-message">Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.</p>';
    }
  }
}

/**
 * Render toàn bộ nội dung trang giỏ hàng
 */
function renderCartPage() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummaryContainer = document.getElementById('cart-summary');

  if (!cartItemsContainer) return;

  // Kiểm tra giỏ hàng trống
  if (App.cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <a href="products.html" class="btn-primary">Tiếp tục mua sắm</a>
      </div>
    `;
    if (cartSummaryContainer) {
      cartSummaryContainer.innerHTML = '';
    }
    return;
  }

  // Render từng sản phẩm trong giỏ hàng
  let cartHTML = '';
  App.cart.forEach(item => {
    const product = App.products.find(p => p.id === item.id);
    if (!product) return;

    const lineTotal = product.price * item.quantity;

    cartHTML += `
      <div class="cart-item" data-id="${product.id}">
        <div class="cart-item-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${product.name}</h3>
          <span class="cart-item-category">${product.category || ''}</span>
          <span class="cart-item-price">${formatPrice(product.price)}</span>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="updateCartQuantity(${product.id}, ${item.quantity - 1})">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99"
                 onchange="updateCartQuantity(${product.id}, parseInt(this.value) || 1)">
          <button class="qty-btn" onclick="updateCartQuantity(${product.id}, ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">
          <span>${formatPrice(lineTotal)}</span>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${product.id})" title="Xóa sản phẩm">
          🗑
        </button>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = cartHTML;

  // Render tóm tắt đơn hàng
  if (cartSummaryContainer) {
    const total = getCartTotal();
    const count = getCartCount();

    cartSummaryContainer.innerHTML = `
      <div class="cart-summary-content">
        <h3>Tóm tắt đơn hàng</h3>
        <div class="summary-row">
          <span>Tạm tính (${count} sản phẩm)</span>
          <span>${formatPrice(total)}</span>
        </div>
        <div class="summary-row">
          <span>Phí vận chuyển</span>
          <span class="free-shipping">Miễn phí</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-row summary-total">
          <span>Tổng cộng</span>
          <span>${formatPrice(total)}</span>
        </div>
        <button class="btn-checkout" onclick="handleCheckout()">
          Đặt hàng
        </button>
        <a href="products.html" class="btn-continue-shopping">← Tiếp tục mua sắm</a>
      </div>
    `;
  }
}

/**
 * Xử lý đặt hàng (checkout)
 */
function handleCheckout() {
  if (App.cart.length === 0) {
    showToast('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi đặt hàng.', 'error');
    return;
  }

  // Hiển thị modal thành công
  showModal(
    'Đặt hàng thành công!',
    'Cảm ơn bạn đã mua sắm tại Cellphone X. Đơn hàng của bạn đang được xử lý.'
  );

  // Xóa giỏ hàng
  App.cart = [];
  saveCart();
  updateCartBadge();

  // Cập nhật lại giao diện trang giỏ hàng
  renderCartPage();
}

// ------------------------------------------------------------
// 10. NEWSLETTER (Đăng ký nhận tin)
// ------------------------------------------------------------

/**
 * Khởi tạo form đăng ký nhận tin
 */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value.trim();

    // Validate email đơn giản
    if (!email || !email.includes('@') || !email.includes('.')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
      return;
    }

    // Hiển thị thông báo thành công
    showToast('Đăng ký nhận tin thành công! Cảm ơn bạn.', 'success');
    emailInput.value = '';
  });
}

// ------------------------------------------------------------
// 11. KHỞI TẠO ỨNG DỤNG (Page Router / Init)
// ------------------------------------------------------------

// Gán các hàm vào đối tượng App để có thể gọi từ HTML
App.addToCart = addToCart;
App.removeFromCart = removeFromCart;
App.updateCartQuantity = updateCartQuantity;

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  App.init = async function () {
    // Khởi tạo các thành phần chung cho mọi trang
    initNavigation();
    updateCartBadge();
    initNewsletter();

    // Điều hướng đến hàm khởi tạo tương ứng với trang hiện tại
    if (path.includes('product-detail')) {
      App.currentPage = 'product-detail';
      await initProductDetail();
    } else if (path.includes('products')) {
      App.currentPage = 'products';
      await initProductsPage();
    } else if (path.includes('cart')) {
      App.currentPage = 'cart';
      await initCartPage();
    } else {
      App.currentPage = 'home';
      await initHomePage();
    }
  };

  App.init();
});
