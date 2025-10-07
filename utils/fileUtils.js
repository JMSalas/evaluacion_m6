import { readFile, writeFile } from 'fs/promises';

export const readLocalFile = async (path) => {
    try {
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(error.message);
        // Se devuelve 'null' para indicar que la operación falló de forma controlada
        return null;
    }
};

export const writeLocalFile = async (path, data) => {
    try {
        await writeFile(path, JSON.stringify(data, null, 2));   
        return true; 
    } catch (error) {
        // Manejo de errores (por ejemplo, ruta inválida o permisos insuficientes)
        console.error(error.message);
        return false;
    }
};