
let cart = [];

function renderCart() {
  const cartItemsForm = document.getElementById('cart-items-form');
  if (!cartItemsForm) return;
  cartItemsForm.innerHTML = '';
  let total = 0;
  const widgetTitle = document.getElementById('cart-widget-title');
  const widgetTitleCart = document.getElementById('cart-widget-title-cart');
  const customerForm = document.getElementById('customer-form');
  const totalEl = document.getElementById('total-cart');

  if (cart.length === 0) {
    totalEl.textContent = 'Total: R0.00';
    totalEl.classList.add('hidden');
    customerForm.style.display = 'none';
    if (widgetTitle) widgetTitle.innerHTML = 'Your Royal Cart is<br/>Empty';
    if (widgetTitleCart) widgetTitleCart.textContent = 'Your Royal Cart is Empty';
    syncCartNavCount();
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'flex justify-between py-2 border-b border-gray-700 last:border-b-0 text-sm';
    div.innerHTML = `<span>${item.name} (x${item.qty})</span><span class="font-bold text-yellow-400">R${(item.price * item.qty).toFixed(2)}</span>`;
    cartItemsForm.appendChild(div);
    total += item.price * item.qty;
  });

  totalEl.textContent = `Total: R${total.toFixed(2)}`;
  totalEl.classList.remove('hidden');
  customerForm.style.display = 'block';
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  if (widgetTitle) widgetTitle.innerHTML = `Cart<br/>${itemCount} items`;
  if (widgetTitleCart) widgetTitleCart.textContent = `Cart: ${itemCount} items`;
  syncCartNavCount();
}

function checkout() {
  if (cart.length === 0) {
    showToast('Cart is empty!');
    return;
  }
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  if (!name || !phone || !address) {
    showToast('Please fill in name, phone and address');
    return;
  }

  cart = [];
  renderCart();
  showToast('Order placed successfully. We will contact you shortly.');
}

// --- MENU LOADING ---
async function loadMenuAndCategories() {
  try {
    const embeddedCsv = document.getElementById('embedded-menu-data')?.textContent?.trim() || '';
    let csvText = '';

    try {
      const response = await fetch('menu.csv');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      csvText = await response.text();
    } catch (fetchError) {
      csvText = embeddedCsv;
    }

    if (!csvText) throw new Error('No menu data available');
    const lines = csvText.trim().split(/\r?\n/).slice(1);
    const menuMap = new Map();

    // Proper CSV parser for quoted fields/commas
    function parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    }

    lines.forEach((line, index) => {
      const fields = parseCSVLine(line);
      if (fields.length >= 4) {
        const category = fields[0];
        const item = fields[1];
        const desc = fields[2];
        const priceStr = fields[3];
        const price = parseFloat(priceStr);
        if (!category || !item || isNaN(price)) {
          return;
        }
        if (!menuMap.has(category)) menuMap.set(category, []);
        menuMap.get(category).push({item, description: desc, price});
      }
    });


    const categories = Array.from(menuMap.keys());

    const grid = document.getElementById('menu-grid');
    const categoryNav = document.getElementById('category-nav');
    const mobileCategorySelect = document.getElementById('mobile-category-select');
    if (!grid) return;

    let activeMobileCategory = categories[0] || null;

    function renderMenuGrid(selectedCategory = null) {
      grid.innerHTML = '';
      const entries = selectedCategory
        ? [[selectedCategory, menuMap.get(selectedCategory) || []]]
        : Array.from(menuMap.entries());

      entries.forEach(([category, items]) => {
        const catHeader = document.createElement('h3');
        catHeader.className = 'col-span-full text-2xl font-bold gold-gradient-text mb-4 pt-2 lg:pt-8';
        catHeader.textContent = category;
        catHeader.id = 'cat-' + category.replace(/\s+/g, '-');
        grid.appendChild(catHeader);

        items.forEach(({ item, description, price }) => {
          const div = document.createElement('div');
          div.className = 'menu-item bg-gray-800 rounded-xl p-6 hover:border-yellow-500 border border-gray-700 hover:scale-105 transition-all duration-300 group flex flex-col';
          div.dataset.name = item;
          div.dataset.price = price;
          div.innerHTML = `
            <img src="https://images.unsplash.com/photo-1600891964601-f61ba0e24093?auto=format&fit=crop&w=400&q=80" alt="${item}" class="w-full h-36 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform">
            <h4 class="font-bold text-lg mb-1">${item}</h4>
            <p class="text-gray-400 mb-3 text-sm flex-1">${description}</p>
            <button onclick="addToCart(this)" class="w-full btn-gold py-2 rounded-lg font-semibold text-sm mt-auto">Add to Cart - R${price.toFixed(2)}</button>
          `;
          grid.appendChild(div);
        });
      });
    }

    function populateMobileCategorySelect() {
      if (!mobileCategorySelect) return;
      mobileCategorySelect.innerHTML = '';

      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        mobileCategorySelect.appendChild(option);
      });

      mobileCategorySelect.value = activeMobileCategory || categories[0] || '';
    }

    if (categoryNav) {
      categoryNav.innerHTML = '';
      categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'block w-full text-left px-4 py-2 rounded-lg hover:bg-yellow-500/10 hover:text-yellow-400 font-semibold transition-colors category-link';
        btn.textContent = category;
        btn.onclick = () => {
          const el = document.getElementById('cat-' + category.replace(/\s+/g, '-'));
          if (window.innerWidth < 1024) {
            activeMobileCategory = category;
            if (mobileCategorySelect) mobileCategorySelect.value = category;
            renderMenuGrid(category);
          } else if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        };
        categoryNav.appendChild(btn);
      });
    }

    if (mobileCategorySelect) {
      populateMobileCategorySelect();
      mobileCategorySelect.addEventListener('change', () => {
        activeMobileCategory = mobileCategorySelect.value;
        renderMenuGrid(activeMobileCategory);
      });
    }

    const renderForScreenSize = () => {
      if (window.innerWidth < 1024) {
        populateMobileCategorySelect();
        renderMenuGrid(activeMobileCategory || categories[0]);
      } else {
        renderMenuGrid();
      }
    };

    renderForScreenSize();
    window.addEventListener('resize', renderForScreenSize);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('menu-grid');
    if (grid) grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-20">Menu could not load. Refresh the page or open it from localhost.</p>';
  }
}

// --- END MENU LOADING ---

function addToCart(button) {
  const item = button.closest('.menu-item') || button.closest('[data-name]');
  const name = item.dataset.name;
  const price = parseFloat(item.dataset.price);
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  renderCartModal();
  syncCartNavCount();
  showToast('Added to cart!');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
  }, 3200);
}

function renderCartModal() {
  const cartItemsForm = document.getElementById('cart-items-form-modal');
  if (!cartItemsForm) return;
  cartItemsForm.innerHTML = '';
  let total = 0;
  const widgetTitle = document.getElementById('cart-widget-title-cart-modal');
  const customerForm = document.getElementById('customer-form-modal');
  const totalEl = document.getElementById('total-cart-modal');

  if (cart.length === 0) {
    totalEl.textContent = 'Total: R0.00';
    totalEl.classList.add('hidden');
    customerForm.style.display = 'none';
    if (widgetTitle) widgetTitle.textContent = 'Your Royal Cart is Empty';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'flex justify-between py-2 border-b border-gray-700 last:border-b-0 text-sm';
    div.innerHTML = `<span>${item.name} (x${item.qty})</span><span class="font-bold text-yellow-400">R${(item.price * item.qty).toFixed(2)}</span>`;
    cartItemsForm.appendChild(div);
    total += item.price * item.qty;
  });

  totalEl.textContent = `Total: R${total.toFixed(2)}`;
  totalEl.classList.remove('hidden');
  customerForm.style.display = 'block';
  if (widgetTitle) widgetTitle.textContent = `Cart: ${cart.reduce((sum, i) => sum + i.qty, 0)} items`;
}

function syncCartNavCount() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const badge = document.getElementById('cart-nav-count');
  const mobileFloatingBadge = document.getElementById('mobile-floating-cart-count');
  const mobileFloatingTotal = document.getElementById('mobile-floating-cart-total');

  [badge, mobileFloatingBadge].forEach(el => {
    if (!el) return;
    if (count > 0) {
      el.textContent = count;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  if (mobileFloatingTotal) {
    mobileFloatingTotal.textContent = `R${total.toFixed(2)}`;
  }
}

function openCartModal() {
  document.getElementById('cart-modal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderCartModal();
}

function closeCartModal() {
  document.getElementById('cart-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function checkoutModal() {
  if (cart.length === 0) {
    showToast('Cart is empty!');
    return;
  }

  const name = document.getElementById('customer-name-modal').value.trim();
  const phone = document.getElementById('customer-phone-modal').value.trim();
  const address = document.getElementById('customer-address-modal').value.trim();

  if (!name || !phone || !address) {
    showToast('Please fill in name, phone and address');
    return;
  }

  cart = [];
  renderCart();
  renderCartModal();
  syncCartNavCount();
  closeCartModal();
  showToast('Order placed successfully. We will contact you shortly.');
}

document.addEventListener('DOMContentLoaded', () => {
  cart = [];
  try {
    localStorage.removeItem('cart');
    sessionStorage.removeItem('cart');
  } catch (e) {}
  renderCart();
  renderCartModal();
  syncCartNavCount();
  loadMenuAndCategories();

  const cartBtn = document.getElementById('cart-nav-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCartModal);

  const mobileFloatingCartBtn = document.getElementById('mobile-floating-cart-btn');
  if (mobileFloatingCartBtn) {
    mobileFloatingCartBtn.addEventListener('click', openCartModal);
  }

  const closeBtn = document.getElementById('close-cart-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeCartModal);

  document.getElementById('cart-modal')?.addEventListener('click', function (e) {
    if (e.target === this) closeCartModal();
  });
});

document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});
