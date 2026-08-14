// ===== SETTINGS LOGIC =====
window.storeSettings = {};
fetch('/api/settings').then(r => r.json()).then(data => {
  window.storeSettings = data;
  
  if (data.maintenance && data.maintenance.enabled) {
    if (!window.location.pathname.includes('admin.html') && !window.location.pathname.includes('maintenance.html')) {
      window.location.href = 'maintenance.html';
      return;
    }
  }
  
  const heroTitle = document.querySelector('.hero h1');
  const heroSubtitle = document.querySelector('.hero p');
  const heroBtn = document.querySelector('.hero .btn');
  if (data.heroBanner) {
    if (heroTitle) heroTitle.innerText = data.heroBanner.title || 'Step Into Style';
    if (heroSubtitle) heroSubtitle.innerText = data.heroBanner.subtitle || '';
    if (heroBtn) heroBtn.innerText = data.heroBanner.buttonText || 'Shop Now';
  }
  
  window.dispatchEvent(new Event('settingsLoaded'));
}).catch(e => console.error('Settings fetch failed', e));


// ===== WISHLIST LOGIC =====
window.getWishlist = function() {
  return JSON.parse(localStorage.getItem("laced_wishlist") || "[]");
};
window.toggleWishlist = function(e, id) {
  e.preventDefault();
  e.stopPropagation();
  let list = window.getWishlist();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    e.currentTarget.style.color = "#ccc";
    e.currentTarget.querySelector("svg").setAttribute("fill", "none");
  } else {
    list.push(id);
    e.currentTarget.style.color = "#ff0000";
    e.currentTarget.querySelector("svg").setAttribute("fill", "currentColor");
  }
  localStorage.setItem("laced_wishlist", JSON.stringify(list));
  // Update wishlist count badge if it exists
  const wlCount = document.getElementById("wishlist-count");
  if(wlCount) wlCount.innerText = list.length;
};

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const featuredGrid = document.getElementById('featured-grid');
  const productDetailContainer = document.getElementById('product-detail-container');
  const productGallery = document.getElementById('product-gallery');

  const generateProductCard = (product) => {
    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <a href="product.html?id=${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x600?text=LACED';">
          </a>
          <span class="sale-badge">Sale</span>
        </div>
        <div class="product-info">
          <a href="product.html?id=${product.id}" class="product-name" style="text-decoration:none; color:inherit;">${product.name}</a>
          <div class="product-price-container">
            <div class="product-old-price">LE ${(product.price + 300).toFixed(2)} EGP</div>
            <div class="product-price">LE ${product.price.toFixed(2)} EGP</div>
          </div>
          <button class="btn-choose" onclick="openQuickAddModal(${product.id})">Choose options</button>
        </div>
      </div>
    `;
  };

  window.openQuickAddModal = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
  
    let modal = document.getElementById('quick-add-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quick-add-modal';
      modal.className = 'quick-add-modal';
      document.body.appendChild(modal);
    }
  
    const getVariantQty = (size) => {
      if (!window.cart) return 0;
      const item = window.cart.items.find(i => i.id === product.id && i.size === size);
      return item ? item.quantity : 0;
    };
  
    const renderModalContent = () => {
      let totalItems = 0;
      let totalPrice = 0;
      
      const sizesHtml = product.sizes.map(size => {
        const qty = getVariantQty(size);
        totalItems += qty;
        totalPrice += (qty * product.price);
        return `
          <div class="qa-size-row">
            <div class="qa-size-name">${size}</div>
            <div class="qa-qty-control">
              <div class="qa-qty-inner">
                <button class="qa-qty-btn" onclick="updateQuickAddQty(${product.id}, '${size}', -1)">-</button>
                <span class="qa-qty-val">${qty}</span>
                <button class="qa-qty-btn" onclick="updateQuickAddQty(${product.id}, '${size}', 1)">+</button>
              </div>
            </div>
            <div class="qa-price-col">
              <span class="old">LE ${(product.price + 300).toFixed(2)}</span>
              LE ${product.price.toFixed(2)}/ea
            </div>
            <div class="qa-total-col">LE ${(qty * product.price).toFixed(2)}</div>
          </div>
        `;
      }).join('');
  
      modal.innerHTML = `
        <div class="quick-add-container">
          <div class="quick-add-close" onclick="closeQuickAddModal()">
            <i class="fa-solid fa-xmark"></i>
          </div>
          <div class="quick-add-left">
            <div>
              <div class="quick-add-img-wrap">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x600?text=LACED';">
              </div>
              <a href="product.html?id=${product.id}" class="quick-add-details-link">View full details <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
          <div class="quick-add-right">
            <div class="quick-add-title">${product.name}</div>
            <div class="quick-add-price">
              <span class="old">LE ${(product.price + 300).toFixed(2)} EGP</span>
              LE ${product.price.toFixed(2)} EGP
            </div>
            
            <div class="quick-add-table-header">
              <div class="qa-col-var">VARIANT</div>
              <div class="qa-col-qty">QUANTITY</div>
              <div class="qa-col-price">PRICE</div>
              <div class="qa-col-total">VARIANT TOTAL</div>
            </div>
            
            <div class="quick-add-sizes-list">
              ${sizesHtml}
            </div>
            
            <div class="quick-add-footer">
              <button class="qa-view-cart-btn" onclick="closeQuickAddModal(); window.cart.toggleCart(true);">View cart</button>
              <div class="qa-summary-col">
                <div class="qa-summary-items"><span>${totalItems}</span> Total items</div>
                <div class="qa-summary-total">LE ${totalPrice.toFixed(2)}</div>
                <div class="qa-summary-note">Taxes, discounts and shipping calculated at checkout.</div>
              </div>
            </div>
          </div>
        </div>
      `;
    };
  
    renderModalContent();
    window.currentQuickAddRender = renderModalContent;
  
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
  };
  
  window.closeQuickAddModal = () => {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  };
  
  window.updateQuickAddQty = (productId, size, delta) => {
    const product = products.find(p => p.id === productId);
    if (!product || !window.cart) return;
    window.cart.addItem(product, size, delta, false);
    if (window.currentQuickAddRender) {
      window.currentQuickAddRender();
    }
  };

  // ===== SHOP PAGE (with pagination) =====
  if (productsGrid) {
    let currentPage = 1;
    const itemsPerPage = 20;

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const searchQuery = urlParams.get('search');

    let filteredProducts = products;
    const shopTitle = document.querySelector('.shop-section .section-title');
    
    if (category === 'ladies') {
      filteredProducts = products.filter(p => p.sizes && p.sizes.some(s => parseInt(s) <= 40));
      if (shopTitle) shopTitle.textContent = "Ladies Collection";
    } else if (category === 'mens') {
      filteredProducts = products.filter(p => p.sizes && p.sizes.some(s => parseInt(s) >= 41));
      if (shopTitle) shopTitle.textContent = "Men's Collection";
    } else {
      if (shopTitle) shopTitle.textContent = "All Footwear";
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
      if (shopTitle) shopTitle.textContent = `Search Results: "${searchQuery}"`;
    }

    const renderPage = (page) => {
      currentPage = page;
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      productsGrid.innerHTML = filteredProducts.slice(start, end).map(p => generateProductCard(p)).join('');
      renderPagination();
    };

    const renderPagination = () => {
      const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
      let paginationContainer = document.getElementById('pagination-container');
      if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'pagination-container';
        productsGrid.parentNode.insertBefore(paginationContainer, productsGrid.nextSibling);
      }

      if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }

      let html = '';
      if (currentPage > 1) html += `<button class="page-btn" data-page="${currentPage - 1}">&lt;</button>`;
      html += `<button class="page-btn ${currentPage === 1 ? 'active' : ''}" data-page="1">1</button>`;

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage === 1) endPage = Math.min(totalPages - 1, 3);
      if (currentPage === totalPages) startPage = Math.max(2, totalPages - 2);

      if (startPage > 2) html += `<span class="page-dots">...</span>`;
      for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
      if (totalPages > 1) html += `<button class="page-btn ${currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
      if (currentPage < totalPages) html += `<button class="page-btn" data-page="${currentPage + 1}">&gt;</button>`;

      paginationContainer.innerHTML = html;
      paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          renderPage(parseInt(e.target.getAttribute('data-page')));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    };

    renderPage(1);
  }

  // ===== HOME PAGE (featured) =====
  if (featuredGrid) {
    featuredGrid.innerHTML = products.slice(0, 8).map(p => generateProductCard(p)).join('');
  }

  // ===== PRODUCT DETAIL PAGE =====
  if (productDetailContainer && productGallery) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (product) {
      document.title = `${product.name} | LACED`;

      const sizesHtml = product.sizes.map(size =>
        `<button class="prod-size-btn" data-size="${size}">${size}</button>`
      ).join('');

      productGallery.innerHTML = `
        <div class="main-image">
          <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x600?text=LACED';">
        </div>
      `;

      // Related products
      const relatedProducts = products.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 3);
            const relatedHtml = relatedProducts.map(p => {
        const sizeOptions = p.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
        return `
        <div class="goes-well-item">
          <input type="checkbox" class="goes-well-check">
          <img src="${p.image}" class="goes-well-img" onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60?text=LACED';">
          <div class="goes-well-info">
            <div class="gw-title">${p.name}</div>
            <div class="gw-size">
              <select class="gw-size-select" style="border:none; outline:none; background:transparent; font-family:'Inter',sans-serif; color:#666; cursor:pointer;">
                ${sizeOptions}
              </select>
            </div>
            <div class="gw-price"><span class="gw-new">LE ${p.price.toFixed(2)}</span> <span class="gw-old">LE ${(p.price + 300).toFixed(2)}</span></div>
          </div>
        </div>
        `;
      }).join('');

      productDetailContainer.innerHTML = `
        <h1 class="detail-title">${product.name}</h1>

        <div class="prod-price-block">
          <span class="prod-old-price">LE ${(product.price + 300).toFixed(2)} EGP</span>
          <span class="prod-new-price">LE ${product.price.toFixed(2)} EGP</span>
          <span class="prod-sale-badge">Sale</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end;"><div class="prod-section-title" style="margin-bottom:0;">Shoe size</div><button style="background:none; border:none; text-decoration:underline; cursor:pointer; color:#666;" onclick="document.getElementById('size-guide-modal').style.display='flex'">Size Guide</button></div>
        <div class="prod-size-grid" id="size-grid">
          ${sizesHtml}
        </div>

        <div class="prod-section-title">Quantity</div>
        <div class="prod-qty-wrapper">
          <button class="prod-qty-btn" id="qty-minus">-</button>
          <input type="number" class="prod-qty-input" id="qty-input" value="1" min="1">
          <button class="prod-qty-btn" id="qty-plus">+</button>
        </div>

        <div class="goes-well-container">
          <div class="goes-well-header">
            <h3>Goes well with</h3>
          </div>
          <div class="goes-well-list">
            ${relatedHtml}
          </div>
        </div>

        <button class="prod-add-to-cart" id="add-to-cart-btn">Add to cart</button>
      `;

      
        

        let selectedSize = null;
      let quantity = 1;

      document.querySelectorAll('.prod-size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.prod-size-btn').forEach(b => b.classList.remove('selected'));
          e.target.classList.add('selected');
          selectedSize = e.target.dataset.size;
        });
      });

      const qtyInput = document.getElementById('qty-input');
      document.getElementById('qty-minus').addEventListener('click', () => {
        if (quantity > 1) { quantity--; qtyInput.value = quantity; }
      });
      document.getElementById('qty-plus').addEventListener('click', () => {
        quantity++; qtyInput.value = quantity;
      });

      document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        if (!selectedSize) { alert('Please select a size first.'); return; }
        cart.addItem(product, selectedSize, quantity);
      });
    } else {
      productGallery.style.display = 'none';
      productDetailContainer.innerHTML = '<h2>Product not found</h2><a href="shop.html" style="margin-top:20px; display:inline-block; text-decoration:underline;">Back to Shop</a>';
    }
  }

  
    // ===== AI CHATBOT (SIZING ASSISTANT) =====
    const chatbotHTML = `
      <div id="ai-chatbot-btn" style="position:fixed; bottom:20px; right:20px; background:#000; color:#fff; width:60px; height:60px; border-radius:50%; display:flex; justify-content:center; align-items:center; cursor:pointer; box-shadow:0 10px 20px rgba(0,0,0,0.2); z-index:9999;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </div>
      
      <div id="ai-chatbot-window" style="display:none; position:fixed; bottom:90px; right:20px; width:300px; height:400px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.2); z-index:9999; flex-direction:column; overflow:hidden; border:1px solid #ddd;">
        <div style="background:#000; color:#fff; padding:15px; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
          <div>AI Sizing Assistant 👟</div>
          <button id="close-chatbot" style="background:none; border:none; color:#fff; cursor:pointer; font-size:1.2rem;">&times;</button>
        </div>
        <div id="chat-messages" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; background:#fafafa;">
          <div style="background:#eee; color:#000; padding:10px; border-radius:8px; align-self:flex-start; max-width:80%; font-size:0.9rem;">
            Hello! I am your LACED AI Assistant. Confused about your size? Tell me your usual size in Nike or Adidas, and I will recommend the perfect size for you!
          </div>
        </div>
        <div style="padding:10px; background:#fff; border-top:1px solid #ddd; display:flex;">
          <input type="text" id="chat-input" placeholder="e.g. I wear 42 in Nike..." style="flex:1; padding:10px; border:1px solid #ccc; border-radius:4px; font-family:inherit; outline:none;" />
          <button id="chat-send" style="background:#000; color:#fff; border:none; padding:10px 15px; border-radius:4px; margin-left:5px; cursor:pointer; font-weight:700;">Send</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);
    
    const chatBtn = document.getElementById("ai-chatbot-btn");
    const chatWin = document.getElementById("ai-chatbot-window");
    const chatClose = document.getElementById("close-chatbot");
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatMsgs = document.getElementById("chat-messages");
    
    chatBtn.addEventListener("click", () => { chatWin.style.display = chatWin.style.display === "flex" ? "none" : "flex"; });
    chatClose.addEventListener("click", () => { chatWin.style.display = "none"; });
    
    const sendReply = (text, isUser) => {
      const div = document.createElement("div");
      div.style.padding = "10px"; div.style.borderRadius = "8px"; div.style.maxWidth = "80%"; div.style.fontSize = "0.9rem";
      if (isUser) {
        div.style.background = "#000"; div.style.color = "#fff"; div.style.alignSelf = "flex-end";
      } else {
        div.style.background = "#eee"; div.style.color = "#000"; div.style.alignSelf = "flex-start";
      }
      div.innerText = text;
      chatMsgs.appendChild(div);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    };
    
    chatSend.addEventListener("click", () => {
      const text = chatInput.value.trim();
      if (!text) return;
      sendReply(text, true);
      chatInput.value = "";
      
      // Enhanced AI Logic
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let reply = "I couldn't quite catch that! Could you tell me what brand you usually wear (like Nike, Adidas, Puma) and your size?";
        
        // Find if a number (size) was mentioned
        const sizeMatch = text.match(/\d{2}(\.5)?/);
        const userSize = sizeMatch ? parseFloat(sizeMatch[0]) : null;

        if (lowerText.includes("nike") || lowerText.includes("jordan")) {
          if (userSize) {
            reply = `Awesome! Nike/Jordan sizes tend to run slightly larger. If you wear a ${userSize} in Nike, I highly recommend ordering a **${userSize - 0.5}** for the perfect fit in our sneakers.`;
          } else {
            reply = "Great! What size do you usually wear in Nike? (e.g., 42 or 43.5)";
          }
        } 
        else if (lowerText.includes("adidas") || lowerText.includes("yeezy")) {
          if (userSize) {
            reply = `Got it! Adidas/Yeezy typically runs small. If you are a ${userSize} in Adidas, you should order exactly a **${userSize}** in our store for a comfortable fit.`;
          } else {
            reply = "Adidas sizing can be tricky! What size do you normally wear in Adidas?";
          }
        }
        else if (lowerText.includes("puma") || lowerText.includes("new balance") || lowerText.includes("nb")) {
          if (userSize) {
            reply = `Puma and New Balance fit very similarly to our sneakers. I recommend sticking to your true size: **${userSize}**.`;
          } else {
            reply = "Nice! What size do you wear in that brand?";
          }
        }
        else if (lowerText.includes("cm") || lowerText.includes("centimeter")) {
          reply = "Measuring in CM is the most accurate! Please check out the **Size Guide** on any product page to match your CM measurement exactly to our EU sizes.";
        }
        else if (userSize) {
          reply = `If your standard EU size is ${userSize}, then a size **${userSize}** in our store will fit you perfectly! We are true to size.`;
        }
        else if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey") || lowerText.includes("Ù…Ø±Ø­Ø¨Ø§") || lowerText.includes("Ø§Ù‡Ù„Ø§") || lowerText.includes("Ø³Ù„Ø§Ù…")) {
          reply = "Hello there! ðŸ‘‹ I'm your LACED sizing expert. Tell me your usual shoe brand and size, and I'll find your perfect fit!";
        }
        
        sendReply(reply, false);
      }, 1000);
    });
    
    chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") chatSend.click(); });

    // ===== HAMBURGER MENU =====
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      if (mobileMenu.classList.contains('open')) {
        hamburger.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      } else {
        hamburger.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      }
    });
  }

  // ===== SEARCH (MODERN) =====
  const searchIcon = document.querySelector('.search-icon');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const searchClear = document.getElementById('search-clear');
  const searchResultsArea = document.getElementById('search-results-area');
  const searchFooterBar = document.getElementById('search-footer-bar');
  const searchSuggestionsList = document.getElementById('search-suggestions-list');
  const searchProductsList = document.getElementById('search-products-list');
  const searchTermDisplay = document.getElementById('search-term-display');
  const searchAllLink = document.getElementById('search-all-link');

  if (searchIcon && searchOverlay) {
    searchIcon.addEventListener('click', () => {
      searchOverlay.classList.add('open');
      document.body.classList.add('no-scroll');
      searchInput.focus();
    });

    const closeSearch = () => {
      searchOverlay.classList.remove('open');
      document.body.classList.remove('no-scroll');
      searchInput.value = '';
      updateSearchResults('');
    };

    searchClose.addEventListener('click', closeSearch);
    
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });

    const performSearch = () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = 'shop.html?search=' + encodeURIComponent(query);
      }
    };

    searchBtn.addEventListener('click', performSearch);
    
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      updateSearchResults('');
      searchInput.focus();
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    searchInput.addEventListener('input', (e) => {
      updateSearchResults(e.target.value.trim());
    });

    function updateSearchResults(query) {
      if (!query) {
        searchClear.style.display = 'none';
        searchResultsArea.style.display = 'none';
        searchFooterBar.style.display = 'none';
        return;
      }

      searchClear.style.display = 'block';
      const q = query.toLowerCase();
      searchTermDisplay.textContent = query;
      searchAllLink.href = 'shop.html?search=' + encodeURIComponent(query);
      
      const matchedProducts = products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 6);

      if (matchedProducts.length > 0) {
        searchResultsArea.style.display = 'flex';
        searchFooterBar.style.display = 'flex';
        
        const suggestions = new Set();
        matchedProducts.forEach(p => {
          suggestions.add(p.name);
        });
        
        searchSuggestionsList.innerHTML = Array.from(suggestions).slice(0, 5).map(s => {
          const idx = s.toLowerCase().indexOf(q);
          if (idx === -1) return `<li><span class="rest">${s}</span></li>`;
          const before = s.substring(0, idx);
          const match = s.substring(idx, idx + q.length);
          const after = s.substring(idx + q.length);
          return `<li onclick="window.location.href='shop.html?search=${encodeURIComponent(s)}'"><span class="match">${before}</span><span class="rest">${match}</span><span class="match">${after}</span></li>`;
        }).join('');

        searchProductsList.innerHTML = matchedProducts.slice(0, 4).map(p => {
          const s = p.name;
          const idx = s.toLowerCase().indexOf(q);
          let titleHtml = s;
          if (idx !== -1) {
            const before = s.substring(0, idx);
            const match = s.substring(idx, idx + q.length);
            const after = s.substring(idx + q.length);
            titleHtml = `<span class="match">${before}</span><span class="rest">${match}</span><span class="match">${after}</span>`;
          }
          return `
            <a href="product.html?id=${p.id}" class="search-product-item">
              <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60?text=LACED';">
              <div class="title">${titleHtml}</div>
            </a>
          `;
        }).join('');
      } else {
        searchResultsArea.style.display = 'none';
        searchFooterBar.style.display = 'none';
      }
    }
  }
});


// Global Upsell Functions
window.addUpsellAndCart = function() {
  document.getElementById("upsell-modal").style.display = "none";
  cart.addItem(window.currentPendingProduct, window.currentPendingSize, window.currentPendingQty);
  
  // Add cleaning kit
  const cleaningKit = {
    id: "upsell_clean_kit",
    name: "Sneaker Cleaning Kit",
    price: 100,
    image: "https://via.placeholder.com/600x600?text=Cleaning+Kit"
  };
  cart.addItem(cleaningKit, "One Size", 1);
};

window.continueWithoutUpsell = function() {
  document.getElementById("upsell-modal").style.display = "none";
  cart.addItem(window.currentPendingProduct, window.currentPendingSize, window.currentPendingQty);
};










// ===== FLOATING WHATSAPP BUTTON =====
window.addEventListener('settingsLoaded', () => {
    if (window.storeSettings && window.storeSettings.storeInfo && window.storeSettings.storeInfo.whatsapp) {
        // Only add if not already added
        if (!document.getElementById('floating-wa')) {
            const waNumber = window.storeSettings.storeInfo.whatsapp;
            const waWidget = document.createElement('a');
            waWidget.id = 'floating-wa';
            waWidget.href = 'https://wa.me/' + waNumber;
            waWidget.target = '_blank';
            waWidget.style.position = 'fixed';
            waWidget.style.bottom = '20px';
            waWidget.style.right = '20px';
            waWidget.style.backgroundColor = '#25D366';
            waWidget.style.color = '#FFF';
            waWidget.style.borderRadius = '50%';
            waWidget.style.width = '60px';
            waWidget.style.height = '60px';
            waWidget.style.display = 'flex';
            waWidget.style.justifyContent = 'center';
            waWidget.style.alignItems = 'center';
            waWidget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            waWidget.style.zIndex = '9999';
            waWidget.style.transition = 'transform 0.3s ease';
            waWidget.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
            
            waWidget.onmouseover = () => waWidget.style.transform = 'scale(1.1)';
            waWidget.onmouseout = () => waWidget.style.transform = 'scale(1)';
            
            document.body.appendChild(waWidget);
        }
    }
});



