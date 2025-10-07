// Ejecuta una solicitud fetch y maneja errores de red y de respuesta HTTP.
export async function contactosFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        // Si la respuesta es exitosa (código 2xx), devolver el JSON.
        if (response.ok) {
            // Verificar si hay contenido antes de intentar parsear JSON.
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            // Si no es JSON (ej. DELETE sin body), devuelve un objeto vacío o null.
            return null; 
        } 
        
        // --- Manejo de errores HTTP (4xx o 5xx) ---
        let errorMessage = `Error en la solicitud: ${response.status} ${response.statusText}`;

        try {
            // Intenta leer el cuerpo de la respuesta para obtener un mensaje detallado del servidor.
            const data = await response.json(); 
            
            if (data && data.error?.message) {
                errorMessage = data.error.message; // Usa el mensaje detallado del servidor
            }
        } catch (e) {
            // No era JSON o falló la lectura del JSON. Mantiene el mensaje de estado HTTP.
            console.warn(`Respuesta de error para ${url} no era JSON. Se usará el mensaje de estado HTTP.`);
        }

        // Lanza un error que será capturado por el bloque 'catch' externo.
        throw new Error(errorMessage);

    } catch (error) {
        // Maneja errores de red o el error lanzado anteriormente.
        console.error('Error de conexión o fallo:', error.message);
        throw error; // Re-lanza para que la función que llama pueda manejar el fallo (ej. evitar actualización de UI)
    }
}