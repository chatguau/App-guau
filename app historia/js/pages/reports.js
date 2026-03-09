/**
 * SHCV - Página Reportes
 * Generación de reportes y estadísticas
 */

const ReportsPage = {
    /**
     * Renderiza la página de reportes
     */
    async render() {
        // Mostrar estado de carga inicial
        return `
            <div class="reports-page">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Generando reportes y estadísticas...</p>
                </div>
            </div>
        `;
    },

    /**
     * Llamado después de renderizar el contenedor principal para cargar los datos
     */
    async loadAndRender() {
        try {
            const stats = await this.calculateStats();
            const speciesChartHtml = await this.renderSpeciesChart();
            const vetOptionsHtml = await this.getVeterinarianOptions();
            const patientOptionsHtml = await this.getPatientOptions();

            const html = `
                <div class="reports-page">
                <!-- Quick Stats -->
                <div class="reports-stats">
                    <div class="report-stat-card">
                        <div class="stat-icon">🐾</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.totalPatients}</div>
                            <div class="stat-label">Pacientes Totales</div>
                        </div>
                    </div>
                    <div class="report-stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.totalConsultations}</div>
                            <div class="stat-label">Consultas</div>
                        </div>
                    </div>
                    <div class="report-stat-card">
                        <div class="stat-icon">💉</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.totalVaccinations}</div>
                            <div class="stat-label">Vacunas Aplicadas</div>
                        </div>
                    </div>
                    <div class="report-stat-card">
                        <div class="stat-icon">🏥</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.activeHospitalizations}</div>
                            <div class="stat-label">Hospitalizados</div>
                        </div>
                    </div>
                </div>

                <!-- Report Types -->
                <div class="reports-grid">
                    <!-- Reporte de Pacientes -->
                    <div class="report-card">
                        <div class="report-card-header">
                            <span class="report-icon">📊</span>
                            <h3>Estadísticas de Pacientes</h3>
                        </div>
                        <div class="report-card-body">
                            <p>Distribución de pacientes por especie, raza y estado.</p>
                            ${speciesChartHtml}
                        </div>
                        <div class="report-card-footer">
                            <button class="btn btn-primary btn-sm" onclick="ReportsPage.openPatientsFilterModal()">
                                ⚙️ Configurar y Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Reporte de Consultas -->
                    <div class="report-card">
                        <div class="report-card-header">
                            <span class="report-icon">📋</span>
                            <h3>Reporte de Consultas</h3>
                        </div>
                        <div class="report-card-body">
                            <p>Consultas realizadas por período y tipo.</p>
                            <div class="mini-stat-row">
                                <div class="mini-stat">
                                    <span class="mini-stat-label">Este mes</span>
                                    <span class="mini-stat-value">${stats.consultationsThisMonth}</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="mini-stat-label">Promedio/día</span>
                                    <span class="mini-stat-value">${stats.avgConsultationsPerDay}</span>
                                </div>
                            </div>
                        </div>
                        <div class="report-card-footer">
                            <button class="btn btn-primary btn-sm" onclick="ReportsPage.openConsultationFilters()">
                                ⚙️ Configurar y Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Reporte de Vacunación -->
                    <div class="report-card">
                        <div class="report-card-header">
                            <span class="report-icon">💉</span>
                            <h3>Reporte de Vacunación</h3>
                        </div>
                        <div class="report-card-body">
                            <p>Estado de vacunación de pacientes activos.</p>
                            <div class="vaccination-status-bar">
                                <div class="status-segment al-dia" style="width: ${stats.vaccinationUpToDate}%"></div>
                                <div class="status-segment pendiente" style="width: ${stats.vaccinationPending}%"></div>
                            </div>
                            <div class="status-legend">
                                <span><span class="dot al-dia"></span> Al día: ${stats.vaccinationUpToDate}%</span>
                                <span><span class="dot pendiente"></span> Pendiente: ${stats.vaccinationPending}%</span>
                            </div>
                        </div>
                        <div class="report-card-footer">
                            <button class="btn btn-primary btn-sm" onclick="ReportsPage.openVaccinationFilters()">
                                ⚙️ Configurar y Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Historia Clínica Individual -->
                    <div class="report-card">
                        <div class="report-card-header">
                            <span class="report-icon">🐕</span>
                            <h3>Historia Clínica</h3>
                        </div>
                        <div class="report-card-body">
                            <p>Genera el historial completo de un paciente.</p>
                        </div>
                        <div class="report-card-footer">
                            <button class="btn btn-primary btn-sm" onclick="ReportsPage.openHistoryFilters()">
                                ⚙️ Configurar y Generar
                            </button>
                        </div>
                    </div>

                    <!-- Reporte de Controles -->
                    <div class="report-card">
                        <div class="report-card-header">
                            <span class="report-icon">📅</span>
                            <h3>Reporte de Controles</h3>
                        </div>
                        <div class="report-card-body">
                            <p>Seguimiento de próximos controles y controles vencidos.</p>
                        </div>
                        <div class="report-card-footer">
                            <button class="btn btn-primary btn-sm" onclick="ReportsPage.openControlsFilterModal()">
                                ⚙️ Configurar y Exportar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Reporte de Desparasitación -->
                    <div class="report-card">
                        <div class="report-card-header">
                            <span class="report-icon">💊</span>
                            <h3>Reporte de Desparasitación</h3>
                        </div>
                        <div class="report-card-body">
                            <p>Informe de aplicaciones internas y externas.</p>
                        </div>
                        <div class="report-card-footer">
                            <button class="btn btn-primary btn-sm" onclick="ReportsPage.openDewormingFilterModal()">
                                ⚙️ Configurar y Exportar
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            
            <!-- Modal Filtros Pacientes -->
            <div class="modal-backdrop" id="patientsFilterModal" onclick="if(event.target === this) ReportsPage.closePatientsFilterModal()">
                <div class="modal-content" style="max-width: 500px; background-color: var(--color-surface); padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Filtrar Estadísticas de Pacientes</h3>
                        <button class="btn btn-ghost btn-sm" onclick="ReportsPage.closePatientsFilterModal()" style="font-size: 1.2em;">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label class="label">Registrado Desde</label>
                                <input type="date" id="patFilterDateStart" class="input">

                            </div>
                            <div class="form-group">
                                <label class="label">Hasta</label>
                                <input type="date" id="patFilterDateEnd" class="input">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Especie</label>
                            <select id="patFilterSpecies" class="input" onchange="ReportsPage.updatePatientFilterBreeds()">
                                <option value="">Todas las especies</option>
                                <option value="canino">🐕 Canino</option>
                                <option value="felino">🐱 Felino</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Raza</label>
                            <select id="patFilterBreed" class="input">
                                <option value="">Todas las razas</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ReportsPage.closePatientsFilterModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="ReportsPage.generateFilteredPatientsReport()">Generar Reporte PDF</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal Filtros Desparasitación -->
            <div class="modal-backdrop" id="dewormingFilterModal" onclick="if(event.target === this) ReportsPage.closeDewormingFilterModal()">
                <div class="modal-content" style="max-width: 500px; background-color: var(--color-surface); padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Filtrar Reporte de Desparasitación</h3>
                        <button class="btn btn-ghost btn-sm" onclick="ReportsPage.closeDewormingFilterModal()" style="font-size: 1.2em;">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label class="label">Desde</label>
                                <input type="date" id="dewormFilterDateStart" class="input">
                            </div>
                            <div class="form-group">
                                <label class="label">Hasta</label>
                                <input type="date" id="dewormFilterDateEnd" class="input">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Tipo</label>
                            <select id="dewormFilterType" class="input">
                                <option value="all">Todos</option>
                                <option value="internal">Interna</option>
                                <option value="external">Externa</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ReportsPage.closeDewormingFilterModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="ReportsPage.generateDewormingReport()">Generar PDF</button>
                    </div>
                </div>
            </div>

            <!-- Modal Filtros Controles -->
            <div class="modal-backdrop" id="controlsFilterModal" onclick="if(event.target === this) ReportsPage.closeControlsFilterModal()">
                <div class="modal-content" style="max-width: 500px; background-color: var(--color-surface); padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Filtrar Reporte de Controles</h3>
                        <button class="btn btn-ghost btn-sm" onclick="ReportsPage.closeControlsFilterModal()" style="font-size: 1.2em;">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Estado del Control</label>
                            <select id="controlFilterStatus" class="input">
                                <option value="upcoming">Próximos (Futuros)</option>
                                <option value="expired">Vencidos (Pasados)</option>
                                <option value="all">Todos</option>
                            </select>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label class="label">Rango Desde (Opcional)</label>
                                <input type="date" id="controlFilterDateStart" class="input">
                            </div>
                            <div class="form-group">
                                <label class="label">Hasta (Opcional)</label>
                                <input type="date" id="controlFilterDateEnd" class="input">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ReportsPage.closeControlsFilterModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="ReportsPage.generateControlsReport()">Generar Reporte PDF</button>
                    </div>
                </div>
            </div>

            <!-- Modal Filtros Consultas -->
            <div class="modal-backdrop" id="consultationFilterModal" onclick="if(event.target === this) ReportsPage.closeFilterModal()">
                <div class="modal-content" style="max-width: 500px; background-color: var(--color-surface); padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Filtrar Reporte de Consultas</h3>
                        <button class="btn btn-ghost btn-sm" onclick="ReportsPage.closeFilterModal()" style="font-size: 1.2em;">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label class="label">Desde</label>
                                <input type="date" id="filterDateStart" class="input">
                            </div>
                            <div class="form-group">
                                <label class="label">Hasta</label>
                                <input type="date" id="filterDateEnd" class="input">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Especie</label>
                            <select id="filterSpecies" class="input">
                                <option value="">Todas las especies</option>
                                <option value="canino">🐕 Canino</option>
                                <option value="felino">🐱 Felino</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Diagnóstico (contiene)</label>
                            <input type="text" id="filterDiagnosis" class="input" placeholder="Ej. Gastroenteritis">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Veterinario</label>
                            <select id="filterVet" class="input">
                                <option value="">Todos los veterinarios</option>
                                \${vetOptionsHtml}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ReportsPage.closeFilterModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="ReportsPage.generateFilteredReport()">Generar Reporte PDF</button>
                    </div>
                </div>
            </div>

            <!-- Modal Filtros Vacunación -->
            <div class="modal-backdrop" id="vaccinationFilterModal" onclick="if(event.target === this) ReportsPage.closeVaccinationFilterModal()">
                <div class="modal-content" style="max-width: 500px; background-color: var(--color-surface); padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Filtrar Reporte de Vacunación</h3>
                        <button class="btn btn-ghost btn-sm" onclick="ReportsPage.closeVaccinationFilterModal()" style="font-size: 1.2em;">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 16px;">
                            <label class="label">Mostrar:</label>
                            <div style="display: flex; gap: 16px; margin-top: 8px;">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="vacReportType" value="applied" checked> Aplicadas
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="vacReportType" value="upcoming"> Próximas
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="vacReportType" value="all"> Todo el historial
                                </label>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label class="label">Desde</label>
                                <input type="date" id="vacFilterDateStart" class="input">
                            </div>
                            <div class="form-group">
                                <label class="label">Hasta</label>
                                <input type="date" id="vacFilterDateEnd" class="input">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Especie</label>
                            <select id="vacFilterSpecies" class="input">
                                <option value="">Todas las especies</option>
                                <option value="canino">🐕 Canino</option>
                                <option value="felino">🐱 Felino</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Vacuna (Nombre)</label>
                            <input type="text" id="vacFilterType" class="input" placeholder="Ej. Rabia, Triple...">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Veterinario</label>
                            <select id="vacFilterVet" class="input">
                                <option value="">Todos los veterinarios</option>
                                \${vetOptionsHtml}
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ReportsPage.closeVaccinationFilterModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="ReportsPage.generateFilteredVaccinationReport()">Generar Reporte PDF</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal Filtros Historia Clínica -->
            <div class="modal-backdrop" id="historyFilterModal" onclick="if(event.target === this) ReportsPage.closeHistoryFilterModal()">
                <div class="modal-content" style="max-width: 500px; background-color: var(--color-surface); padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                   <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Filtrar Historia Clínica</h3>
                        <button class="btn btn-ghost btn-sm" onclick="ReportsPage.closeHistoryFilterModal()" style="font-size: 1.2em;">×</button>
                    </div>
                    <div class="modal-body">
                         <div class="form-group" style="margin-bottom: 12px;">
                            <label class="label">Buscar por Cédula Propietario</label>
                            <input type="text" id="histFilterOwnerId" class="input" placeholder="Ingrese número de documento..." oninput="ReportsPage.searchPatientForHistory()">
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="label">Paciente</label>
                            <select id="histFilterPatient" class="input">
                                <option value="">-- Seleccionar paciente --</option>
                                \${patientOptionsHtml}
                            </select>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label class="label">Desde</label>
                                <input type="date" id="histFilterDateStart" class="input">
                            </div>
                            <div class="form-group">
                                <label class="label">Hasta</label>
                                <input type="date" id="histFilterDateEnd" class="input">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ReportsPage.closeHistoryFilterModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="ReportsPage.generateFilteredPatientHistory()">Generar Historia PDF</button>
                    </div>
                </div>
            </div>
        \`;
            
            // Insertar el HTML
            const container = document.querySelector('.reports-page');
            if (container && container.parentElement) {
                container.parentElement.innerHTML = html;
            }
            this.init();
            
        } catch (error) {
            console.error('Error cargando reportes:', error);
            const container = document.querySelector('.reports-page');
            if (container) {
                container.innerHTML = \`<div class="error-state">Error al cargar reportes: \${error.message}</div>\`;
            }
        }
    },
    
    /**
     * Calcula estadísticas
     */
    async calculateStats() {
        const patients = await DataService.getPatients() || [];
        const consultations = await DataService.getConsultations() || [];
        const vaccinations = await DataService.getVaccinations() || [];
        const hospitalizations = await DataService.getHospitalizations() || [];

        // Distribución por especie
        const speciesCount = {};
        patients.forEach(p => {
            speciesCount[p.species] = (speciesCount[p.species] || 0) + 1;
        });

        // Consultas este mes
        const thisMonth = new Date().getMonth();
        const consultationsThisMonth = consultations.filter(c => {
            const dateStr = c.date || c.created_at;
            if (!dateStr) return false;
            return new Date(dateStr).getMonth() === thisMonth;
        }).length;

        // Hospitalizados activos
        const activeHosp = hospitalizations.filter(h => h.status === 'active').length;

        // Vacunas pendientes
        const today = new Date();
        const pendingVaccines = vaccinations.filter(v => {
            const nextDose = v.next_dose_date || v.nextDoseDate;
            if (!nextDose) return false;
            return new Date(nextDose) <= today;
        }).length;
        const upToDatePercent = vaccinations.length > 0
            ? Math.round(((vaccinations.length - pendingVaccines) / vaccinations.length) * 100)
            : 100;

        return {
            totalPatients: patients.length,
            totalConsultations: consultations.length,
            totalVaccinations: vaccinations.length,
            activeHospitalizations: activeHosp,
            consultationsThisMonth: consultationsThisMonth,
            avgConsultationsPerDay: (consultations.length / 30).toFixed(1),
            vaccinationUpToDate: upToDatePercent,
            vaccinationPending: 100 - upToDatePercent,
            avgHospDays: 3.2,
            occupancyRate: activeHosp > 0 ? 40 : 0,
            speciesDistribution: speciesCount
        };
    },

    /**
     * Renderiza gráfico de especies
     */
    async renderSpeciesChart() {
        const patients = await DataService.getPatients() || [];
        const species = {};
        patients.forEach(p => {
            const key = p.species;
            species[key] = (species[key] || 0) + 1;
        });

        const total = patients.length;
        const colors = {
            canino: 'var(--color-primary)',
            felino: 'var(--color-accent)'
        };
        const emojis = { canino: '🐕', felino: '🐱' };

        return \`
            <div class="species-chart">
                \${Object.entries(species).map(([key, count]) => {
            const percent = Math.round((count / total) * 100);
            return \`
                        <div class="species-bar-container">
                            <span class="species-label">\${emojis[key] || '🐾'} \${key}</span>
                            <div class="species-bar-wrapper">
                                <div class="species-bar" style="width: \${percent}%; background: \${colors[key] || 'var(--color-primary)'}"></div>
                            </div>
                            <span class="species-count">\${count} (\${percent}%)</span>
                        </div>
                    \`;
        }).join('')}
            </div>
        \`;
    },

    /**
     * Opciones de pacientes para select
     */
    async getPatientOptions() {
        const patients = await DataService.getPatients() || [];
        const optionsHtml = await Promise.all(patients.map(async p => {
            const emoji = DataService.getSpeciesEmoji(p.species);
            return \`<option value="\${p.id}">\${emoji} \${p.name} - \${p.medical_record_number || p.medicalRecordNumber}</option>\`;
        }));
        return optionsHtml.join('');
    },

    async getVeterinarianOptions() {
        const vets = await DataService.getVeterinarians() || [];
        return vets.map(v => \`<option value="\${v.id}">\${v.full_name || v.name}</option>\`).join('');
    },

    openConsultationFilters() {
        document.getElementById('consultationFilterModal').classList.add('active');
        // Set default dates (this month)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('filterDateStart').valueAsDate = firstDay;
        document.getElementById('filterDateEnd').valueAsDate = today;
    },

    closeFilterModal() {
        document.getElementById('consultationFilterModal').classList.remove('active');
    },

    async generateFilteredReport() {
        const startDate = document.getElementById('filterDateStart').value;
        const endDate = document.getElementById('filterDateEnd').value;
        const species = document.getElementById('filterSpecies').value;
        const diagnosis = document.getElementById('filterDiagnosis').value.toLowerCase();
        const vetId = document.getElementById('filterVet').value;

        let consultations = await DataService.getConsultations() || [];

        // Necesitamos procesar los pacientes asíncronamente
        const filteredConsultations = [];

        for (const c of consultations) {
            let matches = true;
            const cDate = c.date || c.created_at;

            // Fecha
            if (startDate && cDate < startDate) matches = false;
            if (endDate && cDate > endDate) matches = false;

            // Diagnóstico
            if (diagnosis && (!c.diagnosis || !c.diagnosis.toLowerCase().includes(diagnosis))) matches = false;

            // Medico
            if (vetId && (c.veterinarian_id || c.veterinarianId) !== vetId) matches = false;

            // Especie
            if (species) {
                const patient = await DataService.getPatientById(c.patient_id || c.patientId);
                if (!patient || patient.species !== species) matches = false;
            }

            if (matches) {
                filteredConsultations.push(c);
            }
        }

        if (filteredConsultations.length === 0) {
            alert('No se encontraron consultas con los filtros seleccionados.');
            return;
        }

        // Generate Content
        let html = \`<h3>Listado de Consultas Filtradas</h3>\`;
        html += '<table style="width:100%; border-collapse: collapse;"><thead><tr style="background:#f1f5f9;"><th style="padding:8px; text-align:left;">Fecha</th><th style="padding:8px; text-align:left;">Paciente</th><th style="padding:8px; text-align:left;">Motivo</th><th style="padding:8px; text-align:left;">Diagnóstico</th><th style="padding:8px; text-align:left;">Veterinario</th></tr></thead><tbody>';

        const rows = await Promise.all(filteredConsultations.map(async c => {
            const patient = await DataService.getPatientById(c.patient_id || c.patientId);
            const vet = await DataService.getVeterinarianById(c.veterinarian_id || c.veterinarianId);
            return \`<tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${DataService.formatDate(c.date || c.created_at)}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${patient ? patient.name : '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${c.reason}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${c.diagnosis || 'No especificado'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${vet ? vet.full_name || vet.name : '-'}</td>
            </tr>\`;
        }));

        html += rows.join('') + '</tbody></table>';
        html += \`<p><strong>Total Registros:</strong> \${filteredConsultations.length}</p>\`;

        this.generatePDF('Reporte de Consultas (Personalizado)', html);
        this.closeFilterModal();
    },

    openVaccinationFilters() {
        document.getElementById('vaccinationFilterModal').classList.add('active');
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('vacFilterDateStart').valueAsDate = firstDay;
        document.getElementById('vacFilterDateEnd').valueAsDate = today;
    },

    closeVaccinationFilterModal() {
        document.getElementById('vaccinationFilterModal').classList.remove('active');
    },

    async generateFilteredVaccinationReport() {
        try {
            const startDate = document.getElementById('vacFilterDateStart').value;
            const endDate = document.getElementById('vacFilterDateEnd').value;
            const species = document.getElementById('vacFilterSpecies').value;
            const vacType = document.getElementById('vacFilterType').value.toLowerCase();
            const vetId = document.getElementById('vacFilterVet').value;
            const reportTypeInput = document.querySelector('input[name="vacReportType"]:checked');
            const reportType = reportTypeInput ? reportTypeInput.value : 'applied';

            const vaccinations = await DataService.getVaccinations() || [];

            const filtered = [];
            
            for (const v of vaccinations) {
                let matches = true;
                // Filtro por tipo de fecha
                let dateToCheck = v.applicationDate || v.date; // Fallback
                if (reportType === 'upcoming') {
                    if (!v.next_dose_date && !v.nextDoseDate) matches = false;
                    dateToCheck = v.next_dose_date || v.nextDoseDate;
                }

                if (startDate && dateToCheck < startDate) matches = false;
                if (endDate && dateToCheck > endDate) matches = false;

                // Tipo de Vacuna
                const vName = (v.vaccine_name || v.vaccineType || v.vaccineName || '').toLowerCase();
                if (vacType && !vName.includes(vacType)) matches = false;

                // Veterinario
                if (vetId && (v.veterinarian_id || v.veterinarianId) !== vetId) matches = false;

                // Especie
                if (species) {
                    const patient = await DataService.getPatientById(v.patient_id || v.patientId);
                    if (!patient || patient.species !== species) matches = false;
                }

                if (matches) {
                    filtered.push(v);
                }
            }

            if (filtered.length === 0) {
                alert('No hay registros que coincidan con los filtros seleccionados.');
                return;
            }

            // Sorting
            filtered.sort((a, b) => {
                const dateA = reportType === 'upcoming' ? (a.next_dose_date || a.nextDoseDate) : (a.applicationDate || a.date);
                const dateB = reportType === 'upcoming' ? (b.next_dose_date || b.nextDoseDate) : (b.applicationDate || b.date);
                return new Date(dateA) - new Date(dateB);
            });

            let title = 'Reporte de Vacunación';
            if (reportType === 'applied') title += ' - Aplicadas';
            if (reportType === 'upcoming') title += ' - Próximas Dosis';
            if (species) title += \` (\${species})\`;

            const contentHtml = await this.generateVaccinationContent(filtered);
            this.generatePDF(title, contentHtml);
            this.closeVaccinationFilterModal();

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Hubo un error al generar el reporte: ' + error.message);
        }
    },

    async openHistoryFilters() {
        document.getElementById('historyFilterModal').classList.add('active');

        // Reset search
        document.getElementById('histFilterOwnerId').value = '';
        const patients = await DataService.getPatients() || [];
        await this.renderPatientOptionsInModal(patients);

        // Reset patient selection
        document.getElementById('histFilterPatient').value = '';
    },

    async searchPatientForHistory() {
        const query = document.getElementById('histFilterOwnerId').value;
        if (!query) {
            const patients = await DataService.getPatients() || [];
            await this.renderPatientOptionsInModal(patients);
            return;
        }

        const results = await DataService.searchPatients(query) || [];
        await this.renderPatientOptionsInModal(results);

        if (results.length === 1) {
            document.getElementById('histFilterPatient').value = results[0].id;
        }
    },

    async renderPatientOptionsInModal(patients) {
        const select = document.getElementById('histFilterPatient');
        if (patients.length === 0) {
            select.innerHTML = '<option value="">-- No se encontraron pacientes --</option>';
            return;
        }

        const optionsHtml = await Promise.all(patients.map(async p => {
            const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
            return \`<option value="\${p.id}">\${DataService.getSpeciesEmoji(p.species)} \${p.name} (\${owner?.full_name || owner?.fullName || ''} - \${owner?.document_number || owner?.documentNumber || ''})</option>\`;
        }));

        select.innerHTML = '<option value="">-- Seleccionar paciente --</option>' + optionsHtml.join('');
    },

    closeHistoryFilterModal() {
        document.getElementById('historyFilterModal').classList.remove('active');
    },

    async generateFilteredPatientHistory() {
        const patientId = document.getElementById('histFilterPatient').value;
        const startDate = document.getElementById('histFilterDateStart').value;
        const endDate = document.getElementById('histFilterDateEnd').value;

        if (!patientId) {
            alert('Por favor selecciona un paciente.');
            return;
        }

        const patient = await DataService.getPatientById(patientId);
        const timeline = await this.generateHistoryTimeline(patientId, startDate, endDate);

        const contentHtml = await this.generatePatientHistoryContent(patient, timeline);
        this.generatePDF(\`Historia Clínica - \${patient.name}\`, contentHtml);
        this.closeHistoryFilterModal();
    },

    generateHistoryTimeline(patientId, startDate, endDate) {
        let timeline = [];

        // Consultas
        const consultations = DataService.getConsultationsByPatient(patientId);
        consultations.forEach(c => {
            timeline.push({
                date: c.date,
                timestamp: new Date(c.date + 'T00:00:00').getTime(),
                type: 'CONSULTA',
                data: c,
                vetId: c.veterinarianId
            });
        });

        // Vacunas
        const vaccinations = DataService.getVaccinationsByPatient(patientId);
        vaccinations.forEach(v => {
            const date = v.applicationDate || v.date;
            timeline.push({
                date: date,
                timestamp: new Date(date + 'T00:00:00').getTime(),
                type: 'VACUNACIÓN',
                data: v,
                vetId: v.veterinarianId
            });
        });

        // Cirugías
        const surgeries = typeof SurgeriesPage !== 'undefined' ? (SurgeriesPage.surgeries || []).filter(s => s.patientId === patientId) : [];
        surgeries.forEach(s => {
            timeline.push({
                date: s.date,
                timestamp: new Date(s.date + 'T' + (s.time || '00:00')).getTime(),
                type: 'CIRUGÍA',
                data: s,
                vetId: s.surgeonId
            });
        });

        // Prescripciones (Fórmulas)
        const prescriptions = typeof PrescriptionsPage !== 'undefined' ? (PrescriptionsPage.prescriptions || []).filter(p => p.patientId === patientId) : [];
        prescriptions.forEach(p => {
            timeline.push({
                date: p.date,
                timestamp: new Date(p.date + 'T00:00:00').getTime(),
                type: 'FÓRMULA MÉDICA',
                data: p,
                vetId: p.veterinarianId
            });
        });

        // Filtrar y Ordenar
        return timeline.filter(item => {
            if (!item.date) return false;
            if (startDate && item.date < startDate) return false;
            if (endDate && item.date > endDate) return false;
            return true;
        }).sort((a, b) => b.timestamp - a.timestamp);
    },

    /**
     * Exportar reportes (simulado)
     */
    /**
     * Filtros de Pacientes
     */
    openPatientsFilterModal() {
        document.getElementById('patientsFilterModal').classList.add('active');
        // Reset inputs
        document.getElementById('patFilterDateStart').value = '';
        document.getElementById('patFilterDateEnd').value = '';
        document.getElementById('patFilterSpecies').value = '';
        this.updatePatientFilterBreeds();
    },

    closePatientsFilterModal() {
        document.getElementById('patientsFilterModal').classList.remove('active');
    },

    updatePatientFilterBreeds() {
        const species = document.getElementById('patFilterSpecies').value;
        const breedSelect = document.getElementById('patFilterBreed');

        if (!species) {
            breedSelect.innerHTML = '<option value="">Todas las razas</option>';
            return;
        }

        const breeds = DataService.getBreedsBySpecies(species);
        let options = '<option value="">Todas las razas</option>';
        options += breeds.map(b => \`<option value="\${b}">\${b}</option>\`).join('');
        breedSelect.innerHTML = options;
    },

    generateFilteredPatientsReport() {
        const startDate = document.getElementById('patFilterDateStart').value;
        const endDate = document.getElementById('patFilterDateEnd').value;
        const species = document.getElementById('patFilterSpecies').value;
        const breed = document.getElementById('patFilterBreed').value;

        // Filter Logic
        let patients = DataService.getPatients();

        patients = patients.filter(p => {
            // Check Date
            if (p.createdAt) {
                if (startDate && p.createdAt < startDate) return false;
                if (endDate && p.createdAt > endDate) return false;
            }

            // Check Species
            if (species && p.species !== species) return false;

            // Check Breed
            if (breed && p.breed !== breed) return false;

            return true;
        });

        if (patients.length === 0) {
            alert('No hay pacientes que coincidan con los filtros seleccionados.');
            return;
        }

        // Generate Title
        let title = 'Reporte de Pacientes';
        const parts = [];
        if (species) parts.push(species === 'canino' ? 'Caninos' : 'Felinos');
        if (breed) parts.push(breed);
        if (startDate || endDate) parts.push(\`(\${startDate || 'Inicio'} a \${endDate || 'Hoy'})\`);

        if (parts.length > 0) title += ' - ' + parts.join(', ');

        this.generatePDF(title, this.generatePatientsContent(patients));
        this.closePatientsFilterModal();
    },

    exportConsultationsReport() {
        this.generatePDF('Reporte de Consultas', this.generateConsultationsContent());
    },

    exportVaccinationReport() {
        this.generatePDF('Reporte de Vacunación', this.generateVaccinationContent());
    },

    exportPatientHistory() {
        // Legacy fallback
        this.openHistoryFilters();
    },

    exportHospReport() {
        // Obsoleto
    },

    generatePDF(title, content) {
        // Crear ventana de impresión
        const printWindow = window.open('', '_blank');
        printWindow.document.write(\`
            <!DOCTYPE html>
            <html>
            <head>
                <title>\${title} - Guau</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                    h2 { color: #374151; margin-top: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
                    th { background: #f3f4f6; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .date { color: #6b7280; }
                    .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="logo.png" alt="Logo" style="width: 60px; height: 60px; object-fit: contain;">
                            <h1>Guau - Clínica Veterinaria</h1>
                        </div>
                        <h2>\${title}</h2>
                    </div>
                    <div class="date">
                        <p>Fecha: \${new Date().toLocaleDateString('es-ES')}</p>
                        <p>Hora: \${new Date().toLocaleTimeString('es-ES')}</p>
                    </div>
                </div>
                \${content}
                <div class="footer">
                    <p>Generado por Guau - Gestión Veterinaria</p>
                </div>
                <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
            </body>
            </html>
        \`);
        printWindow.document.close();
    },

    async generatePatientsContent(filteredData = null) {
        const patients = filteredData || await DataService.getPatients() || [];
        let html = '<h3>Listado de Pacientes</h3>';

        if (patients.length === 0) {
            return html + '<p>No se encontraron registros.</p>';
        }

        html += '<table><thead><tr><th>HC</th><th>Nombre</th><th>Especie</th><th>Raza</th><th>Propietario</th><th>Registrado</th></tr></thead><tbody>';
        const rows = await Promise.all(patients.map(async p => {
            const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
            const regDate = p.created_at || p.createdAt ? new Date(p.created_at || p.createdAt).toLocaleDateString() : '-';
            return \`<tr><td>\${p.medical_record_number || p.medicalRecordNumber}</td><td>\${p.name}</td><td>\${p.species}</td><td>\${p.breed}</td><td>\${owner?.full_name || owner?.fullName || '-'}</td><td>\${regDate}</td></tr>\`;
        }));
        html += rows.join('') + '</tbody></table>';
        html += \`<p><strong>Total:</strong> \${patients.length} pacientes</p>\`;
        return html;
    },

    async generateConsultationsContent(filteredData = null) {
        const consultations = filteredData || await DataService.getConsultations() || [];
        let html = '<h3>Listado de Consultas</h3><table><thead><tr><th>Fecha</th><th>Paciente</th><th>Especie</th><th>Motivo</th><th>Diagnóstico</th><th>Veterinario</th></tr></thead><tbody>';
        const rows = await Promise.all(consultations.map(async c => {
            const patient = await DataService.getPatientById(c.patient_id || c.patientId);
            const vet = await DataService.getVeterinarianById(c.veterinarian_id || c.veterinarianId);
            return \`<tr>
                <td>\${c.date || c.created_at}</td>
                <td>\${patient?.name || '-'}</td>
                <td>\${patient?.species || '-'}</td>
                <td>\${c.reason}</td>
                <td>\${c.diagnosis || 'Pendiente'}</td>
                <td>\${vet?.full_name || vet?.name || '-'}</td>
            </tr>\`;
        }));
        html += rows.join('') + '</tbody></table>';
        return html;
    },

    async generateVaccinationContent(filteredData = null) {
        const vaccinations = filteredData || await DataService.getVaccinations() || [];
        let html = '<h3>Registro de Vacunación</h3><table><thead><tr><th>Fecha Apl.</th><th>Próxima</th><th>Paciente</th><th>Especie</th><th>Vacuna</th><th>Veterinario</th></tr></thead><tbody>';
        const rows = await Promise.all(vaccinations.map(async v => {
            const patient = await DataService.getPatientById(v.patient_id || v.patientId);
            const vet = await DataService.getVeterinarianById(v.veterinarian_id || v.veterinarianId);

            return \`<tr>
                <td>\${DataService.formatDate(v.applicationDate || v.date)}</td>
                <td>\${(v.next_dose_date || v.nextDoseDate) ? DataService.formatDate(v.next_dose_date || v.nextDoseDate) : '-'}</td>
                <td>\${patient?.name || '-'}</td>
                <td>\${patient?.species || '-'}</td>
                <td>\${v.vaccine_name || v.vaccineType || v.vaccineName}</td>
                <td>\${vet?.full_name || vet?.name || '-'}</td>
            </tr>\`;
        }));
        html += rows.join('') + '</tbody></table>';
        html += \`<p><strong>Total registros:</strong> \${vaccinations.length}</p>\`;
        return html;
    },

    async generatePatientHistoryContent(patient, timeline) {
        const owner = await DataService.getOwnerById(patient.owner_id || patient.ownerId);

        let html = \`
            <div style="font-family: Arial, sans-serif; color: #333;">
                
                <!-- Header del Documento -->
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h1 style="color: #2563eb; margin: 0 0 5px 0; font-size: 24px;">HISTORIA CLÍNICA</h1>
                        <p style="margin: 0; color: #666;">Generado el: \${new Date().toLocaleDateString()}</p>
                    </div>
                    <div style="text-align: right;">
                         <h2 style="margin: 0; font-size: 18px;">Clínica Veterinaria</h2>
                         <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Nit: 900.000.000-1</p>
                    </div>
                </div>

                <!-- Datos Paciente y Propietario -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="vertical-align: top; width: 50%; padding-right: 20px; border-right: 1px solid #cbd5e1;">
                                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">DATOS DEL PACIENTE</h3>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr><td style="color: #64748b; padding: 4px 0;">Nombre:</td><td><strong>\${patient.name}</strong></td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Historia Clínica:</td><td><strong>\${patient.medicalRecordNumber}</strong></td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Especie/Raza:</td><td>\${patient.species} - \${patient.breed}</td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Sexo:</td><td>\${patient.sex}</td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Edad:</td><td>\${DataService.calculateAge(patient.birthDate)}</td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Peso:</td><td>\${patient.weight || '-'} kg</td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Color/Señas:</td><td>\${patient.color || '-'} / \${patient.distinctiveMarks || '-'}</td></tr>
                                </table>
                            </td>
                            <td style="vertical-align: top; width: 50%; padding-left: 20px;">
                                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">DATOS DEL PROPIETARIO</h3>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr><td style="color: #64748b; padding: 4px 0;">Nombre:</td><td><strong>\${owner?.fullName || 'N/A'}</strong></td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Identificación:</td><td><strong>\${owner?.documentNumber || 'N/A'}</strong></td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Teléfono:</td><td>\${owner?.phone || 'N/A'}</td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Email:</td><td>\${owner?.email || 'N/A'}</td></tr>
                                    <tr><td style="color: #64748b; padding: 4px 0;">Dirección:</td><td>\${owner?.address || 'N/A'}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Línea de Tiempo -->
                <h3 style="background: #2563eb; color: white; padding: 10px; border-radius: 4px; text-align: center; margin-bottom: 20px;">REGISTRO DE EVENTOS CLÍNICOS</h3>
        \`;

        if (timeline.length === 0) {
            html += '<p style="text-align: center; padding: 40px; color: #64748b;">No hay registros clínicos en el período seleccionado.</p>';
        } else {
            const timelineHtml = await Promise.all(timeline.map(async item => {
                const vet = await DataService.getVeterinarianById(item.vetId);
                const vetName = vet ? vet.full_name || vet.name : 'Veterinario no identificado';
                const vetTp = vet ? vet.tp || '' : '';

                return \`
                    <div style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; page-break-inside: avoid;">
                        <!-- Encabezado del Evento -->
                        <div style="background: #f1f5f9; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-weight: bold; color: #2563eb; font-size: 16px;">\${item.type}</span>
                                <span style="margin-left: 10px; color: #64748b;">\${DataService.formatDate(item.date)}</span>
                            </div>
                            <div style="font-size: 13px; text-align: right;">
                                <strong>\${vetName}</strong><br>
                                <span style="color: #666;">TP: \${vetTp}</span>
                            </div>
                        </div>
                        
                        <!-- Cuerpo del Evento -->
                        <div style="padding: 15px;">
                            \${this.renderTimelineItemBody(item)}
                        </div>
                    </div>
                \`;
            }));
            
            html += timelineHtml.join('');
        }

        html += \`
            <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 12px; color: #999;">
                <p>Este documento es un resumen de la historia clínica digital. Documento informativo.</p>
                <p>Clínica Veterinaria Guau - Software de Gestión Veterinaria</p>
            </div>
            </div>
        \`;

        return html;
    },

    renderTimelineItemBody(item) {
        if (item.type === 'CONSULTA') {
            const data = item.data;
            return \`
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <td colspan="2" style="padding-bottom: 10px;"><strong>Motivo de Consulta:</strong> \${data.reason}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="background: #f8fafc; padding: 10px; border-radius: 4px; font-style: italic; margin-bottom: 10px; display: block;">
                            <strong>Anamnesis:</strong><br>\${data.anamnesis || 'Sin datos'}
                        </td>
                    </tr>
                </table>
                
                <h4 style="margin: 10px 0 5px 0; font-size: 14px; border-bottom: 1px solid #eee;">Examen Físico</h4>
                <table style="width: 100%; font-size: 13px; margin-bottom: 10px;">
                    <tr>
                        <td><strong>Temp:</strong> \${data.temperature || '-'} °C</td>
                        <td><strong>FC:</strong> \${data.heartRate || '-'} lpm</td>
                        <td><strong>FR:</strong> \${data.respiratoryRate || '-'} rpm</td>
                        <td><strong>Peso:</strong> \${data.weight || '-'} kg</td>
                    </tr>
                    <tr>
                        <td colspan="4"><strong>Cond. Corporal:</strong> \${data.bodyCondition || '-'} / 9</td>
                    </tr>
                </table>

                \${data.physicalExamFindings ? \`
                <div style="margin-bottom: 10px;">
                     <strong>Hallazgos del Examen Físico:</strong><br>
                     <p style="margin: 5px 0; white-space: pre-wrap;">\${data.physicalExamFindings}</p>
                </div>\` : ''}

                \${data.paraclinicalExams ? \`
                <div style="margin-bottom: 10px;">
                     <strong>Exámenes Paraclínicos:</strong><br>
                     <p style="margin: 5px 0; white-space: pre-wrap;">\${data.paraclinicalExams}</p>
                </div>\` : ''}

                <div style="background: #eff6ff; padding: 10px; border-left: 4px solid #2563eb; margin: 15px 0;">
                    <strong>DIAGNÓSTICO:</strong> \${data.diagnosis || 'Reservado'}
                </div>

                \${data.treatmentPlan ? \`
                <div style="margin-bottom: 10px;">
                     <strong>Plan Terapéutico:</strong><br>
                     <p style="margin: 5px 0; white-space: pre-wrap;">\${data.treatmentPlan}</p>
                </div>\` : ''}
                \${data.observations ? \`
                <div style="margin-bottom: 10px; background: #fffbe6; padding: 10px; border-radius: 4px;">
                     <strong>Observaciones / Notas:</strong><br>
                     <p style="margin: 5px 0; white-space: pre-wrap;">\${data.observations}</p>
                </div>\` : ''}
            \`;
        } else if (item.type === 'FÓRMULA MÉDICA') {
            const data = item.data;
            let medsHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;"><thead><tr style="background:#eee;"><th style="padding:5px; text-align:left;">Medicamento</th><th style="padding:5px; text-align:left;">Presentación</th><th style="padding:5px; text-align:left;">Dosis</th><th style="padding:5px; text-align:left;">Frecuencia</th><th style="padding:5px; text-align:left;">Duración</th></tr></thead><tbody>';
            data.medications.forEach(m => {
                medsHtml += \`<tr>
                    <td style="padding:5px; border-bottom:1px solid #eee;">\${m.name}</td>
                    <td style="padding:5px; border-bottom:1px solid #eee;">\${m.presentation}</td>
                    <td style="padding:5px; border-bottom:1px solid #eee;">\${m.dosage}</td>
                    <td style="padding:5px; border-bottom:1px solid #eee;">\${m.frequency}</td>
                    <td style="padding:5px; border-bottom:1px solid #eee;">\${m.duration}</td>
                </tr>\`;
            });
            medsHtml += '</tbody></table>';

            return \`
                \${medsHtml}
                \${data.recommendations ? \`<div style="margin-top: 10px; padding: 10px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 4px;"><strong>Recomendaciones:</strong> \${data.recommendations}</div>\` : ''}
            \`;
        } else if (item.type === 'VACUNACIÓN') {
            const data = item.data;
            return \`
                <table style="width: 100%;">
                    <tr>
                        <td><strong>Vacuna:</strong> \${data.vaccineType || data.vaccineName}</td>
                        <td><strong>Lote:</strong> \${data.batch || data.lotNumber || '-'}</td>
                        <td><strong>Laboratorio:</strong> \${data.laboratory || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>Fecha Aplicación:</strong> \${DataService.formatDate(data.applicationDate || data.date)}</td>
                        <td><strong>Próxima Dosis:</strong> \${DataService.formatDate(data.nextDoseDate)}</td>
                        <td></td>
                    </tr>
                </table>
            \`;
        } else if (item.type === 'CIRUGÍA') {
            const data = item.data;
            return \`
                <div>
                    <strong>Procedimiento:</strong> \${data.type}<br>
                    <strong>Estado:</strong> \${data.status}<br>
                    \${data.preOpNotes ? \`<p><small><strong>Notas Pre-Op:</strong> \${data.preOpNotes}</small></p>\` : ''}
                    \${data.procedure ? \`<p><small><strong>Detalle Procedimiento:</strong> \${data.procedure}</small></p>\` : ''}
                </div>
            \`;
        }
        return '';
    },

    /**
     * Filtros de Controles
     */
    openControlsFilterModal() {
        document.getElementById('controlsFilterModal').classList.add('active');
        // Reset defaults
        document.getElementById('controlFilterStatus').value = 'all';
        document.getElementById('controlFilterDateStart').value = '';
        document.getElementById('controlFilterDateEnd').value = '';
    },

    closeControlsFilterModal() {
        document.getElementById('controlsFilterModal').classList.remove('active');
    },

    /**
     * Filtros Desparasitación
     */
    openDewormingFilterModal() {
        document.getElementById('dewormingFilterModal').classList.add('active');
    },

    closeDewormingFilterModal() {
        document.getElementById('dewormingFilterModal').classList.remove('active');
    },

    async generateDewormingReport() {
        const startDate = document.getElementById('dewormFilterDateStart').value;
        const endDate = document.getElementById('dewormFilterDateEnd').value;
        const type = document.getElementById('dewormFilterType').value;

        // Get all dewormings
        const records = await DataService.getDewormings() || [];

        // Filter
        const filtered = records.filter(r => {
            if (startDate && r.date < startDate) return false;
            if (endDate && r.date > endDate) return false;
            if (type !== 'all' && r.type !== type) return false;
            return true;
        });

        if (filtered.length === 0) {
            alert('No se encontraron registros de desparasitación con los filtros seleccionados.');
            return;
        }

        // Generate Title
        let title = 'Reporte de Desparasitación';
        if (type !== 'all') title += \` (\${type === 'internal' ? 'Interna' : 'Externa'})\`;
        if (startDate || endDate) title += \` [\${startDate || 'Inicio'} - \${endDate || 'Hoy'}]\`;

        // Generate Content
        let html = \`<h3>Listado de Desparasitaciones</h3>\`;
        html += '<table style="width:100%; border-collapse: collapse;"><thead><tr style="background:#f1f5f9;"><th style="padding:8px; text-align:left;">Fecha</th><th style="padding:8px; text-align:left;">Paciente</th><th style="padding:8px; text-align:left;">Producto</th><th style="padding:8px; text-align:left;">Tipo</th><th style="padding:8px; text-align:left;">Dosis</th><th style="padding:8px; text-align:left;">Próxima</th></tr></thead><tbody>';

        const rows = await Promise.all(filtered.map(async r => {
            const patient = await DataService.getPatientById(r.patient_id || r.patientId);
            return \`<tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${DataService.formatDate(r.date)}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${patient ? patient.name : '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${r.product}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${r.type === 'internal' ? 'Interna' : 'Externa'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${r.dose}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${DataService.formatDate(r.next_dose_date || r.nextDoseDate)}</td>
            </tr>\`;
        }));

        html += rows.join('') + '</tbody></table>';
        html += \`<p><strong>Total Registros:</strong> \${filtered.length}</p>\`;

        this.generatePDF(title, html);
        this.closeDewormingFilterModal();
    },

    async generateControlsReport() {
        // Safe access to prescriptions
        const prescriptions = await DataService.getPrescriptions() || [];

        const statusFilter = document.getElementById('controlFilterStatus').value;
        const startDate = document.getElementById('controlFilterDateStart').value;
        const endDate = document.getElementById('controlFilterDateEnd').value;

        const reportData = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        prescriptions.forEach(p => {
            // Only consider prescriptions with next control info
            if (!p.nextControlType || !p.nextControlValue || p.status !== 'active') return;

            // Calculate Control Date
            let controlDate = null;
            if (p.nextControlType === 'days') {
                const days = parseInt(p.nextControlValue);
                if (!isNaN(days)) {
                    // Calculate date from prescription date
                    const [y, m, d] = p.date.split('-').map(Number);
                    // Use noon to avoid timezone issues
                    controlDate = new Date(y, m - 1, d, 12, 0, 0);
                    controlDate.setDate(controlDate.getDate() + days);
                }
            } else {
                const [y, m, d] = p.nextControlValue.split('-').map(Number);
                controlDate = new Date(y, m - 1, d, 12, 0, 0);
            }

            if (!controlDate) return;

            // Apply Filters
            // 1. Status Filter
            if (statusFilter === 'expired') {
                if (controlDate >= today) return; // Skip future dates
            } else if (statusFilter === 'upcoming') {
                if (controlDate < today) return; // Skip past dates
            }

            // 2. Date Range Filter
            const controlDateString = controlDate.toISOString().split('T')[0];
            if (startDate && controlDateString < startDate) return;
            if (endDate && controlDateString > endDate) return;

            reportData.push({
                date: controlDateString,
                objDate: controlDate,
                patientId: p.patientId,
                veterinarianId: p.veterinarianId,
                reason: p.medications.map(m => m.name).join(', '),
                prescriptionId: p.id
            });
        });

        // Sort by date (asc)
        reportData.sort((a, b) => a.objDate - b.objDate);

        if (reportData.length === 0) {
            alert('No se encontraron controles con los filtros seleccionados.');
            return;
        }

        // Generate HTML
        let html = \`<h3>Reporte de Controles (\${statusFilter === 'all' ? 'Todos' : (statusFilter === 'expired' ? 'Vencidos' : 'Próximos')})</h3>\`;
        html += '<table style="width:100%; border-collapse: collapse;"><thead><tr style="background:#f1f5f9;"><th style="padding:8px; text-align:left;">Fecha Control</th><th style="padding:8px; text-align:left;">Paciente</th><th style="padding:8px; text-align:left;">Propietario</th><th style="padding:8px; text-align:left;">Teléfono</th><th style="padding:8px; text-align:left;">Medicamentos</th><th style="padding:8px; text-align:left;">Veterinario</th></tr></thead><tbody>';

        const rows = await Promise.all(reportData.map(async item => {
            const patient = await DataService.getPatientById(item.patientId);
            const owner = patient ? await DataService.getOwnerById(patient.owner_id || patient.ownerId) : null;
            const vet = await DataService.getVeterinarianById(item.veterinarianId);

            // Highlight expired
            const isExpired = item.objDate < today;
            const style = isExpired ? 'color: #ef4444; font-weight: bold;' : 'color: #22c55e;';

            return \`<tr>
                <td style="padding:8px; border-bottom:1px solid #eee; \${style}">\${DataService.formatDate(item.date)} \${isExpired ? '(Vencido)' : ''}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${patient ? patient.name : '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${owner ? owner.full_name || owner.fullName : '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${owner ? owner.phone : '-'}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${item.reason}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">\${vet ? vet.full_name || vet.name : '-'}</td>
            </tr>\`;
        }));

        html += rows.join('') + '</tbody></table>';
        html += \`<p><strong>Total Registros:</strong> \${reportData.length}</p>\`;

        this.generatePDF('Reporte de Controles', html);
        this.closeControlsFilterModal();
    },

    /**
     * Inicializa eventos
     */
    init() {
        // No hay eventos especiales necesarios
    }
};






