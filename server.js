// EMS 6
import express from "express";
import { engine } from "express-handlebars";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { ContactosAdmin } from "./classes/ContactosAdmin.js";

// Recrear __dirname para EMS 6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuración del motor de vistas Handlebars
app.engine(
  ".hbs",
  engine({
    defaultLayout: "main", // El layout principal por defecto (ej. views/layouts/main.hbs)
    layoutsDir: path.join(__dirname, "views/layouts"), // Directorio de los layouts
    partialsDir: path.join(__dirname, "views/partials"), // Directorio de los partials
    extname: ".hbs", // La extensión de los archivos de plantilla
    //Helpers
    helpers: {
      actualYear() {
        const actualDate = new Date();
        return actualDate.getFullYear();
      },
    },
  })
);

// Motor Vistas
app.set("view engine", ".hbs"); // Establece handlebars como el motor de vistas
app.set("views", path.join(__dirname, "views")); // Establece el directorio raíz de las vistas

// Middleware contenido estático
app.use(express.static("public"));

// Middleware recibir JSON en req
app.use(express.json());

// Administrador Contactos
const archivoPersistencia = "contactos.json";
const contactosAdmin = new ContactosAdmin(path.join(path.dirname(__filename), archivoPersistencia));

// Rutas
app
  .route("/")
  .get((req, res) => {
    res.redirect("/contactos");
  });

app
  .route("/contactos")
  .get(async (req, res) => {      
    const contactos = await contactosAdmin.getContactos();
    res.status(200).render("contactos", {
      title: "Mosaico",
      contactos: contactos,
      pageScripts: ["scriptNavbar", "scriptContactos"],   
    });
  })
  .post(async (req, res) => {
    // Agrego nuevo contacto a archivo .json
    const contacto = await contactosAdmin.agregarContacto(req.body);

    // Si se agrega el nuevo contacto, enviar la respuesta 201.
    res.status(201).json(contacto); 
  });

app
  .route("/contactos/:id")
  .put(async (req, res) => {
    // Actualizar la contacto.
    const contacto = await contactosAdmin.actualizarContacto(req.params.id, req.body);

    // Si se actualiza el contacto, enviar la respuesta 201.
    res.status(201).json(contacto);
  })
  .delete(async (req, res) => {
    // Eliminar Contacto
    await contactosAdmin.eliminarContacto(req.params.id);

    // Responder con el código estándar para DELETE exitoso sin contenido.
    res.sendStatus(204); // 204 No Content
  });

// Middleware de Manejo de Errores Personalizado
// Debe ser el último middelware agregado y debe tener la firma o signature de cuatro argumentos: (err, req, res, next)
app.use((err, req, res, next) => {  
  // Delegar al manipulador de errores por defecto de Express, si los headers de la respuesta ya han sido enviados al cliente.
  if (res.headersSent) {
    console.error(chalk.redBright("*** Error capturado por el manipulador de errores por defecto ***"));
    return next(err);
  }
  
  // Logear el error para el desarrollador
  console.error(chalk.redBright("*** Error capturado por el middleware de errores ***"));
  console.error(chalk.redBright(err));

  // Error al leer inicialmente el archivo de persistencia
  if (err.message == '(READ) No se pudo leer el archivo de datos.') {
    res.status(404);   
    res.render("error", {
    title: `Error ${res.statusCode}`,
    error: {
      message: err.message
    },
    pageScripts: ["scriptNavbar"],
    });
    return;
  }

  // Determinar el estado y el mensaje
  // Para errores lanzados desde ContactosAdmin, usar Code 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';

  // Enviar la respuesta al cliente
  res.status(statusCode).json({
      error: {
        message: message,
      }
  });
});

// Manejar rutas no capturadas anteriormente
app.all("/{*ruta}", (req, res) => {
  const ruta = `http://localhost:${port}/${req.params.ruta}`;
  res.status(404);
  res.render("error", {
    title: `Error ${res.statusCode}`,
    error: {
      message: `Página ruta "${ruta}", no encontrada`
    },
    pageScripts: ["scriptNavbar"],
  });
});

// Puerto
app.listen(port, () => {
  console.log(chalk.blue(`Servidor corriendo en http://localhost:${port}`));
});
