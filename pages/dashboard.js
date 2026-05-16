// ============================================================
//  DASHBOARD.JS — LuxeStay Boutique
//  Stats calculadas desde luxestay_facturas + luxestay_reservas
// ============================================================

function inicializarDatos() {
    if (!localStorage.getItem('luxestay_habitaciones')) {
        const habitaciones = [
            { numero: '101', tipo: 'Suite Deluxe',   estado: 'Ocupada',     precio: 220 },
            { numero: '102', tipo: 'Vista al Mar',    estado: 'Disponible',  precio: 240 },
            { numero: '103', tipo: 'Estándar King',   estado: 'Limpieza',    precio: 180 },
            { numero: '104', tipo: 'Twin Boutique',   estado: 'Disponible',  precio: 160 }
        ];
        localStorage.setItem('luxestay_habitaciones', JSON.stringify(habitaciones));
    }

    if (!localStorage.getItem('luxestay_reservas')) {
        const reservas = [
            { id: 1, cliente: 'Marcus Sterling', habitacion: 'Suite Deluxe', checkIn: '2023-10-24', checkout: '2023-10-27', total: 1240.00, estadoPago: 'Pagado',    iniciales: 'MS', color: 'bg-primary-container text-on-primary-container' },
            { id: 2, cliente: 'Lydia Whitmore',  habitacion: 'Vista al Mar',  checkIn: '2023-10-25', checkout: '2023-10-28', total: 680.00,  estadoPago: 'Pendiente', iniciales: 'LW', color: 'bg-secondary-container text-on-secondary-container' },
            { id: 3, cliente: 'Bastien Kolsen',  habitacion: 'Estándar King', checkIn: '2023-10-25', checkout: '2023-10-30', total: 2100.00, estadoPago: 'Pagado',    iniciales: 'BK', color: 'bg-tertiary-container text-on-tertiary-container' }
        ];
        localStorage.setItem('luxestay_reservas', JSON.stringify(reservas));
    }
}

// ── Helpers de lectura ─────────────────────────────────────
function obtenerLS(clave) {
    try { return JSON.parse(localStorage.getItem(clave)) || []; }
    catch (e) { return []; }
}

// ============================================================
//  STATS — todo desde luxestay_facturas + luxestay_reservas
// ============================================================
function actualizarDashboardStats() {
    const facturas     = obtenerLS('luxestay_facturas');
    const reservas     = obtenerLS('luxestay_reservas');
    const habitaciones = obtenerLS('luxestay_habitaciones');
    const hoyStr       = new Date().toISOString().split('T')[0];

    // ── 1. TASA DE OCUPACIÓN ──────────────────────────────
    // Habitaciones que tienen una reserva activa (checkIn ≤ hoy < checkout)
    // Se apoya en reservas porque las facturas no guardan fechas de estancia.
    const habitacionesOcupadas = new Set();
    reservas.forEach(r => {
        const estado = (r.estado || r.estadoPago || '').toLowerCase();
        if (estado === 'cancelado' || estado === 'cancelada') return;
        const ci = r.checkIn  || r.checkin  || r.fechaEntrada || '';
        const co = r.checkout || r.checkOut || r.fechaSalida  || '';
        if (ci && co && ci <= hoyStr && co > hoyStr) {
            habitacionesOcupadas.add(r.habitacion || r.numeroHabitacion || '');
        }
    });
    const totalHabs  = habitaciones.length || 1;
    const pctOcupacion = Math.round((habitacionesOcupadas.size / totalHabs) * 100);

    // ── 2. CHECK-INS HOY ─────────────────────────────────
    // Reservas cuyo checkIn es hoy y no están canceladas
    const checkinsHoy = reservas.filter(r => {
        const estado = (r.estado || r.estadoPago || '').toLowerCase();
        if (estado === 'cancelado' || estado === 'cancelada') return false;
        const ci = r.checkIn || r.checkin || r.fechaEntrada || '';
        return ci === hoyStr;
    }).length;

    // ── 3. INGRESOS DIARIOS ───────────────────────────────
    // Facturas Completadas cuya fecha de emisión es hoy.
    // La fecha en facturas tiene formato "DD MMM AAAA" (ej: "16 may. 2026")
    // Convertimos hoy al mismo formato para comparar.
    const hoyFormato = new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).toLowerCase();

    const ingresosHoy = facturas
        .filter(f => {
            const fechaFac = (f.fecha || '').toLowerCase();
            // Comparar la parte de día, mes y año
            return fechaFac === hoyFormato && f.estado === 'Completada';
        })
        .reduce((sum, f) => sum + parseFloat(f.total || 0), 0);

    // ── 4. PAGOS PENDIENTES ───────────────────────────────
    // Facturas con estado "Pendiente"
    const pendientes = facturas.filter(f => f.estado === 'Pendiente').length;

    // ── Actualizar DOM ────────────────────────────────────
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('dashboard-ocupacion-pct',    `${pctOcupacion}%`);
    set('dashboard-ocupacion-valor',  `${pctOcupacion > 0 ? '+' + pctOcupacion : 0}%`);
    set('dashboard-checkins-valor',   checkinsHoy);
    set('dashboard-checkins-label',   `${checkinsHoy} reserva${checkinsHoy !== 1 ? 's' : ''}`);
    set('dashboard-ingresos-valor',   `$${ingresosHoy.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    set('dashboard-pendientes-valor', pendientes);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initAppPage('dashboard');
    inicializarDatos();
    actualizarDashboardStats();
});