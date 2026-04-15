
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

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
    customerForm.style.display = 'none';
    if (widgetTitle) widgetTitle.innerHTML = 'Your Royal Cart is<br/>Empty';
    if (widgetTitleCart) widgetTitleCart.textContent = 'Your Royal Cart is Empty';
    localStorage.setItem('cart', '[]');
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
  customerForm.style.display = 'block';
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  if (widgetTitle) widgetTitle.innerHTML = `Cart<br/>${itemCount} items`;
  if (widgetTitleCart) widgetTitleCart.textContent = `Cart: ${itemCount} items`;
  localStorage.setItem('cart', JSON.stringify(cart));
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
  const notes = document.getElementById('order-notes').value;
  const payment = document.getElementById('payment-method').value;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = {
    customer: { name, phone, address, notes, payment },
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: total.toFixed(2)
  };
  console.log('New Order:', order);
  alert(`Order placed!\nName: ${name}\nPhone: ${phone}\nTotal: R${total.toFixed(2)}\nCheck console for details.\nWe will call you shortly.`);
  cart = [];
  renderCart();
}

// --- MENU LOADING ---
async function loadMenuAndCategories() {
  try {
    const embeddedCsv = document.getElementById('embedded-menu-data')?.textContent?.trim() || '';
    let csvText = '';

    try {
      const response = await fetch('menu.csv');
      console.log('Fetch menu.csv:', response.ok ? 'OK' : `Failed ${response.status}`, 'Size:', response.headers.get('content-length'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      csvText = await response.text();
    } catch (fetchError) {
      console.warn('Using embedded menu fallback:', fetchError.message);
      csvText = embeddedCsv;
    }

    if (!csvText) throw new Error('No menu data available');

    console.log('CSV preview:', csvText.substring(0, 300));
    console.log('Data lines:', csvText.trim().split(/\r?\n/).slice(1).length);
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
      if (index < 3) console.log(`Line ${index}:`, JSON.stringify(fields));
      if (fields.length >= 4) {
        const category = fields[0];
        const item = fields[1];
        const desc = fields[2];
        const priceStr = fields[3];
        const price = parseFloat(priceStr);
        if (!category || !item || isNaN(price)) {
          console.warn('Skipped line:', {category, item, priceStr, price, fields: fields.slice(0,4)});
          return;
        }
        if (!menuMap.has(category)) menuMap.set(category, []);
        menuMap.get(category).push({item, description: desc, price});
      }
    });


    const categories = Array.from(menuMap.keys());
    const totalItems = Array.from(menuMap.values()).reduce((acc, items) => acc + items.length, 0);
    console.log('Final menuMap:', categories.length, 'categories,', totalItems, 'items');

    const grid = document.getElementById('menu-grid');
    const categoryNav = document.getElementById('category-nav');
    const mobileCategorySelect = document.getElementById('mobile-category-select');
    if (!grid) return;

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

    if (categoryNav) {
      categoryNav.innerHTML = '';
      categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'block w-full text-left px-4 py-2 rounded-lg hover:bg-yellow-500/10 hover:text-yellow-400 font-semibold transition-colors category-link';
        btn.textContent = category;
        btn.onclick = () => renderMenuGrid(category);
        categoryNav.appendChild(btn);
      });
    }

    if (mobileCategorySelect) {
      mobileCategorySelect.innerHTML = categories
        .map(category => `<option value="${category}">${category}</option>`)
        .join('');

      mobileCategorySelect.addEventListener('change', () => {
        renderMenuGrid(mobileCategorySelect.value);
      });
    }

    const renderForScreenSize = () => {
      if (window.innerWidth < 1024) {
        const firstCategory = mobileCategorySelect?.value || categories[0];
        renderMenuGrid(firstCategory);
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
    cart.push({name, price, qty: 1});
  }
  renderCart();
  showToast('Added to cart!');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.querySelector('#toast-message').textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4');
    setTimeout(() => toast.classList.add('opacity-0', 'translate-y-4'), 3000);
  } else {
    alert(message);
  }
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
    localStorage.setItem('cart', '[]');
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
  localStorage.setItem('cart', JSON.stringify(cart));
}

function syncCartNavCount() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-nav-count');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function openCartModal() {
  document.getElementById('cart-modal')?.classList.remove('hidden');
  renderCartModal();
}

function closeCartModal() {
  document.getElementById('cart-modal')?.classList.add('hidden');
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

  const notes = document.getElementById('order-notes-modal').value;
  const payment = document.getElementById('payment-method-modal').value;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = {
    customer: { name, phone, address, notes, payment },
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: total.toFixed(2)
  };

  console.log('New Order:', order);
  alert(`Order placed!\nName: ${name}\nPhone: ${phone}\nTotal: R${total.toFixed(2)}\nCheck console for details.\nWe will call you shortly.`);
  cart = [];
  renderCart();
  renderCartModal();
  syncCartNavCount();
  closeCartModal();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderCartModal();
  syncCartNavCount();
  loadMenuAndCategories();

  const cartBtn = document.getElementById('cart-nav-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCartModal);

  const closeBtn = document.getElementById('close-cart-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeCartModal);

  document.getElementById('cart-modal')?.addEventListener('click', function (e) {
    if (e.target === this) closeCartModal();
  });
});

document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});
