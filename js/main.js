/* =========================================================================
   1. VARIABLES GLOBALES Y CARGA INICIAL
   ========================================================================= */

// URL base del backend (todas las llamadas usan esta constante)
const API_URL = 'https://pagina-web-de-videojuegos.onrender.com';

let catalogoGlobal = [];      // Catálogo completo de la vista Plataformas
let catalogoCategorias = [];  // Catálogo con categorías (vista Categorías)
let carritoGlobal = [];       // Productos añadidos al carrito
let indiceSlider = 0;         // Diapositiva actual del carrusel

async function cargarCatalogo() {
  mostrarEsqueletos('#contenedor-juegos', 8);

  try {
    const respuesta = await fetch(`${API_URL}/api/catalogo-precios`);
    catalogoGlobal = await respuesta.json();

    pintarJuegos(catalogoGlobal);
    pintarJuegosAdmin(catalogoGlobal);
    iniciarCarrusel(catalogoGlobal);

  } catch (error) {
    console.error('Hubo un error al cargar el catálogo:', error);
  }
}

async function cargarVistaCategorias() {
  mostrarEsqueletos('#contenedor-juegos', 8);

  try {
    const respuesta = await fetch(`${API_URL}/api/catalogo-completo`);
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

  const juegosFusionados = {};

  lista.forEach(juego => {
    const tituloJuego = juego.titulo.trim().toLowerCase();
    const categoriaActual = juego.categoria;

    if (!juegosFusionados[tituloJuego]) {
      juegosFusionados[tituloJuego] = { ...juego, listaCategorias: [] };
    }

    if (categoriaActual && categoriaActual.toLowerCase() !== 'todos') {
      if (!juegosFusionados[tituloJuego].listaCategorias.includes(categoriaActual)) {
        juegosFusionados[tituloJuego].listaCategorias.push(categoriaActual);
      }
    }
  });

  const juegosUnicos = Object.values(juegosFusionados);

  juegosUnicos.forEach(juego => {
    const idUnico = juego.id || juego.id_juego || 1;
    const textoCategorias = juego.listaCategorias.length > 0
                            ? juego.listaCategorias.join(', ')
                            : 'General';

    const tarjetaHTML = `
      <div class="tarjeta-juego">
        <img src=".${juego.imagen_url || ''}" alt="${juego.titulo}">
        <div class="info-juego">
          <span class="consola">${juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola'}</span>
          <h3>${juego.titulo}</h3>
          <p class="consola" style="font-size: 0.75rem;">Categorías: ${textoCategorias}</p>
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
   3. FILTROS Y NAVEGACIÓN (SPA) - CHIPS Y ORDENAMIENTO
   ========================================================================= */

// 1. Activar el chip de plataforma seleccionado y filtrar
function seleccionarChip(elementoBtn, valorPlataforma) {
  const grupoPlataforma = elementoBtn.closest('.filtro-grupo-limpio');
  if (grupoPlataforma) {
    const chips = grupoPlataforma.querySelectorAll('.chip-btn');
    chips.forEach(chip => chip.classList.remove('activo'));
  }
  
  elementoBtn.classList.add('activo');
  
  const selectOculto = document.getElementById('filtro-plataforma');
  if (selectOculto) {
    selectOculto.value = valorPlataforma;
    aplicarFiltrosPlataforma();
  }
}

// 2. Activar el botón de orden por precio seleccionado
function seleccionarOrden(elementoBtn, valorOrden) {
  const grupoOrden = document.getElementById('grupo-orden-chips');
  if (grupoOrden) {
    const botonesOrden = grupoOrden.querySelectorAll('.chip-btn:not(.btn-limpiar-orden)');
    botonesOrden.forEach(btn => btn.classList.remove('activo'));
  }
  elementoBtn.classList.add('activo');
  
  const selectOculto = document.getElementById('filtro-orden-precio');
  if (selectOculto) {
    selectOculto.value = valorOrden;
    aplicarFiltrosPlataforma();
  }
}

// 3. Quitar el filtro de orden al presionar la 'X'
function limpiarOrden() {
  const grupoOrden = document.getElementById('grupo-orden-chips');
  if (grupoOrden) {
    const botonesOrden = grupoOrden.querySelectorAll('.chip-btn:not(.btn-limpiar-orden)');
    botonesOrden.forEach(btn => btn.classList.remove('activo'));
  }
  
  const selectOculto = document.getElementById('filtro-orden-precio');
  if (selectOculto) {
    selectOculto.value = 'predeterminado';
    aplicarFiltrosPlataforma();
  }
}

// 4. Función unificada que aplica ambos filtros simultáneamente
function aplicarFiltrosPlataforma() {
  const plataformaElegida = document.getElementById('filtro-plataforma').value;
  const ordenElegido = document.getElementById('filtro-orden-precio').value;

  let juegosResultado = [...catalogoGlobal];

  // Filtrar por consola
  if (plataformaElegida && plataformaElegida !== 'todos') {
    juegosResultado = juegosResultado.filter(juego => {
      const consolaJuego = juego.juegos_plataformas || juego.consola || juego.plataforma || '';
      return consolaJuego.toLowerCase() === plataformaElegida.toLowerCase();
    });
  }

  // Ordenar por precio sobre el resultado filtrado
  if (ordenElegido === 'menor-mayor') {
    juegosResultado.sort((a, b) => Number(a.precio) - Number(b.precio));
  } else if (ordenElegido === 'mayor-menor') {
    juegosResultado.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  // Pintar los juegos en pantalla
  pintarJuegos(juegosResultado);
}

function filtrarPorCategoria(categoriaElegida) {
  if (categoriaElegida === 'Todos') {
    const juegosUnicos = [];
    const idsVistos = new Set();

    catalogoCategorias.forEach(juego => {
      const idUnico = juego.id || juego.id_juego || 1;
      if (!idsVistos.has(idUnico)) {
        idsVistos.add(idUnico);
        juegosUnicos.push(juego);
      }
    });

    pintarJuegosCategorias(juegosUnicos);
  } else {
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

function cerrarLogin() {
  const modalLogin = document.getElementById('seccion-login-admin');
  if (modalLogin) {
    modalLogin.style.display = 'none';
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
    const respuesta = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioForm, password: passwordForm })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      Swal.fire({
        icon: 'success',
        title: '¡Acceso concedido!',
        text: datos.mensaje,
        showConfirmButton: false,
        timer: 2000,
        background: '#1a1a1a',
        color: '#ffffff'
      });

      localStorage.setItem('tokenGamer', datos.token);

      document.getElementById('seccion-login-admin').style.display = 'none';
      document.getElementById('admin-usuario').value = '';
      document.getElementById('admin-password').value = '';

      cambiarVista('admin');

    } else {
      Swal.fire({ icon: 'error', title: 'Acceso denegado', text: datos.error, background: '#1a1a1a', color: '#ffffff' });
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar con el servidor.', background: '#1a1a1a', color: '#ffffff' });
  }
}


/* =========================================================================
   5. PANEL DE ADMINISTRACIÓN
   ========================================================================= */

// Función para filtrar los juegos en el panel de administración
function filtrarAdmin(evento) {
  const textoBusqueda = evento.target.value.toLowerCase().trim();

  if (!catalogoGlobal) return;

  // Filtramos sobre el catálogo global
  const juegosFiltrados = catalogoGlobal.filter(juego =>
    juego.titulo.toLowerCase().includes(textoBusqueda)
  );

  // Pintamos únicamente los resultados coincidentes en la sección admin
  pintarJuegosAdmin(juegosFiltrados);
}

async function guardarNuevoJuego(event) {
  event.preventDefault();

  const token = localStorage.getItem('tokenGamer');
  if (!token) {
    Swal.fire({ icon: 'error', title: '¡Alto ahí!', text: 'No tienes permiso para guardar juegos.', background: '#1a1a1a', color: '#ffffff' });
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
    Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Por favor selecciona al menos una categoría.', background: '#1a1a1a', color: '#ffffff' });
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
    const respuesta = await fetch(`${API_URL}/api/juegos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(nuevoJuego)
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      Swal.fire({ icon: 'success', title: '¡Juego Guardado!', text: datos.mensaje, background: '#1a1a1a', color: '#ffffff' });
      document.getElementById('formulario-juego').reset();
      cargarCatalogo();
      cargarVistaCategorias();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: datos.error, background: '#1a1a1a', color: '#ffffff' });
    }

  } catch (error) {
    console.error("Error al intentar guardar:", error);
    Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar con el servidor.', background: '#1a1a1a', color: '#ffffff' });
  }
}

async function eliminarVideojuegoPorId(idJuego) {
  const token = localStorage.getItem('tokenGamer');

  if (!token) {
    Swal.fire({ icon: 'error', title: '¡Alto ahí!', text: 'No tienes permiso para realizar esta acción.', background: '#1a1a1a', color: '#ffffff' });
    return;
  }

  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará el juego con ID: ${idJuego} para siempre.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1a1a1a',
    color: '#ffffff'
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/juegos/${idJuego}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      Swal.fire({ icon: 'success', title: '¡Eliminado!', text: datos.mensaje, background: '#1a1a1a', color: '#ffffff' });
      cargarCatalogo();
      cargarVistaCategorias();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: datos.error, background: '#1a1a1a', color: '#ffffff' });
    }

  } catch (error) {
    console.error("Error al intentar eliminar:", error);
    Swal.fire({ icon: 'error', title: 'Error de red', text: 'No se pudo conectar con el servidor.', background: '#1a1a1a', color: '#ffffff' });
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

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: `¡${juegoEncontrado.titulo} agregado!`,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: '#1a1a1a',
    color: '#ffffff'
  });
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
    Swal.fire({
      icon: 'info',
      title: 'Tu carrito está vacío',
      text: 'Explora el catálogo y agrega al menos un juego para continuar.',
      background: '#1a1a1a',
      color: '#ffffff',
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  let mensaje = "Hola, ¡quiero realizar la compra de los siguientes juegos:%0A";
  let total = 0;

  carritoGlobal.forEach((juego, i) => {
    const nombreConsola = juego.juegos_plataformas || juego.consola || juego.plataforma || 'Consola';
    mensaje += `%0A${i + 1}. *${juego.titulo}* (${nombreConsola}) - $${juego.precio}`;
    total += Number(juego.precio);
  });

  mensaje += `%0A%0A*Total a pagar: $${total.toFixed(2)}*%0AQuedo a la espera de las instrucciones de pago!.`;

  const numeroWhatsApp = "524922686525";
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

  window.open(urlWhatsApp, '_blank');
}

// LÓGICA DEL MENÚ DE HAMBURGUESA
function inicializarMenuHamburguesa() {
    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const navPrincipal = document.getElementById('nav-principal');
    const overlay = document.getElementById('overlay-menu');
    const linksMenu = document.querySelectorAll('#nav-principal a');

    function toggleMenu() {
        btnHamburguesa.classList.toggle('active');
        navPrincipal.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }

    if (btnHamburguesa) btnHamburguesa.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    linksMenu.forEach(link => {
        link.addEventListener('click', () => {
            if (navPrincipal && navPrincipal.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}


/* =========================================================================
   8. ACCESO SECRETO DE ADMINISTRADOR Y UTILIDADES
   ========================================================================= */

let secuenciaTeclas = '';
const palabraSecreta = 'admin';

document.addEventListener('keydown', (evento) => {
    secuenciaTeclas += evento.key.toLowerCase();

    if (secuenciaTeclas.length > 10) {
        secuenciaTeclas = secuenciaTeclas.slice(-10);
    }

    if (secuenciaTeclas.includes(palabraSecreta)) {
        mostrarLogin();
        secuenciaTeclas = '';
    }
});

let contadorToques = 0;
let temporizadorToques;

function toqueSecreto() {
    contadorToques++;

    if (contadorToques === 5) {
        mostrarLogin();
        contadorToques = 0;
    }

    clearTimeout(temporizadorToques);
    temporizadorToques = setTimeout(() => {
        contadorToques = 0;
    }, 2000);
}

document.addEventListener('DOMContentLoaded', inicializarMenuHamburguesa);

// BUSCADOR MINIMALISTA Y DROPDOWN TIPO XBOX
document.addEventListener('DOMContentLoaded', () => {
    const btnLupa = document.getElementById('btn-lupa');
    const envolturaBusqueda = document.getElementById('envoltura-busqueda');
    const inputPc = document.getElementById('input-busqueda-global');
    const btnCerrar = document.getElementById('btn-cerrar-busqueda');
    const dropdownPc = document.getElementById('dropdown-resultados');

    const inputCelular = document.getElementById('buscador-celular');
    const dropdownMovil = document.getElementById('dropdown-resultados-movil');

    if (btnLupa) {
        btnLupa.addEventListener('click', () => {
            envolturaBusqueda.classList.add('activo');
            inputPc.focus();
        });
    }

    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            envolturaBusqueda.classList.remove('activo');
            inputPc.value = '';
            dropdownPc.classList.remove('activo');
        });
    }

    function renderizarDropdown(evento, contenedorDropdown) {
        const textoBusqueda = evento.target.value.toLowerCase().trim();

        if (textoBusqueda.length === 0) {
            contenedorDropdown.classList.remove('activo');
            return;
        }

        const resultados = catalogoGlobal.filter(juego =>
            juego.titulo.toLowerCase().includes(textoBusqueda)
        );

        contenedorDropdown.innerHTML = '';

        if (resultados.length > 0) {
            resultados.forEach(juego => {
                const item = document.createElement('div');
                item.classList.add('item-resultado');

                const nombreConsola = juego.juegos_plataformas || juego.consola || juego.plataforma || 'Game';

                item.innerHTML = `
                    <img src=".${juego.imagen_url}" alt="${juego.titulo}" onerror="this.src='./imagenes/default.png'">
                    <div class="info-resultado">
                        <h4>${juego.titulo}</h4>
                        <span>${nombreConsola}</span>
                    </div>
                `;

                item.addEventListener('click', () => {
                    cambiarVista('categorias');
                    pintarJuegosCategorias([juego]);

                    contenedorDropdown.classList.remove('activo');
                    if (envolturaBusqueda) envolturaBusqueda.classList.remove('activo');
                    evento.target.value = '';

                    const navPrincipal = document.getElementById('nav-principal');
                    if (navPrincipal && navPrincipal.classList.contains('active')) {
                        document.getElementById('btn-hamburguesa').click();
                    }
                });

                contenedorDropdown.appendChild(item);
            });
            contenedorDropdown.classList.add('activo');
        } else {
            contenedorDropdown.innerHTML = '<div style="padding: 15px; color: #9ca3af; font-size: 0.9rem;">No se encontraron juegos</div>';
            contenedorDropdown.classList.add('activo');
        }
    }

    function manejarEnter(evento, contenedorDropdown) {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            const texto = evento.target.value.toLowerCase().trim();
            if (texto.length > 0) {
                const resultados = catalogoGlobal.filter(juego =>
                    juego.titulo.toLowerCase().includes(texto)
                );

                cambiarVista('categorias');
                pintarJuegosCategorias(resultados);

                contenedorDropdown.classList.remove('activo');
                evento.target.blur();

                const navPrincipal = document.getElementById('nav-principal');
                if (navPrincipal && navPrincipal.classList.contains('active')) {
                    document.getElementById('btn-hamburguesa').click();
                }
            }
        }
    }

    if (inputPc) {
        inputPc.addEventListener('input', (e) => renderizarDropdown(e, dropdownPc));
        inputPc.addEventListener('keydown', (e) => manejarEnter(e, dropdownPc));
    }

    if (inputCelular) {
        inputCelular.addEventListener('input', (e) => renderizarDropdown(e, dropdownMovil));
        inputCelular.addEventListener('keydown', (e) => manejarEnter(e, dropdownMovil));
    }
});

// Modal "Cómo Comprar"
function abrirModalComoComprar() {
    const modal = document.getElementById('modal-como-comprar');
    if (modal) modal.classList.add('activo');
}

function cerrarModalComoComprar() {
    const modal = document.getElementById('modal-como-comprar');
    if (modal) modal.classList.remove('activo');
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-como-comprar');
    if (e.target === modal) {
        cerrarModalComoComprar();
    }
});

// Skeletons de carga
function mostrarEsqueletos(contenedorSelector, cantidad = 8) {
    const contenedor = document.querySelector(contenedorSelector);
    if (!contenedor) return;

    let HTMLSkeletons = '';
    for (let i = 0; i < cantidad; i++) {
        HTMLSkeletons += `
            <div class="tarjeta-skeleton">
                <div class="skeleton-animacion skeleton-imagen"></div>
                <div class="skeleton-animacion skeleton-titulo"></div>
                <div class="skeleton-animacion skeleton-categoria"></div>
                <div class="skeleton-animacion skeleton-boton"></div>
            </div>
        `;
    }
    contenedor.innerHTML = HTMLSkeletons;
}

// Botón volver arriba
document.addEventListener('DOMContentLoaded', () => {
    const btnVolverArriba = document.getElementById('btn-volver-arriba');

    if (btnVolverArriba) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btnVolverArriba.classList.add('visible');
            } else {
                btnVolverArriba.classList.remove('visible');
            }
        });

        btnVolverArriba.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});