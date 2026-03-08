/**
 * SHCV - Página Dashboard
 * Renderiza la vista principal del dashboard
 */

const DashboardPage = {
    /**
     * Renderiza la página completa del dashboard
     */
    async render() {
        try {
            const user = DataService.getCurrentUser();
            // Simulador de cambio de rol (si no existe, default vet)
            const currentRole = localStorage.getItem('demo_role') || user.role || 'veterinarian';

            const today = new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // Botón para cambiar de rol (Demo)
            const roleSwitcherHelper = `
                <div style="position: absolute; top: 20px; right: 20px; z-index: 1000;">
                    <button id="btnSwitchRole" class="btn btn-sm btn-secondary" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1;">
                        🔄 ${currentRole === 'admin' ? 'Ver como Veterinario' : 'Ver como Admin'}
                    </button>
                </div>
            `;

            if (currentRole === 'admin') {
                return roleSwitcherHelper + await this.renderAdminDashboard(today);
            } else {
                return roleSwitcherHelper + await this.renderVetDashboard(today);
            }
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            return Components.emptyState('⚠️', 'Error al cargar', 'Hubo un problema al cargar el dashboard. Revisa tu conexión.');
        }
    },

    /**
     * Dashboard del Veterinario (Vista Original)
     */
    async renderVetDashboard(today) {
        const stats = await DataService.getDashboardStats();
        
        // Simulamos datos para la vista operativa basados en Supabase
        const patientsResponse = await DataService.getPatients();
        const hospitalized = (patientsResponse || []).slice(0, 3).map(p => ({ ...p, admissionDate: 'Reciente', diagnosis: 'Observación' }));
        const pendingControls = [
            { patient: 'Max', type: 'Control Médico', date: 'Hoy', time: '09:00 AM' },
            { patient: 'Luna', type: 'Vacuna (Rabia)', date: 'Próxima', time: '10:30 AM' }
        ];

        return `
            <div class="dashboard-date">${today} <span class="badge badge-primary">Veterinario</span></div>
            
            <!-- Operational Stats -->
            <div class="stats-grid">
                ${Components.statCard('Pacientes Totales', stats.totalPacientes || 0, 'primary')}
                ${Components.statCard('Hospitalizados', hospitalized.length, 'danger')}
                ${Components.statCard('Pendientes', pendingControls.length, 'warning')}
                ${Components.statCard('Citas Hoy', '8', 'success')}
            </div>
            
            <!-- Main Grid -->
            <div class="dashboard-grid">
                <!-- Left Column (Main Operations) -->
                <div class="dashboard-main">
                    
                    <!-- Hospitalized Patients (Priority) -->
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="panel-header">
                            <span class="panel-title">🏥 Pacientes Hospitalizados</span>
                            <button class="btn btn-sm btn-ghost">Ver todos</button>
                        </div>
                        <div class="list-group">
                            ${hospitalized.map(p => `
                                <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="font-size: 1.5em;">${DataService.getSpeciesEmoji(p.species)}</div>
                                        <div>
                                            <div style="font-weight: bold;">${p.name}</div>
                                            <div style="font-size: 0.8em; color: #666;">${p.breed} • Ingreso: ${p.admissionDate}</div>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div class="badge badge-warning">Hospitalizado</div>
                                        <div style="font-size: 0.8em; margin-top: 4px;">${p.diagnosis}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Pending Controls & Vaccines -->
                    <div class="card">
                        <div class="panel-header">
                            <span class="panel-title">⏰ Controles y Vacunas Pendientes</span>
                        </div>
                        <div class="list-group">
                            ${pendingControls.map(c => `
                                <div class="list-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="background: #eff6ff; padding: 8px; border-radius: 50%;">📅</div>
                                        <div>
                                            <div style="font-weight: bold;">${c.patient}</div>
                                            <div style="font-size: 0.8em; color: #666;">${c.type}</div>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: bold; color: #2563eb;">${c.time}</div>
                                        <div style="font-size: 0.8em; color: #666;">${c.date}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                </div>
                
                <!-- Right Column - Schedule & Actions -->
                <div class="dashboard-sidebar">

                    
                    <!-- Quick Actions -->
                    <div class="card" id="quickActionsPanel">
                        <div class="panel-header"><span class="panel-title">⚡ Acciones Rápidas</span></div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${Components.button('Nueva Consulta', 'primary', '➕', '', 'btnQuickConsultation')}
                            ${Components.button('Registrar Paciente', 'secondary', '🐾', '', 'btnQuickPatient')}
                            ${Components.button('Ver Hospitalización', 'ghost', '🏥', '', 'btnQuickHosp')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Dashboard del Administrador (Vista Nueva)
     */
    async renderAdminDashboard(today) {
        // Datos Mock para Admin
        const adminStats = {
            totalIngresos: '$ 15.4M',
            totalUsuarios: 12, // Veterinarios + Staff
            alertasInventario: 3,
            satisfaccion: '98%'
        };

        const staffActivity = [
            { name: 'Dr. Nanda', consultas: 12, estado: 'Activo', ventas: '$ 450k' },
            { name: 'Dra. Laura', consultas: 8, estado: 'Cirugía', ventas: '$ 1.2M' },
            { name: 'Dr. Carlos', consultas: 5, estado: 'Descanso', ventas: '$ 200k' }
        ];

        return `
            <div class="dashboard-date">${today} <span class="badge badge-danger">Administrador</span></div>
            
            <!-- Admin Stats Cards -->
            <div class="stats-grid">
                ${Components.statCard('Ingresos (Mes)', adminStats.totalIngresos, 'success')}
                ${Components.statCard('Personal Activo', adminStats.totalUsuarios, 'primary')}
                ${Components.statCard('Alertas Stock', adminStats.alertasInventario, 'danger')}
                ${Components.statCard('Satisfacción', adminStats.satisfaccion, 'info')}
            </div>
            
            <!-- Main Grid -->
            <div class="dashboard-grid">
                <!-- Left Column (Wider for Admin Tables) -->
                <div class="dashboard-main" style="grid-column: span 3;">
                    
                    <!-- Panel 1: Rendimiento del Personal -->
                    <div class="card">
                        <div class="panel-header">
                            <span class="panel-title">👥 Rendimiento del Personal (Hoy)</span>
                            <button class="btn btn-sm btn-ghost">Exportar</button>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <thead>
                                <tr style="background: #f8fafc; text-align: left;">
                                    <th style="padding: 10px;">Veterinario</th>
                                    <th style="padding: 10px;">Consultas</th>
                                    <th style="padding: 10px;">Estado Actual</th>
                                    <th style="padding: 10px;">Facturación (Est.)</th>
                                    <th style="padding: 10px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${staffActivity.map(staff => `
                                    <tr style="border-bottom: 1px solid #e2e8f0;">
                                        <td style="padding: 10px;"><strong>${staff.name}</strong></td>
                                        <td style="padding: 10px;">${staff.consultas}</td>
                                        <td style="padding: 10px;"><span class="badge badge-${staff.estado === 'Activo' ? 'success' : (staff.estado === 'Cirugía' ? 'warning' : 'secondary')}">${staff.estado}</span></td>
                                        <td style="padding: 10px;">${staff.ventas}</td>
                                        <td style="padding: 10px;"><button class="btn btn-sm btn-ghost">Detalles</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Panel 2: Auditoría / Actividad Reciente -->
                    <div style="margin-top: 20px;" class="card">
                        <div class="panel-header">
                            <span class="panel-title">🛡️ Auditoría del Sistema</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                            <div style="display: flex; gap: 10px; align-items: center; padding: 10px; background: #f8fafc; border-radius: 6px;">
                                <span>🕐 10:45 AM</span>
                                <strong>Dr. Nanda</strong>
                                <span>creó una nueva prescripción para "Max"</span>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center; padding: 10px; background: #f8fafc; border-radius: 6px;">
                                <span>🕐 10:30 AM</span>
                                <strong>Recepción</strong>
                                <span>registró un nuevo paciente "Luna"</span>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center; padding: 10px; background: #fff1f2; border-radius: 6px; border-left: 3px solid #f43f5e;">
                                <span>🕐 09:15 AM</span>
                                <strong>Sistema</strong>
                                <span>Alerta de stock bajo para: Amoxicilina</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Right Column - Admin Actions -->
                <div class="dashboard-sidebar">
                    <div class="card">
                        <div class="panel-header"><span class="panel-title">⚡ Gestión</span></div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${Components.button('Gestionar Usuarios', 'primary', '👥', '', 'btnManageUsers')}
                            ${Components.button('Configuración', 'secondary', '⚙️', '', 'btnSettings')}
                            ${Components.button('Reportes Financieros', 'ghost', '💰', '', 'btnFinance')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa la lógica del Dashboard
     */
    init() {
        // Toggle Role Logic
        const btnSwitch = document.getElementById('btnSwitchRole');
        if (btnSwitch) {
            btnSwitch.addEventListener('click', async () => {
                const current = localStorage.getItem('demo_role') || 'veterinarian';
                const next = current === 'veterinarian' ? 'admin' : 'veterinarian';
                localStorage.setItem('demo_role', next);

                // Reload dashboard via App controller to ensure proper re-initialization
                App.navigateTo('dashboard');
                // Note: navigateTo might not reload if already there? 
                // But loadPage does. navigateTo checks nav items.
                // It's safer to just reload the page content directly or force reload.
                // Since we are already ON dashboard, navigateTo might do nothing if it checks "active".
                // Let's check navigateTo. It sets active class then calls loadPage.
                // loadPage just does innerHTML = ...
                // So yes, App.navigateTo('dashboard') or App.loadPage('dashboard') works.
                // I'll use App.loadPage('dashboard') to be direct.
                await App.loadPage('dashboard');
            });
        }

        // Event listeners based on active view
        const currentRole = localStorage.getItem('demo_role') || 'veterinarian';

        if (currentRole === 'admin') {
            document.getElementById('btnManageUsers')?.addEventListener('click', () => alert('Funcionalidad de Gestión de Usuarios'));
        } else {
            // Vet View Listeners
            document.getElementById('btnQuickConsultation')?.addEventListener('click', () => {
                localStorage.setItem('autoOpenConsultation', 'true');
                App.navigateTo('consultations');
            });

            document.getElementById('btnQuickPatient')?.addEventListener('click', () => {
                App.navigateTo('patients');
            });

            document.getElementById('btnQuickHosp')?.addEventListener('click', () => {
                App.navigateTo('hospitalization');
            });
        }
    }
};
