/* =========================================================================
   1. IMPORTACIONES Y CONFIGURACIÓN INICIAL DEL SERVIDOR
   ========================================================================= */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // <-- Agregamos la variable del puerto
    ssl: {
        rejectUnauthorized: false // <-- El escudo de seguridad para Aiven
    }
};

const puerto = process.env.PORT || 3000; // Lo regresamos a 3000 para el servidor
const jwtSecret = process.env.JWT_SECRET;


/* =========================================================================
   2. ENDPOINTS DE CONSULTA (GET)
   ========================================================================= */

app.get('/api/catalogo-precios', async (req, res) => {
  console.log("-> Alguien pidió el catálogo de precios");
  try {
    const conexion = await mysql.createConnection(dbConfig);
    
    const consultaSQL = `
      SELECT 
        juegos.id AS id,
        juegos.titulo, 
        juegos.descripcion,
        juegos.imagen_url,
        plataformas.nombre AS consola, 
        juegos_plataformas.precio
      FROM juegos
      JOIN juegos_plataformas ON juegos.id = juegos_plataformas.id_juego
      JOIN plataformas ON juegos_plataformas.id_plataforma = plataformas.id;
    `;
    
    const [precios] = await conexion.execute(consultaSQL);
    await conexion.end();
    
    res.json(precios);

  } catch (error) {
    console.error('ERROR REAL DE MYSQL:', error);
    res.status(500).json({ error: error.message }); 
  }
});

// Endpoint corregido para incluir explícitamente el ID del juego
app.get('/api/catalogo-completo', async (req, res) => {
  console.log("-> Alguien pidió el catálogo completo con categorías");
  try {
    const conexion = await mysql.createConnection(dbConfig);
    
    const consultaSQL = `
      SELECT 
        juegos.id AS id,
        juegos.titulo, 
        juegos.descripcion, 
        juegos.imagen_url, 
        categorias.nombre AS categoria,
        juegos_plataformas.precio,
        plataformas.nombre AS consola
      FROM juegos
      JOIN juegos_categorias ON juegos.id = juegos_categorias.id_juego
      JOIN categorias ON juegos_categorias.id_categoria = categorias.id
      LEFT JOIN juegos_plataformas ON juegos.id = juegos_plataformas.id_juego
      LEFT JOIN plataformas ON juegos_plataformas.id_plataforma = plataformas.id;
    `;
    
    const [catalogo] = await conexion.execute(consultaSQL);
    await conexion.end();
    
    res.json(catalogo);

  } catch (error) {
    console.error('Error detallado en catálogo completo:', error);
    res.status(500).json({ error: error.message });
  }
});


/* =========================================================================
   3. ENDPOINT DE AUTENTICACIÓN (LOGIN)
   ========================================================================= */

app.post('/api/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    
    const conexion = await mysql.createConnection(dbConfig);
    
    const consultaSQL = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';
    const [resultado] = await conexion.execute(consultaSQL, [usuario, password]);
    
    await conexion.end();

    if (resultado.length > 0) {
      const token = jwt.sign({ usuario: usuario }, jwtSecret, { expiresIn: '1h' });
      res.json({ mensaje: '¡Bienvenido administrador!', token: token });
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

  } catch (error) {
    console.error('Error al intentar iniciar sesión:', error);
    res.status(500).json({ error: error.message });
  }
});


/* =========================================================================
   4. ENDPOINT DE REGISTRO (POST)
   ========================================================================= */

app.post('/api/juegos', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).json({ error: 'Acceso denegado: No hay token de seguridad' });
    }
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret);

    const { titulo, descripcion, imagen_url, precio, consola, categorias } = req.body;
    
    const conexion = await mysql.createConnection(dbConfig);
    
    const [resJuego] = await conexion.execute(
      'INSERT INTO juegos (titulo, descripcion, imagen_url) VALUES (?, ?, ?)',
      [titulo, descripcion, imagen_url]
    );
    const idNuevoJuego = resJuego.insertId;

    const [resPlat] = await conexion.execute(
      'SELECT id FROM plataformas WHERE nombre = ?',
      [consola]
    );

    if (resPlat.length > 0) {
      const idPlataformaReal = resPlat[0].id;
      await conexion.execute(
        'INSERT INTO juegos_plataformas (id_juego, id_plataforma, precio) VALUES (?, ?, ?)',
        [idNuevoJuego, idPlataformaReal, precio]
      );
    }

    if (Array.isArray(categorias) && categorias.length > 0) {
      for (const nombreCategoria of categorias) {
        const [resCat] = await conexion.execute(
          'SELECT id FROM categorias WHERE nombre = ?',
          [nombreCategoria]
        );
        
        if (resCat.length > 0) {
          const idCategoria = resCat[0].id;
          await conexion.execute(
            'INSERT INTO juegos_categorias (id_juego, id_categoria) VALUES (?, ?)',
            [idNuevoJuego, idCategoria]
          );
        }
      }
    }

    await conexion.end();
    res.status(201).json({ mensaje: 'Juego, precio y múltiples categorías guardados con éxito' });

  } catch (error) {
    console.error('Error al guardar en el servidor:', error);
    res.status(500).json({ error: error.message });
  }
});


/* =========================================================================
   5. ENDPOINT DE ELIMINACIÓN (DELETE)
   ========================================================================= */

app.delete('/api/juegos/:id', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).json({ error: 'Acceso denegado: No hay token de seguridad' });
    }
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret);

    const idJuego = req.params.id;
    const conexion = await mysql.createConnection(dbConfig);

    await conexion.execute('DELETE FROM juegos_categorias WHERE id_juego = ?', [idJuego]);
    await conexion.execute('DELETE FROM juegos_plataformas WHERE id_juego = ?', [idJuego]);
    
    const [resultado] = await conexion.execute('DELETE FROM juegos WHERE id = ?', [idJuego]);

    await conexion.end();

    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Juego y todas sus referencias eliminadas con éxito' });
    } else {
      res.status(404).json({ error: 'No se encontró un juego con ese ID' });
    }

  } catch (error) {
    console.error('Error al eliminar en el servidor:', error);
    res.status(500).json({ error: error.message });
  }
});


/* =========================================================================
   6. INICIO Y ARRANQUE DEL SERVIDOR
   ========================================================================= */

app.listen(puerto, () => {
  console.log(`Servidor backend encendido y escuchando en http://localhost:${puerto}`);
});