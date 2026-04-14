let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function addToCart(button) {
  const item = button.closest('.menu-item');
  const name = item.dataset.name;
  const price = parseFloat(item.dataset.price);
  const existing = cart.find(i => i.name === name);
  
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({name, price, qty: 1});
  }
  
  renderCart();
  
  // Visual feedback
  button.style.background = '#28a745';
  button.textContent = 'Added!';
  setTimeout(() => {
    button.style.background = '#E41C23';
    button.textContent = `Add to Cart - R${price}`;
  }, 1000);
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const customerForm = document.getElementById('customer-form');
  const miniCartItems = document.getElementById('mini-cart-items');
  const floatingCart = document.getElementById('floating-cart');
  
  cartItems.innerHTML = '';
  miniCartItems.innerHTML = '';
  let total = 0;
  
  cart.forEach(item => {
    total += item.price * item.qty;
    
    // Main cart item
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <div class="cart-item-info">
        <span class="item-name">${item.name}</span>
        <span class="item-qty">Qty: ${item.qty}</span>
      </div>
      <div class="cart-item-controls">
        <span class="item-price">R${(item.price * item.qty).toFixed(2)}</span>
        <div class="qty-controls">
          <button onclick="updateQty('${item.name}', -1)">-</button>
          <button onclick="updateQty('${item.name}', 1)">+</button>
          <button onclick="removeFromCart('${item.name}')">Remove</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
    
    // Mini cart item
    const miniDiv = document.createElement('div');
    miniDiv.classList.add('mini-cart-item');
    miniDiv.innerHTML = `
      <span>${item.name} x ${item.qty}</span>
      <span>R${(item.price * item.qty).toFixed(2)}</span>
    `;
    miniCartItems.appendChild(miniDiv);
  });
  
  document.getElementById('total').innerText = `Total: R${total.toFixed(2)}`;
  document.getElementById('mini-total').innerText = `Total: R${total.toFixed(2)}`;
  document.getElementById('cart-count').innerText = cart.length;
  
  customerForm.style.display = cart.length > 0 ? 'block' : 'none';
  
  // Always show floating cart
  floatingCart.style.display = 'block';
  
  // Update cart header text
  const cartHeader = floatingCart.querySelector('.cart-header span');
  if (cart.length === 0) {
    cartHeader.innerHTML = '🛒 Cart (Empty)';
    document.getElementById('floating-cart-items').innerHTML = '<p style="text-align:center;color:#666;padding:1rem;">Your cart is empty</p>';
  } else {
    cartHeader.innerHTML = `🛒 Cart (<span id="cart-count">${cart.length}</span>)`;
  }
}

function updateQty(name, change) {
  const item = cart.find(i => i.name === name);
  if (item) {
    // Load and render dynamic menu from menu.csv
    async function loadDynamicMenu() {
      try {
        const response = await fetch('menu.csv');
        const csvText = await response.text();
        const lines = csvText.trim().split('\n').slice(1); // Skip header
        const menuMap = new Map();

        lines.forEach(line => {
          const [category, item, description, priceStr] = line.split(',');
          const price = parseFloat(priceStr);
          if (!menuMap.has(category)) menuMap.set(category, []);
          menuMap.get(category).push({item, description, price});
        });

        const grid = document.getElementById('dynamic-menu-grid');
        menuMap.forEach((items, category) => {
          const catDiv = document.createElement('div');
          catDiv.className = 'menu-subcategory';
          catDiv.innerHTML = `<h4 class="subcategory-title">${category}</h4>`;
          const subGrid = document.createElement('div');
          subGrid.className = 'menu-grid';
          items.slice(0,8).forEach(({item, description, price}) => { // Limit 8 per cat
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.dataset.name = item;
            div.dataset.price = price;
            div.innerHTML = `
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80" alt="${item}" style="filter: brightness(1.1);">
              <h3>${item}</h3>
              <p>${description}</p>
              <button onclick="addToCart(this)">Add to Cart - R${price.toFixed(2)}</button>
            `;
            subGrid.appendChild(div);
          });
          catDiv.appendChild(subGrid);
          grid.appendChild(catDiv);
        });
      } catch (err) {
        console.error('Failed to load menu.csv:', err);
        document.getElementById('dynamic-menu').innerHTML += '<p style="text-align:center;color:#ccc;">Full menu loading...</p>';
      }
    }

    // Initialize cart on page load
    document.addEventListener('DOMContentLoaded', () => {
      renderCart();
      loadDynamicMenu();
    });

// Smooth scroll function
function scrollToMenu() {
  const menuElement = document.getElementById('menu');
  if (menuElement) {
    menuElement.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function toggleCart() {
  const cartContent = document.getElementById('floating-cart-items');
  const toggle = document.getElementById('cart-toggle');
  
  if (cartContent.style.display === 'none') {
    cartContent.style.display = 'block';
    toggle.textContent = '▼';
  } else {
    cartContent.style.display = 'none';
    toggle.textContent = '▶';
  }
}

<<<<<<< HEAD
// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
=======
// Load and render dynamic menu from menu.csv
async function loadDynamicMenu() {
  try {
    const response = await fetch('menu.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n').slice(1); // Skip header
    const menuMap = new Map();

    lines.forEach(line => {
      const [category, item, description, priceStr] = line.split(',');
      const price = parseFloat(priceStr);
      if (!menuMap.has(category)) menuMap.set(category, []);
      menuMap.get(category).push({item, description, price});
    });

    const grid = document.getElementById('dynamic-menu-grid');
    menuMap.forEach((items, category) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'menu-subcategory';
      catDiv.innerHTML = `<h4 class="subcategory-title">${category}</h4>`;
      const subGrid = document.createElement('div');
      subGrid.className = 'menu-grid';
      items.slice(0,8).forEach(({item, description, price}) => { // Limit 8 per cat
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.dataset.name = item;
        div.dataset.price = price;
        div.innerHTML = `
          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80" alt="${item}" style="filter: brightness(1.1);">
          <h3>${item}</h3>
          <p>${description}</p>
          <button onclick="addToCart(this)">Add to Cart - R${price.toFixed(2)}</button>
        `;
        subGrid.appendChild(div);
      });
      catDiv.appendChild(subGrid);
      grid.appendChild(catDiv);
    });
  } catch (err) {
    console.error('Failed to load menu.csv:', err);
    document.getElementById('dynamic-menu').innerHTML += '<p style="text-align:center;color:#ccc;">Full menu loading...</p>';
  }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  loadDynamicMenu();
});
>>>>>>> 93d01d7 (Redesign header and hero section with new topbar, logo fallback, hero--photo layout, cart-widget, and gold/dark theme styles)
