class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('laced_cart')) || [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCartCount();
    this.renderCart();
  }

  bindEvents() {
    const checkoutBtn = document.querySelector('.cart-footer .btn-full');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => { window.location.href = 'checkout.html'; });
    const cartIcon = document.getElementById('cart-icon');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartIcon) cartIcon.addEventListener('click', () => this.toggleCart(true));
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => this.toggleCart(false));
  }

  toggleCart(show) {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar && overlay) {
      if (show) {
        sidebar.classList.add('open');
        overlay.classList.add('show');
      } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      }
    }
  }

  addItem(product, size, quantity, openCart = true) {
    const existingItemIndex = this.items.findIndex(item => item.id === product.id && item.size === size);
    
    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity;
        if (this.items[existingItemIndex].quantity <= 0) {
          this.items.splice(existingItemIndex, 1);
        }
      } else if (quantity > 0) {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        quantity: quantity
      });
    }
    
    this.saveCart();
    this.updateCartCount();
    this.renderCart();
    if (openCart) this.toggleCart(true); // Open cart after adding
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
    this.updateCartCount();
    this.renderCart();
  }

  saveCart() {
    localStorage.setItem('laced_cart', JSON.stringify(this.items));
  }

  updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
      const totalCount = this.items.reduce((acc, item) => acc + item.quantity, 0);
      countEl.textContent = totalCount;
    }
  }

  renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-amount');
    
    if (!cartItemsContainer || !cartTotalEl) return;

    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
      cartTotalEl.textContent = '$0.00';
      return;
    }

    let html = '';
    let total = 0;

    this.items.forEach((item, index) => {
      total += item.price * item.quantity;
      html += `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-size">Size: ${item.size} | Qty: ${item.quantity}</div>
            <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} EGP</div>
            <div class="cart-item-actions">
              <button class="remove-item" onclick="cart.removeItem(${index})">Remove</button>
            </div>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    cartTotalEl.textContent = `${total.toFixed(2)} EGP`;
  }
}

// Initialize cart globally
const cart = new Cart();



