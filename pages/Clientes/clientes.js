// ==========================================
// VARIABLES DE ESTADO
// ==========================================
let estadoActual = 'Todos'; 
let busquedaActual = '';
let paginaActual = 1;
const clientesPorPagina = 5;

document.addEventListener('DOMContentLoaded', () => {
    initAppPage('clientes');
    inicializarDatosClientes();
    renderizarTablaClientes();
    actualizarEstadisticas();
});

// ==========================================
// 1. GESTIÓN DE DATOS (Con el nuevo esquema)
// ==========================================
function inicializarDatosClientes() {
    if (!localStorage.getItem('luxestay_clientes_v2')) {
        const clientesMock = [
            { id: 'C-1001', nombre: 'Adriana Villalobos', documento: '05432198-7', telefono: '+503 7000-1111', email: 'a.villalobos@email.com', direccion: 'Col. Escalón, San Salvador', fechaRegistro: '2023-10-12', estado: 'Activo', foto: '', empresa: '', observaciones: 'Prefiere habitaciones en piso alto.' },
            { id: 'C-1002', nombre: 'Julian Martínez', documento: 'PAS-998877', telefono: '+503 7222-3333', email: 'julian.mtz@corporate.com', direccion: 'Zona 10, Ciudad de Guatemala', fechaRegistro: '2023-11-25', estado: 'Inactivo', foto: '', empresa: 'TechCorp SA', observaciones: 'Facturar siempre a nombre de la empresa.' },
            { id: 'C-1003', nombre: 'Sara Meyer', documento: '01122334-5', telefono: '+503 6111-2222', email: 'sara.meyer@webmail.de', direccion: 'Santa Tecla, La Libertad', fechaRegistro: '2024-01-05', estado: 'Activo', foto: '', empresa: '', observaciones: 'Alérgica al gluten.' }
        ];
        localStorage.setItem('luxestay_clientes_v2', JSON.stringify(clientesMock));
    }
}

function obtenerClientes() {
    return JSON.parse(localStorage.getItem('luxestay_clientes_v2')) || [];
}

// ==========================================
// 2. FILTROS Y LÓGICA DE TABLA
// ==========================================
function cambiarPestana(estado) {
    busquedaActual = '';
    document.getElementById('input-busqueda').value = '';
    estadoActual = estado;
    paginaActual = 1;

    const tabs = ['Todos', 'Activos', 'Inactivos'];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) {
            el.classList.remove('tab-activa');
            el.classList.add('tab-inactiva');
        }
    });

    const tabActivaId = estado === 'Activo' ? 'Activos' : (estado === 'Inactivo' ? 'Inactivos' : 'Todos');
    document.getElementById(`tab-${tabActivaId}`).classList.remove('tab-inactiva');
    document.getElementById(`tab-${tabActivaId}`).classList.add('tab-activa');

    renderizarTablaClientes();
}

function aplicarBusqueda() {
    busquedaActual = document.getElementById('input-busqueda').value.toLowerCase();
    paginaActual = 1;
    renderizarTablaClientes();
}

function obtenerClientesFiltrados() {
    let clientes = obtenerClientes();

    if (estadoActual === 'Activo' || estadoActual === 'Inactivo') {
        clientes = clientes.filter(c => c.estado === estadoActual);
    }

    if (busquedaActual) {
        clientes = clientes.filter(c => 
            c.nombre.toLowerCase().includes(busquedaActual) || 
            c.documento.toLowerCase().includes(busquedaActual)
        );
    }

    return clientes;
}

// ==========================================
// 3. RENDERIZADO Y PAGINACIÓN
// ==========================================
function renderizarTablaClientes() {
    const clientesFiltrados = obtenerClientesFiltrados();
    const tbody = document.getElementById('tabla-clientes');
    tbody.innerHTML = '';

    const totalClientes = clientesFiltrados.length;
    const totalPaginas = Math.ceil(totalClientes / clientesPorPagina) || 1;
    
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    
    const inicio = (paginaActual - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = clientesFiltrados.slice(inicio, fin);

    document.getElementById('info-paginacion').innerText = `Mostrando ${clientesPagina.length > 0 ? inicio + 1 : 0} a ${Math.min(fin, totalClientes)} de ${totalClientes} clientes`;
    document.getElementById('numeros-paginacion').innerText = `Página ${paginaActual} de ${totalPaginas}`;
    
    document.getElementById('btn-prev').disabled = paginaActual === 1;
    document.getElementById('btn-next').disabled = paginaActual === totalPaginas;

    if (clientesPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-on-surface-variant">No se encontraron clientes.</td></tr>`;
        return;
    }

    clientesPagina.forEach(cli => {
        const badgeEstado = cli.estado === 'Activo' ? 'text-primary bg-primary-container/20' : 'text-error bg-error-container';
        
        // Renderizar avatar o foto
        let avatarHtml = '';
        if (cli.foto) {
            avatarHtml = `<img src="${cli.foto}" class="w-10 h-10 rounded-full object-cover border border-outline-variant" alt="Foto">`;
        } else {
            avatarHtml = `<div class="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold shadow-sm">${cli.nombre.substring(0, 2).toUpperCase()}</div>`;
        }

        tbody.innerHTML += `
        <tr class="hover:bg-surface-container-low transition-colors group">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    ${avatarHtml}
                    <div>
                        <p class="font-titular-md text-base text-on-surface">${cli.nombre}</p>
                        <p class="text-xs text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">mail</span> ${cli.email}</p>
                        <p class="text-xs text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">call</span> ${cli.telefono}</p>
                    </div>
                </div>
            </td>
            <td class="p-4 text-sm font-dato-numerico text-on-surface-variant">${cli.documento}</td>
            <td class="p-4 text-sm text-on-surface-variant">
                ${cli.empresa ? `<span class="px-2 py-1 bg-surface-container-highest rounded text-xs font-semibold">${cli.empresa}</span>` : '<span class="text-xs italic">Particular</span>'}
            </td>
            <td class="p-4">
                <span class="px-3 py-1 rounded-full text-[12px] font-bold ${badgeEstado}">${cli.estado}</span>
            </td>
            <td class="p-4 text-right">
                <button onclick="editarCliente('${cli.id}')" class="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors" title="Ver / Editar Ficha">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button onclick="eliminarCliente('${cli.id}')" class="p-2 hover:bg-error-container rounded-full text-error transition-colors" title="Eliminar Cliente">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
            </td>
        </tr>`;
    });
}

function cambiarPagina(delta) {
    paginaActual += delta;
    renderizarTablaClientes();
}

function actualizarEstadisticas() {
    const clientes = obtenerClientes();
    const activos = clientes.filter(c => c.estado === 'Activo').length;
    const inactivos = clientes.filter(c => c.estado === 'Inactivo').length;

    document.getElementById('stat-total').innerText = clientes.length;
    document.getElementById('stat-activos').innerText = activos;
    document.getElementById('stat-inactivos').innerText = inactivos;
}

// ==========================================
// 4. CONTROL DE MODALES Y FORMULARIO
// ==========================================
function abrirModal(idModal) {
    document.getElementById(idModal).classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.add('hidden');
    document.body.classList.remove('modal-open');
}

function obtenerFechaActual() {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

function abrirModalNuevoCliente() {
    document.getElementById('form-cliente').reset();
    document.getElementById('form-id').value = '';
    
    document.getElementById('modal-titulo').innerText = 'Nuevo Registro de Cliente';
    document.getElementById('modal-registro-fecha').innerText = `Fecha de Registro: ${obtenerFechaActual()}`;
    
    abrirModal('modal-form-cliente');
}

function guardarCliente() {
    const form = document.getElementById('form-cliente');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('form-id').value;
    let clientes = obtenerClientes();

    const datosFormulario = {
        nombre: document.getElementById('form-nombre').value,
        documento: document.getElementById('form-documento').value,
        telefono: document.getElementById('form-telefono').value,
        email: document.getElementById('form-email').value,
        direccion: document.getElementById('form-direccion').value,
        estado: document.getElementById('form-estado').value,
        empresa: document.getElementById('form-empresa').value,
        foto: document.getElementById('form-foto').value,
        observaciones: document.getElementById('form-observaciones').value
    };

    if (id) {
        // Actualizar existente
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            // Mantenemos la fecha de registro original
            datosFormulario.fechaRegistro = clientes[index].fechaRegistro;
            clientes[index] = { ...clientes[index], ...datosFormulario };
        }
    } else {
        // Crear nuevo (Generar ID automático y Fecha)
        datosFormulario.id = 'C-' + Math.floor(1000 + Math.random() * 9000); // ID Aleatorio Ej: C-8392
        datosFormulario.fechaRegistro = obtenerFechaActual();
        clientes.unshift(datosFormulario); // Agrega al inicio
    }

    localStorage.setItem('luxestay_clientes_v2', JSON.stringify(clientes));
    cerrarModal('modal-form-cliente');
    renderizarTablaClientes();
    actualizarEstadisticas();
}

function editarCliente(id) {
    const cliente = obtenerClientes().find(c => c.id === id);
    if (!cliente) return;

    document.getElementById('form-id').value = cliente.id;
    document.getElementById('form-nombre').value = cliente.nombre;
    document.getElementById('form-documento').value = cliente.documento;
    document.getElementById('form-telefono').value = cliente.telefono;
    document.getElementById('form-email').value = cliente.email;
    document.getElementById('form-direccion').value = cliente.direccion;
    document.getElementById('form-estado').value = cliente.estado;
    document.getElementById('form-empresa').value = cliente.empresa || '';
    document.getElementById('form-foto').value = cliente.foto || '';
    document.getElementById('form-observaciones').value = cliente.observaciones || '';
    
    document.getElementById('modal-titulo').innerText = `Ficha de Cliente: ${cliente.id}`;
    document.getElementById('modal-registro-fecha').innerText = `Registrado el: ${cliente.fechaRegistro}`;
    
    abrirModal('modal-form-cliente');
}

function eliminarCliente(id) {
    if(confirm(`¿Seguro que deseas eliminar el registro del cliente ${id}? Esta acción no se puede deshacer.`)) {
        let clientes = obtenerClientes().filter(c => c.id !== id);
        localStorage.setItem('luxestay_clientes_v2', JSON.stringify(clientes));
        renderizarTablaClientes();
        actualizarEstadisticas();
    }
}

function moduloEnConstruccion(nombreModulo) {
    alert(`El módulo de ${nombreModulo} se encuentra en construcción. ¡Pronto estará disponible!`);
}

// Exponer funciones para los handlers inline cuando se carga como módulo
window.cambiarPestana = cambiarPestana;
window.aplicarBusqueda = aplicarBusqueda;
window.cambiarPagina = cambiarPagina;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.abrirModalNuevoCliente = abrirModalNuevoCliente;
window.guardarCliente = guardarCliente;
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.moduloEnConstruccion = moduloEnConstruccion;
