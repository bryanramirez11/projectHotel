// habitaciones.js

const IMAGEN_DEFAULT = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop';

document.addEventListener('DOMContentLoaded', () => {
    initAppPage('habitaciones');
    inicializarDatosHabitaciones();
    renderizarDashboard();

    // Event Listener para el filtro
    document.getElementById('filtro-estado').addEventListener('change', renderizarHabitaciones);
});

// ==========================================
// 1. GESTIÓN DE DATOS (CRUD)
// ==========================================

function inicializarDatosHabitaciones() {
    if (!localStorage.getItem('luxestay_habitaciones')) {
        const habitacionesMock = [
            { id: 1, numero: '201', tipo: 'Suite Presidencial', piso: '2', estado: 'Ocupada', precio: 320, capacidad: 4, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=600&auto=format&fit=crop' },
            { id: 2, numero: '304', tipo: 'Doble Deluxe', piso: '3', estado: 'Disponible', precio: 185, capacidad: 2, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop' },
            { id: 3, numero: '105', tipo: 'Standard Individual', piso: '1', estado: 'Limpieza', precio: 95, capacidad: 1, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop' }
        ];
        localStorage.setItem('luxestay_habitaciones', JSON.stringify(habitacionesMock));
    }
}

function obtenerHabitaciones() {
    return JSON.parse(localStorage.getItem('luxestay_habitaciones')) || [];
}

function guardarEnStorage(datos) {
    localStorage.setItem('luxestay_habitaciones', JSON.stringify(datos));
    renderizarDashboard();
}

function guardarHabitacion() {
    const form = document.getElementById('form-habitacion');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('form-id').value;
    const imagenIngresada = document.getElementById('form-img').value.trim();

    const habitacionData = {
        numero: document.getElementById('form-numero').value,
        tipo: document.getElementById('form-tipo').value,
        piso: document.getElementById('form-piso').value,
        estado: document.getElementById('form-estado').value,
        precio: parseFloat(document.getElementById('form-precio').value),
        capacidad: parseInt(document.getElementById('form-capacidad').value),
        img: imagenIngresada !== '' ? imagenIngresada : IMAGEN_DEFAULT
    };

    let habitaciones = obtenerHabitaciones();

    if (id) {
        // Actualizar existente
        const index = habitaciones.findIndex(h => h.id == id);
        if (index !== -1) {
            habitaciones[index] = { ...habitaciones[index], ...habitacionData };
        }
    } else {
        // Crear nueva
        habitacionData.id = Date.now(); // ID único simple
        habitaciones.push(habitacionData);
    }

    guardarEnStorage(habitaciones);
    cerrarModal('modal-formulario');
}

function eliminarHabitacion(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta habitación? Esta acción no se puede deshacer.')) {
        let habitaciones = obtenerHabitaciones();
        habitaciones = habitaciones.filter(h => h.id != id);
        guardarEnStorage(habitaciones);
    }
}

// ==========================================
// 2. RENDERIZADO DE INTERFAZ
// ==========================================

function renderizarDashboard() {
    renderizarEstadisticas();
    renderizarHabitaciones();
}

function renderizarEstadisticas() {
    const habitaciones = obtenerHabitaciones();
    
    document.getElementById('stat-total').innerText = habitaciones.length;
    document.getElementById('stat-disponibles').innerText = habitaciones.filter(h => h.estado === 'Disponible').length;
    document.getElementById('stat-limpieza').innerText = habitaciones.filter(h => h.estado === 'Limpieza').length;
    document.getElementById('stat-mantenimiento').innerText = habitaciones.filter(h => h.estado === 'Mantenimiento').length;
}

function renderizarHabitaciones() {
    const grid = document.getElementById('grid-habitaciones');
    const filtro = document.getElementById('filtro-estado').value;
    let habitaciones = obtenerHabitaciones();

    if (filtro !== 'Todos') {
        habitaciones = habitaciones.filter(h => h.estado === filtro);
    }

    grid.innerHTML = ''; 

    if (habitaciones.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-10 text-center text-secondary">No se encontraron habitaciones con estos filtros.</div>`;
        return;
    }

    habitaciones.forEach(hab => {
        let badgeColor, iconName, filterClass = '';
        switch (hab.estado) {
            case 'Ocupada':
                badgeColor = 'bg-error text-white'; iconName = 'lock';
                break;
            case 'Disponible':
                badgeColor = 'bg-primary text-white'; iconName = 'check';
                break;
            case 'Limpieza':
                badgeColor = 'bg-secondary text-white'; iconName = 'mop';
                filterClass = 'grayscale-[30%] opacity-90';
                break;
            case 'Mantenimiento':
                badgeColor = 'bg-tertiary text-white'; iconName = 'build';
                filterClass = 'grayscale-[50%]';
                break;
        }

        const cardHTML = `
        <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col group">
            <div class="relative h-48 ${filterClass}">
                <img alt="Habitación ${hab.numero}" class="w-full h-full object-cover" src="${hab.img}" onerror="this.src='${IMAGEN_DEFAULT}'" />
                <div class="absolute top-4 left-4">
                    <span class="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[12px] font-bold text-primary shadow-sm">PISO ${hab.piso}</span>
                </div>
                <div class="absolute top-4 right-4">
                    <span class="${badgeColor}/90 backdrop-blur px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-wide">
                        <span class="material-symbols-outlined text-[14px]">${iconName}</span>
                        ${hab.estado}
                    </span>
                </div>
                
                <div class="absolute inset-0 bg-on-background/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onclick="verDetalles(${hab.id})" class="bg-surface text-primary p-3 rounded-full hover:scale-110 shadow-lg transition-transform" title="Ver Detalles">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button onclick="abrirModalEdicion(${hab.id})" class="bg-surface text-secondary p-3 rounded-full hover:scale-110 shadow-lg transition-transform" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button onclick="eliminarHabitacion(${hab.id})" class="bg-error text-white p-3 rounded-full hover:scale-110 shadow-lg transition-transform" title="Eliminar">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
            <div class="p-5 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-headline-md text-headline-md text-on-surface">Hab. ${hab.numero}</h4>
                        <p class="font-label-caps text-label-caps text-secondary truncate max-w-[140px]">${hab.tipo}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-headline-md text-headline-md text-primary">$${hab.precio}</p>
                        <p class="text-[12px] text-secondary">/ noche</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 mt-auto pt-3 border-t border-outline-variant/30">
                    <div class="flex items-center gap-1 text-secondary">
                        <span class="material-symbols-outlined text-[18px]">group</span>
                        <span class="font-body-sm text-body-sm text-[13px]">${hab.capacidad} Px</span>
                    </div>
                    <div class="flex items-center gap-1 text-secondary">
                        <span class="material-symbols-outlined text-[18px]">layers</span>
                        <span class="font-body-sm text-body-sm text-[13px]">Piso ${hab.piso}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// ==========================================
// 3. CONTROL DE MODALES
// ==========================================

function abrirModal(idModal) {
    document.getElementById(idModal).classList.remove('hidden');
    document.body.classList.add('modal-open'); // Previene scroll del fondo
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// Limpia y abre modal para CREAR
function abrirModalFormulario() {
    document.getElementById('form-habitacion').reset();
    document.getElementById('form-id').value = '';
    document.getElementById('modal-titulo').innerText = 'Agregar Nueva Habitación';
    abrirModal('modal-formulario');
}

// Llena y abre modal para EDITAR
function abrirModalEdicion(id) {
    const habitaciones = obtenerHabitaciones();
    const hab = habitaciones.find(h => h.id == id);
    if (!hab) return;

    document.getElementById('form-id').value = hab.id;
    document.getElementById('form-numero').value = hab.numero;
    document.getElementById('form-tipo').value = hab.tipo;
    document.getElementById('form-piso').value = hab.piso;
    document.getElementById('form-estado').value = hab.estado;
    document.getElementById('form-precio').value = hab.precio;
    document.getElementById('form-capacidad').value = hab.capacidad;
    document.getElementById('form-img').value = hab.img === IMAGEN_DEFAULT ? '' : hab.img;

    document.getElementById('modal-titulo').innerText = `Editar Habitación ${hab.numero}`;
    abrirModal('modal-formulario');
}

// Llena y abre modal de DETALLES
function verDetalles(id) {
    const habitaciones = obtenerHabitaciones();
    const hab = habitaciones.find(h => h.id == id);
    if (!hab) return;

    document.getElementById('detalle-img').src = hab.img;
    document.getElementById('detalle-img').onerror = function() { this.src = IMAGEN_DEFAULT; };
    document.getElementById('detalle-titulo').innerText = `Habitación ${hab.numero}`;
    document.getElementById('detalle-tipo').innerText = hab.tipo;
    document.getElementById('detalle-precio').innerText = `$${hab.precio}`;
    document.getElementById('detalle-piso').innerText = hab.piso;
    document.getElementById('detalle-capacidad').innerText = `${hab.capacidad} Personas`;

    const badge = document.getElementById('detalle-estado-badge');
    badge.innerText = hab.estado;
    
    // Resetear clases del badge
    badge.className = 'px-3 py-1 rounded-full text-[12px] font-bold shadow-sm uppercase tracking-wide bg-white backdrop-blur-md ';
    
    switch (hab.estado) {
        case 'Ocupada': badge.classList.add('text-error'); break;
        case 'Disponible': badge.classList.add('text-primary'); break;
        case 'Limpieza': badge.classList.add('text-secondary'); break;
        case 'Mantenimiento': badge.classList.add('text-tertiary'); break;
    }

    abrirModal('modal-detalles');
}
// Exponer funciones para los handlers inline cuando se carga como módulo
window.verDetalles = verDetalles;
window.abrirModalEdicion = abrirModalEdicion;
window.eliminarHabitacion = eliminarHabitacion;
window.abrirModalFormulario = abrirModalFormulario;
window.guardarHabitacion = guardarHabitacion;
window.cerrarModal = cerrarModal;
window.abrirModal = abrirModal;
