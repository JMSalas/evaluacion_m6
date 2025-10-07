document.addEventListener("DOMContentLoaded", () => {
    // Obtiene la ruta actual de la URL. Ejemplo: "/servicios"
    const currentPath = window.location.pathname;

    // Obtiene todos los enlaces dentro de tu navegación
    const navLinks = document.querySelectorAll('#navBar .nav-link');

    navLinks.forEach(link => {
        // Obtiene el valor del atributo 'href' de cada enlace
        const linkPath = link.getAttribute('href');

        // Compara la ruta de la URL con la ruta del enlace.
        // Se usa .startsWith() para ser más flexible, útil si las rutas tienen sub-segmentos (ej. /servicios/detalle).
        // Esto evita que siempre se active linkPath = '/' si los enlaces incluye "/" en su ruta
        if (currentPath.startsWith(linkPath) && linkPath !== '/') {
            // Si la ruta coincide, se activa
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } 
        
        // Manejo especial para la página de inicio (ruta base '/')
        if (currentPath === '/' && linkPath === '/') {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
});