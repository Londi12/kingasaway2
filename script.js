let cart = [];

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
    item.qty += change;
    if (item.qty <= 0) {
      removeFromCart(name);
    } else {
      renderCart();
    }
  }
}

function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const notes = document.getElementById('order-notes').value.trim();
  const payment = document.getElementById('payment-method').value;
  
  if (!name || !phone || !address) {
    alert('Please fill in all required fields (Name, Phone, Address)');
    return;
  }
  
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const orderDetails = cart.map(item => `${item.name} x ${item.qty} = R${(item.price * item.qty).toFixed(2)}`).join('\n');
  
  const whatsappMessage = `🍔 *NEW ORDER - King Aways*\n\n` +
    `👤 *Customer:* ${name}\n` +
    `📱 *Phone:* ${phone}\n` +
    `📍 *Address:* ${address}\n` +
    `💳 *Payment:* ${payment.charAt(0).toUpperCase() + payment.slice(1)}\n\n` +
    `🛒 *ORDER DETAILS:*\n${orderDetails}\n\n` +
    `💰 *TOTAL: R${total.toFixed(2)}*\n\n` +
    (notes ? `📝 *Notes:* ${notes}\n\n` : '') +
    `⏰ Order placed: ${new Date().toLocaleString()}`;
  
  const whatsappUrl = `https://wa.me/27695530902?text=${encodeURIComponent(whatsappMessage)}`;
  
  const confirmed = confirm(`Order Summary:\n${orderDetails}\n\nTotal: R${total.toFixed(2)}\n\nThis will open WhatsApp to send your order. Continue?`);
  
  if (confirmed) {
    window.open(whatsappUrl, '_blank');
    alert('Order sent to WhatsApp! We will confirm your order shortly.');
    cart = [];
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('order-notes').value = '';
    renderCart();
  }
}

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

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});