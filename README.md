# Mosaico: Agenda de Contactos

**Mosaico** es una aplicación web simple para la gestión de una agenda de contactos (**CRUD**), implementada en el backend con **Node.js** y **Express**, y utilizando **Handlebars** como motor de plantillas para la interfaz de usuario. Los datos persisten de forma local en un archivo JSON.

---

## ⚙️ Instalación y Configuración del Entorno (Node.js y Express)

Para ejecutar este proyecto, necesitas tener **Node.js** instalado en tu sistema.

1.  **Clonar el repositorio**:
    ```bash
    git clone [URL_DEL_REPOSiTORIO]
    cd mosaico-agenda-de-contactos
    ```

2.  **Instalar dependencias**:
    El proyecto utiliza dependencias definidas en `package.json`. Ejecuta el siguiente comando para instalarlas:
    ```bash
    npm install
    ```

3.  **Ejecución del Servidor**:

    * **Modo Producción**: Inicia el servidor de forma estándar.
        ```bash
        npm start
        ```
    * **Modo Desarrollo**: Utiliza `nodemon` (si está instalado como dependencia de desarrollo) para recargar automáticamente el servidor al detectar cambios en los archivos.
        ```bash
        npm run dev
        ```

El servidor se ejecutará en **http://localhost:3000**.

---

## 📂 Estructura del Proyecto

La estructura del proyecto separa la lógica de negocio, las utilidades de datos, las rutas del servidor y la interfaz de usuario.

```
.
├── classes/
│   ├── Contacto.js           \# Clase Modelo para un contacto.
│   └── ContactosAdmin.js     \# Lógica de Negocio (Controlador/Manejo CRUD).
├── public/
│   ├── css/
│   │   └── style.css         \# Estilos CSS personalizados.
│   └── js/
│       ├── scriptContactos.js  \# Lógica del Frontend (Manejo de UI y Listeners).
│       ├── contactosFetch.js   \# Wrapper para Fetch API con manejo de errores HTTP.
│       └── scriptNavbar.js     \# Lógica para activar enlaces en la barra de navegación.
├── utils/
│   └── fileUtils.js          \# Módulo para leer y escribir en archivos JSON locales (fs/promises).
├── views/
│   ├── layouts/
│   │   └── main.hbs          \# Plantilla principal (incluye Bootstrap y scripts base).
│   ├── partials/
│   │   ├── footer.hbs        \# Pie de página.
│   │   ├── header.hbs        \# Encabezado principal.
│   │   ├── navbar.hbs        \# Barra de navegación.
│   │   └── headScripts.hbs   \# Inclusión dinámica de scripts de cliente (JS).
│   ├── contactos.hbs         \# Vista principal (Formulario y Tabla de Contactos).
│   └── error.hbs             \# Vista para mostrar errores amigables.
├── server.js                 \# Configuración de Express, motor de vistas y rutas (API REST).
├── contactos.json            \# Archivo de persistencia de datos.
└── package.json              \# Configuración del proyecto y dependencias.
```

---

## 📦 Dependencias Utilizadas

Las dependencias se gestionan a través de `package.json`:

### Dependencias Principales

| Dependencia | Versión | Descripción |
| :--- | :--- | :--- |
| **express** | `^5.1.0` | Framework de backend para Node.js. |
| **express-handlebars** | `^8.0.3` | Motor de plantillas Handlebars para Express. |
| **chalk** | `^5.6.2` | Utilidad para aplicar estilos de color a la salida de la consola (para logs del servidor). |

### Dependencias de Desarrollo

| Dependencia | Versión | Descripción |
| :--- | :--- | :--- |
| **nodemon** | `^3.1.10` | Herramienta para recargar automáticamente la aplicación durante el desarrollo. |

---

## 💾 Persistencia de Datos

La aplicación utiliza un sistema de persistencia de datos basado en archivos locales, ideal para proyectos pequeños o de prueba.

* **Archivo de Persistencia**: Todos los contactos se almacenan en el archivo **`contactos.json`**.
* **`fileUtils.js`**: Este módulo maneja directamente las operaciones de E/S de archivos (`readFile` y `writeFile` de `fs/promises`), asegurando la lectura como JSON y el guardado con formato legible (`JSON.stringify(..., null, 2)`).
* **`ContactosAdmin.js`**: La lógica de negocio utiliza `fileUtils.js` para la lectura y escritura, aislando las operaciones de persistencia del resto de la aplicación.

---

## 🛑 Manejo de Errores

El manejo de errores se divide entre el servidor (Node.js/Express) y el cliente (JavaScript).

### 1. Manejo de Errores en el Servidor (`server.js`)
* Se utiliza un **middleware de errores**.
* Los errores de lógica de negocio (lanzados por `ContactosAdmin.js`, como "Contacto no encontrado") son capturados.
* Para errores de API, se envía una respuesta **JSON** al cliente con el estado HTTP apropiado (generalmente `500 Internal Server Error`) y el mensaje detallado del error (`{ error: { message: ... } }`).
* Los errores al leer inicialmente el archivo de persistencia lanzan un `404 Not Found` y se renderiza la vista `error.hbs`.
* Las rutas no definidas también renderizan `error.hbs` con un estado `404`.

### 2. Manejo de Errores en el Cliente (`contactosFetch.js` y `scriptContactos.js`)
* **`contactosFetch.js`**:
    * Es un *wrapper* de la función nativa `fetch`.
    * Maneja errores de red.
    * Detecta respuestas HTTP fallidas (códigos 4xx/5xx).
    * Intenta leer el cuerpo de la respuesta JSON para obtener el mensaje de error detallado enviado por el servidor (`data.error.message`) y lanza un `Error` con este mensaje.
* **`scriptContactos.js`**:
    * Contiene la lógica de la UI.
    * Utiliza `contactosFetch` para todas las operaciones CRUD.
    * Captura los errores lanzados y los muestra al usuario a través de un componente **Toast** de Bootstrap, proporcionando una experiencia de usuario más fluida que una página de error completa.

---

## 🧪 Pruebas

1. El código incluye un mecanismo simple en `scriptContactos.js` para simular fallos de prueba:

```javascript
// Dentro de ProductsUI.js
constructor (test = false) { 
    // ...
    this.test = test;
    // ...
}

// Ejemplo de uso en la función delete:
await productFetch(`/contactos/${this.test?999:btnEliminar.dataset.id}`, 
    {
        method: 'DELETE'
    }
);
```

Al pasar `test = true` a la clase `ProductsUI` al final de `scriptContactos.js`, las solicitudes `DELETE` y `PUT` intentarán usar el ID `999`. Dado que este ID probablemente no existe en `products.json`, esto forzará un error 500/404 que será capturado por el `try...catch` del frontend, permitiendo verificar el correcto funcionamiento del `showToast` y la captura de error al actualizar o eliminar productos.

`Error: Producto ID: ${id}, no encontrado. No se ha realizado la actualización`

`Error: Producto ID: ${id}, no encontrado. No se ha realizado la eliminación`

2. Cambiar los permisos del archivo contactos.json para que permita solo lectura. Esto levanta errores que se muestran en consola del servidor, consola del browser, y mensajes al usuario en toast de bootstrap.

`Error: ([CREATE, UPDATE, DELETE]) No se pudo escribir en el archivo de datos.`

3. Si en el archivo server.js se cambia el valor de `const archivoPersistencia = "contactos.json";` o el archivo `contactos.json` no existe en la raiz del proyecto, se registran errores en la consola del servidor, consola del browser y se renderiza una página de error con el mensaje:

`Error: (READ) No se pudo leer el archivo de productos.`

4. La ruta en "Informacion" no ha sido definida, por lo tanto deriva a la página de error 404.
-----

## 👨‍💻 Autor

**José Miguel Salas M**