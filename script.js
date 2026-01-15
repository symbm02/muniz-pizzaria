document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("main-content");
  const order = ["combos", "pizzas-8", "pizzas-4", "doces-8", "doces-4", "calzones", "bebidas"];
  
  // Sistema de pedidos
  let cart = [];
  const WHATSAPP_NUMBER = "5581984819344";

  // Funções básicas
  function extractPriceValue(price) {
    if (!price) return 0;
    const numericValue = price.replace("R$ ", "").replace(".", "").replace(",", ".");
    return parseFloat(numericValue) || 0;
  }

  function formatPrice(value) {
    return "R$ " + value.toFixed(2).replace(".", ",");
  }

  function showNotification(message) {
    // Criar notificação simples
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #25D366;
      color: white;
      padding: 15px 25px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 3000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Sistema do carrinho
  function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  }

  function calculateTotal() {
    return cart.reduce((total, item) => {
      return total + (extractPriceValue(item.price) * item.quantity);
    }, 0);
  }

  function addToCart(item, quantity = 1) {
    const existingItem = cart.find(cartItem => 
      cartItem.title === item.title && cartItem.price === item.price
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...item, quantity });
    }

    updateCartCount();
    localStorage.setItem('munizCart', JSON.stringify(cart));
    showNotification(`${item.title} adicionado ao carrinho!`);
    
    if (document.getElementById('cartModal').classList.contains('active')) {
      renderCartItems();
    }
  }

  function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#666;">
          <i class="fas fa-shopping-cart" style="font-size:3rem; color:#ddd; margin-bottom:20px;"></i>
          <p>Seu carrinho está vazio</p>
          <p>Adicione itens do menu</p>
        </div>
      `;
      totalEl.textContent = 'R$ 0,00';
      return;
    }

    container.innerHTML = cart.map((item, index) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
        <div>
          <div style="font-weight:600; margin-bottom:5px;">${item.title}</div>
          <div style="color:#666; font-size:0.9rem;">${item.description.substring(0, 50)}...</div>
        </div>
        <div style="display:flex; align-items:center; gap:15px;">
          <div style="display:flex; align-items:center; gap:8px; background:#f5f5f5; padding:5px; border-radius:5px;">
            <button onclick="app.updateQuantity(${index}, -1)" style="background:#ff4500; color:white; border:none; width:25px; height:25px; border-radius:3px; cursor:pointer;">-</button>
            <span style="font-weight:bold;">${item.quantity}</span>
            <button onclick="app.updateQuantity(${index}, 1)" style="background:#ff4500; color:white; border:none; width:25px; height:25px; border-radius:3px; cursor:pointer;">+</button>
          </div>
          <div style="font-weight:bold; color:#ff4500; min-width:80px; text-align:right;">
            ${formatPrice(extractPriceValue(item.price) * item.quantity)}
          </div>
          <button onclick="app.removeFromCart(${index})" style="background:#ff0000; color:white; border:none; width:25px; height:25px; border-radius:3px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-trash" style="font-size:0.8rem;"></i>
          </button>
        </div>
      </div>
    `).join('');

    totalEl.textContent = formatPrice(calculateTotal());
  }

  function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
      cart.splice(index, 1);
    }
    updateCartCount();
    localStorage.setItem('munizCart', JSON.stringify(cart));
    renderCartItems();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    localStorage.setItem('munizCart', JSON.stringify(cart));
    renderCartItems();
    showNotification("Item removido do carrinho");
  }

  // Sistema do formulário de dados
  function showDataForm() {
    if (cart.length === 0) {
      showNotification("Adicione itens ao carrinho primeiro!");
      return;
    }
    
    closeCartModal();
    document.getElementById('dataModal').classList.add('active');
    
    // Resetar formulário
    document.getElementById('clientForm').reset();
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('changeField').classList.remove('show');
  }

  function closeDataForm() {
    document.getElementById('dataModal').classList.remove('active');
  }

  function validateForm() {
    let valid = true;
    
    // Validar nome
    const name = document.getElementById('clientName');
    if (!name.value.trim()) {
      name.closest('.data-form-group').classList.add('error');
      valid = false;
    } else {
      name.closest('.data-form-group').classList.remove('error');
    }
    
    // Validar endereço
    const address = document.getElementById('clientAddress');
    if (!address.value.trim()) {
      address.closest('.data-form-group').classList.add('error');
      valid = false;
    } else {
      address.closest('.data-form-group').classList.remove('error');
    }
    
    // Validar telefone
    const phone = document.getElementById('clientPhone');
    const phoneClean = phone.value.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      phone.closest('.data-form-group').classList.add('error');
      valid = false;
    } else {
      phone.closest('.data-form-group').classList.remove('error');
    }
    
    // Validar forma de pagamento
    if (!document.querySelector('.payment-option.selected')) {
      showNotification("Selecione uma forma de pagamento!");
      valid = false;
    }
    
    return valid;
  }

  function sendToWhatsApp() {
    if (!validateForm()) return;
    
    // Coletar dados
    const clientData = {
      name: document.getElementById('clientName').value,
      address: document.getElementById('clientAddress').value,
      phone: document.getElementById('clientPhone').value,
      payment: document.querySelector('.payment-option.selected')?.dataset.value || '',
      change: document.getElementById('changeFor').value || '',
      notes: document.getElementById('orderNotes').value || ''
    };
    
    // Gerar mensagem
    let message = `*PEDIDO - MUNIZ PIZZARIA* 🍕\n\n`;
    message += `*Cliente:* ${clientData.name}\n`;
    message += `*Endereço:* ${clientData.address}\n`;
    message += `*Telefone:* ${clientData.phone}\n\n`;
    
    message += `*ITENS:*\n`;
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.title} - ${item.price}\n`;
    });
    
    const total = calculateTotal();
    message += `\n*TOTAL: ${formatPrice(total)}*\n`;
    if (total >= 60) message += `✅ *FRETE GRÁTIS*\n`;
    
    message += `\n*Pagamento:* ${clientData.payment}\n`;
    if (clientData.payment === 'Dinheiro' && clientData.change) {
      message += `*Troco para:* ${clientData.change}\n`;
    }
    
    if (clientData.notes) {
      message += `\n*Observações:*\n${clientData.notes}\n`;
    }
    
    message += `\n_Pedido feito pelo site_\n📍 Estrada de Águas Compridas S/N\n📞 (81) 98481-9344`;
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Limpar tudo
    cart = [];
    updateCartCount();
    localStorage.removeItem('munizCart');
    closeDataForm();
    
    showNotification("Pedido enviado para o WhatsApp!");
  }

  // Funções UI
  function openCartModal() {
    renderCartItems();
    document.getElementById('cartModal').classList.add('active');
  }

  function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
  }

  function addToCartFromCard(button, item) {
    const quantity = parseInt(button.closest('.menu-card').querySelector('.quantity-input').value) || 1;
    addToCart(item, quantity);
  }

  // Renderizar menu (mantém seu código original)
  order.forEach(key => {
    if (!menuData[key]) return;

    const section = document.createElement("section");
    section.id = key;

    const h2 = document.createElement("h2");
    h2.innerHTML = `<i class="${menuData[key].icon}"></i> ${menuData[key].title}`;
    section.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "menu-grid";

    menuData[key].items.forEach(item => {
      const card = document.createElement("div");
      card.className = `menu-card ${item.class || ''}`;

      let imgHtml = item.img ? `<img src="${item.img}" alt="${item.title}" loading="lazy">` : '';

      const quantityControls = item.price ? `
        <div class="item-actions">
          <div class="quantity-control">
            <button class="quantity-btn decrease" onclick="this.nextElementSibling.stepDown()">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="quantity-input" value="1" min="1" max="99">
            <button class="quantity-btn increase" onclick="this.previousElementSibling.stepUp()">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <button class="add-to-cart-btn" onclick="app.addToCartFromCard(this, ${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <i class="fas fa-cart-plus"></i> Adicionar
          </button>
        </div>
      ` : '';

      card.innerHTML = `
        ${imgHtml}
        <div class="menu-title">${item.title}</div>
        <div class="menu-desc">${item.description}</div>
        ${item.price ? `<div class="menu-price">${item.price}</div>` : ""}
        ${quantityControls}
      `;

      grid.appendChild(card);
    });

    section.appendChild(grid);
    main.appendChild(section);
  });

  // Criar elementos da interface
  // Botão do carrinho
  const cartButton = document.createElement('div');
  cartButton.className = 'cart-float';
  cartButton.innerHTML = `
    <button class="cart-button" onclick="app.openCartModal()">
      <i class="fas fa-shopping-cart"></i>
      <span class="cart-count" id="cartCount">0</span>
    </button>
  `;
  document.body.appendChild(cartButton);

  // Modal do carrinho
  const cartModal = document.createElement('div');
  cartModal.className = 'cart-modal';
  cartModal.id = 'cartModal';
  cartModal.innerHTML = `
    <div class="cart-content">
      <div class="cart-header">
        <h3><i class="fas fa-shopping-cart"></i> Seu Pedido</h3>
        <button class="close-cart" onclick="app.closeCartModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total:</span>
          <span id="cartTotal">R$ 0,00</span>
        </div>
        <button class="checkout-btn" onclick="app.showDataForm()">
          <i class="fab fa-whatsapp"></i> Finalizar Pedido
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(cartModal);

  // Modal de dados do cliente (APENAS APARECE QUANDO PRECISA)
  const dataModal = document.createElement('div');
  dataModal.className = 'data-modal';
  dataModal.id = 'dataModal';
  dataModal.innerHTML = `
    <div class="data-modal-content">
      <div class="data-modal-header">
        <h3><i class="fas fa-user"></i> Dados para Entrega</h3>
      </div>
      <div class="data-modal-body">
        <form id="clientForm">
          <div class="data-form-group">
            <label>Nome completo *</label>
            <input type="text" id="clientName" placeholder="Seu nome">
            <div class="error-text">Por favor, digite seu nome</div>
          </div>
          
          <div class="data-form-group">
            <label>Endereço completo *</label>
            <input type="text" id="clientAddress" placeholder="Rua, número, bairro">
            <div class="error-text">Por favor, digite o endereço</div>
          </div>
          
          <div class="data-form-group">
            <label>Telefone *</label>
            <input type="tel" id="clientPhone" placeholder="(81) 99999-9999">
            <div class="error-text">Digite um telefone válido</div>
          </div>
          
          <div class="data-form-group">
            <label>Forma de pagamento *</label>
            <div class="payment-options">
              <div class="payment-option" data-value="Dinheiro">💵 Dinheiro</div>
              <div class="payment-option" data-value="Cartão de Crédito">💳 Cartão</div>
              <div class="payment-option" data-value="PIX">📱 PIX</div>
            </div>
            <div id="changeField" class="change-field">
              <label style="margin-top:10px; display:block;">Troco para quanto?</label>
              <input type="text" id="changeFor" placeholder="R$ 50,00">
            </div>
          </div>
          
          <div class="data-form-group">
            <label>Observações do pedido</label>
            <textarea id="orderNotes" placeholder="Sem cebola, ponto da massa, etc..."></textarea>
          </div>
        </form>
      </div>
      <div class="data-modal-footer">
        <button class="data-modal-btn back" onclick="app.closeDataForm()">
          <i class="fas fa-arrow-left"></i> Voltar
        </button>
        <button class="data-modal-btn send" onclick="app.sendToWhatsApp()">
          <i class="fab fa-whatsapp"></i> Enviar Pedido
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(dataModal);

  // Configurar eventos
  function setupEvents() {
    // Formatação de telefone
    document.getElementById('clientPhone').addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.substring(0, 11);
      
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      }
      
      e.target.value = value;
    });
    
    // Formatação do troco
    document.getElementById('changeFor').addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = (parseInt(value) / 100).toFixed(2);
      if (value === 'NaN') value = '0.00';
      e.target.value = 'R$ ' + value.replace('.', ',');
    });
    
    // Seleção de pagamento
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', function() {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        
        const changeField = document.getElementById('changeField');
        if (this.dataset.value === 'Dinheiro') {
          changeField.classList.add('show');
        } else {
          changeField.classList.remove('show');
        }
      });
    });
  }

  // Expor funções globalmente
  window.app = {
    addToCart,
    addToCartFromCard,
    removeFromCart,
    updateQuantity,
    openCartModal,
    closeCartModal,
    showDataForm,
    closeDataForm,
    sendToWhatsApp
  };

  // Inicializar
  const savedCart = localStorage.getItem('munizCart');
  if (savedCart) cart = JSON.parse(savedCart);
  updateCartCount();
  setupEvents();
  
  // Fechar modais ao clicar fora
  document.addEventListener('click', function(e) {
    if (e.target.id === 'cartModal') closeCartModal();
    if (e.target.id === 'dataModal') closeDataForm();
  });
});

// Função de scroll existente
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}