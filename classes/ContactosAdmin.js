import { writeLocalFile, readLocalFile} from  '../utils/fileUtils.js';
import { Contacto } from './Contacto.js';

export class ContactosAdmin {
    constructor (path) {
        this.path = path;
    }
    
    async getContactos(method = 'READ') {
        const contactos = await readLocalFile(this.path);
        if (contactos === null) {
            throw new Error(`(${method}) No se pudo leer el archivo de datos.`);
        }
        return contactos;
    }

    async setContactos(contactos, method) {
        const success = await writeLocalFile(this.path, contactos);
        if (!success) {
            throw new Error(`(${method}) No se pudo escribir en el archivo de datos.`);
        }
        return success;
    }
    
    async agregarContacto(data) {
        const method = 'CREATE';
        const contactos = await this.getContactos(method);
        let newID;

        if(contactos.length > 0) {
            // Encontrar el ID mas alto en caso que la lista este desordenada.
            const maxID = Math.max(...contactos.map(contacto => contacto.id));
            // Definir Proximo ID
            newID = maxID + 1;
        } else {
            // Si la lista está vacía, empezar en 1.
            newID = 1;
        }

        const { nombre, telefono, correo } = data
        const nuevoContacto = new Contacto(newID, nombre, telefono, correo);
        
        contactos.push(nuevoContacto);

        await this.setContactos(contactos, method);
        return nuevoContacto;
    }

    async actualizarContacto(id, data) {
        const method = 'UPDATE';
        const contactos = await this.getContactos(method);
        const contactoSeleccionado = contactos.find(contacto => contacto.id == id);
        
        if (!contactoSeleccionado)
            throw new Error(`Contacto ID: ${id}, no encontrado. No se ha realizado actualización`);

        contactoSeleccionado.nombre = data.nombre;
        contactoSeleccionado.telefono = data.telefono;
        contactoSeleccionado.correo = data.correo;
        
        await this.setContactos(contactos, method);
        return contactoSeleccionado;
    }

    async eliminarContacto(id) {
        const method = 'DELETE';
        const contactos = await this.getContactos(method);
        const index = contactos.findIndex(contacto => contacto.id == id);

        if (index === -1)
            throw new Error(`Contacto ID: ${id}, no encontrado. No se ha realizado la eliminación`);

        contactos.splice(index, 1);
        await this.setContactos(contactos, method);
        return true;
    }
}