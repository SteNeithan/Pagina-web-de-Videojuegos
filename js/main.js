/* =========================================================================
   1. VARIABLES GLOBALES Y CARGA INICIAL
   ========================================================================= */
let catalogoGlobal = [];
let catalogoCategorias = [];
let carritoGlobal = [];
let indiceSlider = 0;

async function cargarCatalogo() {
  try {
    const respuesta = await fetch('https://pagina-web-de-videojuegos.onrender.com/api/catalogo-precios');
    catalogoGlobal = await respuesta.json();
    
    pintarJuegos(catalogoGlobal);
    pintarJuegosAdmin(catalogoGlobal);
    iniciarCarrusel(catalogoGlobal);

  } catch (error) {
    console.error('Hubo un error al cargar el catálogo:', error);
  }
}

async function cargarVistaCategorias() {
  try {
    const respuesta = await fetch('https://pagina-web-de-videojuegos.onrender.com/api/catalogo-completo');
    catalogoCategorias = await respuesta.json();
    
    pintarJuegosCategorias(catalogoCategorias);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Ejecutar cargas al iniciar
cargarCatalogo();
cargarVistaCategorias();


/* =========================================================================
   2. FUNCIONES DE RENDERIZADO
   ========================================================================= */

function pintarJuegos(listaDeJuegos) {
  const contenedor = document.getElementById('contenedor-juegos');
  if (!contenedor) return;
  
  contenedor.innerHTML = ''; 

  if (!listaDeJuegos || listaDeJuegos.length === 0) {
    contenedor.innerHTML = '<p style="color: #9ca3af; text-align: center; grid-column: 1/-1;">No hay juegos disponibles.</p>';
    return;
  }

  listaDeJuegos.forEach(juego => {
    const idUnico = juego.id || juego.id_juego || 1;
    const tarjetaHTML = `
      <div class="tarjeta-juego">
        <img src=".${juego.imagen_url || ''}" alt="${juego.titulo}">
        <div class="info-juego">
          <!-- Aquí mandamos llamar la plataforma usando el nombre de tu BD -->
          <span class="consola">${juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola'}</span>
          <h3>${juego.titulo}</h3>
          <p class="descripcion">${juego.descripcion || 'Sin descripción disponible'}</p>
          <p class="precio">$${juego.precio}</p>
          <button onclick="agregarAlCarrito(${idUnico})" class="btn-comprar">Agregar al carrito</button>
        </div>
      </div>
    `;
    contenedor.innerHTML += tarjetaHTML;
  });
}

function pintarJuegosCategorias(lista) {
  const contenedor = document.getElementById('contenedor-juegos-categorias');
  if (!contenedor) return;
  
  contenedor.innerHTML = ''; 

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = '<p style="color: #9ca3af; text-align: center; grid-column: 1/-1;">No hay juegos en esta categoría.</p>';
    return;
  }

  lista.forEach(juego => {
    const idUnico = juego.id || juego.id_juego || 1;
    const tarjetaHTML = `
      <div class="tarjeta-juego">
        <img src=".${juego.imagen_url || ''}" alt="${juego.titulo}">
        <div class="info-juego">
          <!-- Aquí mandamos llamar la plataforma usando el nombre de tu BD -->
          <span class="consola">${juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola'}</span>
          <h3>${juego.titulo}</h3>
          <p class="consola" style="font-size: 0.75rem;">Categoría: ${juego.categoria || 'General'}</p> 
          <p class="descripcion">${juego.descripcion || 'Sin descripción'}</p>
          <p class="precio">$${juego.precio || 'Consultar precio'}</p>
          <button onclick="agregarAlCarrito(${idUnico})" class="btn-comprar">Agregar al carrito</button>
        </div>
      </div>
    `;
    contenedor.innerHTML += tarjetaHTML;
  });
}

function pintarJuegosAdmin(listaDeJuegos) {
  const contenedor = document.getElementById('contenedor-admin-juegos');
  if (!contenedor) return;
  
  contenedor.innerHTML = ''; 

  listaDeJuegos.forEach(juego => {
    const idUnico = juego.id || juego.id_juego || 1;
    const tarjetaHTML = `
      <div class="tarjeta-juego">
        <img src=".${juego.imagen_url || ''}" alt="${juego.titulo}">
        <div class="info-juego">
          <h3>${juego.titulo}</h3>
          <p class="consola">ID: ${idUnico}</p>
          <p class="precio">$${juego.precio}</p>
          <button onclick="eliminarVideojuegoPorId(${idUnico})" class="btn-comprar" style="background-color: #dc3545; margin-top: 10px; cursor: pointer;">Eliminar</button>
        </div>
      </div>
    `;
    contenedor.innerHTML += tarjetaHTML;
  });
}


/* =========================================================================
   3. FILTROS Y NAVEGACIÓN (SPA)
   ========================================================================= */

function filtrarPorPlataforma() {
  const opcionElegida = document.getElementById('filtro-plataforma').value;
  
  if (opcionElegida === 'todos') {
    pintarJuegos(catalogoGlobal);
  } else {
    const juegosFiltrados = catalogoGlobal.filter(
      juego => {
        // Se asegura de buscar en las diferentes formas en las que puede venir la consola
        const consolaJuego = juego.juegos_plataformas || juego.consola || juego.plataforma || '';
        return consolaJuego.toLowerCase() === opcionElegida.toLowerCase();
      }
    );
    pintarJuegos(juegosFiltrados);
  }
}

function filtrarPorCategoria(categoriaElegida) {
  if (categoriaElegida === 'Todos') {
    // 1. Creamos una memoria para recordar qué juegos ya vimos
    const juegosUnicos = [];
    const idsVistos = new Set();

    // 2. Revisamos todo el catálogo paso a paso
    catalogoCategorias.forEach(juego => {
      // Obtenemos su ID único exactamente como lo tienes en tu código
      const idUnico = juego.id || juego.id_juego || 1;
      
      // Si no hemos visto este ID, lo agregamos a la lista final
      if (!idsVistos.has(idUnico)) {
        idsVistos.add(idUnico);
        juegosUnicos.push(juego);
      }
    });

    // 3. Pintamos solo los juegos únicos
    pintarJuegosCategorias(juegosUnicos);
    
  } else {
    // Si elige una categoría específica (como Acción o Terror), filtramos normal
    const filtrados = catalogoCategorias.filter(
      juego => juego.categoria && juego.categoria.toLowerCase() === categoriaElegida.toLowerCase()
    );
    pintarJuegosCategorias(filtrados);
  }
}

// Control de vistas optimizado para refrescar contenido al mostrarse
function cambiarVista(nombreVista) {
  const secciones = document.querySelectorAll('body > section');
  secciones.forEach(seccion => {
    seccion.classList.remove('vista-activa');
    seccion.classList.add('vista-oculta');
  });

  let vistaAMostrar = null;
  
  if (nombreVista === 'inicio') {
    vistaAMostrar = document.getElementById('inicio');
  } 
  else if (nombreVista === 'catalogo' || nombreVista === 'categorias') {
    vistaAMostrar = document.getElementById('categorias');
    pintarJuegosCategorias(catalogoCategorias); 
  } 
  else if (nombreVista === 'plataformas') {
    vistaAMostrar = document.getElementById('plataformas');
    pintarJuegos(catalogoGlobal); 
  } 
  else if (nombreVista === 'carrito') {
    vistaAMostrar = document.getElementById('vista-carrito');
    renderizarCarrito();
  } 
  else if (nombreVista === 'admin') {
    vistaAMostrar = document.getElementById('admin');
  }

  if (vistaAMostrar) {
    vistaAMostrar.classList.remove('vista-oculta');
    vistaAMostrar.classList.add('vista-activa');
  }
}


/* =========================================================================
   4. SEGURIDAD Y LOGIN DE ADMINISTRADOR
   ========================================================================= */

function mostrarLogin() {
  const modalLogin = document.getElementById('seccion-login-admin');
  if (modalLogin) {
    modalLogin.style.display = 'flex';
  }
}

async function enviarLoginHTML() {
  const usuarioForm = document.getElementById('admin-usuario').value;
  const passwordForm = document.getElementById('admin-password').value;

  if (!usuarioForm || !passwordForm) {
    alert("Por favor completa ambos campos.");
    return;
  }

  try {
    const respuesta = await fetch('https://pagina-web-de-videojuegos.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioForm, password: passwordForm }) 
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      alert("¡Acceso concedido! " + datos.mensaje);
      localStorage.setItem('tokenGamer', datos.token);
      
      document.getElementById('seccion-login-admin').style.display = 'none';
      document.getElementById('admin-usuario').value = '';
      document.getElementById('admin-password').value = '';

      cambiarVista('admin');
      
    } else {
      alert("Acceso denegado: " + datos.error);
    }
    
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor.");
  }
}


/* =========================================================================
   5. PANEL DE ADMINISTRACIÓN
   ========================================================================= */

async function guardarNuevoJuego(event) {
  event.preventDefault();

  const token = localStorage.getItem('tokenGamer');
  if (!token) {
    alert("¡Alto ahí! No tienes permiso para guardar juegos.");
    return;
  }

  const selectCategorias = document.getElementById('nuevas-categorias');
  const categoriasSeleccionadas = [];
  
  if (selectCategorias) {
    for (let i = 0; i < selectCategorias.options.length; i++) {
      if (selectCategorias.options[i].selected) {
        categoriasSeleccionadas.push(selectCategorias.options[i].value);
      }
    }
  }

  if (categoriasSeleccionadas.length === 0) {
    alert("Por favor selecciona al menos una categoría.");
    return;
  }

  const nuevoJuego = {
    titulo: document.getElementById('nuevo-titulo').value,
    descripcion: document.getElementById('nueva-descripcion').value,
    imagen_url: document.getElementById('nueva-imagen').value,
    precio: parseFloat(document.getElementById('nuevo-precio').value), 
    consola: document.getElementById('nueva-plataforma').value,
    categorias: categoriasSeleccionadas 
  };

  try {
    const respuesta = await fetch('https://pagina-web-de-videojuegos.onrender.com/api/juegos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token 
      },
      body: JSON.stringify(nuevoJuego)
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      alert("¡Éxito! " + datos.mensaje);
      document.getElementById('formulario-juego').reset();
      cargarCatalogo();
      cargarVistaCategorias();
    } else {
      alert("Hubo un error: " + datos.error);
    }
    
  } catch (error) {
    console.error("Error al intentar guardar:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

async function eliminarVideojuegoPorId(idJuego) {
  const token = localStorage.getItem('tokenGamer');
  
  if (!token) {
    alert("¡Alto ahí! No tienes permiso para realizar esta acción.");
    return;
  }

  if (!confirm(`¿Estás seguro de eliminar este juego (ID: ${idJuego})?`)) {
    return;
  }

  try {
    const respuesta = await fetch(`https://pagina-web-de-videojuegos.onrender.com/api/juegos/${idJuego}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      alert("¡Éxito! " + datos.mensaje);
      cargarCatalogo();
      cargarVistaCategorias();
    } else {
      alert("Hubo un error: " + datos.error);
    }

  } catch (error) {
    console.error("Error al intentar eliminar:", error);
    alert("No se pudo conectar con el servidor.");
  }
}


/* =========================================================================
   6. CARRUSEL DINÁMICO
   ========================================================================= */

function iniciarCarrusel(listaJuegos) {
  const track = document.getElementById('slider-track');
  if (!track) return;

  track.innerHTML = '';

  listaJuegos.forEach(juego => {
    const itemHTML = `
      <div class="tarjeta-slider">
        <div class="info-slider">
          <span class="consola-slider">${juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola'}</span>
          <h3>${juego.titulo}</h3>
          <p>${juego.descripcion || 'Sin descripción disponible'}</p>
          <span class="precio-slider">$${juego.precio}</span>
        </div>
        <div class="imagen-slider-container">
          <img src=".${juego.imagen_url || ''}" alt="${juego.titulo}">
        </div>
      </div>
    `;
    track.innerHTML += itemHTML;
  });

  if (window.intervaloCarrusel) {
    clearInterval(window.intervaloCarrusel);
  }

  window.intervaloCarrusel = setInterval(() => {
    const tarjetas = track.querySelectorAll('.tarjeta-slider');
    if (tarjetas.length === 0) return;

    indiceSlider++;
    if (indiceSlider >= tarjetas.length) {
      indiceSlider = 0;
    }

    track.style.transform = `translateX(-${indiceSlider * 100}%)`;
  }, 4000);
}

/* =========================================================================
   7. GESTIÓN DEL CARRITO Y WHATSAPP
   ========================================================================= */

function agregarAlCarrito(idJuego) {
  const juegoEncontrado = catalogoGlobal.find(j => (j.id == idJuego || j.id_juego == idJuego));
  if (!juegoEncontrado) return;

  carritoGlobal.push(juegoEncontrado);
  actualizarContadorCarrito();
  renderizarCarrito();
  
  alert(`¡${juegoEncontrado.titulo} se agregó al carrito!`);
}

function actualizarContadorCarrito() {
  const contador = document.getElementById('contador-carrito');
  if (contador) {
    contador.textContent = carritoGlobal.length;
  }
}

function renderizarCarrito() {
  const contenedorItems = document.getElementById('lista-carrito-items');
  const spanTotal = document.getElementById('carrito-total');
  if (!contenedorItems) return;

  contenedorItems.innerHTML = '';
  let totalSuma = 0;

  if (carritoGlobal.length === 0) {
    contenedorItems.innerHTML = `<p style="text-align: center; color: #9ca3af;">Tu carrito está vacío.</p>`;
    if (spanTotal) spanTotal.textContent = '0.00';
    return;
  }

  carritoGlobal.forEach((juego, index) => {
    totalSuma += Number(juego.precio);
    const nombreConsola = juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola';
    const itemHTML = `
      <div class="item-carrito-fila">
        <div class="item-carrito-info">
          <h4>${juego.titulo} (${nombreConsola})</h4>
          <span>$${juego.precio}</span>
        </div>
        <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar-item">Eliminar</button>
      </div>
    `;
    contenedorItems.innerHTML += itemHTML;
  });

  if (spanTotal) spanTotal.textContent = totalSuma.toFixed(2);
}

function eliminarDelCarrito(index) {
  carritoGlobal.splice(index, 1);
  actualizarContadorCarrito();
  renderizarCarrito();
}

function realizarCompraWhatsApp() {
  if (carritoGlobal.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let mensaje = "Hola, ¡quiero realizar la compra de los siguientes juegos:%0A";
  let total = 0;

  carritoGlobal.forEach((juego, i) => {
    const nombreConsola = juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola';
    mensaje += `%0A${i + 1}. *${juego.titulo}* (${nombreConsola}) - $${juego.precio}`;
    total += Number(juego.precio);
  });

  mensaje += `%0A%0A*Total a pagar: $${total.toFixed(2)}*%0AQuedo a la espera de las instrucciones de pago.`;

  const numeroWhatsApp = "524922686525"; 
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

  window.open(urlWhatsApp, '_blank');
}

// =========================================
// LÓGICA DEL MENÚ DE HAMBURGUESA
// =========================================
function inicializarMenuHamburguesa() {
    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const navPrincipal = document.getElementById('nav-principal');
    const overlay = document.getElementById('overlay-menu');
    const linksMenu = document.querySelectorAll('#nav-principal a'); // Todos los links

    // Función que alterna las clases 'active'
    function toggleMenu() {
        btnHamburguesa.classList.toggle('active');
        navPrincipal.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Evita que la página principal se mueva de fondo cuando el menú está abierto
        document.body.classList.toggle('no-scroll');
    }

    // 1. Clic en el botón de hamburguesa
    btnHamburguesa.addEventListener('click', toggleMenu);

    // 2. Clic en la capa oscura (cierra el menú)
    overlay.addEventListener('click', toggleMenu);

    // 3. Clic en cualquier link del menú (cierra el menú para ir a la sección)
    linksMenu.forEach(link => {
        link.addEventListener('click', () => {
            // Solo si el menú está abierto (tiene la clase active)
            if (navPrincipal.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

// Ejecutamos la función cuando cargue el DOM
document.addEventListener('DOMContentLoaded', inicializarMenuHamburguesa);