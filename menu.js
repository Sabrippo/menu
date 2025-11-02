let productos = {};
let total = 0;

// Cargamos productos e inicializamos cantidades
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data.reduce((acc, p) => {
      acc[p.id] = { ...p, cantidad: 0 };
      return acc;
    }, {});
    renderAllMenus(data);
  })
  .catch(err => console.error(err));

// Render general para todas las categorías
function renderAllMenus(data) {
  const pizzas = data.filter(p => p.categoria === "pizzas");
  const empanadas = data.filter(p => p.categoria === "empanadas");
  const bebidas = data.filter(p => p.categoria === "bebidas");
  const postres = data.filter(p => p.categoria === "postres");

  renderMenu(pizzas, "menu");
  renderMenu(empanadas, "menu-empanadas");
  renderMenu(bebidas, "menu-bebidas");
  renderMenu(postres, "menu-postres");

  actualizarBurbuja();
}

// Render individual
function renderMenu(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  contenedor.innerHTML = lista.map(p => `
    <div class="item">
      <div>
        <h4>${p.nombre.replace(/\((.*?)\)/, '<span class="detalle">($1)</span>')}</h4>
        <span class="precio">$${p.precio.toLocaleString('es-AR')}</span>
      </div>
      <div class="controls">
        <button class="btn" onclick="cambiarCantidad('${p.id}', -1)">−</button>
        <span id="${p.id}-count" class="count">0</span>
        <button class="btn" onclick="cambiarCantidad('${p.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

// Cambiar cantidad y actualizar total
function cambiarCantidad(id, delta) {
  productos[id].cantidad = Math.max(0, productos[id].cantidad + delta);
  document.getElementById(`${id}-count`).innerText = productos[id].cantidad;
  actualizarTotal();
}

// Recalcular total global
function actualizarTotal() {
  total = Object.values(productos).reduce((sum, p) => sum + p.cantidad * p.precio, 0);
  actualizarBurbuja();
  actualizarLink();
}

// Actualiza el link de WhatsApp con el pedido
function actualizarLink() {
  const numero = "5491151580209"; // tu número
  let texto = "Hola! Quiero hacer un pedido:%0A";

  Object.values(productos).forEach(p => {
    if (p.cantidad > 0) {
      texto += `- ${p.cantidad}x ${p.nombre} ($${p.precio.toLocaleString('es-AR')})%0A`;
    }
  });
  texto += `%0ATotal: $${total.toLocaleString('es-AR')}`;

  document.getElementById('whatsapp-link').href =
    `https://wa.me/${numero}?text=${texto}`;
}

// 🛒 CREA / ACTUALIZA LA BURBUJA FLOTANTE
function actualizarBurbuja() {
  const bubble = document.getElementById('cart-bubble');

  if (total > 0) {
    bubble.innerHTML = `
      <div class="cart-bubble-inner">
        🛒 $${total.toLocaleString('es-AR')}
      </div>
    `;
    bubble.style.display = 'block';
  } else {
    bubble.style.display = 'none';
  }
}

// Toast si no selecciona nada
function mostrarToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 2500);
}

// Listener del botón WhatsApp
document.getElementById('whatsapp-link').addEventListener('click', function(e) {
  if (total === 0) {
    e.preventDefault();
    mostrarToast();
  }
});
