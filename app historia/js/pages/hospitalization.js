/**
 * SHCV - Página Hospitalización
 * Gestión de pacientes hospitalizados
 */

const HospitalizationPage = {
    hospitalizations: [],

    /**
     * Inicializa datos
     */
    loadData() {
        if (this.hospitalizations.length === 0) {
            this.hospitalizations = [
                {
                    id: 'hosp-001',
                    patientId: 'pat-003',
                    admissionDate: '2024-01-25',
                    admissionReason: 'Gastroenteritis severa - Deshidratación',
                    status: 'active',
                    room: 'UCI-01',
                    attendingVetId: 'vet-001',
                    evolutions: [
                        { date: '2024-01-25', time: '09:00', notes: 'Ingreso. Inicio de fluidoterapia IV. Temp: 39.2°C', authorId: 'vet-001' },
                        { date: '2024-01-25', time: '15:00', notes: 'Mejora de hidratación. Se agrega antiemético. Temp: 38.8°C', authorId: 'vet-002' },
                        { date: '2024-01-26', time: '08:00', notes: 'Paciente más activo. Inicia alimentación blanda. Temp: 38.5°C', authorId: 'vet-001' }
                    ],
                    treatments: [
                        { id: 'trt-001', medication: 'Lactato de Ringer', route: 'IV', frequency: 'Continuo', schedule: ['24h'], dose: '10 ml/kg/h', active: true },
                        { id: 'trt-002', medication: 'Metoclopramida', route: 'SC', frequency: 'c/8h', schedule: ['08:00', '16:00', '00:00'], dose: '0.5 mg/kg', active: true },
                        { id: 'trt-003', medication: 'Omeprazol', route: 'IV', frequency: 'c/24h', schedule: ['08:00'], dose: '1 mg/kg', active: true }
                    ],
                    dischargeDate: null,
                    dischargeType: null, // alta, fallecio, eutanasia, declinacion
                    dischargeSummary: null
                }
            ];
        }
    },

    /**
     * Renderiza la página
     */
    async render() {
        this.loadData(); // MOCK: o eventualmente await DataService.getHospitalizations()

        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar paciente hospitalizado...', 'hospSearch')}
                </div>
                <div class="patients-filters">
                    <button class="btn btn-primary" id="btnNewHospitalization">
                        <span>🏥</span> Nuevo Ingreso
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="vaccination-tabs">
                <button class="tab-btn active" data-tab="active">🏥 Hospitalizados</button>
                <button class="tab-btn" data-tab="history">📋 Historial</button>
            </div>
            
            <!-- Tab Content -->
            <div class="vaccination-content">
                <div class="tab-content active" id="tab-active">
                    ${await this.renderActiveHospitalizations()}
                </div>
                <div class="tab-content" id="tab-history">
                    ${await this.renderHospitalizationHistory()}
                </div>
            </div>
            
            <!-- Modals -->
            ${await this.renderHospitalizationModal()}
            ${await this.renderEvolutionModal()}
            ${this.renderTreatmentModal()}
            ${this.renderTreatmentSheetModal()}
            ${this.renderDischargeModal()}
            ${this.renderViewModal()}
        `;
    },

    /**
     * Renderiza lista de hospitalizados activos
     */
    async renderActiveHospitalizations() {
        const active = this.hospitalizations.filter(h => h.status === 'active');

        if (active.length === 0) {
            return Components.emptyState('✅', 'No hay pacientes hospitalizados', 'Todos los pacientes han sido dados de alta.');
        }

        const cards = await Promise.all(active.map(h => this.renderHospitalizationCard(h)));

        return `
            <div class="hospitalizations-grid">
                ${cards.join('')}
            </div>
        `;
    },

    /**
     * Renderiza historial de hospitalizaciones
     */
    async renderHospitalizationHistory() {
        const discharged = this.hospitalizations.filter(h => h.status !== 'active');

        if (discharged.length === 0) {
            return Components.emptyState('📋', 'Sin historial', 'No hay pacientes egresados registrados.');
        }

        const historyRows = await Promise.all(discharged.map(async h => {
            const patient = await DataService.getPatientById(h.patientId);
            const vet = await DataService.getVeterinarianById(h.attendingVetId);
            const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
            const dischargeLabel = this.getDischargeTypeLabel(h.dischargeType || h.status);
            const dischargeBadgeClass = this.getDischargeTypeBadgeClass(h.dischargeType || h.status);
            return `
                                <tr>
                                    <td>
                                        <div class="table-patient">
                                            <span class="patient-emoji">${emoji}</span>
                                            <span>${patient ? patient.name : 'Paciente'}</span>
                                        </div>
                                    </td>
                                    <td>${h.admissionReason}</td>
                                    <td>${DataService.formatDate(h.admissionDate)}</td>
                                    <td>${DataService.formatDate(h.dischargeDate)}</td>
                                    <td><span class="badge badge-${dischargeBadgeClass}">${dischargeLabel}</span></td>
                                    <td>
                                        ${vet ? vet.full_name || vet.name : '-'}
                                        ${vet ? `<br><span class="text-muted" style="font-size: 0.75em;">TP: ${vet.tp || 'N/A'}</span>` : ''}
                                    </td>
                                    <td>
                                        <button class="btn btn-ghost btn-sm" onclick="HospitalizationPage.viewHospitalization('${h.id}')">
                                            👁️ Ver
                                        </button>
                                    </td>
                                </tr>
                            `;
        }));

        return `
            <div class="vaccinations-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Motivo</th>
                            <th>Ingreso</th>
                            <th>Egreso</th>
                            <th>Tipo</th>
                            <th>Veterinario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historyRows.join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async renderHospitalizationCard(hosp) {
        const patient = await DataService.getPatientById(hosp.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id || patient.ownerId) : null;
        let vet = await DataService.getVeterinarianById(hosp.attendingVetId);
        if (!vet) vet = DataService.getCurrentUser();
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const admDate = DataService.formatDate(hosp.admissionDate);
        const daysHospitalized = Math.ceil((new Date() - new Date(hosp.admissionDate)) / (24 * 60 * 60 * 1000));
        const lastEvolution = hosp.evolutions[hosp.evolutions.length - 1];
        const lastEvoVet = lastEvolution ? await DataService.getVeterinarianById(lastEvolution.authorId) : null;

        return `
            <div class="hospitalization-card" data-hosp-id="${hosp.id}">
                <div class="hosp-card-header">
                    <div class="hosp-room">
                        <span class="room-badge">${hosp.room}</span>
                    </div>
                    <span class="badge badge-warning">${daysHospitalized} día${daysHospitalized > 1 ? 's' : ''}</span>
                </div>
                <div class="hosp-patient">
                    <span class="patient-emoji large">${emoji}</span>
                    <div>
                        <div class="patient-name-lg">${patient ? patient.name : 'Paciente'}</div>
                        <div class="patient-owner-sm">${owner ? owner.fullName : ''}</div>
                        <div class="admission-date">Ingreso: ${admDate}</div>
                    </div>
                </div>
                <div class="hosp-reason">
                    <strong>Motivo:</strong> ${hosp.admissionReason}
                </div>
                <div class="hosp-vet">
                    <span>👨‍⚕️</span> ${vet ? vet.full_name || vet.name : 'No asignado'}
                    ${vet ? `<span class="text-muted" style="font-size: 0.8em;"> • TP: ${vet.tp || 'N/A'}</span>` : ''}
                </div>
                ${lastEvolution ? `
                    <div class="last-evolution">
                        <div class="evolution-header">
                            <span>📝 Última evolución</span>
                            <span class="evolution-time">${lastEvolution.date} ${lastEvolution.time}</span>
                        </div>
                        <p>${lastEvolution.notes}</p>
                        <p class="text-muted" style="font-size: 0.75em; margin-top: 4px;">
                            Por: ${lastEvoVet ? lastEvoVet.full_name || lastEvoVet.name : 'Personal'}
                        </p>
                    </div>
                ` : ''}
                <div class="hosp-card-footer" style="flex-wrap: wrap; gap: 8px;">
                    <button class="btn btn-primary btn-sm" onclick="HospitalizationPage.openEvolutionModal('${hosp.id}')">
                        ➕ Evolución
                    </button>
                    <button class="btn btn-info btn-sm" onclick="HospitalizationPage.openTreatmentSheetModal('${hosp.id}')">
                        💊 Tratamiento
                    </button>
                    <button class="btn btn-success btn-sm" onclick="HospitalizationPage.openDischargeModal('${hosp.id}')">
                        🚪 Egreso
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="HospitalizationPage.openViewModal('${hosp.id}')">
                        📋 Historial
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Modal nuevo ingreso hospitalario
     */
    async renderHospitalizationModal() {
        const patients = await DataService.getPatients() || [];
        const vets = await DataService.getVeterinarians() || [];
        const currentUser = DataService.getCurrentUser();

        return `
            <div class="modal-backdrop" id="hospitalizationModal">
                <div class="modal" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🏥 Ingreso Hospitalario</h2>
                        <button class="modal-close" onclick="HospitalizationPage.closeModal('hospitalizationModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Paciente *</label>
                            <select class="input" id="hospPatient">
                                <option value="">-- Seleccionar --</option>
                                ${await Promise.all(patients.map(async p => {
                                    const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
                                    return `<option value="${p.id}">${DataService.getSpeciesEmoji(p.species)} ${p.name} (${owner?.full_name || owner?.fullName || ''})</option>`;
                                })).then(opts => opts.join(''))}
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Habitación/Jaula</label>
                                <input type="text" class="input" id="hospRoom" placeholder="Ej: UCI-01, HOSP-03">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Veterinario a cargo *</label>
                                <select class="input" id="hospVet">
                                    <option value="">-- Seleccionar --</option>
                                    ${vets.map(v => `
                                        <option value="${v.id}" ${v.id === currentUser?.id ? 'selected' : ''}>
                                            ${v.full_name || v.name} - TP: ${v.tp || 'N/A'}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Motivo de ingreso *</label>
                            <textarea class="input textarea" id="hospReason" rows="3" placeholder="Diagnóstico y razón del ingreso..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Primera evolución</label>
                            <textarea class="input textarea" id="firstEvolution" rows="2" placeholder="Estado al ingreso, signos vitales..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="HospitalizationPage.closeModal('hospitalizationModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="HospitalizationPage.saveHospitalization()">💾 Registrar Ingreso</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal agregar evolución
     */
    async renderEvolutionModal() {
        const vets = await DataService.getVeterinarians() || [];
        const currentUser = DataService.getCurrentUser();

        return `
            <div class="modal-backdrop" id="evolutionModal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2 class="modal-title">📝 Nueva Evolución</h2>
                        <button class="modal-close" onclick="HospitalizationPage.closeModal('evolutionModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="evolutionHospId">
                        <div class="form-group">
                            <label class="form-label">Veterinario *</label>
                            <select class="input" id="evolutionVet">
                                ${vets.map(v => `
                                    <option value="${v.id}" ${v.id === currentUser?.id ? 'selected' : ''}>
                                        ${v.full_name || v.name} - TP: ${v.tp || 'N/A'}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notas de evolución *</label>
                            <textarea class="input textarea" id="evolutionNotes" rows="4" placeholder="Estado del paciente, signos vitales, tratamiento administrado..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="HospitalizationPage.closeModal('evolutionModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="HospitalizationPage.saveEvolution()">💾 Guardar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal hoja de tratamiento
     */
    renderTreatmentSheetModal() {
        return `
            <div class="modal-backdrop" id="treatmentSheetModal">
                <div class="modal" style="max-width: 800px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 class="modal-title">💊 Hoja de Tratamiento</h2>
                        <button class="modal-close" onclick="HospitalizationPage.closeModal('treatmentSheetModal')">✕</button>
                    </div>
                    <div class="modal-body" id="treatmentSheetBody" style="overflow-y: auto; max-height: 65vh;">
                        <!-- Se llena dinámicamente -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="btnAddTreatment">➕ Agregar Medicamento</button>
                        <button class="btn btn-secondary" onclick="HospitalizationPage.printTreatmentSheet()">🖨️ Imprimir</button>
                        <button class="btn btn-ghost" onclick="HospitalizationPage.closeModal('treatmentSheetModal')">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal agregar tratamiento
     */
    renderTreatmentModal() {
        return `
            <div class="modal-backdrop" id="treatmentModal">
                <div class="modal" style="max-width: 550px;">
                    <div class="modal-header">
                        <h2 class="modal-title">💊 Agregar Medicamento</h2>
                        <button class="modal-close" onclick="HospitalizationPage.closeTreatmentModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="treatmentHospId">
                        <div class="form-group">
                            <label class="form-label">Medicamento *</label>
                            <input type="text" class="input" id="treatmentMedication" placeholder="Ej: Amoxicilina, Meloxicam...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dosis *</label>
                            <input type="text" class="input" id="treatmentDose" placeholder="Ej: 20 mg/kg, 0.2 ml/kg...">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Vía de Administración *</label>
                                <select class="input" id="treatmentRoute">
                                    <option value="PO">PO - Oral</option>
                                    <option value="IV">IV - Intravenosa</option>
                                    <option value="IM">IM - Intramuscular</option>
                                    <option value="SC">SC - Subcutánea</option>
                                    <option value="TOP">TOP - Tópica</option>
                                    <option value="OFT">OFT - Oftálmica</option>
                                    <option value="OT">OT - Ótica</option>
                                    <option value="RECT">RECT - Rectal</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Frecuencia *</label>
                                <select class="input" id="treatmentFrequency">
                                    <option value="c/6h">Cada 6 horas</option>
                                    <option value="c/8h">Cada 8 horas</option>
                                    <option value="c/12h">Cada 12 horas</option>
                                    <option value="c/24h">Cada 24 horas</option>
                                    <option value="c/48h">Cada 48 horas</option>
                                    <option value="PRN">PRN (según necesidad)</option>
                                    <option value="Continuo">Continuo</option>
                                    <option value="STAT">STAT (dosis única)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Horarios de Administración</label>
                            <div class="schedule-inputs" id="scheduleInputs" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <input type="time" class="input" style="width: 100px;" id="scheduleTime1" value="08:00">
                                <input type="time" class="input" style="width: 100px;" id="scheduleTime2">
                                <input type="time" class="input" style="width: 100px;" id="scheduleTime3">
                                <input type="time" class="input" style="width: 100px;" id="scheduleTime4">
                            </div>
                            <small class="text-muted">Ingresa los horarios según la frecuencia seleccionada</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notas adicionales</label>
                            <input type="text" class="input" id="treatmentNotes" placeholder="Ej: Administrar con comida, diluir en 100ml...">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="HospitalizationPage.closeTreatmentModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="HospitalizationPage.saveTreatment()">💾 Agregar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal ver historial completo
     */
    renderViewModal() {
        return `
            <div class="modal-backdrop" id="viewHospModal">
                <div class="modal" style="max-width: 700px; max-height: 85vh;">
                    <div class="modal-header">
                        <h2 class="modal-title">📋 Historial de Hospitalización</h2>
                        <button class="modal-close" onclick="HospitalizationPage.closeModal('viewHospModal')">✕</button>
                    </div>
                    <div class="modal-body" id="viewHospBody" style="overflow-y: auto; max-height: 60vh;">
                        <!-- Se llena dinámicamente -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="HospitalizationPage.printHistory()">🖨️ Imprimir</button>
                        <button class="btn btn-primary" onclick="HospitalizationPage.closeModal('viewHospModal')">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal de egreso
     */
    renderDischargeModal() {
        return `
            <div class="modal-backdrop" id="dischargeModal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🚪 Egreso del Paciente</h2>
                        <button class="modal-close" onclick="HospitalizationPage.closeModal('dischargeModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="dischargeHospId">
                        <div class="form-group">
                            <label class="form-label">Tipo de Egreso *</label>
                            <div class="discharge-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                                <label class="discharge-option" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="dischargeType" value="alta" checked>
                                    <span style="font-size: 1.5em;">✅</span>
                                    <span><strong>Alta</strong><br><small class="text-muted">Recuperado</small></span>
                                </label>
                                <label class="discharge-option" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="dischargeType" value="fallecio">
                                    <span style="font-size: 1.5em;">🕊️</span>
                                    <span><strong>Falleció</strong><br><small class="text-muted">Deceso natural</small></span>
                                </label>
                                <label class="discharge-option" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="dischargeType" value="eutanasia">
                                    <span style="font-size: 1.5em;">💔</span>
                                    <span><strong>Eutanasia</strong><br><small class="text-muted">Procedimiento humanitario</small></span>
                                </label>
                                <label class="discharge-option" style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="dischargeType" value="declinacion">
                                    <span style="font-size: 1.5em;">🚫</span>
                                    <span><strong>Declinación</strong><br><small class="text-muted">Retiro voluntario</small></span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Observaciones de egreso</label>
                            <textarea class="input textarea" id="dischargeSummary" rows="3" placeholder="Notas finales, recomendaciones..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="HospitalizationPage.closeModal('dischargeModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="HospitalizationPage.confirmDischarge()">💾 Confirmar Egreso</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa eventos
     */
    init() {
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            });
        });

        // Botón nuevo ingreso
        document.getElementById('btnNewHospitalization')?.addEventListener('click', () => {
            document.getElementById('hospitalizationModal').classList.add('active');
        });

        // Búsqueda
        document.getElementById('hospSearch')?.addEventListener('input', (e) => {
            this.filterHospitalizations(e.target.value);
        });

        // Calculadora de horarios de tratamiento
        const frequencySelect = document.getElementById('treatmentFrequency');
        const firstTimeInput = document.getElementById('scheduleTime1');

        const updateSchedule = () => {
            const freq = frequencySelect.value;
            const start = firstTimeInput.value;
            if (freq && start) {
                const times = this.calculateSchedule(start, freq);
                times.slice(1, 4).forEach((time, index) => {
                    const input = document.getElementById(`scheduleTime${index + 2}`);
                    if (input) input.value = time;
                });
            }
        };

        if (frequencySelect && firstTimeInput) {
            frequencySelect.addEventListener('change', updateSchedule);
            firstTimeInput.addEventListener('change', updateSchedule);
        }
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    saveHospitalization() {
        const patientId = document.getElementById('hospPatient').value;
        const reason = document.getElementById('hospReason').value;
        const vetId = document.getElementById('hospVet').value;

        if (!patientId || !reason || !vetId) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        const now = new Date();
        const evolutions = [];
        const firstEvo = document.getElementById('firstEvolution').value;
        if (firstEvo) {
            evolutions.push({
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().slice(0, 5),
                notes: firstEvo,
                authorId: vetId
            });
        }

        const newHosp = {
            id: `hosp-${Date.now()}`,
            patientId,
            admissionDate: now.toISOString().split('T')[0],
            admissionReason: reason,
            status: 'active',
            room: document.getElementById('hospRoom').value || 'HOSP-01',
            attendingVetId: vetId,
            evolutions,
            dischargeDate: null,
            dischargeSummary: null
        };

        this.hospitalizations.unshift(newHosp);
        this.closeModal('hospitalizationModal');
        this.refreshActiveAndHistory();
        this.showToast('✅ Paciente ingresado');
    },

    async refreshActiveAndHistory() {
        document.getElementById('tab-active').innerHTML = await this.renderActiveHospitalizations();
        document.getElementById('tab-history').innerHTML = await this.renderHospitalizationHistory();
    },

    openEvolutionModal(hospId) {
        document.getElementById('evolutionHospId').value = hospId;
        document.getElementById('evolutionNotes').value = '';
        document.getElementById('evolutionModal').classList.add('active');
    },

    saveEvolution() {
        const hospId = document.getElementById('evolutionHospId').value;
        const notes = document.getElementById('evolutionNotes').value;
        const vetId = document.getElementById('evolutionVet').value;

        if (!notes.trim()) {
            alert('Por favor ingresa las notas de evolución');
            return;
        }

        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (hosp) {
            const now = new Date();
            hosp.evolutions.push({
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().slice(0, 5),
                notes,
                authorId: vetId
            });
        }

        this.closeModal('evolutionModal');
        this.refreshActiveAndHistory();
        this.showToast('✅ Evolución registrada');
    },

    // ========== TREATMENT SHEET FUNCTIONS ==========

    currentTreatmentHospId: null,

    async openTreatmentSheetModal(hospId) {
        this.currentTreatmentHospId = hospId;
        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (!hosp) return;

        // Inicializar treatments si no existe
        if (!hosp.treatments) {
            hosp.treatments = [];
        }

        const patient = await DataService.getPatientById(hosp.patientId);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const body = document.getElementById('treatmentSheetBody');
        
        document.getElementById('treatmentSheetModal').classList.add('active');
        body.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando...</div>';

        body.innerHTML = this.renderTreatmentSheetContent(hosp, patient, emoji);

        // Event listener para agregar tratamiento
        document.getElementById('btnAddTreatment').onclick = () => {
            this.openTreatmentModal(hospId);
        };
    },

    renderTreatmentSheetContent(hosp, patient, emoji) {
        const activeTreatments = hosp.treatments?.filter(t => t.active) || [];
        const inactiveTreatments = hosp.treatments?.filter(t => !t.active) || [];

        return `
            <div class="treatment-sheet">
                <div class="treatment-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid var(--color-primary);">
                    <span style="font-size: 40px;">${emoji}</span>
                    <div>
                        <h3 style="margin: 0;">${patient ? patient.name : 'Paciente'}</h3>
                        <p class="text-muted" style="margin: 4px 0;">Habitación: ${hosp.room} | Ingreso: ${DataService.formatDate(hosp.admissionDate)}</p>
                    </div>
                </div>

                <h4 style="margin-bottom: 12px;">💊 Medicamentos Activos (${activeTreatments.length})</h4>
                ${activeTreatments.length > 0 ? `
                    <div class="treatment-table" style="overflow-x: auto; margin-bottom: 24px;">
                        <table class="table" style="min-width: 700px;">
                            <thead>
                                <tr style="background: var(--color-primary-bg);">
                                    <th>Medicamento</th>
                                    <th>Dosis</th>
                                    <th>Vía</th>
                                    <th>Frecuencia</th>
                                    <th>Horarios</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${activeTreatments.map(t => `
                                    <tr>
                                        <td>
                                            <strong>${t.medication}</strong>
                                            ${t.notes ? `<br><small class="text-muted">${t.notes}</small>` : ''}
                                        </td>
                                        <td>${t.dose}</td>
                                        <td><span class="badge badge-primary">${t.route}</span></td>
                                        <td>${t.frequency}</td>
                                        <td>
                                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                                ${t.schedule.map(s => `<span class="badge badge-secondary" style="font-size: 0.75em;">${s}</span>`).join('')}
                                            </div>
                                        </td>
                                        <td>
                                            <button class="btn btn-ghost btn-xs" onclick="HospitalizationPage.toggleTreatment('${hosp.id}', '${t.id}')" title="Suspender">
                                                ⏸️
                                            </button>
                                            <button class="btn btn-ghost btn-xs" onclick="HospitalizationPage.deleteTreatment('${hosp.id}', '${t.id}')" title="Eliminar">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 24px; background: var(--color-bg-secondary); border-radius: 8px; margin-bottom: 24px;">
                        <p class="text-muted">No hay medicamentos activos</p>
                    </div>
                `}

                ${inactiveTreatments.length > 0 ? `
                    <h4 style="margin-bottom: 12px; color: var(--color-text-secondary);">⏸️ Medicamentos Suspendidos (${inactiveTreatments.length})</h4>
                    <div class="treatment-table" style="overflow-x: auto; opacity: 0.7;">
                        <table class="table" style="min-width: 700px;">
                            <thead>
                                <tr>
                                    <th>Medicamento</th>
                                    <th>Dosis</th>
                                    <th>Vía</th>
                                    <th>Frecuencia</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inactiveTreatments.map(t => `
                                    <tr style="text-decoration: line-through;">
                                        <td>${t.medication}</td>
                                        <td>${t.dose}</td>
                                        <td>${t.route}</td>
                                        <td>${t.frequency}</td>
                                        <td>
                                            <button class="btn btn-ghost btn-xs" onclick="HospitalizationPage.toggleTreatment('${hosp.id}', '${t.id}')" title="Reactivar">
                                                ▶️
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </div>
        `;
    },

    openTreatmentModal(hospId) {
        // Ocultar temporalmente la hoja de tratamiento
        document.getElementById('treatmentSheetModal').classList.remove('active');

        document.getElementById('treatmentHospId').value = hospId;
        document.getElementById('treatmentMedication').value = '';
        document.getElementById('treatmentDose').value = '';
        document.getElementById('treatmentRoute').value = 'PO';
        document.getElementById('treatmentFrequency').value = 'c/8h';
        document.getElementById('scheduleTime1').value = '08:00';
        document.getElementById('scheduleTime2').value = '';
        document.getElementById('scheduleTime3').value = '';
        document.getElementById('scheduleTime4').value = '';
        document.getElementById('treatmentNotes').value = '';
        document.getElementById('treatmentModal').classList.add('active');
    },

    saveTreatment() {
        const hospId = document.getElementById('treatmentHospId').value;
        const medication = document.getElementById('treatmentMedication').value.trim();
        const dose = document.getElementById('treatmentDose').value.trim();
        const route = document.getElementById('treatmentRoute').value;
        const frequency = document.getElementById('treatmentFrequency').value;
        const notes = document.getElementById('treatmentNotes').value.trim();

        if (!medication || !dose) {
            alert('Por favor completa medicamento y dosis');
            return;
        }

        // Recoger horarios
        const schedule = [];
        for (let i = 1; i <= 4; i++) {
            const time = document.getElementById(`scheduleTime${i}`).value;
            if (time) schedule.push(time);
        }

        if (schedule.length === 0) {
            schedule.push('08:00');
        }

        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (!hosp) return;

        if (!hosp.treatments) {
            hosp.treatments = [];
        }

        const newTreatment = {
            id: `trt-${Date.now()}`,
            medication,
            dose,
            route,
            frequency,
            schedule,
            notes,
            active: true,
            addedDate: new Date().toISOString().split('T')[0]
        };

        hosp.treatments.push(newTreatment);



        this.closeModal('treatmentModal');
        this.refreshTreatmentSheet(hospId);
        // Reabrir hoja de tratamiento
        document.getElementById('treatmentSheetModal').classList.add('active');
        this.showToast('💊 Medicamento agregado');
    },

    closeTreatmentModal() {
        this.closeModal('treatmentModal');
        // Reabrir hoja de tratamiento si hay un ID activo
        if (this.currentTreatmentHospId) {
            document.getElementById('treatmentSheetModal').classList.add('active');
        }
    },

    toggleTreatment(hospId, treatmentId) {
        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (!hosp || !hosp.treatments) return;

        const treatment = hosp.treatments.find(t => t.id === treatmentId);
        if (treatment) {
            treatment.active = !treatment.active;
            this.refreshTreatmentSheet(hospId);
            this.showToast(treatment.active ? '▶️ Medicamento reactivado' : '⏸️ Medicamento suspendido');
        }
    },

    deleteTreatment(hospId, treatmentId) {
        if (!confirm('¿Eliminar este medicamento del tratamiento?')) return;

        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (!hosp || !hosp.treatments) return;

        hosp.treatments = hosp.treatments.filter(t => t.id !== treatmentId);
        this.refreshTreatmentSheet(hospId);
        this.showToast('🗑️ Medicamento eliminado');
    },

    async refreshTreatmentSheet(hospId) {
        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (!hosp) return;

        const patient = await DataService.getPatientById(hosp.patientId);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';

        const body = document.getElementById('treatmentSheetBody');
        if (body) {
            body.innerHTML = this.renderTreatmentSheetContent(hosp, patient, emoji);
        }
    },

    printTreatmentSheet() {
        window.print();
    },

    // ========== END TREATMENT FUNCTIONS ==========

    calculateSchedule(startTime, frequency) {
        if (!startTime || !frequency) return [];

        // Extraer intervalo en horas
        let interval = 0;
        if (frequency.includes('c/') && frequency.includes('h')) {
            interval = parseInt(frequency.replace('c/', '').replace('h', ''));
        } else if (frequency === 'Continuo') {
            return ['Continuo']; // Lógica especial si se desea
        } else {
            return []; // PRN, STAT no calculan
        }

        if (isNaN(interval) || interval <= 0) return [];

        const times = [startTime];
        let [hours, minutes] = startTime.split(':').map(Number);

        // Calcular siguientes 3 dosis (o hasta cubrir 24h, simplificado a 3 más para los 4 inputs)
        for (let i = 0; i < 3; i++) {
            hours += interval;
            if (hours >= 24) hours -= 24;

            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            times.push(timeString);
        }

        return times;
    },

    openDischargeModal(hospId) {
        document.getElementById('dischargeHospId').value = hospId;
        document.getElementById('dischargeSummary').value = '';
        // Reset radio to Alta
        const altaRadio = document.querySelector('input[name="dischargeType"][value="alta"]');
        if (altaRadio) altaRadio.checked = true;
        document.getElementById('dischargeModal').classList.add('active');
    },

    confirmDischarge() {
        const hospId = document.getElementById('dischargeHospId').value;
        const dischargeType = document.querySelector('input[name="dischargeType"]:checked')?.value;
        const summary = document.getElementById('dischargeSummary').value;

        if (!dischargeType) {
            alert('Por favor selecciona el tipo de egreso');
            return;
        }

        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (hosp) {
            hosp.status = dischargeType;
            hosp.dischargeType = dischargeType;
            hosp.dischargeDate = new Date().toISOString().split('T')[0];
            hosp.dischargeSummary = summary;
        }

        this.closeModal('dischargeModal');
        this.refreshActiveAndHistory();

        const label = this.getDischargeTypeLabel(dischargeType);
        this.showToast(`${this.getDischargeTypeEmoji(dischargeType)} Egreso registrado: ${label}`);
    },

    getDischargeTypeLabel(type) {
        const labels = {
            'alta': 'Alta',
            'fallecio': 'Falleció',
            'eutanasia': 'Eutanasia',
            'declinacion': 'Declinación',
            'discharged': 'Alta' // backward compatibility
        };
        return labels[type] || 'Egresado';
    },

    getDischargeTypeBadgeClass(type) {
        const classes = {
            'alta': 'success',
            'fallecio': 'secondary',
            'eutanasia': 'secondary',
            'declinacion': 'warning',
            'discharged': 'success'
        };
        return classes[type] || 'secondary';
    },

    getDischargeTypeEmoji(type) {
        const emojis = {
            'alta': '✅',
            'fallecio': '🕊️',
            'eutanasia': '💔',
            'declinacion': '🚫'
        };
        return emojis[type] || '✅';
    },

    dischargePatient(hospId) {
        // Legacy function - now opens modal
        this.openDischargeModal(hospId);
    },

    async openViewModal(hospId) {
        // Inyectar modal si no existe
        if (!document.getElementById('viewHospModal')) {
            document.body.insertAdjacentHTML('beforeend', this.renderViewModal());
        }

        const hosp = this.hospitalizations.find(h => h.id === hospId);
        if (!hosp) return;
        
        document.getElementById('viewHospModal').classList.add('active');
        const body = document.getElementById('viewHospBody');
        body.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando historial...</div>';

        const patient = await DataService.getPatientById(hosp.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id || patient.ownerId) : null;
        const vet = await DataService.getVeterinarianById(hosp.attendingVetId);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const activeTreatments = hosp.treatments?.filter(t => t.active) || [];

        body.innerHTML = `
            <div class="hosp-detail">
                <div class="hosp-detail-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);">
                    <span style="font-size: 48px;">${emoji}</span>
                    <div>
                        <h3 style="margin: 0;">${patient ? patient.name : 'Paciente'}</h3>
                        <p class="text-muted" style="margin: 4px 0;">${owner ? owner.full_name || owner.fullName : ''}</p>
                        <span class="badge badge-${hosp.status === 'active' ? 'warning' : 'success'}">
                            ${hosp.status === 'active' ? '🏥 Hospitalizado' : '✅ Alta'}
                        </span>
                    </div>
                </div>

                <div class="hosp-info-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div class="info-item">
                        <strong>Habitación:</strong> ${hosp.room}
                    </div>
                    <div class="info-item">
                        <strong>Veterinario:</strong> ${vet ? vet.full_name || vet.name : '-'}
                        ${vet ? `<span class="text-muted"> (TP: ${vet.tp || 'N/A'})</span>` : ''}
                    </div>
                    <div class="info-item">
                        <strong>Ingreso:</strong> ${DataService.formatDate(hosp.admissionDate)}
                    </div>
                    <div class="info-item">
                        <strong>Alta:</strong> ${hosp.dischargeDate ? DataService.formatDate(hosp.dischargeDate) : 'Pendiente'}
                    </div>
                </div>

                <div class="hosp-reason-detail" style="background: var(--color-primary-bg); padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                    <strong>Motivo de ingreso:</strong>
                    <p style="margin: 8px 0 0 0;">${hosp.admissionReason}</p>
                </div>

                ${hosp.dischargeDate ? `
                    <div class="hosp-reason-detail" style="background: var(--color-success-bg); padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--color-success);">
                         <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                            <strong>Egreso:</strong>
                            <span class="badge badge-success">${this.getDischargeTypeLabel(hosp.dischargeType)}</span>
                         </div>
                        <p style="margin: 0;">${hosp.dischargeSummary || 'Sin observaciones'}</p>
                    </div>
                ` : ''}

                ${activeTreatments.length > 0 ? `
                    <h4 style="margin-bottom: 12px;">💊 Medicamentos Activos (${activeTreatments.length})</h4>
                    <div class="table-container" style="margin-bottom: 20px;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Medicamento</th>
                                    <th>Dosis/Vía</th>
                                    <th>Frecuencia</th>
                                    <th>Horarios</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${activeTreatments.map(t => `
                                    <tr>
                                        <td><strong>${t.medication}</strong></td>
                                        <td>${t.dose} (${t.route})</td>
                                        <td>${t.frequency}</td>
                                        <td>${t.schedule.map(s => `<span class="badge badge-secondary" style="font-size: 0.75em; margin-right: 2px;">${s}</span>`).join('')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                <h4 style="margin-bottom: 12px;">📝 Evoluciones (${hosp.evolutions.length})</h4>
                <div class="evolutions-timeline" style="border-left: 3px solid var(--color-primary); padding-left: 16px;">
                    ${(await Promise.all(hosp.evolutions.map(async evo => {
            const evoVet = await DataService.getVeterinarianById(evo.authorId);
            return `
                            <div class="evolution-item" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <strong>${evo.date} - ${evo.time}</strong>
                                    <span class="text-muted">${evoVet ? evoVet.full_name || evoVet.name : 'Personal'}</span>
                                </div>
                                <p style="margin: 0;">${evo.notes}</p>
                            </div>
                        `;
        }))).join('')}
                </div>
            </div>
        `;

    },

    viewHospitalization(hospId) {
        this.openViewModal(hospId);
    },

    async filterHospitalizations(query) {
        // En un caso real haríamos llamada a Supabase con un like o ilike
        // Aquí hacemos el mock basado en data en memoria, pero asíncrono.
        // Simulando delay y uso de DataService si estuviese mapeado todo
        let filtered = [];
        
        for (const h of this.hospitalizations) {
            if (h.status !== 'active') continue;
            const patient = await DataService.getPatientById(h.patientId);
            const searchText = `${patient ? patient.name : ''} ${h.admissionReason} ${h.room}`.toLowerCase();
            if (searchText.includes(query.toLowerCase())) {
                filtered.push(h);
            }
        }

        if (filtered.length === 0 && query) {
            document.getElementById('tab-active').innerHTML = Components.emptyState('🔍', 'Sin resultados', 'No se encontraron pacientes con ese criterio.');
        } else if (filtered.length === 0) {
            document.getElementById('tab-active').innerHTML = await this.renderActiveHospitalizations();
        } else {
            const cards = await Promise.all(filtered.map(h => this.renderHospitalizationCard(h)));
            document.getElementById('tab-active').innerHTML = `
                <div class="hospitalizations-grid">
                    ${cards.join('')}
                </div>
            `;
        }
    },

    printHistory() {
        window.print();
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
