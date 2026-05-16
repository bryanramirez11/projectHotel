// ============================================================
//  FACTURACION.JS  —  LuxeStay Boutique
// ============================================================

// --- 1. LECTURA DE LA BASE DE DATOS LOCAL ---
function obtenerDatosGlobales(clave) {
    const mapping = {
        reservas:     'luxestay_reservas',
        clientes:     'luxestay_clientes_v2',
        habitaciones: 'luxestay_habitaciones',
        facturas:     'luxestay_facturas'
    };
    const key   = mapping[clave] || clave;
    const datos = localStorage.getItem(key);
    return datos ? JSON.parse(datos) : [];
}

function inicializarFacturas() {
    if (!localStorage.getItem('luxestay_facturas')) {
        localStorage.setItem('luxestay_facturas', JSON.stringify([]));
    }
    // Inicializar también el registro de reservas eliminadas manualmente
    if (!localStorage.getItem('luxestay_facturas_eliminadas')) {
        localStorage.setItem('luxestay_facturas_eliminadas', JSON.stringify([]));
    }
}

// ✅ FIX 1: Leer el usuario desde localStorage directamente, NO desde currentUser() función
function nombreUsuarioActivo() {
    try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return 'Sistema';
        const user = JSON.parse(raw);
        return (user && (user.name || user.username)) || 'Sistema';
    } catch (e) {
        return 'Sistema';
    }
}

// ============================================================
//  2. AUTO-GENERAR FACTURAS PENDIENTES
//     Por cada reserva activa sin factura, se crea una entrada
//     automática con estado "Pendiente" y generadoPor = Sistema.
//     ✅ FIX 2: Se respetan las facturas eliminadas manualmente
//     para que no vuelvan a aparecer al recargar la página.
// ============================================================
function sincronizarFacturasPendientes() {
    const reservas     = obtenerDatosGlobales('reservas');
    const clientes     = obtenerDatosGlobales('clientes');
    const habitaciones = obtenerDatosGlobales('habitaciones');
    let   facturas     = obtenerDatosGlobales('facturas');

    // IDs de reservas que ya tienen factura activa
    const reservasFacturadasIds = new Set(facturas.map(f => String(f.reservaId)).filter(Boolean));

    // ✅ IDs de reservas cuya factura fue eliminada manualmente — NO recrear
    const eliminadasRaw = localStorage.getItem('luxestay_facturas_eliminadas');
    const reservasEliminadasIds = new Set(
        eliminadasRaw ? JSON.parse(eliminadasRaw) : []
    );

    let cambios = false;

    reservas.forEach(res => {
        const resId     = String(res.id || res.codigo || '');
        const estadoRes = (res.estado || '').toLowerCase();

        // Solo reservas activas / confirmadas sin factura
        if (!resId || reservasFacturadasIds.has(resId)) return;
        if (estadoRes === 'cancelado' || estadoRes === 'cancelada') return;

        // ✅ Si esta reserva tuvo factura y fue eliminada manualmente, no recrear
        if (reservasEliminadasIds.has(resId)) return;

        // Resolver cliente y habitación
        const { nombreCliente, habitacion, campoHab } = resolverReserva(res, clientes, habitaciones);
        const habDisplay = habitacion.numero || habitacion.nombre || campoHab;

        const noches          = calcularNochesReserva(res);
        const costoHabitacion = calcularCostoHabitacionDesdeReserva(res, habitacion);
        const costoAmenidades = calcularCostoAmenidadesDesdeReserva(res);
        const ajuste          = calcularAjusteClienteDesdeReserva(res, habitacion);
        const total           = Math.max(0, costoHabitacion + costoAmenidades + ajuste);
        const amenidadesTexto = (res.amenidades || []).map(a => a.nombre || a).filter(Boolean);
        const conceptos       = ['Reserva Habitación', ...amenidadesTexto];

        const nuevaFactura = {
            idFactura:     'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000),
            fecha:         new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            reservaId:     resId,
            clienteNombre: nombreCliente,
            habNombre:     habDisplay,
            estado:        'Pendiente',
            total:         parseFloat(total.toFixed(2)),
            conceptos:     conceptos,
            generadoPor:   'Sistema',
            autoGenerada:  true,
            detalle: {
                noches:          noches,
                costoHabitacion: `$${costoHabitacion.toFixed(2)}`,
                costoAmenidades: `$${costoAmenidades.toFixed(2)}`,
                costoCliente:    `$${ajuste.toFixed(2)}`,
                amenidades:      amenidadesTexto
            }
        };

        facturas.push(nuevaFactura);
        reservasFacturadasIds.add(resId);
        cambios = true;
    });

    if (cambios) {
        localStorage.setItem('luxestay_facturas', JSON.stringify(facturas));
    }
}

// Helper compartido: resuelve cliente y habitación de una reserva
function resolverReserva(res, clientes, habitaciones) {
    const cliente = clientes.find(c => {
        if (!c.id && !c.nombre && !c.nombres) return false;

        const cId  = String(c.id || '').trim();
        const rCId = String(res.clienteId || res.idCliente || '').trim();

        if (cId !== '' && rCId !== '' && cId === rCId) return true;

        const resNombre = String(res.cliente || res.clienteNombre || '').trim();
        const cliNombre = String(c.nombre || c.nombres || '').trim();

        if (resNombre !== '' && cliNombre !== '' && cliNombre === resNombre) return true;

        return false;
    }) || { nombre: res.cliente || res.clienteNombre || res.nombreCliente || 'Cliente Desconocido' };

    const nombreCliente = cliente.nombre || cliente.nombres || 'Cliente Desconocido';

    const campoHab  = (res.habitacion || res.numeroHabitacion || res.idHabitacion || '').toString().trim();
    const numeroHab = campoHab.split(/[-–\s]/)[0].trim();

    const habitacion = habitaciones.find(h => {
        const hId  = String(h.id     || '');
        const hNum = String(h.numero || '');
        const hNom = String(h.nombre || h.tipo || '');
        return (
            (hNum !== '' && (hNum === campoHab || hNum === numeroHab)) ||
            (hId  !== '' && (hId  === campoHab || hId  === String(res.idHabitacion || ''))) ||
            (hNom !== '' && hNom === campoHab)
        );
    }) || { numero: campoHab || 'Hab. Desconocida', precio: res.precioPorNoche || res.precio || 0 };

    return { nombreCliente, habitacion, campoHab };
}

// ============================================================
//  3. RENDERIZAR TABLA Y TARJETAS DE RESUMEN
// ============================================================
function cargarFacturas() {
    const facturas = obtenerDatosGlobales('facturas');
    const tbody    = document.getElementById('tabla-facturas');
    tbody.innerHTML = '';

    let totalPendiente  = 0;
    let countPendientes = 0;
    let totalRecaudado  = 0;

    if (facturas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12 text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl block mb-2 opacity-30">receipt_long</span>
            No hay facturas registradas.
        </td></tr>`;
    }

    [...facturas].reverse().forEach(fac => {
        if (fac.estado === 'Pendiente') {
            totalPendiente += parseFloat(fac.total);
            countPendientes++;
        } else if (fac.estado === 'Completada') {
            totalRecaudado += parseFloat(fac.total);
        }

        const htmlConceptos = fac.conceptos.map(c =>
            `<span class="px-2 py-1 bg-surface-container rounded text-[10px] font-etiqueta-sm whitespace-nowrap">${c.trim()}</span>`
        ).join('');

        const htmlEstado = fac.estado === 'Completada'
            ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[12px] font-bold">
                   <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>Completada
               </span>`
            : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[12px] font-bold">
                   <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Pendiente
               </span>`;

        const generadoPor = fac.generadoPor || 'Sistema';
        const autoTag     = fac.autoGenerada
            ? `<span class="text-[10px] text-amber-600 font-semibold">● Auto</span>` : '';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-surface-container-low/50 transition-colors group';
        tr.innerHTML = `
            <td class="px-6 py-5">
                <div class="flex flex-col gap-0.5">
                    <span class="font-etiqueta-sm font-semibold text-primary">${fac.idFactura}</span>
                    <span class="text-[12px] text-on-surface-variant">${fac.fecha}</span>
                </div>
            </td>
            <td class="px-6 py-5">
                <div class="flex flex-col gap-0.5">
                    <span class="font-etiqueta-sm text-on-surface font-medium">${fac.clienteNombre}</span>
                    <span class="text-[12px] text-on-surface-variant">${fac.habNombre}</span>
                    <span class="text-[11px] text-on-surface-variant/70 flex items-center gap-1">
                        Por: ${generadoPor} ${autoTag}
                    </span>
                </div>
            </td>
            <td class="px-6 py-5"><div class="flex flex-wrap gap-1">${htmlConceptos}</div></td>
            <td class="px-6 py-5">${htmlEstado}</td>
            <td class="px-6 py-5 text-center">
                <button onclick="toggleEstadoFactura('${fac.idFactura}')"
                    class="px-3 py-2 rounded-lg text-white text-xs hover:opacity-90 transition-colors whitespace-nowrap
                           ${fac.estado === 'Completada' ? 'bg-amber-500' : 'bg-green-600'}">
                    ${fac.estado === 'Completada' ? 'Marcar Pendiente' : 'Marcar Pagada'}
                </button>
            </td>
            <td class="px-6 py-5 text-center">
                <button onclick="descargarPDF('${fac.idFactura}')"
                    class="px-3 py-2 rounded-lg bg-primary text-on-primary text-sm hover:bg-primary/90 transition-colors">
                    PDF
                </button>
            </td>
            <td class="px-6 py-5 text-center">
                <button onclick="eliminarFactura('${fac.idFactura}')"
                    class="px-3 py-2 rounded-lg bg-error text-on-error text-sm hover:bg-error/90 transition-colors">
                    Eliminar
                </button>
            </td>
            <td class="px-6 py-5 text-right font-dato-numerico font-bold">
                $${parseFloat(fac.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('monto-pendiente').textContent =
        `$${totalPendiente.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('contador-pendientes').textContent =
        `${countPendientes} factura${countPendientes !== 1 ? 's' : ''} por cobrar`;
    document.getElementById('monto-total-recaudado').textContent =
        `$${totalRecaudado.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

// --- TOGGLE ESTADO ---
function toggleEstadoFactura(idFactura) {
    const facturas = obtenerDatosGlobales('facturas');
    const idx = facturas.findIndex(f => f.idFactura === idFactura);
    if (idx === -1) return;
    facturas[idx].estado = facturas[idx].estado === 'Completada' ? 'Pendiente' : 'Completada';
    if (facturas[idx].estado === 'Completada') {
        facturas[idx].marcadaPorUsuario = nombreUsuarioActivo();
    }
    localStorage.setItem('luxestay_facturas', JSON.stringify(facturas));
    cargarFacturas();
}

// ============================================================
//  4. MODAL — SELECTOR DINÁMICO (solo reservas sin factura)
// ============================================================
function abrirModalFactura() {
    const select = document.getElementById('factura-reserva');
    select.innerHTML = '<option value="">Seleccione una reserva...</option>';

    const reservas     = obtenerDatosGlobales('reservas');
    const clientes     = obtenerDatosGlobales('clientes');
    const habitaciones = obtenerDatosGlobales('habitaciones');
    const facturas     = obtenerDatosGlobales('facturas');

    const reservasFacturadasIds = new Set(facturas.map(f => String(f.reservaId)).filter(Boolean));
    const errorEl = document.getElementById('error-reservas');

    if (reservas.length === 0) {
        errorEl.classList.remove('hidden');
    } else {
        errorEl.classList.add('hidden');
    }

    let hayDisponibles = false;

    reservas.forEach(res => {
        const resId     = String(res.id || res.codigo || '');
        const estadoRes = (res.estado || '').toLowerCase();

        if (!resId || reservasFacturadasIds.has(resId)) return;
        if (estadoRes === 'cancelado' || estadoRes === 'cancelada') return;

        const { nombreCliente, habitacion, campoHab } = resolverReserva(res, clientes, habitaciones);
        const habDisplay      = habitacion.numero || habitacion.nombre || campoHab;
        const noches          = calcularNochesReserva(res);
        const costoHabitacion = calcularCostoHabitacionDesdeReserva(res, habitacion);
        const costoAmenidades = calcularCostoAmenidadesDesdeReserva(res);
        const ajuste          = calcularAjusteClienteDesdeReserva(res, habitacion);
        const total           = calcularTotalFacturaDesdeReserva(res, habitacion);
        const amenidadesTexto = (res.amenidades || []).map(a => a.nombre || a).join(', ');

        hayDisponibles = true;

        const option = document.createElement('option');
        option.value = resId;
        option.dataset.cliente         = nombreCliente;
        option.dataset.habitacion      = habDisplay;
        option.dataset.total           = total;
        option.dataset.reservaId       = resId;
        option.dataset.clienteVip      = res.clienteVIP ? 'Sí' : 'No';
        option.dataset.amenidades      = amenidadesTexto;
        option.dataset.noches          = noches;
        option.dataset.costoHabitacion = costoHabitacion;
        option.dataset.costoAmenidades = costoAmenidades;
        option.dataset.costoCliente    = ajuste;
        option.textContent = `${nombreCliente} — Hab. ${habDisplay} (${noches} noche${noches !== 1 ? 's' : ''})`;
        select.appendChild(option);
    });

    if (!hayDisponibles && reservas.length > 0) {
        const opt = document.createElement('option');
        opt.disabled = true;
        opt.textContent = 'Todas las reservas ya tienen factura o están canceladas';
        select.appendChild(opt);
    }

    document.getElementById('modal-factura').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function autocompletarDesdeReserva() {
    const select = document.getElementById('factura-reserva');
    const form   = document.getElementById('form-nueva-factura');
    if (!select.value) { form.reset(); return; }

    const o = select.options[select.selectedIndex];
    document.getElementById('factura-cliente').value          = o.dataset.cliente;
    document.getElementById('factura-habitacion').value       = o.dataset.habitacion;
    document.getElementById('factura-noches').value           = o.dataset.noches || '';
    document.getElementById('factura-cliente-vip').value      = o.dataset.clienteVip;
    document.getElementById('factura-costo-habitacion').value = `$${parseFloat(o.dataset.costoHabitacion || 0).toFixed(2)}`;
    document.getElementById('factura-costo-amenidades').value = `$${parseFloat(o.dataset.costoAmenidades || 0).toFixed(2)}`;
    document.getElementById('factura-costo-cliente').value    = `$${parseFloat(o.dataset.costoCliente    || 0).toFixed(2)}`;
    document.getElementById('factura-total').value            = parseFloat(o.dataset.total || 0).toFixed(2);
    document.getElementById('factura-conceptos').value        = o.dataset.amenidades;
}

// ============================================================
//  5. GUARDAR FACTURA MANUAL
// ============================================================
function guardarFactura(event) {
    event.preventDefault();

    const select = document.getElementById('factura-reserva');
    if (!select.value) {
        alert('Selecciona una reserva válida antes de generar la factura.');
        return;
    }

    const reservaId = String(select.value);
    const facturas  = obtenerDatosGlobales('facturas');
    if (facturas.some(f => String(f.reservaId) === reservaId)) {
        alert('Ya existe una factura para esta reserva.');
        return;
    }

    // ✅ FIX 1: Leer usuario desde localStorage en el momento exacto del guardado
    const nombreUsuario = nombreUsuarioActivo();

    const extras    = document.getElementById('factura-conceptos').value;
    const conceptos = ['Reserva Habitación',
        ...extras.split(',').map(e => e.trim()).filter(Boolean)
    ];

    const nuevaFactura = {
        idFactura:     'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000),
        fecha:         new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        reservaId,
        clienteNombre: document.getElementById('factura-cliente').value,
        habNombre:     document.getElementById('factura-habitacion').value,
        estado:        'Pendiente',
        total:         parseFloat(document.getElementById('factura-total').value),
        conceptos,
        generadoPor:   nombreUsuario,   // ✅ nombre real del usuario logueado
        autoGenerada:  false,
        detalle: {
            noches:          document.getElementById('factura-noches').value,
            costoHabitacion: document.getElementById('factura-costo-habitacion').value,
            costoAmenidades: document.getElementById('factura-costo-amenidades').value,
            costoCliente:    document.getElementById('factura-costo-cliente').value,
            amenidades:      extras.split(',').map(i => i.trim()).filter(Boolean)
        }
    };

    facturas.push(nuevaFactura);
    localStorage.setItem('luxestay_facturas', JSON.stringify(facturas));
    cargarFacturas();
    cerrarModalFactura();
}

// ✅ FIX 2: Al eliminar, registrar el reservaId para que sincronizar no la recree
function eliminarFactura(idFactura) {
    if (!confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) return;

    const facturas  = obtenerDatosGlobales('facturas');
    const factura   = facturas.find(f => f.idFactura === idFactura);

    // Guardar el reservaId en la lista negra de eliminadas
    if (factura && factura.reservaId) {
        const eliminadasRaw = localStorage.getItem('luxestay_facturas_eliminadas');
        const eliminadas    = eliminadasRaw ? JSON.parse(eliminadasRaw) : [];
        if (!eliminadas.includes(String(factura.reservaId))) {
            eliminadas.push(String(factura.reservaId));
            localStorage.setItem('luxestay_facturas_eliminadas', JSON.stringify(eliminadas));
        }
    }

    const filtradas = facturas.filter(f => f.idFactura !== idFactura);
    localStorage.setItem('luxestay_facturas', JSON.stringify(filtradas));
    cargarFacturas();
}

function cerrarModalFactura() {
    document.getElementById('modal-factura').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.getElementById('form-nueva-factura').reset();
}

// ============================================================
//  6. CÁLCULOS
// ============================================================
function calcularNochesReserva(reserva) {
    let checkin, checkout;
    if (typeof reserva === 'object' && reserva !== null) {
        checkin  = reserva.checkin  || reserva.checkIn  || reserva.fechaEntrada || reserva.inicio;
        checkout = reserva.checkout || reserva.checkOut || reserva.fechaSalida  || reserva.fin;
    } else {
        checkin  = reserva;
        checkout = arguments[1];
    }
    if (!checkin || !checkout) return 0;
    const diff = new Date(checkout + 'T00:00:00') - new Date(checkin + 'T00:00:00');
    return diff > 0 ? Math.round(diff / 86400000) : 0;
}

function calcularCostoAmenidadesDesdeReserva(reserva) {
    return (reserva.amenidades || []).reduce((s, a) => s + parseFloat(a.costo || a.precio || 0), 0);
}

function calcularCostoHabitacionDesdeReserva(reserva, habitacion) {
    const n = calcularNochesReserva(reserva);
    const p = parseFloat(habitacion.precio || habitacion.precioPorNoche || reserva.precioPorNoche || reserva.precio || 0);
    return n * p;
}

function calcularAjusteClienteDesdeReserva(reserva, habitacion) {
    return reserva.clienteVIP ? -(0.1 * calcularCostoHabitacionDesdeReserva(reserva, habitacion)) : 0;
}

function calcularTotalFacturaDesdeReserva(reserva, habitacion) {
    return Math.max(0,
        calcularCostoHabitacionDesdeReserva(reserva, habitacion) +
        calcularCostoAmenidadesDesdeReserva(reserva) +
        calcularAjusteClienteDesdeReserva(reserva, habitacion)
    ).toFixed(2);
}

// ============================================================
//  7. PDF MEJORADO
// ============================================================
function descargarPDF(idFactura) {
    const facturas = obtenerDatosGlobales('facturas');
    const fac      = facturas.find(f => f.idFactura === idFactura);
    if (!fac) { alert('Factura no encontrada.'); return; }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('La librería jsPDF no está disponible.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc   = new jsPDF({ unit: 'pt', format: 'a4' });
    const W     = doc.internal.pageSize.getWidth();
    const H     = doc.internal.pageSize.getHeight();
    const LEFT  = 48;
    const RIGHT = W - 48;
    let   Y     = 0;

    const TEAL       = [0,   106,  99];
    const TEAL_LIGHT = [232, 245, 244];
    const GRAY       = [100, 116, 114];
    const DARK       = [25,  28,  30];
    const WHITE      = [255, 255, 255];
    const AMBER      = [217, 119,  6];
    const GREEN      = [22,  163,  74];

    function hrLine(y, color = [220, 230, 228], lw = 0.5) {
        doc.setDrawColor(...color);
        doc.setLineWidth(lw);
        doc.line(LEFT, y, RIGHT, y);
    }

    function txt(text, x, y, { size = 10, color = DARK, bold = false, align = 'left' } = {}) {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(...color);
        doc.text(String(text), x, y, { align });
    }

    // CABECERA
    doc.setFillColor(...TEAL);
    doc.rect(0, 0, W, 90, 'F');

    txt('LuxeStay', LEFT, 38, { size: 24, color: WHITE, bold: true });
    txt('Boutique Hotel', LEFT, 54, { size: 11, color: [180, 220, 218] });
    txt('FACTURA', RIGHT, 34, { size: 20, color: WHITE, bold: true, align: 'right' });
    txt(fac.idFactura, RIGHT, 52, { size: 10, color: [180, 220, 218], align: 'right' });

    const estadoColor = fac.estado === 'Completada' ? GREEN : AMBER;
    doc.setFillColor(...estadoColor);
    doc.roundedRect(RIGHT - 90, 60, 90, 20, 4, 4, 'F');
    txt(fac.estado.toUpperCase(), RIGHT - 45, 74, { size: 8, color: WHITE, bold: true, align: 'center' });

    Y = 110;

    // BLOQUE INFO
    doc.setFillColor(...TEAL_LIGHT);
    doc.roundedRect(LEFT, Y, 230, 80, 6, 6, 'F');

    txt('CLIENTE', LEFT + 12, Y + 18, { size: 8, color: GRAY, bold: true });
    txt(fac.clienteNombre, LEFT + 12, Y + 34, { size: 11, color: DARK, bold: true });
    txt(fac.habNombre,     LEFT + 12, Y + 50, { size: 9,  color: GRAY });

    const vipText = (fac.detalle && parseInt(fac.detalle.noches) > 0 && fac.clienteVIP) ? 'Cliente VIP ★' : '';
    if (vipText) txt(vipText, LEFT + 12, Y + 66, { size: 8, color: AMBER, bold: true });

    doc.setFillColor(...TEAL_LIGHT);
    doc.roundedRect(RIGHT - 200, Y, 200, 80, 6, 6, 'F');

    txt('FECHA DE EMISIÓN', RIGHT - 188, Y + 18, { size: 8, color: GRAY, bold: true });
    txt(fac.fecha, RIGHT - 188, Y + 34, { size: 10, color: DARK });

    txt('GENERADA POR', RIGHT - 188, Y + 52, { size: 8, color: GRAY, bold: true });
    // ✅ Solo usa el valor guardado en la factura — siempre correcto
    txt(fac.generadoPor || 'Sistema', RIGHT - 188, Y + 68, { size: 10, color: DARK });

    Y += 100;

    // TABLA DE DESGLOSE
    doc.setFillColor(...TEAL);
    doc.rect(LEFT, Y, RIGHT - LEFT, 26, 'F');
    txt('CONCEPTO',  LEFT  + 12,  Y + 17, { size: 9, color: WHITE, bold: true });
    txt('DETALLE',   LEFT  + 220, Y + 17, { size: 9, color: WHITE, bold: true });
    txt('IMPORTE',   RIGHT - 12,  Y + 17, { size: 9, color: WHITE, bold: true, align: 'right' });
    Y += 26;

    const det    = fac.detalle || {};
    const noches = parseInt(det.noches) || 0;

    const filas = [
        {
            concepto: 'Alojamiento',
            detalle:  `${noches} noche${noches !== 1 ? 's' : ''} × ${fac.habNombre}`,
            importe:  det.costoHabitacion || '$0.00'
        },
        {
            concepto: 'Amenidades / Servicios',
            detalle:  (det.amenidades && det.amenidades.length) ? det.amenidades.join(', ') : 'Sin extras',
            importe:  det.costoAmenidades || '$0.00'
        },
        {
            concepto: 'Ajuste cliente',
            detalle:  parseFloat(det.costoCliente || 0) < 0 ? 'Descuento VIP (10%)' : 'Sin descuento',
            importe:  det.costoCliente || '$0.00'
        }
    ];

    filas.forEach((f, i) => {
        const bg = i % 2 === 0 ? WHITE : TEAL_LIGHT;
        doc.setFillColor(...bg);
        doc.rect(LEFT, Y, RIGHT - LEFT, 30, 'F');

        txt(f.concepto, LEFT + 12,   Y + 19, { size: 9, color: DARK, bold: true });
        const detalleCorto = doc.splitTextToSize(f.detalle, 160)[0];
        txt(detalleCorto, LEFT + 220, Y + 19, { size: 8, color: GRAY });
        txt(f.importe,    RIGHT - 12, Y + 19, { size: 9, color: DARK, align: 'right' });
        Y += 30;
    });

    if (fac.conceptos && fac.conceptos.length > 1) {
        doc.setFillColor(...TEAL_LIGHT);
        doc.rect(LEFT, Y, RIGHT - LEFT, 28, 'F');
        const extras = fac.conceptos.slice(1).join(', ');
        txt('Extras incluidos', LEFT + 12, Y + 12, { size: 7.5, color: GRAY, bold: true });
        txt(doc.splitTextToSize(extras, RIGHT - LEFT - 24)[0], LEFT + 12, Y + 23, { size: 8, color: DARK });
        Y += 28;
    }

    hrLine(Y + 6, TEAL, 1);
    Y += 20;

    // TOTAL
    doc.setFillColor(...TEAL);
    doc.roundedRect(RIGHT - 200, Y, 200, 42, 6, 6, 'F');
    txt('TOTAL A PAGAR', RIGHT - 188, Y + 15, { size: 8, color: [180, 220, 218], bold: true });
    txt(`$${parseFloat(fac.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        RIGHT - 12, Y + 33, { size: 18, color: WHITE, bold: true, align: 'right' });
    Y += 60;

    // Nota de estado
    if (fac.estado === 'Pendiente') {
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(LEFT, Y, RIGHT - LEFT, 26, 4, 4, 'F');
        doc.setDrawColor(...AMBER);
        doc.setLineWidth(1);
        doc.roundedRect(LEFT, Y, RIGHT - LEFT, 26, 4, 4, 'S');
        txt('⚠ Pago pendiente — Por favor realice el pago a la brevedad.',
            LEFT + 12, Y + 17, { size: 8.5, color: AMBER, bold: true });
        Y += 36;
    } else {
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(LEFT, Y, RIGHT - LEFT, 26, 4, 4, 'F');
        doc.setDrawColor(...GREEN);
        doc.setLineWidth(1);
        doc.roundedRect(LEFT, Y, RIGHT - LEFT, 26, 4, 4, 'S');
        txt('✔ Pago completado — Gracias por su confianza.',
            LEFT + 12, Y + 17, { size: 8.5, color: GREEN, bold: true });
        Y += 36;
    }

    // PIE
    doc.setFillColor(...TEAL);
    doc.rect(0, H - 50, W, 50, 'F');
    txt('LuxeStay Boutique Hotel', W / 2, H - 30, { size: 9, color: WHITE, bold: true, align: 'center' });
    txt('Gracias por elegirnos — luxestay.com', W / 2, H - 16, { size: 7.5, color: [180, 220, 218], align: 'center' });

    doc.save(`${fac.idFactura}.pdf`);
}

// ============================================================
//  8. GRÁFICA VISUAL
// ============================================================
function actualizarGrafica() {
    const datosGrafica = {
        '6meses': [
            { mes: 'ENE', v: 30 }, { mes: 'FEB', v: 50 }, { mes: 'MAR', v: 45 },
            { mes: 'ABR', v: 75 }, { mes: 'MAY', v: 90 }, { mes: 'JUN', v: 65, destacado: true }
        ],
        '3meses': [
            { mes: 'ABR', v: 75 }, { mes: 'MAY', v: 90 }, { mes: 'JUN', v: 65, destacado: true }
        ]
    };

    const filtro     = document.getElementById('filtro-grafica').value;
    const contenedor = document.getElementById('contenedor-grafica');
    contenedor.innerHTML = '';

    datosGrafica[filtro].forEach(dato => {
        const col = document.createElement('div');
        col.className = 'w-full flex flex-col items-center gap-2 group h-full justify-end';
        const bg  = dato.destacado ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary/20 group-hover:bg-primary/40';
        const txtCls = dato.destacado ? 'text-primary font-bold' : 'text-on-surface-variant';
        col.innerHTML = `
            <div class="w-full ${bg} rounded-t-lg chart-bar" style="height:0%"></div>
            <span class="text-[10px] font-etiqueta-sm ${txtCls}">${dato.mes}</span>
        `;
        contenedor.appendChild(col);
        setTimeout(() => col.querySelector('.chart-bar').style.height = `${dato.v}%`, 50);
    });
}

// ============================================================
//  9. IMPRIMIR TABLA
// ============================================================
function printFacturas() {
    const tabla = document.getElementById('tabla-facturas');
    if (!tabla) { window.print(); return; }
    const wrapper = tabla.closest('.overflow-x-auto') || tabla.parentElement;
    const newWin  = window.open('', '_blank');
    newWin.document.write('<html><head><title>Historial de Facturas — LuxeStay</title>');
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach(n => {
        try { newWin.document.head.appendChild(n.cloneNode(true)); } catch (e) {}
    });
    newWin.document.write('</head><body style="padding:24px">');
    newWin.document.write('<h2 style="font-family:sans-serif;margin-bottom:16px">Historial de Facturas — LuxeStay</h2>');
    newWin.document.write(wrapper.outerHTML);
    newWin.document.write('</body></html>');
    newWin.document.close();
    newWin.focus();
    setTimeout(() => { newWin.print(); newWin.close(); }, 500);
}

// ============================================================
//  INICIAR
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initAppPage('facturacion');
    inicializarFacturas();
    sincronizarFacturasPendientes();
    cargarFacturas();
    actualizarGrafica();
});