# 🎮 Zona Gamer - Catálogo y Tienda Digital de Videojuegos

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.0-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: ISC](https://img.shields.io/badge/License-ISC-brightgreen.svg)](https://opensource.org/licenses/ISC)

> **Zona Gamer** es una plataforma web full-stack moderna e interactiva para la exploración, consulta y compra directa de videojuegos digitales. El backend está desplegado en **Render** con una base de datos **MySQL en la nube (Aiven)**, cuenta con un buscador en tiempo real con resultados desplegables, y un flujo de checkout automatizado hacia WhatsApp con un panel de administración securizado mediante tokens JWT.

---

## 📋 Tabla de Contenidos
- [Características Principales](#-características-principales)
- [Demo y Despliegue](#-demo-y-despliegue)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración de Base de Datos](#-configuración-de-base-de-datos)
- [Instrucciones de Instalación](#-instrucciones-de-instalación)
- [Ejemplo Básico de Uso](#-ejemplo-básico-de-uso)
- [Endpoints de la API](#-endpoints-de-la-api)

---

## 🚀 Características Principales

- **Catálogo Dinámico e Interactivo:** Navegación fluida tipo SPA (*Single Page Application*) sin recargas de página.
- **Carrusel Destacado:** Presentación visual automatizada en tiempo real de los mejores títulos del catálogo.
- **Buscador en Tiempo Real:** Búsqueda minimalista con resultados desplegables estilo Xbox, disponible tanto en escritorio (botón de lupa) como en móvil.
- **Skeleton Loaders:** Pantallas de carga animadas (esqueletos) mientras se obtienen los datos de la API.
- **Filtrado Avanzado:** Filtrado dinámico por categorías (*Acción, Terror, Disparos, Carreras*) y plataformas mediante *chips* interactivos (*PlayStation 5, Xbox Series, PC, Nintendo Switch 2*), con ordenamiento por precio (menor/mayor).
- **Carrito de Compras Integrado:** Persistencia temporal de artículos seleccionados con cálculo dinámico del total a pagar.
- **Checkout directo vía WhatsApp:** Generación automática de orden formateada y redirección hacia WhatsApp para completar la compra, incluyendo modal explicativo "¿Cómo funciona la compra y entrega?".
- **SEO y Redes Sociales:** Meta tags de **Open Graph** (WhatsApp, Facebook, Discord) y **Twitter Cards** con imagen de vista previa personalizada.
- **Experiencia de Usuario:** Menú hamburguesa animado para móviles, botón flotante "volver arriba", footer con redes sociales (Discord, Instagram, Twitch) y notificaciones con **SweetAlert2**.
- **Panel Administrador Protegido:**
  - Autenticación segura mediante **JWT** (JSON Web Token).
  - Creación de nuevos videojuegos con múltiples categorías y asignación de precios por consola.
  - Eliminación en cascada de juegos del catálogo.

---

## 🌐 Demo y Despliegue

- **Frontend (GitHub Pages):** https://steneithan.github.io/Pagina-web-de-Videojuegos/
- **Backend (Render):** https://pagina-web-de-videojuegos.onrender.com

> La API se despliega gratuitamente en **Render**, por lo que la primera petición tras un periodo de inactividad puede tardar unos segundos mientras el servicio "despierta" (*cold start*).

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5 & CSS3:** Estructura semántica, diseño adaptable (*Responsive Design*) y animaciones fluidas.
- **JavaScript (Vanilla ES6+):** Lógica del cliente, manipulación reactiva del DOM y consumo de la API con `fetch`.
- **SweetAlert2:** Notificaciones y alertas modernas para el cliente.

### Backend
- **Node.js:** Entorno de ejecución JavaScript del lado del servidor.
- **Express.js (v5):** Framework web para el desarrollo de la API RESTful.
- **MySQL2 (`mysql2/promise`):** Cliente de base de datos relacional con soporte de promesas async/await.
- **JSONWebToken (JWT):** Generación y validación de tokens de seguridad para endpoints administrativos.
- **Dotenv:** Administración segura de variables de entorno.
- **CORS:** Middleware para habilitar peticiones entre el cliente y el servidor backend.
- **Render:** Plataforma de despliegue gratuito del servidor API.
- **MySQL en la nube (Aiven):** Base de datos relacional administrada con conexión segura vía **SSL**.

---

## 📂 Estructura del Proyecto

```text
Pagina Web Practicas/
│
├── index.html            # Interfaz de usuario principal (SPA, SEO, Open Graph)
├── css/
│   └── styles.css        # Estilos visuales y diseño responsivo
├── js/
│   └── main.js           # Lógica cliente (SPA, Buscador, Carrito, Fetch, Admin)
├── imagenes/
│   ├── favicon.png       # Ícono del sitio
│   ├── og-preview.png    # Imagen de vista previa para redes sociales
│   └── *.jpg             # Portadas del catálogo de juegos
│
└── backend/
    ├── server.js         # API REST con Express y MySQL (Aiven/SSL)
    ├── package.json      # Dependencias del backend
    ├── package-lock.json # Bloqueo de versiones
    ├── .gitignore        # Excluye node_modules y .env
    └── .env              # Variables de entorno (Base de datos y JWT)
```

---

## 🔧 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de iniciar:
- [Node.js](https://nodejs.org/) (Versión 18.x o superior)
- [MySQL Server](https://www.mysql.com/) (Versión 8.0 o superior) o MySQL Workbench / XAMPP / MariaDB. También puedes usar un servicio en la nube como [Aiven for MySQL](https://aiven.io/).
- Una cuenta en [Render](https://render.com/) (opcional, si deseas desplegar el backend).
- Un navegador web moderno (Chrome, Edge, Firefox, Brave).

---

## 🗄️ Configuración de Base de Datos

Crea una base de datos en MySQL con el esquema relacional requerido para ejecutar el proyecto correctamente:

```sql
CREATE DATABASE IF NOT EXISTS zona_gamer;
USE zona_gamer;

-- Tabla de Juegos
CREATE TABLE juegos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(255)
);

-- Tabla de Plataformas
CREATE TABLE plataformas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- Tabla de Categorías
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- Relación Juegos - Plataformas (con Precio)
CREATE TABLE juegos_plataformas (
  id_juego INT,
  id_plataforma INT,
  precio DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_juego, id_plataforma),
  FOREIGN KEY (id_juego) REFERENCES juegos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_plataforma) REFERENCES plataformas(id) ON DELETE CASCADE
);

-- Relación Juegos - Categorías
CREATE TABLE juegos_categorias (
  id_juego INT,
  id_categoria INT,
  PRIMARY KEY (id_juego, id_categoria),
  FOREIGN KEY (id_juego) REFERENCES juegos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Tabla de Usuarios administradores
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Registros Iniciales Recomendados
INSERT INTO plataformas (nombre) VALUES
('PlayStation 5'), ('Xbox Series'), ('PC'), ('Nintendo Switch 2');

INSERT INTO categorias (nombre) VALUES
('Acción'), ('Terror'), ('Disparos'), ('Carreras'), ('Todos');

-- Registro de un usuario Administrador de prueba
INSERT INTO usuarios (usuario, password) VALUES ('admin', 'admin123');
```

---

## 📦 Instrucciones de Instalación

### 1. Clonar o descargar el proyecto
```bash
git clone https://github.com/tu-usuario/zona-gamer.git
cd "Pagina Web Practicas"
```

### 2. Configurar el Backend
Accede al directorio `backend/` e instala las dependencias de Node.js:
```bash
cd backend
npm install
```

### 3. Configurar las Variables de Entorno
Crea o edita el archivo `.env` dentro de la carpeta `backend/` con los parámetros de tu entorno local:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=zona_gamer
JWT_SECRET=tu_secreto_super_seguro_jwt
```

> 💡 **Nota:** El backend está preparado para bases de datos en la nube como **Aiven**, ya que incluye conexión segura mediante SSL (`rejectUnauthorized: false`). Si usas un servicio en la nube, recuerda colocar también el puerto proporcionado en `DB_PORT`.

### 4. Iniciar el Servidor API
En la carpeta `backend/`, ejecuta el siguiente comando:
```bash
node server.js
```
El servidor backend estará listo escuchando en `http://localhost:3000`.

> 🚀 **Despliegue:** El backend ya se encuentra desplegado públicamente en Render (`https://pagina-web-de-videojuegos.onrender.com`), dirección que el frontend usa como `API_URL` por defecto. Si ejecutas el servidor localmente y quieres conectar el frontend a tu API local, modifica la constante `API_URL` al inicio de `js/main.js`.

### 5. Iniciar la Aplicación Frontend
Abre directamente el archivo `index.html` en tu navegador web de preferencia o utiliza la extensión **Live Server** en VS Code / CodeGPT.

---

## 💻 Ejemplo Básico de Uso

### 🛒 1. Comprar Videojuegos como Cliente
1. Abre la aplicación en tu navegador (`index.html`).
2. Explora el catálogo desde **Inicio**, **Categorías** o **Plataformas**, o usa el **buscador** (lupa 🔍 en escritorio, campo de búsqueda en móvil) para encontrar juegos al instante con resultados desplegables.
3. En la vista **Plataformas** puedes filtrar por consola y **ordenar por precio** (menor/mayor) usando los botones interactivos.
4. Presiona el botón **"Agregar al carrito"** en los juegos de tu interés.
5. Haz clic en el botón flotante del carrito 🛒 en la barra superior.
6. Revisa la lista de selección y haz clic en **"📲 Realizar compra por WhatsApp"**.
7. Se generará un enlace a WhatsApp con el desglose detallado de los juegos seleccionados y el monto total calculado.

### 👤 2. Administrar el Catálogo como Administrador
1. Haz clic en el icono de usuario 👤 ubicado en el menú superior.
2. Ingresa con las credenciales de administrador registrados (ej. Usuario: `admin`, Contraseña: `admin123`).
3. Al autenticarte correctamente, se activará la vista del **Panel de Administración**.
4. **Agregar un videojuego:** Completa el formulario con título, descripción, imagen (ej. `juego.jpg`), precio, plataforma y categorías. Presiona **"Guardar Videojuego"**.
5. **Eliminar un videojuego:** Desplázate a la sección inferior de gestión y presiona el botón **"Eliminar"** en el juego deseado. La eliminación se realizará mediante la API usando el token JWT recibido.

---

## 📡 Endpoints de la API Backend

| Método | Endpoint | Descripción | Requiere Autenticación |
| :--- | :--- | :--- | :---: |
| Base URL (producción) | `https://pagina-web-de-videojuegos.onrender.com` | Backend desplegado en Render | — |
| `GET` | `/api/catalogo-precios` | Obtiene el listado de juegos con plataforma y precio | ❌ No |
| `GET` | `/api/catalogo-completo` | Obtiene el catálogo completo incluyendo categorías | ❌ No |
| `POST` | `/api/login` | Autentica un usuario admin y devuelve token JWT | ❌ No |
| `POST` | `/api/juegos` | Crea un nuevo videojuego en el catálogo | ✅ Sí (`Bearer <token>`) |
| `DELETE` | `/api/juegos/:id` | Elimina un videojuego y sus relaciones en cascada | ✅ Sí (`Bearer <token>`) |

---

## 🔐 Notas de Seguridad

- El token JWT se guarda en el `localStorage` del navegador (`tokenGamer`) tras iniciar sesión.
- El archivo `.env` está excluido del repositorio mediante `.gitignore`; nunca subas tus credenciales.
- La conexión a la base de datos en la nube se realiza mediante **SSL**.

---

## 📝 Licencia

Este proyecto está bajo la Licencia **ISC**.
