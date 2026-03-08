/**
 * SHCV - Página Cirugías
 * Gestión de procedimientos quirúrgicos
 */

const SurgeriesPage = {
    surgeries: [],

    /**
     * Inicializa datos
     */
    loadData() {
        if (this.surgeries.length === 0) {
            this.surgeries = [
                {
                    id: 'surg-001',
                    patientId: 'pat-001',
                    type: 'Esterilización (Orquiectomía)',
                    date: '2024-01-28',
                    time: '10:00',
                    surgeonId: 'vet-001',
                    anesthesiologistId: 'vet-002',
                    status: 'completed',
                    preOpNotes: 'Paciente en ayuno de 12h. Laboratorios dentro de parámetros normales.',
                    procedure: 'Se realizó orquiectomía bilateral sin complicaciones. Tiempo quirúrgico: 35 min.',
                    postOpNotes: 'Recuperación anestésica satisfactoria. Alta en 4 horas.',
                    complications: null
                },
                {
                    id: 'surg-002',
                    patientId: 'pat-002',
                    type: 'Limpieza dental',
                    date: '2024-01-30',
                    time: '14:00',
                    surgeonId: 'vet-001',
                    anesthesiologistId: 'vet-002',
                    status: 'scheduled',
                    preOpNotes: 'Pendiente ayuno. Requiere profilaxis antibiótica.',
                    procedure: null,
                    postOpNotes: null,
                    complications: null
                }
            ];
        }
    },

    /**
     * Renderiza la página
     */
    async render() {
        this.loadData();

        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar cirugía...', 'surgerySearch')}
                </div>
                <div class="patients-filters">
                    <button class="btn btn-primary" id="btnNewSurgery">
                        <span>🔪</span> Nueva Cirugía
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="vaccination-tabs">
                <button class="tab-btn active" data-tab="scheduled">📅 Programadas</button>
                <button class="tab-btn" data-tab="inprogress">▶️ En Curso</button>
                <button class="tab-btn" data-tab="completed">✅ Completadas</button>
            </div>
            
            <!-- Tab Content -->
            <div class="vaccination-content">
                <div class="tab-content active" id="tab-scheduled">
                    ${await this.renderScheduledSurgeries()}
                </div>
                <div class="tab-content" id="tab-inprogress">
                    ${await this.renderInProgressSurgeries()}
                </div>
                <div class="tab-content" id="tab-completed">
                    ${await this.renderCompletedSurgeries()}
                </div>
            </div>
            
            <!-- Modal -->
            ${await this.renderSurgeryModal()}
            ${this.renderViewModal()}
        `;
    },

    /**
     * Renderiza cirugías programadas
     */
    async renderScheduledSurgeries() {
        const scheduled = this.surgeries.filter(s => s.status === 'scheduled');
        if (scheduled.length === 0) {
            return Components.emptyState('📅', 'No hay cirugías programadas', 'Programa una nueva cirugía.');
        }

        const cards = await Promise.all(scheduled.map(s => this.renderSurgeryCard(s)));
        return `
            <div class="surgeries-grid">
                ${cards.join('')}
            </div>
        `;
    },

    /**
     * Renderiza cirugías en curso
     */
    async renderInProgressSurgeries() {
        const inProgress = this.surgeries.filter(s => s.status === 'in-progress');
        if (inProgress.length === 0) {
            return Components.emptyState('▶️', 'No hay cirugías en curso', 'Las cirugías activas aparecerán aquí.');
        }

        const cards = await Promise.all(inProgress.map(s => this.renderSurgeryCard(s)));
        return `
            <div class="surgeries-grid">
                ${cards.join('')}
            </div>
        `;
    },

    /**
     * Renderiza cirugías completadas
     */
    async renderCompletedSurgeries() {
        const completed = this.surgeries.filter(s => s.status === 'completed');
        if (completed.length === 0) {
            return Components.emptyState('✅', 'No hay cirugías completadas', 'Las cirugías finalizadas aparecerán aquí.');
        }

        const cards = await Promise.all(completed.map(s => this.renderSurgeryCard(s)));
        return `
            <div class="surgeries-grid">
                ${cards.join('')}
            </div>
        `;
    },

    async renderSurgeryCard(surgery) {
        const patient = await DataService.getPatientById(surgery.patientId);
        const surgeon = await DataService.getVeterinarianById(surgery.surgeonId);
        const anesthesiologist = await DataService.getVeterinarianById(surgery.anesthesiologistId);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const date = DataService.formatDate(surgery.date);
        const statusClass = surgery.status === 'completed' ? 'success' : surgery.status === 'in-progress' ? 'warning' : 'primary';
        const statusLabel = surgery.status === 'completed' ? 'Completada' : surgery.status === 'in-progress' ? 'En curso' : 'Programada';

        return `
            <div class="surgery-card" data-surgery-id="${surgery.id}">
                <div class="surgery-card-header">
                    <div class="surgery-patient">
                        <span class="patient-emoji">${emoji}</span>
                        <div>
                            <div class="patient-name-sm">${patient ? patient.name : 'Paciente'}</div>
                            <div class="surgery-date">${date} - ${surgery.time}</div>
                        </div>
                    </div>
                    <span class="badge badge-${statusClass}">${statusLabel}</span>
                </div>
                <div class="surgery-card-body">
                    <h4 class="surgery-type">${surgery.type}</h4>
                    <div class="surgery-team">
                        <div>
                            <span>👨‍⚕️</span> ${surgeon ? surgeon.full_name || surgeon.name : 'No asignado'}
                            ${surgeon ? `<span class="text-muted" style="font-size: 0.75em;"> TP: ${surgeon.tp || 'N/A'}</span>` : ''}
                        </div>
                        <div>
                            <span>💊</span> ${anesthesiologist ? anesthesiologist.full_name || anesthesiologist.name : 'No asignado'}
                        </div>
                    </div>
                    ${surgery.preOpNotes ? `
                        <div class="surgery-notes">
                            <strong>Pre-op:</strong> ${surgery.preOpNotes.substring(0, 100)}...
                        </div>
                    ` : ''}
                </div>
                <div class="surgery-card-footer">
                    ${surgery.status === 'scheduled' ? `
                        <button class="btn btn-warning btn-sm" onclick="SurgeriesPage.startSurgery('${surgery.id}')">
                            ▶️ Iniciar
                        </button>
                    ` : ''}
                    ${surgery.status === 'in-progress' ? `
                        <button class="btn btn-success btn-sm" onclick="SurgeriesPage.completeSurgery('${surgery.id}')">
                            ✅ Finalizar
                        </button>
                    ` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="SurgeriesPage.openViewModal('${surgery.id}')">
                        Ver detalle →
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Modal nueva cirugía
     */
    async renderSurgeryModal() {
        const patients = await DataService.getPatients() || [];
        const vets = await DataService.getVeterinarians() || [];
        const currentUser = DataService.getCurrentUser();

        return `
            <div class="modal-backdrop" id="surgeryModal">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🔪 Programar Cirugía</h2>
                        <button class="modal-close" onclick="SurgeriesPage.closeModal('surgeryModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Paciente *</label>
                                <select class="input" id="surgeryPatient">
                                    <option value="">-- Seleccionar --</option>
                                    ${await Promise.all(patients.map(async p => {
                                        const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
                                        return `<option value="${p.id}">${DataService.getSpeciesEmoji(p.species)} ${p.name} (${owner?.full_name || owner?.fullName || ''})</option>`;
                                    })).then(opts => opts.join(''))}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo de procedimiento *</label>
                                <select class="input" id="surgeryType">
                                    <option value="">-- Seleccionar --</option>
                                    <option value="Esterilización">Esterilización</option>
                                    <option value="Limpieza dental">Limpieza dental</option>
                                    <option value="Extracción de tumor">Extracción de tumor</option>
                                    <option value="Cesárea">Cesárea</option>
                                    <option value="Cirugía ortopédica">Cirugía ortopédica</option>
                                    <option value="Laparotomía exploratoria">Laparotomía exploratoria</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                <input type="text" class="input mt-2 hidden" id="surgeryTypeCustom" placeholder="Especificar procedimiento..." style="margin-top: 8px;">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha *</label>
                                <input type="date" class="input" id="surgeryDate" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hora *</label>
                                <input type="time" class="input" id="surgeryTime" value="09:00">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Cirujano *</label>
                                <select class="input" id="surgeon">
                                    <option value="">-- Seleccionar --</option>
                                    ${vets.map(v => `
                                        <option value="${v.id}" ${v.id === currentUser?.id ? 'selected' : ''}>
                                            ${v.full_name || v.name} - TP: ${v.tp || 'N/A'}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            </div>
                            <div class="form-group" id="anesthesiologistGroup">
                                <label class="form-label">Anestesiólogo</label>
                                <select class="input" id="anesthesiologist">
                                    <option value="">-- Seleccionar --</option>
                                    ${vets.map(v => `
                                        <option value="${v.id}">
                                            ${v.full_name || v.name} - TP: ${v.tp || 'N/A'}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notas preoperatorias</label>
                            <textarea class="input textarea" id="preOpNotes" rows="3" placeholder="Indicaciones, ayuno, laboratorios..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="SurgeriesPage.closeModal('surgeryModal')">Cancelar</button>
                        <button class="btn btn-primary" onclick="SurgeriesPage.saveSurgery()">💾 Programar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal ver detalle
     */
    renderViewModal() {
        return `
            <div class="modal-backdrop" id="viewSurgeryModal">
                <div class="modal" style="max-width: 650px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🔪 Detalle de Cirugía</h2>
                        <button class="modal-close" onclick="SurgeriesPage.closeModal('viewSurgeryModal')">✕</button>
                    </div>
                    <div class="modal-body" id="viewSurgeryBody">
                        <!-- Se llena dinámicamente -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="SurgeriesPage.closeModal('viewSurgeryModal')">Cerrar</button>
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

        // Botón nueva cirugía
        document.getElementById('btnNewSurgery')?.addEventListener('click', () => {
            document.getElementById('surgeryModal').classList.add('active');
        });

        // Búsqueda
        document.getElementById('surgerySearch')?.addEventListener('input', (e) => {
            this.filterSurgeries(e.target.value);
        });

        // Toggle para "Otro" tipo de cirugía
        const surgeryTypeSelect = document.getElementById('surgeryType');
        if (surgeryTypeSelect) {
            surgeryTypeSelect.addEventListener('change', (e) => {
                const isOther = e.target.value === 'Otro';
                const customInput = document.getElementById('surgeryTypeCustom');
                const adminGroup = document.getElementById('anesthesiologistGroup');

                if (customInput) {
                    if (isOther) {
                        customInput.classList.remove('hidden');
                        customInput.focus();
                    } else {
                        customInput.classList.add('hidden');
                    }
                }

                if (adminGroup) {
                    if (isOther) {
                        adminGroup.classList.add('hidden');
                        document.getElementById('anesthesiologist').value = '';
                    } else {
                        adminGroup.classList.remove('hidden');
                    }
                }
            });
        }
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    saveSurgery() {
        const patientId = document.getElementById('surgeryPatient').value;
        const type = document.getElementById('surgeryType').value;
        const surgeonId = document.getElementById('surgeon').value;

        if (!patientId || !type || !surgeonId) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        const newSurgery = {
            id: `surg-${Date.now()}`,
            patientId,
            type,
            date: document.getElementById('surgeryDate').value,
            time: document.getElementById('surgeryTime').value,
            surgeonId: surgeonId,
            anesthesiologistId: document.getElementById('anesthesiologist').value || null,
            status: 'scheduled',
            preOpNotes: document.getElementById('preOpNotes').value,
            procedure: null,
            postOpNotes: null,
            complications: null
        };

        this.surgeries.unshift(newSurgery);
        this.closeModal('surgeryModal');
        this.refreshTabs();
        this.showToast('✅ Cirugía programada');
    },

    startSurgery(surgeryId) {
        const surgery = this.surgeries.find(s => s.id === surgeryId);
        if (surgery) {
            surgery.status = 'in-progress';
            this.refreshTabs();
            this.showToast('▶️ Cirugía iniciada');
        }
    },

    completeSurgery(surgeryId) {
        const surgery = this.surgeries.find(s => s.id === surgeryId);
        if (surgery) {
            surgery.status = 'completed';
            this.refreshTabs();
            this.showToast('✅ Cirugía completada');
        }
    },

    async openViewModal(surgeryId) {
        // Inyectar modal si no existe (viniendo de otras páginas)
        if (!document.getElementById('viewSurgeryModal')) {
            document.body.insertAdjacentHTML('beforeend', this.renderViewModal());
            // Cerrar otros modales que puedan estar abiertos (opcional, por si acaso)
        }

        const surgery = this.surgeries.find(s => s.id === surgeryId);
        if (!surgery) return;

        document.getElementById('viewSurgeryModal').classList.add('active');
        const body = document.getElementById('viewSurgeryBody');
        body.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando...</div>';

        const patient = await DataService.getPatientById(surgery.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id || patient.ownerId) : null;
        const surgeon = await DataService.getVeterinarianById(surgery.surgeonId);
        const anesthesiologist = await DataService.getVeterinarianById(surgery.anesthesiologistId);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const statusClass = surgery.status === 'completed' ? 'success' : surgery.status === 'in-progress' ? 'warning' : 'primary';
        const statusLabel = surgery.status === 'completed' ? 'Completada' : surgery.status === 'in-progress' ? 'En curso' : 'Programada';

        body.innerHTML = `
            <div class="surgery-detail">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);">
                    <span style="font-size: 48px;">${emoji}</span>
                    <div style="flex: 1;">
                        <h3 style="margin: 0;">${patient ? patient.name : 'Paciente'}</h3>
                        <p class="text-muted" style="margin: 4px 0;">${owner ? owner.full_name || owner.fullName : ''}</p>
                    </div>
                    <span class="badge badge-${statusClass}">${statusLabel}</span>
                </div>

                <h4 style="margin-bottom: 12px;">${surgery.type}</h4>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div><strong>Fecha:</strong> ${DataService.formatDate(surgery.date)}</div>
                    <div><strong>Hora:</strong> ${surgery.time}</div>
                    <div>
                        <strong>Cirujano:</strong> ${surgeon ? surgeon.full_name || surgeon.name : '-'}
                        ${surgeon ? `<br><span class="text-muted">TP: ${surgeon.tp || 'N/A'}</span>` : ''}
                    </div>
                    <div>
                        <strong>Anestesiólogo:</strong> ${anesthesiologist ? anesthesiologist.full_name || anesthesiologist.name : '-'}
                        ${anesthesiologist ? `<br><span class="text-muted">TP: ${anesthesiologist.tp || 'N/A'}</span>` : ''}
                    </div>
                </div>

                ${surgery.preOpNotes ? `
                    <div style="background: var(--color-warning-bg); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <strong>📋 Notas Preoperatorias:</strong>
                        <p style="margin: 8px 0 0 0;">${surgery.preOpNotes}</p>
                    </div>
                ` : ''}

                ${surgery.procedure ? `
                    <div style="background: var(--color-primary-bg); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <strong>🔪 Procedimiento:</strong>
                        <p style="margin: 8px 0 0 0;">${surgery.procedure}</p>
                    </div>
                ` : ''}

                ${surgery.postOpNotes ? `
                    <div style="background: var(--color-success-bg); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <strong>✅ Notas Postoperatorias:</strong>
                        <p style="margin: 8px 0 0 0;">${surgery.postOpNotes}</p>
                    </div>
                ` : ''}

                ${surgery.complications ? `
                    <div style="background: var(--color-danger-bg); padding: 12px; border-radius: 8px;">
                        <strong>⚠️ Complicaciones:</strong>
                        <p style="margin: 8px 0 0 0;">${surgery.complications}</p>
                    </div>
                ` : ''}
            </div>
        `;

        // body will update as it fetches data. Modal is already open.
    },

    async refreshTabs() {
        document.getElementById('tab-scheduled').innerHTML = await this.renderScheduledSurgeries();
        document.getElementById('tab-inprogress').innerHTML = await this.renderInProgressSurgeries();
        document.getElementById('tab-completed').innerHTML = await this.renderCompletedSurgeries();
    },

    async filterSurgeries(query) {
        const q = query.toLowerCase();
        
        let filtered = [];
        for (const s of this.surgeries) {
            const patient = await DataService.getPatientById(s.patientId);
            const searchText = `${patient ? patient.name : ''} ${s.type}`.toLowerCase();
            if (searchText.includes(q)) {
                filtered.push(s);
            }
        }

        const active = document.querySelector('.tab-btn.active')?.dataset.tab || 'scheduled';
        const container = document.getElementById(`tab-${active}`);

        if (!query) {
            this.refreshTabs();
            return;
        }

        const statusFilter = active === 'scheduled' ? 'scheduled' : active === 'inprogress' ? 'in-progress' : 'completed';
        const results = filtered.filter(s => s.status === statusFilter);

        if (results.length === 0) {
            container.innerHTML = Components.emptyState('🔍', 'Sin resultados', 'No se encontraron cirugías con ese criterio.');
        } else {
            const cards = await Promise.all(results.map(s => this.renderSurgeryCard(s)));
            container.innerHTML = `
                <div class="surgeries-grid">
                    ${cards.join('')}
                </div>
            `;
        }
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

// Alias for backward compatibility
const RecordsPage = SurgeriesPage;
