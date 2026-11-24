document.addEventListener('DOMContentLoaded', () => {
    // Tu número de WhatsApp configurado con código de país de Colombia (57)
    const PHONE_NUMBER = "573052116530"; 

    // Respaldo interno por si se abre sin servidor local (CORS)
    const fallbackProducts = [
        {
            id: 1,
            nombre: "Cadena Tejido Veneciano 50cm",
            categoria: "cadenas",
            precio: 120000,
            imagen: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
            descripcion: "Elegante cadena de tejido veneciano fabricada en plata ley 925 de alta pureza.",
            detalles_material: "Plata Ley 925 sólida, acabado pulido brillante a mano.",
            garantia_producto: "Garantía de por vida sobre autenticidad de la plata ley."
        },
        {
            id: 2,
            nombre: "Cadena Dije Medalla San Benito",
            categoria: "cadena",
            precio: 145000,
            imagen: "https://images.unsplash.com/photo-1611591475179-62cd3579893d?q=80&w=800&auto=format&fit=crop",
            descripcion: "Cadena fina acompañada de un dije con la medalla de San Benito en alto relieve.",
            detalles_material: "Plata Ley 925 con detalles oxidados oscuros.",
            garantia_producto: "Garantía de autenticidad del material por 30 días."
        },
       
        {
            id: 3,
            nombre: "Manilla Tejido Escalera",
            categoria: "manilla",
            precio: 85000,
            imagen: "https://images.unsplash.com/photo-1611591475179-62cd3579893d?q=80&w=800&auto=format&fit=crop",
            descripcion: "Manilla con tejido estilo escalera, cómoda y con gran brillo metálico.",
            detalles_material: "Plata Ley 925 flexible y resistente.",
            garantia_producto: "Garantía de 30 días por fallas en el broche."
        },
        {
            id: 5,
            nombre: "Tobillera Cascabeles & Dijes",
            categoria: "tobillera",
            precio: 70000,
            imagen: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
            descripcion: "Tobillera delicada decorada con pequeños dijes colgantes.",
            detalles_material: "Plata Ley 925 hipoalergénica.",
            garantia_producto: "Garantía de 30 días por defectos de fabricación."
        },
        {
            id: 6,
            nombre: "Tobillera Minimalista Doble Hilo",
            categoria: "tobillera",
            precio: 55000,
            imagen: "https://images.unsplash.com/photo-1611591475179-62cd3579893d?q=80&w=800&auto=format&fit=crop",
            descripcion: "Tobillera de doble hilo minimalista, ideal para un look moderno.",
            detalles_material: "Plata Ley 925 ligera y duradera.",
            garantia_producto: "Garantía de autenticidad por 30 días."
        }
    ];

    let products = [];
    let cart = [];
    let currentCategory = 'todos';
    let currentSearch = '';

    const productGrid = document.getElementById('product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.getElementById('cart-count');
    const checkoutForm = document.getElementById('checkout-form');

    const detailModal = document.getElementById('product-detail-modal');
    const detailClose = document.getElementById('detail-close');
    const detailModalBody = document.getElementById('detail-modal-body');
    const toastContainer = document.getElementById('toast-container');

    // Cargar productos desde data.json con respaldo automático
    async function loadProducts() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('No se pudo cargar data.json');
            products = await response.json();
        } catch (error) {
            console.warn('Usando datos de respaldo internos debido a políticas del navegador.', error);
            products = fallbackProducts;
        }
        applyFilters();
    }

    function applyFilters() {
        const term = currentSearch.trim().toLowerCase();

        const filtered = products.filter(p => {
            const matchesCategory = currentCategory === 'todos' || p.categoria === currentCategory;
            const matchesSearch = !term ||
                p.nombre.toLowerCase().includes(term) ||
                (p.categoria && p.categoria.toLowerCase().includes(term)) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
                (p.detalles_material && p.detalles_material.toLowerCase().includes(term));

            return matchesCategory && matchesSearch;
        });

        renderProducts(filtered);
    }

    function renderProducts(items) {
        if (!productGrid) return;
        productGrid.innerHTML = '';

        if (items.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron productos con esa búsqueda.</p>';
            return;
        }

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card fade-in-element visible';
            card.innerHTML = `
                <img src="${product.imagen}" alt="${product.nombre}" class="product-img">
                <div class="product-info">
                    <h3>${product.nombre}</h3>
                    <p class="product-price">$${product.precio.toLocaleString('es-CO')}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                        <button class="btn btn-silver details-btn" data-id="${product.id}" style="flex: 1; padding: 0.6rem; font-size: 0.75rem;">Ver Detalles</button>
                        <button class="btn btn-silver add-to-cart-btn" data-id="${product.id}" style="flex: 1; padding: 0.6rem; font-size: 0.75rem;">Comprar</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openProductDetail(parseInt(e.currentTarget.dataset.id)));
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(parseInt(e.currentTarget.dataset.id)));
        });
    }

    // Eventos de la lupa de búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearch.length > 0 ? 'inline-block' : 'none';
            }
            applyFilters();
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            clearSearchBtn.style.display = 'none';
            applyFilters();
            searchInput.focus();
        });
    }

    function openProductDetail(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        detailModalBody.innerHTML = `
            <div class="modal-product-info">
                <img src="${product.imagen}" alt="${product.nombre}" style="width:100%; height:240px; object-fit:cover; border-radius:6px; margin-bottom:1rem;">
                <h3>${product.nombre}</h3>
                <p class="modal-product-price">$${product.precio.toLocaleString('es-CO')}</p>
                
                <div class="modal-section-title"><i class="fa-solid fa-circle-info"></i> Descripción</div>
                <p class="modal-desc">${product.descripcion || 'Especial pieza en plata ley.'}</p>
                
                <div class="modal-section-title"><i class="fa-solid fa-gem"></i> Materiales</div>
                <p class="modal-desc">${product.detalles_material || 'Plata Ley 925.'}</p>

                <div class="modal-section-title"><i class="fa-solid fa-shield-halved"></i> Garantía del Producto</div>
                <p class="modal-warranty">${product.garantia_producto || 'Garantía A.D Platería.'}</p>

                <button class="btn btn-silver btn-block modal-add-btn" data-id="${product.id}" style="margin-top: 1rem;">
                    Agregar al Carrito
                </button>
            </div>
        `;

        detailModal.classList.add('open');

        const modalAddBtn = document.querySelector('.modal-add-btn');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', (e) => {
                addToCart(parseInt(e.target.dataset.id));
                detailModal.classList.remove('open');
            });
        }
    }

    if (detailClose) detailClose.addEventListener('click', () => detailModal.classList.remove('open'));

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.dataset.category;
            applyFilters();
        });
    });

    window.addToCart = function(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.cantidad += 1;
        } else {
            cart.push({ ...product, cantidad: 1 });
        }
        updateCartUI();
        showToast(`¡Agregado al carrito: ${product.nombre}!`);
    };

    window.changeQuantity = function(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        updateCartUI();
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    };

    function updateCartUI() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">Tu carrito está vacío.</p>';
        }

        cart.forEach(item => {
            total += item.precio * item.cantidad;
            totalCount += item.cantidad;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${item.nombre}</h4>
                    <small style="color: var(--text-muted);">$${item.precio.toLocaleString('es-CO')}</small>
                    <div class="cart-item-controls">
                        <button onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span style="font-size: 0.9rem; font-weight: 600; padding: 0 5px;">${item.cantidad}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                    <span style="font-weight: 600; font-size: 0.9rem;">$${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ff4d4d; font-size: 1.1rem; cursor: pointer;" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        if (cartTotalPrice) cartTotalPrice.textContent = `$${total.toLocaleString('es-CO')}`;
        if (cartCount) cartCount.textContent = totalCount;
    }

    function showToast(message) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    if (cartToggle) cartToggle.addEventListener('click', () => cartModal.classList.add('open'));
    if (cartClose) cartClose.addEventListener('click', () => cartModal.classList.remove('open'));

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert('Tu carrito está vacío.');
                return;
            }

            const name = document.getElementById('client-name').value.trim();
            const email = document.getElementById('client-email').value.trim();

            let message = `*NUEVO PEDIDO - A.D PLATERÍA*\n\n`;
            message += `*CLIENTE:* ${name}\n`;
            message += `*CORREO:* ${email}\n\n`;
            message += `*PRODUCTOS:*\n`;

            let total = 0;
            cart.forEach(item => {
                const sub = item.precio * item.cantidad;
                total += sub;
                message += `• ${item.nombre} (x${item.cantidad}) - $${sub.toLocaleString('es-CO')}\n`;
            });

            message += `\n*TOTAL:* $${total.toLocaleString('es-CO')}`;

            window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }

    loadProducts();
});