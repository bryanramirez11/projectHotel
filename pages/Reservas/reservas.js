// reservas.js

let reservaActualSeleccionadaId = null;

function inicializarDatosClientes() {
    const almacen = localStorage.getItem('luxestay_clientes_v2');
    if (!almacen) {
        const clientesMock = [
            { id: 'C-1001', nombre: 'Adriana Villalobos', estado: 'Activo' },
            { id: 'C-1002', nombre: 'Julian Martínez', estado: 'Activo' },
            { id: 'C-1003', nombre: 'Sara Meyer', estado: 'Inactivo' }
        ];
        localStorage.setItem('luxestay_clientes_v2', JSON.stringify(clientesMock));
        return;
    }

    const clientesGuardados = JSON.parse(almacen) || [];
    const clientesNormalizados = clientesGuardados.map(cliente => ({
        ...cliente,
        estado: cliente.estado || 'Activo'
    }));

    const necesitaActualizacion = JSON.stringify(clientesGuardados) !== JSON.stringify(clientesNormalizados);
    if (necesitaActualizacion) {
        localStorage.setItem('luxestay_clientes_v2', JSON.stringify(clientesNormalizados));
    }
}

function obtenerClientes() {
    return JSON.parse(localStorage.getItem('luxestay_clientes_v2')) || [];
}

function obtenerClientePorId(id) {
    return obtenerClientes().find(cliente => cliente.id === id) || null;
}

function obtenerAmenidadesSeleccionadas() {
    return Array.from(document.querySelectorAll('input[name="amenidades"]:checked')).map(input => ({
        nombre: input.value,
        costo: parseFloat(input.dataset.costo) || 0
    }));
}

function calcularNochesReserva(checkin, checkout) {
    const inicio = new Date(checkin + 'T00:00:00');
    const fin = new Date(checkout + 'T00:00:00');
    const diff = fin - inicio;
    return diff > 0 ? Math.round(diff / 86400000) : 0;
}

function obtenerPrecioHabitacionDesdeReserva(reserva) {
    const habitaciones = obtenerHabitaciones();
    return parseFloat(habitaciones.find(h => reserva.habitacion.includes(h.numero) || h.numero === reserva.habitacion || h.tipo === reserva.habitacion)?.precio || 0);
}

function cargarClientesEnSelect() {
    const select = document.getElementById('form-cliente');
    if (!select) return;

    const clientes = obtenerClientes();
    select.innerHTML = '<option value="" disabled selected>Selecciona un cliente registrado...</option>';

    if (clientes.length === 0) {
        select.innerHTML = '<option value="" disabled selected>No hay clientes registrados</option>';
        select.disabled = true;
        return;
    }

    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nombre}${cliente.estado === 'Inactivo' ? ' (Inactivo)' : ''}`;
        if (cliente.estado === 'Inactivo') {
            option.disabled = true;
        }
        select.appendChild(option);
    });
    select.disabled = false;
    select.onchange = actualizarIndicadorClienteSeleccionado;
    actualizarIndicadorClienteSeleccionado();
}

function actualizarIndicadorClienteSeleccionado() {
    const select = document.getElementById('form-cliente');
    const indicador = document.getElementById('cliente-estado-indicador');
    if (!select || !indicador) return;

    const clienteSeleccionado = obtenerClientePorId(select.value);
    if (clienteSeleccionado && clienteSeleccionado.estado === 'Inactivo') {
        indicador.textContent = 'Este cliente está inactivo y no puede reservar una habitación.';
        indicador.classList.remove('hidden');
    } else {
        indicador.classList.add('hidden');
    }
}

function abrirModalNuevaReserva() {
    inicializarDatosClientes();
    cargarClientesEnSelect();
    cargarHabitacionesEnSelect();

    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    const hoyStr = hoy.toISOString().split('T')[0];
    const mananaStr = mañana.toISOString().split('T')[0];

    document.getElementById('form-id').value = '';
    document.getElementById('form-cliente').value = '';
    document.getElementById('form-habitacion').value = '';
    document.getElementById('form-estado').value = 'Confirmado';
    document.getElementById('form-checkin').value = hoyStr;
    document.getElementById('form-checkout').value = mananaStr;
    document.getElementById('form-cliente-vip').checked = false;
    document.querySelectorAll('input[name="amenidades"]').forEach(input => input.checked = false);
    document.getElementById('cliente-estado-indicador').classList.add('hidden');
    document.getElementById('alerta-conflicto').classList.add('hidden');
    abrirModal('modal-form-reserva');
}

document.addEventListener('DOMContentLoaded', () => {
    initAppPage('reservas');
    inicializarDatosClientes();
    inicializarDatosReservas();
    cargarHabitacionesEnSelect();
    cargarClientesEnSelect();
    renderizarDiasGantt();
    renderizarGantt();
    renderizarProximasEntradas();
    actualizarEstadisticas();
});

// ==========================================
// 1. GESTIÓN DE DATOS (Storage Local)
// ==========================================

function obtenerHabitaciones() {
    let habitaciones = JSON.parse(localStorage.getItem('luxestay_habitaciones'));
    if (!habitaciones || habitaciones.length === 0) {
        habitaciones = [
            { id: 1, numero: "101", tipo: "Deluxe", estado: "Disponible", precio: "150", camas: "King" },
            { id: 2, numero: "102", tipo: "Estándar", estado: "Disponible", precio: "100", camas: "Queen" },
            { id: 3, numero: "201", tipo: "Suite", estado: "Limpieza", precio: "250", camas: "King" },
            { id: 4, numero: "202", tipo: "Deluxe", estado: "Mantenimiento", precio: "150", camas: "Twin" }
        ];
        localStorage.setItem('luxestay_habitaciones', JSON.stringify(habitaciones));
    }
    return habitaciones;
}

function inicializarDatosReservas() {
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 3);
    
    const hoyStr = hoy.toISOString().split('T')[0];
    const mañanaStr = mañana.toISOString().split('T')[0];

    if (!localStorage.getItem('luxestay_reservas')) {
        const reservasMock = [
            { id: 1690000000001, cliente: 'Elena Rodriguez', habitacion: '201 - Suite', checkin: hoyStr, checkout: mañanaStr, estado: 'Confirmado' }
        ];
        localStorage.setItem('luxestay_reservas', JSON.stringify(reservasMock));
    }
}

function obtenerReservas() {
    return JSON.parse(localStorage.getItem('luxestay_reservas')) || [];
}

function guardarReserva() {
    const form = document.getElementById('form-reserva');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('form-id').value;
    const checkin = document.getElementById('form-checkin').value;
    const checkout = document.getElementById('form-checkout').value;
    const habitacion = document.getElementById('form-habitacion').value;
    const alerta = document.getElementById('alerta-conflicto');

    // Validación 1: Fechas lógicas
    if (checkin >= checkout) {
        alerta.classList.remove('hidden');
        document.getElementById('alerta-conflicto-texto').innerText = "La fecha de salida debe ser posterior a la de entrada.";
        return;
    }

    let reservas = obtenerReservas();

    // Validación 2: Superposición de fechas en la misma habitación
    const hayConflicto = reservas.some(r => {
        // Ignorar la reserva que estamos editando
        if (id && r.id == id) return false;
        // Ignorar reservas canceladas
        if (r.estado === 'Cancelado') return false;
        // Solo importa si es la misma habitación
        if (r.habitacion !== habitacion) return false;
        
        // Lógica de solapamiento: (A_inicio < B_fin) Y (A_fin > B_inicio)
        return (checkin < r.checkout) && (checkout > r.checkin);
    });

    if (hayConflicto) {
        alerta.classList.remove('hidden');
        document.getElementById('alerta-conflicto-texto').innerText = "La habitación ya se encuentra reservada en esas fechas.";
        return;
    }

    // Validación 3: Cliente activo y válido
    const clienteId = document.getElementById('form-cliente').value;
    const clienteSeleccionado = obtenerClientePorId(clienteId);
    if (!clienteSeleccionado || clienteSeleccionado.estado !== 'Activo') {
        alerta.classList.remove('hidden');
        document.getElementById('alerta-conflicto-texto').innerText = "Selecciona un cliente activo para poder reservar.";
        return;
    }

    // Si todo está bien, ocultamos alerta y guardamos
    alerta.classList.add('hidden');

    const amenidades = obtenerAmenidadesSeleccionadas();
    const clienteVIP = document.getElementById('form-cliente-vip').checked;

    const reservaData = {
        clienteId: clienteSeleccionado.id,
        clienteNombre: clienteSeleccionado.nombre,
        clienteVIP: clienteVIP,
        amenidades: amenidades,
        habitacion: habitacion,
        estado: document.getElementById('form-estado').value,
        checkin: checkin,
        checkout: checkout
    };

    if (id) {
        const index = reservas.findIndex(r => r.id == id);
        if (index !== -1) reservas[index] = { ...reservas[index], ...reservaData };
    } else {
        reservaData.id = Date.now();
        reservas.unshift(reservaData);
    }

    localStorage.setItem('luxestay_reservas', JSON.stringify(reservas));
    cerrarModal('modal-form-reserva');
    
    // Recargar vistas
    renderizarProximasEntradas();
    renderizarGantt();
    actualizarEstadisticas();
    if(!document.getElementById('modal-panel-gestion').classList.contains('hidden')) {
        abrirPanelGestion(); // Refrescar tabla si está abierta
    }
}

function eliminarReservaActual() {
    if (!reservaActualSeleccionadaId) return;
    eliminarReservaPorId(reservaActualSeleccionadaId);
    cerrarModal('modal-detalle-reserva');
}

function eliminarReservaPorId(id) {
    let reservas = obtenerReservas();
    reservas = reservas.filter(r => r.id != id);
    localStorage.setItem('luxestay_reservas', JSON.stringify(reservas));
    
    renderizarProximasEntradas();
    renderizarGantt();
    actualizarEstadisticas();
    
    if(!document.getElementById('modal-panel-gestion').classList.contains('hidden')) {
        abrirPanelGestion(); // Refrescar tabla si está abierta
    }
}

// ==========================================
// 2. RENDERIZADO Y ESTADÍSTICAS REALES
// ==========================================

function cargarHabitacionesEnSelect() {
    const select = document.getElementById('form-habitacion');
    const habitaciones = obtenerHabitaciones();
    
    select.innerHTML = '<option value="" disabled selected>Selecciona una habitación...</option>';
    habitaciones.forEach(hab => {
        const texto = `${hab.numero} - ${hab.tipo}`;
        select.innerHTML += `<option value="${texto}">${texto}</option>`;
    });
}

function actualizarEstadisticas() {
    const reservas = obtenerReservas();
    const habitaciones = obtenerHabitaciones();
    
    // Formato YYYY-MM-DD para hoy
    const hoyStr = new Date().toISOString().split('T')[0];
    
    const entradasHoy = reservas.filter(r => r.checkin === hoyStr && r.estado !== 'Cancelado').length;
    const salidasHoy = reservas.filter(r => r.checkout === hoyStr && r.estado !== 'Cancelado').length;
    const enLimpieza = habitaciones.filter(h => h.estado === 'Limpieza' || h.estado === 'Mantenimiento').length;
    
    // CÁLCULO REAL DE OCUPACIÓN HOY
    let habsOcupadasSet = new Set();
    
    // 1. Revisar si la habitación tiene una reserva activa HOY (checkin <= hoy && checkout > hoy)
    reservas.forEach(r => {
        if (r.estado !== 'Cancelado' && r.checkin <= hoyStr && r.checkout > hoyStr) {
            habsOcupadasSet.add(r.habitacion); // Identificador único como "101 - Deluxe"
        }
    });

    const totalHabitaciones = habitaciones.length || 1;
    const porcentaje = Math.round((habsOcupadasSet.size / totalHabitaciones) * 100);
    
    document.getElementById('stat-entradas').innerText = `${entradasHoy} Reservas`;
    document.getElementById('stat-salidas').innerText = `${salidasHoy} Hab.`;
    document.getElementById('stat-limpieza').innerText = `${enLimpieza} Hab.`;
    
    document.getElementById('occ-percent-text').innerText = `${porcentaje}%`;
    document.getElementById('occ-progress-bar').style.width = `${porcentaje}%`;
    
    const textoOcupacion = document.getElementById('occ-texto-descriptivo');
    if(porcentaje > 80) textoOcupacion.innerText = "Excelente Rendimiento";
    else if(porcentaje > 40) textoOcupacion.innerText = "Rendimiento Estable";
    else if(porcentaje > 0) textoOcupacion.innerText = "Disponibilidad Alta";
    else textoOcupacion.innerText = "Hotel Vacío Hoy";
}

function renderizarDiasGantt() {
    const contenedor = document.getElementById('contenedor-dias-gantt');
    contenedor.innerHTML = '';
    const hoy = new Date();
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for(let i = 0; i < 14; i++) {
        let fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        let diaNombre = diasSemana[fecha.getDay()];
        let diaNum = fecha.getDate();
        
        let clasesBg = i === 0 ? 'bg-primary-container/20 border-primary/30' : 'border-outline-variant/30';
        let clasesTexto = i === 0 ? 'text-primary' : 'text-outline';
        
        contenedor.innerHTML += `
        <div class="flex-1 min-w-[60px] p-2 text-center border-r flex flex-col ${clasesBg}">
            <span class="text-[10px] ${clasesTexto} font-bold uppercase">${diaNombre}</span>
            <span class="font-dato-numerico text-dato-numerico ${i===0 ? 'text-primary' : ''}">${diaNum}</span>
        </div>`;
    }
}

function renderizarGantt() {
    const contenedor = document.getElementById('contenedor-habitaciones-gantt');
    const habitaciones = obtenerHabitaciones();
    const reservas = obtenerReservas();
    contenedor.innerHTML = '';

    habitaciones.forEach(hab => {
        const reservaAsociada = reservas.find(r => r.habitacion.includes(hab.numero) && r.estado !== 'Cancelado');
        let barraReservaHTML = '';
        
        if (reservaAsociada) {
            barraReservaHTML = `
            <div onclick="verDetallesReserva(${reservaAsociada.id})" class="absolute top-1/2 -translate-y-1/2 left-[20px] right-[240px] h-10 bg-primary-container/20 border-2 border-primary rounded-full px-4 flex items-center justify-between cursor-pointer hover:bg-primary-container/30 transition-all z-10 shadow-sm">
                <div class="flex items-center gap-2 overflow-hidden">
                    <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-on-primary">${obtenerIniciales(reservaAsociada.clienteNombre || reservaAsociada.cliente)}</div>
                    <span class="font-etiqueta-sm text-etiqueta-sm text-primary truncate">${reservaAsociada.clienteNombre || reservaAsociada.cliente}</span>
                </div>
            </div>`;
        } else if (hab.estado === 'Mantenimiento' || hab.estado === 'Limpieza') {
            barraReservaHTML = `
            <div class="absolute inset-0 bg-tertiary/5 flex items-center justify-center border-y border-tertiary/20">
                <div class="flex items-center gap-2 text-tertiary opacity-70">
                    <span class="material-symbols-outlined text-[18px]">build</span>
                    <span class="font-etiqueta-sm text-xs uppercase tracking-widest">${hab.estado}</span>
                </div>
            </div>`;
        }

        contenedor.innerHTML += `
        <div class="gantt-grid border-b border-outline-variant/30 group">
            <div class="p-4 border-r border-outline-variant/30 group-hover:bg-surface-container-low transition-colors">
                <div class="font-titular-md text-[16px]">${hab.numero} ${hab.tipo}</div>
                <div class="text-[12px] text-outline">${hab.camas || 'Estándar'}</div>
            </div>
            <div class="col-span-14 relative h-20 bg-surface/30">${barraReservaHTML}</div>
        </div>`;
    });
}

function renderizarProximasEntradas() {
    const lista = document.getElementById('lista-proximas-entradas');
    const reservas = obtenerReservas().filter(r => r.estado !== 'Cancelado'); // No mostrar canceladas aquí
    lista.innerHTML = '';

    if (reservas.length === 0) {
        lista.innerHTML = `<p class="text-on-surface-variant text-center py-6 border border-dashed border-outline-variant rounded-xl">No hay reservas próximas.</p>`;
        return;
    }

    // Mostrar solo las 4 más recientes/próximas para no saturar el dashboard
    reservas.slice(0, 4).forEach(res => {
        const clienteNombre = res.clienteNombre || res.cliente || 'Cliente Desconocido';
        let colorClase = res.estado === 'Pendiente' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary';
        
        lista.insertAdjacentHTML('beforeend', `
        <div onclick="verDetallesReserva(${res.id})" class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center font-bold text-on-surface border border-outline-variant/50">
                    ${obtenerIniciales(clienteNombre)}
                </div>
                <div>
                    <div class="font-bold text-on-surface">${clienteNombre}</div>
                    <div class="text-sm text-on-surface-variant">Habitación: ${res.habitacion}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="${colorClase} px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-1 text-center inline-block">${res.estado}</div>
                <div class="text-sm font-dato-numerico text-on-surface">${formatearFecha(res.checkin)}</div>
            </div>
        </div>
        `);
    });
}

// ==========================================
// 3. PANELES Y PANTALLAS (Botón Gestionar)
// ==========================================

function abrirPanelGestion() {
    const tbody = document.getElementById('tabla-gestion-reservas');
    const reservas = obtenerReservas();
    tbody.innerHTML = '';

    if(reservas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-on-surface-variant">No existen reservas en el sistema.</td></tr>`;
    } else {
        reservas.forEach(res => {
            const clienteNombre = res.clienteNombre || res.cliente || 'Cliente Desconocido';
            let colorClase = 'text-primary bg-primary/10';
            if (res.estado === 'Pendiente') colorClase = 'text-tertiary bg-tertiary/10';
            if (res.estado === 'Cancelado') colorClase = 'text-error bg-error/10';

            tbody.innerHTML += `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="p-4">
                    <div class="font-bold text-on-surface">${clienteNombre}</div>
                </td>
                <td class="p-4 text-on-surface-variant text-sm">${res.habitacion}</td>
                <td class="p-4 text-sm font-dato-numerico text-on-surface-variant">${formatearFecha(res.checkin)} al ${formatearFecha(res.checkout)}</td>
                <td class="p-4">
                    <span class="${colorClase} px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-block">${res.estado}</span>
                </td>
                <td class="p-4 text-right">
                    <button onclick="verDetallesReserva(${res.id})" class="text-on-surface-variant hover:text-primary p-2 rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button onclick="eliminarReservaPorId(${res.id})" class="text-on-surface-variant hover:text-error p-2 rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </td>
            </tr>`;
        });
    }

    abrirModal('modal-panel-gestion');
}

// ==========================================
// 4. UTILIDADES
// ==========================================

function formatearFecha(fechaStr) {
    if(!fechaStr) return '';
    const opciones = { day: 'numeric', month: 'short' };
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', opciones).replace('.', '');
}

function obtenerIniciales(nombre) {
    if(!nombre) return 'XX';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function abrirModal(idModal) {
    document.getElementById(idModal).classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.add('hidden');
    document.body.classList.remove('modal-open');
    // Ocultar alertas si cerramos el modal de reserva
    if(idModal === 'modal-form-reserva') {
        document.getElementById('alerta-conflicto').classList.add('hidden');
    }
}

function abrirModalReserva() {
    document.getElementById('form-reserva').reset();
    document.getElementById('form-id').value = '';
    document.getElementById('modal-titulo').innerText = 'Nueva Reserva';
    document.getElementById('alerta-conflicto').classList.add('hidden'); // Limpiar alerta
    
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('form-checkin').value = hoy;
    document.getElementById('form-checkout').value = manana;
    
    abrirModal('modal-form-reserva');
}

function verDetallesReserva(id) {
    const reservas = obtenerReservas();
    const res = reservas.find(r => r.id == id);
    if(!res) return;

    reservaActualSeleccionadaId = id;

    const clienteNombre = res.clienteNombre || res.cliente || 'Cliente Desconocido';
    document.getElementById('detalle-cliente').innerText = clienteNombre;
    document.getElementById('detalle-avatar').innerText = obtenerIniciales(clienteNombre);
    document.getElementById('detalle-habitacion').innerText = res.habitacion;
    document.getElementById('detalle-fechas').innerText = `${formatearFecha(res.checkin)} - ${formatearFecha(res.checkout)}`;
    
    const badge = document.getElementById('detalle-estado');
    badge.innerText = res.estado;
    badge.className = 'inline-block mt-2 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide ';
    if (res.estado === 'Confirmado') badge.className += 'bg-primary/10 text-primary';
    else if (res.estado === 'Pendiente') badge.className += 'bg-tertiary/10 text-tertiary';
    else badge.className += 'bg-error/10 text-error';

    const amenities = (res.amenidades || []).map(a => a.nombre).join(', ');
    document.getElementById('detalle-amenidades').innerText = amenities ? amenities : 'Sin extras';

    const noches = calcularNochesReserva(res.checkin, res.checkout);
    const costoHabitacion = obtenerPrecioHabitacionDesdeReserva(res) * noches;
    const costoAmenidades = (res.amenidades || []).reduce((sum, a) => sum + (parseFloat(a.costo) || 0), 0);
    const clienteDescuento = res.clienteVIP ? -0.1 * costoHabitacion : 0;
    const totalEstimado = costoHabitacion + costoAmenidades + clienteDescuento;
    document.getElementById('detalle-total').innerText = `$${totalEstimado.toFixed(2)}`;

    // Rellenar formulario oculto para si decide guardar encima
    document.getElementById('form-id').value = res.id;
    const clienteId = res.clienteId || obtenerClientes().find(c => c.nombre === res.cliente)?.id || '';
    document.getElementById('form-cliente').value = clienteId;
    document.getElementById('form-habitacion').value = res.habitacion;
    document.getElementById('form-estado').value = res.estado;
    document.getElementById('form-checkin').value = res.checkin;
    document.getElementById('form-checkout').value = res.checkout;
    document.getElementById('form-cliente-vip').checked = !!res.clienteVIP;
    document.querySelectorAll('input[name="amenidades"]').forEach(input => {
        input.checked = (res.amenidades || []).some(a => a.nombre === input.value);
    });
    actualizarIndicadorClienteSeleccionado();
    document.getElementById('modal-titulo').innerText = 'Editar Reserva';

    abrirModal('modal-detalle-reserva');
}