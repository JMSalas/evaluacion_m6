import { contactosFetch } from "./contactosFetch.js";

class ContactosUI {
    constructor (test = false) {
        this.formAgregarContacto = document.querySelector('#formAgregarContacto');
        this.nombreInput = this.formAgregarContacto.querySelector('#nombreInput');
        this.telefonoInput = this.formAgregarContacto.querySelector('#telefonoInput');
        this.correoInput = this.formAgregarContacto.querySelector('#correoInput');
        this.contactosTableBody = document.querySelector('tbody');
        this.emptyAlert = document.querySelector('#emptyAlert');
        this.actualizarContactoModal = document.querySelector('#actualizarContacto');
        this.formActualizarContacto = this.actualizarContactoModal.querySelector('#formActualizarContacto');
        this.nuevoNombreInput = this.formActualizarContacto.querySelector('#nuevoNombreInput');
        this.nuevoTelefonoInput = this.formActualizarContacto.querySelector('#nuevoTelefonoInput');
        this.nuevoCorreoInput = this.formActualizarContacto.querySelector('#nuevoCorreoInput');
        this.updateButton = this.actualizarContactoModal.querySelector('#updateButton');
        this.spanId = this.actualizarContactoModal.querySelector('#spanId');
        this.test = test;
        this.tableRow = undefined; // Fila de la tabla contactos, seleccionada actualmente
    }

    // Cambiar la visibilidad de la tabla y la alerta de "Agenda vacía" cuando la tabla de contacto este vacia 
    toogleAlertAndTable(isTableEmpty) {
        if (isTableEmpty) {
            this.contactosTableBody.parentElement.classList.toggle('d-none');
            emptyAlert.classList.toggle('d-none');  
        }
    }

    // Agregar un contacto a la tabla de contactos HTML
    agregarContacto(contacto) {
        // Crear un nuevo elemento fila
        const tableRow = document.createElement('tr');
        // Agregar contenido HTML con informacion del contacto agregado
        tableRow.innerHTML = `
            <th>${ contacto.id }</th>
            <td data-contacto-nombre>${ contacto.nombre }</td>
            <td data-contacto-telefono>${ contacto.telefono }</td>
            <td data-contacto-correo>${ contacto.correo }</td>
            <td class="smallColumn">
                <div class="d-flex justify-content-evenly">
                    <button class="btn btn-outline-dark" data-id="${ contacto.id }" data-bs-toggle="modal" data-bs-target="#actualizarContacto"><i class="bi bi-pencil-square"></i> Editar</button>
                    <button class="btn btn-outline-danger" data-id="${ contacto.id }" data-button="delete"><i class="bi bi-trash3-fill"></i> Eliminar</button>     
                </div>
            </td>
        `;

        // Verificar y cambiar visibilidad de la tabla de contactos y alerta agenda vacía 
        this.toogleAlertAndTable (!this.contactosTableBody.childElementCount);
        // Agregar nueva fila a la tabla de contactos
        this.contactosTableBody.appendChild(tableRow);
        this.formAgregarContacto.reset();
    }

   // Eliminar un contacto de la tabla de contactos HTML
    eliminarContacto() {
        // Eliminar fila de contacto seleccionado
        this.tableRow.remove();
        // Verificar y cambiar visibilidad de la tabla de contactos y alerta de agenda vacía 
        this.toogleAlertAndTable (!this.contactosTableBody.childElementCount);
    }

    // Cargar datos en Modal de Contacto a Editar
    cargarDatosModal(id) {
        // Transferir id al boton del modal
        this.updateButton.setAttribute('data-id',id);
        // Actualizar span del Modal
        this.spanId.textContent = id; 

        // Obtener las celdas de datos dentro de la fila
        const nombreCell = this.tableRow.querySelector('[data-contacto-nombre]');
        const telefonoCell = this.tableRow.querySelector('[data-contacto-telefono]');
        const correoCell = this.tableRow.querySelector('[data-contacto-correo]');
        
        // Extraer valores y cargar en el Modal
        this.nuevoNombreInput.value = nombreCell.textContent.trim();
        this.nuevoTelefonoInput.value = telefonoCell.textContent.trim();
        this.nuevoCorreoInput.value = correoCell.textContent.trim();

        // Deshabilitar el botón de actualización al cargar los datos
        this.updateButton.disabled = true;
    }

    // Actualizar datos en la tabla de contactos con datos del contacto actualizado
    actualizarContacto(contacto) {
        // Obtener las celdas de datos dentro de la fila
        const tdNombre = this.tableRow.querySelector('[data-contacto-nombre]');
        const tdTelefono = this.tableRow.querySelector('[data-contacto-telefono]');
        const tdCorreo = this.tableRow.querySelector('[data-contacto-correo]');

        tdNombre.textContent = contacto.nombre;
        tdTelefono.textContent = contacto.telefono;
        tdCorreo.textContent = contacto.correo;
    }

    // Nuevo método para mostrar el error como un Toast
    showToast(message, type = 'danger', title = 'Error del Servidor') {
        const toastElement = document.querySelector('#toastError');
        const toastHeader = toastElement.querySelector('.toast-header strong');
        const toastBody = document.querySelector('#toastErrorMessage');

        // Actualizar el contenido y titulo
        toastHeader.textContent = title;
        toastBody.textContent = message;

        // Elimina cualquier clase de fondo anterior (peligro, éxito, etc.)
        toastElement.classList.remove('text-bg-danger', 'text-bg-success', 'text-bg-warning', 'text-bg-info');
        toastElement.classList.add(`text-bg-${type}`);
        
        // Inicializar y mostrar el Toast
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000 // Se oculta después de 5 segundos
        });
        toast.show();
    }

    // Agregar listeners a los elementos de la intefaz
    addListeners() {
        // Agregar EventListener al formulario agregar contacto
        this.formAgregarContacto.addEventListener('submit', async (event) => {
            // Detener el envío tradicional del formulario
            event.preventDefault();

            // Preparar datos a enviar
            const data = {
                nombre : this.nombreInput.value.trim(),
                telefono : this.telefonoInput.value,
                correo : this.correoInput.value
            };

            try {
                const contacto = await contactosFetch('/contactos',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data) 
                    }
                );
                
                this.agregarContacto(contacto);
                this.showToast(`Contacto ${contacto.nombre} (ID: ${contacto.id}) agregado exitosamente.`, 'success', 'Operación Exitosa');

            } catch (error) {
                this.showToast(error.message);
            }
        });

        // Agregar EventListener 'click' al tbody de la tabla de contactos si existe.
        // Determinar si el evento fue generado por un boton eliminar
        // Eliminar contacto asociada al boton
        this.contactosTableBody.addEventListener('click',async(event) => {
            const btnEliminar = event.target.closest('[data-button="delete"]');
            const btnEditar = event.target.closest('[data-bs-toggle="modal"]');

            if (btnEliminar) {
                // Fila de la tabla contactos que será eliminada
                this.tableRow = btnEliminar.closest('tr');
                
                try {
                    // Enviar la solicitud DELETE usando contactosFetch
                    await contactosFetch(`/contactos/${this.test?999:btnEliminar.dataset.id}`, 
                        {
                            method: 'DELETE'
                        }
                    );

                    this.eliminarContacto();
                    this.showToast(`Contacto ID: ${btnEliminar.dataset.id} eliminado exitosamente.`, 'success', 'Eliminación Exitosa'); 

                }catch(error){
                    this.showToast(error.message);
                }
            }

            if (btnEditar) {
                // Fila de la tabla contactos que será actualizada
                this.tableRow = btnEditar.closest('tr');
                this.cargarDatosModal(btnEditar.dataset.id);
            }
        }); 
       
        // Agregar EventListener al formulario editar tarea en el modal
        this.formActualizarContacto.addEventListener('submit', async (event) => {
            // Detener el envío tradicional del formulario
            event.preventDefault();
            
            // Preparar datos a enviar
            const data = {
                nombre : this.nuevoNombreInput.value.trim(),
                telefono : this.nuevoTelefonoInput.value,
                correo : this.nuevoCorreoInput.value
            };
            
            try {
                // Enviar la solicitud POST usando Fetch
                const contacto = await contactosFetch(`/contactos/${this.test?999:this.updateButton.dataset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data) 
                });

                this.actualizarContacto(contacto);
                bootstrap.Modal.getOrCreateInstance(this.actualizarContactoModal).hide();
                this.showToast(`Contacto ${contacto.nombre} (ID: ${contacto.id}) actualizado exitosamente.`, 'success', 'Actualización Exitosa');

            } catch (error) {
                this.showToast(error.message);
            }
        });

        this.formActualizarContacto.addEventListener('input', () => {
            // Habilitar el botón si hay interacción con el formulario
            this.updateButton.disabled = false;
        });

    } // Fin addListeners
} // Fin clase

// MAIN
document.addEventListener("DOMContentLoaded", () => {
    const adminUI = new ContactosUI();
    adminUI.addListeners();
});