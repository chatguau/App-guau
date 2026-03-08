/**
 * SHCV - Página Pacientes
 * Gestión y visualización de pacientes
 */

const PatientsPage = {
    currentPatient: null,
    searchQuery: '',

    /**
     * Renderiza la página de pacientes
     */
    async render() {
        const patients = this.searchQuery
            ? await DataService.searchPatients(this.searchQuery)
            : await DataService.getPatients();

        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar paciente, propietario, HC...', 'patientSearch')}
                </div>
                <div class="patients-filters">
                    <select class="chart-select" id="speciesFilter">
                        <option value="">Todas las especies</option>
                        <option value="canino">🐕 Caninos</option>
                        <option value="felino">🐱 Felinos</option>
                    </select>
                    ${Components.button('Nuevo Paciente', 'primary', '➕', 'btn-new-patient', 'btnNewPatient')}
                </div>
            </div>
            
            <!-- Patients List -->
            <div class="patients-list" id="patientsList">
                ${this.renderPatientsList(patients)}
            </div>
            
            <!-- New Patient Modal -->
            ${this.renderNewPatientModal()}
            
            <!-- Patient Detail Modal -->
            <div class="modal-backdrop" id="patientModal">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 class="modal-title">Detalle del Paciente</h2>
                        <button class="modal-close" id="closePatientModal">✕</button>
                    </div>
                    <div class="modal-body" id="patientModalBody">
                        <!-- Se llena dinámicamente -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="btnEditPatient">✏️ Editar</button>
                        <button class="btn btn-primary" id="btnModalNewConsultation">➕ Nueva Consulta</button>
                        <button class="btn btn-primary" id="btnModalNewVaccination">💉 Nueva Vacuna</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para nuevo paciente
     */
    renderNewPatientModal() {
        return `
            <div class="modal-backdrop" id="newPatientModal">
                <div class="modal" style="max-width: 700px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 class="modal-title">🐾 Registrar Nuevo Paciente</h2>
                        <button class="modal-close" id="closeNewPatientModal">✕</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto; max-height: 60vh;">
                        <!-- Step Indicator -->
                        <div class="form-steps">
                            <div class="form-step active" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-label">Mascota</span>
                            </div>
                            <div class="form-step" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-label">Propietario</span>
                            </div>
                        </div>

                        <!-- Step 1: Datos de la Mascota -->
                        <div class="form-step-content active" id="pStep1">
                            <h3 class="form-section-title">Datos de la Mascota</h3>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Nombre *</label>
                                    <input type="text" class="input" id="pName" placeholder="Nombre de la mascota">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Especie *</label>
                                    <select class="input" id="pSpecies">
                                        <option value="canino">🐕 Canino</option>
                                        <option value="felino">🐱 Felino</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Raza *</label>
                                    <select class="input" id="pBreed">
                                        <!-- Se llena dinámicamente -->
                                    </select>
                                </div>
                                <div class="form-group hidden" id="pCustomBreedContainer">
                                    <label class="form-label">Especificar Raza *</label>
                                    <input type="text" class="input" id="pCustomBreed" placeholder="Ingresa la raza">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Sexo *</label>
                                    <select class="input" id="pSex">
                                        <option value="male">♂ Macho</option>
                                        <option value="male_neutered">♂ Macho Castrado</option>
                                        <option value="female">♀ Hembra</option>
                                        <option value="female_spayed">♀ Hembra Esterilizada</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Microchip</label>
                                    <input type="text" class="input" id="pMicrochip" placeholder="Número de microchip">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Fecha Nacimiento</label>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <input type="date" class="input" id="pBirthDate" style="flex: 1;">
                                        <span id="pAgeDisplay" style="font-size: 0.85rem; color: var(--color-primary); font-weight: 600; white-space: nowrap;"></span>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Peso (kg)</label>
                                    <input type="number" class="input" id="pWeight" step="0.1" placeholder="0.0">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label class="form-label">Color y Señas Particulares</label>
                                    <input type="text" class="input" id="pColor" placeholder="Ej: Blanco con manchas negras">
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Datos del Propietario -->
                        <div class="form-step-content" id="pStep2">
                            <h3 class="form-section-title">Datos del Propietario</h3>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Nombre(s) *</label>
                                    <input type="text" class="input" id="oFirstName" placeholder="Nombres">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Apellido(s) *</label>
                                    <input type="text" class="input" id="oLastName" placeholder="Apellidos">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Documento / ID *</label>
                                    <input type="text" class="input" id="oDocument" placeholder="Cédula, DNI..." required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Celular *</label>
                                    <input type="tel" class="input" id="oPhone" placeholder="Número de contacto">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="input" id="oEmail" placeholder="correo@ejemplo.com">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label class="form-label">Dirección</label>
                                    <input type="text" class="input" id="oAddress" placeholder="Dirección de residencia">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="pPrevStep" disabled>← Anterior</button>
                        <button class="btn btn-primary" id="pNextStep">Siguiente →</button>
                        <button class="btn btn-primary hidden" id="btnSaveNewPatient">💾 Guardar Registro</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza la lista de pacientes
     */
    renderPatientsList(patients) {
        if (patients.length === 0) {
            return Components.emptyState(
                '🔍',
                'No se encontraron pacientes',
                'Intenta con otros términos de búsqueda o registra un nuevo paciente.'
            );
        }

        return patients.map(patient => {
            const owner = DataService.getOwnerById(patient.ownerId);
            return Components.patientItem(patient, owner);
        }).join('');
    },

    /**
     * Renderiza el detalle de un paciente
     */
    async renderPatientDetail(patientId) {
        console.log('Rendering patient detail for:', patientId);

        const patient = await DataService.getPatientById(patientId);
        if (!patient) {
            console.error('Patient not found!');
            return '';
        }

        const consultations = await DataService.getConsultationsByPatient(patientId) || [];
        const vaccinations = await DataService.getVaccinationsByPatient(patientId) || [];
        const deworming = await DataService.getDewormingByPatient(patientId) || [];
        // Prescriptions y otros módulos podrían necesitar refactorización asíncrona también, por ahora mocks o await si ya los tienen
        const prescriptions = (typeof PrescriptionsPage !== 'undefined' && PrescriptionsPage.prescriptions) 
                ? PrescriptionsPage.prescriptions.filter(p => p.patientId === patientId) : [];
        
        const hospitalizations = await DataService.getHospitalizationsByPatient(patientId) || [];

        const surgeries = typeof SurgeriesPage !== 'undefined'
            ? SurgeriesPage.surgeries.filter(s => s.patientId === patientId)
            : [];

        // Medical history mock por ahora
        const medicalHistory = null;
        const age = DataService.calculateAge(patient.birthDate);
        const emoji = DataService.getSpeciesEmoji(patient.species);

        // Generar HTML de autorizaciones también asíncrono
        const authorizationsHtml = await this.renderAuthorizationsTab(patientId);

        return `
            <!-- Patient Header -->
            <div class="patient-detail-header">
                <div class="patient-detail-avatar">${emoji}</div>
                <div class="patient-detail-info">
                    <h2>${patient.name}</h2>
                    <div class="patient-detail-meta">
                        <span class="meta-item">📋 ${patient.medicalRecordNumber}</span>
                        <span class="meta-item">${patient.breed}</span>
                        <span class="meta-item">${this.getSexLabel(patient.sex)}</span>
                        <span class="meta-item">📅 ${age}</span>
                        <span class="meta-item">⚖️ ${patient.weight} kg</span>
                        ${patient.microchip ? `<span class="meta-item">🆔 Chip: ${patient.microchip}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Tabs -->
            <div class="detail-tabs">
                <button class="detail-tab active" data-tab="info">Información</button>
                <button class="detail-tab" data-tab="history">Historial</button>
                <button class="detail-tab" data-tab="vaccines">Vacunación</button>
                <button class="detail-tab" data-tab="deworming">Desparasitación</button>
                <button class="detail-tab" data-tab="prescriptions">Recetas</button>
                <button class="detail-tab" data-tab="hospitalization">Hospitalización</button>
                <button class="detail-tab" data-tab="surgeries">Cirugías</button>
                <button class="detail-tab" data-tab="authorizations">Autorizaciones</button>
            </div>
            
            <!-- Tab Content: Información -->
            <div class="tab-content active" id="tab-info">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Datos del Propietario</h4>
                <div class="info-grid">
                    ${Components.infoItem('Nombre', patient.owner?.fullName)}
                    ${Components.infoItem('Documento', patient.owner?.documentNumber)}
                    ${Components.infoItem('Celular', patient.owner?.phone)}
                    ${Components.infoItem('Email', patient.owner?.email)}
                    ${Components.infoItem('Dirección', patient.owner?.address)}
                </div>
                
                <h4 style="margin: 24px 0 16px; color: var(--color-text);">Datos del Paciente</h4>
                <div class="info-grid">
                    ${Components.infoItem('Especie', patient.species.charAt(0).toUpperCase() + patient.species.slice(1))}
                    ${Components.infoItem('Raza', patient.breed)}
                    ${Components.infoItem('Sexo', this.getSexLabel(patient.sex))}
                    ${Components.infoItem('Microchip', patient.microchip || 'No registrado')}
                    ${Components.infoItem('Color', patient.color)}
                    ${Components.infoItem('Peso', `${patient.weight} kg`)}
                    ${Components.infoItem('Fecha de Nacimiento', patient.birthDate ? DataService.formatDate(patient.birthDate) : 'No registrada')}
                    ${Components.infoItem('Señas Particulares', patient.distinctiveMarks)}
                </div>
                
                ${medicalHistory ? `
                    <h4 style="margin: 24px 0 16px; color: var(--color-text);">Antecedentes Médicos</h4>
                    <div class="info-grid">
                        ${Components.infoItem('Alergias', medicalHistory.allergies)}
                        ${Components.infoItem('Condiciones Crónicas', medicalHistory.chronicConditions)}
                        ${Components.infoItem('Cirugías Previas', medicalHistory.previousSurgeries)}
                        ${Components.infoItem('Medicamentos Actuales', medicalHistory.currentMedications)}
                    </div>
                    ${medicalHistory.observations ? `
                        <div style="margin-top: 16px; padding: 12px; background: var(--color-warning-bg); border-radius: 8px;">
                            <strong>📝 Observaciones:</strong> ${medicalHistory.observations}
                        </div>
                    ` : ''}
                ` : ''}
            </div>
            
            <!-- Tab Content: Historial -->
            <div class="tab-content" id="tab-history">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Historial de Consultas</h4>
                ${consultations.length > 0 ? `
                    <div class="consultations-patient-list">
                        ${consultations.map(c => {
            const vet = DataService.getVeterinarianById(c.veterinarianId);
            return `
                            <div class="consultation-item-mini" data-consultation-id="${c.id}">
                                <div class="consultation-item-header">
                                    <span class="consultation-date">📅 ${DataService.formatDate(c.date)}</span>
                                    <span class="consultation-vet" style="font-size: 0.8em; color: var(--color-text-secondary);">👨‍⚕️ ${vet ? vet.name : 'No especificado'}</span>
                                </div>
                                <div class="consultation-item-content">
                                    <strong>${c.reason}</strong>
                                    <p><strong>Diagnóstico:</strong> ${c.diagnosis || 'Pendiente'}</p>
                                    <p><strong>Peso:</strong> ${c.weight} kg | <strong>Temp:</strong> ${c.temperature}°C</p>
                                </div>
                                <button class="btn btn-ghost btn-xs view-consultation-btn" data-id="${c.id}">Ver detalle →</button>
                            </div>
                        `}).join('')}
                    </div>
                ` : Components.emptyState('📋', 'Sin consultas', 'Este paciente no tiene consultas registradas.')}
            </div>
            
            <!-- Tab Content: Vacunas -->
            <div class="tab-content" id="tab-vaccines">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Registro de Vacunación</h4>
                ${vaccinations.length > 0 ?
                Components.table(
                    ['Vacuna', 'Fecha', 'Próxima Dosis', 'Laboratorio'],
                    vaccinations.map(v => [
                        v.vaccineType,
                        DataService.formatDate(v.applicationDate),
                        v.nextDoseDate ? DataService.formatDate(v.nextDoseDate) : '-',
                        v.laboratory
                    ])
                )
                : Components.emptyState('💉', 'Sin vacunas', 'Este paciente no tiene vacunas registradas.')}
            </div>
            
            <!-- Tab Content: Desparasitación -->
            <div class="tab-content" id="tab-deworming">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Historial de Desparasitación</h4>
                ${deworming.length > 0 ?
                Components.table(
                    ['Producto', 'Fecha', 'Próxima Dosis', 'Dosis'],
                    deworming.map(d => [
                        d.product,
                        DataService.formatDate(d.date),
                        d.nextDoseDate ? DataService.formatDate(d.nextDoseDate) : '-',
                        d.dose
                    ])
                )
                : Components.emptyState('💊', 'Sin registros', 'Este paciente no tiene desparasitaciones registradas.')}
            </div>
            
            <!-- Tab Content: Hospitalización -->
            <div class="tab-content" id="tab-hospitalization">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Historial de Hospitalización</h4>
                ${hospitalizations.length > 0 ?
                `<div class="list-group">
                    ${hospitalizations.map(h => `
                        <div class="list-item" style="padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold;">Ingreso: ${DataService.formatDate(h.admissionDate)}</div>
                                <div class="text-muted small">${h.admissionReason}</div>
                                <div class="badge badge-info mt-1">${h.status === 'active' ? 'Activo' : 'Egresado'}</div>
                            </div>
                            <button class="btn btn-ghost btn-xs" onclick="HospitalizationPage.openViewModal('${h.id}')">Ver detalle →</button>
                        </div>
                    `).join('')}
                </div>`
                : Components.emptyState('🏥', 'Sin hospitalizaciones', 'Este paciente no registra ingresos hospitalarios.')}
            </div>

            <!-- Tab Content: Cirugías -->
            <div class="tab-content" id="tab-surgeries">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Historial Quirúrgico</h4>
                ${surgeries.length > 0 ?
                `<div class="list-group">
                    ${surgeries.map(s => `
                        <div class="list-item" style="padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold;">${s.type}</div>
                                <div class="text-muted small">${DataService.formatDate(s.date)} - ${s.time}</div>
                                <div class="badge ${s.status === 'completed' ? 'badge-success' : 'badge-warning'} mt-1">
                                    ${s.status === 'completed' ? 'Realizada' : 'Programada'}
                                </div>
                            </div>
                            <button class="btn btn-ghost btn-xs" onclick="SurgeriesPage.openViewModal('${s.id}')">Ver detalle →</button>
                        </div>
                    `).join('')}
                </div>`
                : Components.emptyState('✂️', 'Sin cirugías', 'Este paciente no tiene cirugías registradas.')}
            </div>
            
            <!-- Tab Content: Recetas -->
            <div class="tab-content" id="tab-prescriptions">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="color: var(--color-text); margin: 0;">Recetas Médicas</h4>
                    <button class="btn btn-sm btn-primary" id="btnNewPrescriptionFromPatient">➕ Nueva Receta</button>
                </div>
                ${prescriptions.length > 0 ?
                `<div class="prescriptions-patient-list">
                    ${prescriptions.map(p => `
                        <div class="prescription-item-mini" data-prescription-id="${p.id}">
                            <div class="prescription-item-header">
                                <span class="prescription-date">📅 ${DataService.formatDate(p.date)}</span>
                                <span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-muted'}">${p.status === 'active' ? 'Activa' : 'Completada'}</span>
                            </div>
                            <div class="prescription-item-meds">
                                ${p.medications.map(m => `<span class="med-tag">💊 ${m.name}</span>`).join('')}
                            </div>
                            <button class="btn btn-ghost btn-xs view-prescription-btn" data-id="${p.id}">Ver detalle →</button>
                        </div>
                    `).join('')}
                </div>`
                : Components.emptyState('📋', 'Sin recetas', 'Este paciente no tiene recetas médicas registradas.')}
            </div>
            
            <!-- Tab Content: Autorizaciones -->
            <div class="tab-content hidden" id="tab-authorizations">
                <div class="panel-header">
                     <span class="panel-title">Consentimientos Informados</span>
                     <button class="btn btn-sm btn-primary" onclick="AuthorizationsPage.openModal(); setTimeout(() => {
                        document.getElementById('authPatientId').value = '${patient.id}';
                        document.getElementById('authPatientSearch').value = '${patient.name}';
                        document.getElementById('authSignedBy').value = '${patient.owner?.fullName || ''}';
                        document.getElementById('authDocNumber').value = '${patient.owner?.documentNumber || ''}';
                    }, 100);">+ Nueva</button>
                </div>
                ${authorizationsHtml}
            </div>
        `;
    },

    async renderAuthorizationsTab(patientId) {
        const auths = await DataService.getAuthorizationsByPatient(patientId) || [];
        if (auths.length === 0) {
            return Components.emptyState('📝', 'Sin Autorizaciones', 'No hay consentimientos registrados para este paciente.');
        }

        return Components.table(
            ['Fecha', 'Tipo', 'Firmado Por', 'Acciones'],
            auths.map(a => {
                const typeLabels = {
                    hospitalization: 'Hospitalización',
                    anesthesia: 'Anestesia',
                    surgery: 'Cirugía',
                    other: 'Otro'
                };
                return [
                    DataService.formatDate(a.createdAt),
                    typeLabels[a.type] || a.type,
                    a.signedBy,
                    `<button class="btn btn-sm btn-secondary" onclick="AuthorizationsPage.printAuth('${a.id}')">🖨️ Ver/Imprimir</button>`
                ];
            })
        );
    },

    /**
     * Inicializa los event listeners de la página
     */
    init() {
        // Verificar si se debe abrir el modal automáticamente
        if (localStorage.getItem('autoOpenVaccination') === 'true') {
            const autoPatientId = localStorage.getItem('autoSelectPatientId');
            localStorage.removeItem('autoOpenVaccination');
            localStorage.removeItem('autoSelectPatientId');

            setTimeout(() => {
                this.openNewModal(autoPatientId);
            }, 100);
        }

        // Búsqueda de pacientes
        const searchInput = document.getElementById('patientSearch');
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                this.searchQuery = e.target.value;
                document.getElementById('patientsList').innerHTML = '<div style="text-align:center; padding: 20px;">Buscando...</div>';
                const patients = await DataService.searchPatients(this.searchQuery);
                document.getElementById('patientsList').innerHTML = this.renderPatientsList(patients || []);
                this.attachPatientListeners();
            });
        }

        // Filtro por especie
        const speciesFilter = document.getElementById('speciesFilter');
        if (speciesFilter) {
            speciesFilter.addEventListener('change', async (e) => {
                const species = e.target.value;
                document.getElementById('patientsList').innerHTML = '<div style="text-align:center; padding: 20px;">Filtrando...</div>';
                let patients = await DataService.getPatients() || [];
                if (species) {
                    patients = patients.filter(p => p.species === species);
                }
                if (this.searchQuery) {
                    patients = patients.filter(p =>
                        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                    );
                }
                document.getElementById('patientsList').innerHTML = this.renderPatientsList(patients);
                this.attachPatientListeners();
            });
        }

        // Modal detalle
        const closeModal = document.getElementById('closePatientModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        const modalBackdrop = document.getElementById('patientModal');
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) this.closeModal();
            });
        }

        // Nuevo Paciente Modal events
        document.getElementById('btnNewPatient')?.addEventListener('click', () => this.openNewPatientModal());
        document.getElementById('closeNewPatientModal')?.addEventListener('click', () => this.closeNewPatientModal());
        document.getElementById('pPrevStep')?.addEventListener('click', () => this.prevPStep());
        document.getElementById('pNextStep')?.addEventListener('click', () => this.nextPStep());
        document.getElementById('btnSaveNewPatient')?.addEventListener('click', () => this.saveNewPatient());

        // Actualizar razas cuando cambie la especie en el modal
        document.getElementById('pSpecies')?.addEventListener('change', (e) => this.updateBreedSelect(e.target.value));

        // Listener para mostrar campo de raza personalizada
        document.getElementById('pBreed')?.addEventListener('change', (e) => {
            const container = document.getElementById('pCustomBreedContainer');
            if (e.target.value === 'OTRO') {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        });

        // Listener para cálculo de edad en tiempo real
        document.getElementById('pBirthDate')?.addEventListener('change', (e) => {
            const display = document.getElementById('pAgeDisplay');
            if (display) {
                display.textContent = DataService.calculateAge(e.target.value);
            }
        });

        // Attach patient item listeners
        this.attachPatientListeners();
    },

    openNewPatientModal() {
        this.editingPatientId = null;
        this.pCurrentStep = 1;
        this.updatePStepUI();
        this.updateBreedSelect('canino'); // Por defecto canino
        document.querySelector('#newPatientModal .modal-title').textContent = '🐾 Registrar Nuevo Paciente';

        // Limpiar campos
        const fields = ['pName', 'pCustomBreed', 'pMicrochip', 'pBirthDate', 'pWeight', 'pColor',
            'oFirstName', 'oLastName', 'oDocument', 'oPhone', 'oEmail', 'oAddress'];
        fields.forEach(f => {
            const el = document.getElementById(f);
            if (el) el.value = '';
        });
        document.getElementById('pAgeDisplay').textContent = '';

        document.getElementById('newPatientModal').classList.add('active');
    },

    updateBreedSelect(species) {
        const breedSelect = document.getElementById('pBreed');
        if (!breedSelect) return;

        const breeds = DataService.getBreedsBySpecies(species);
        let options = breeds.map(b => `<option value="${b}">${b}</option>`).join('');
        options += '<option value="OTRO">✨ OTRO (especificar)</option>';
        breedSelect.innerHTML = options;

        // Reset custom breed field
        document.getElementById('pCustomBreedContainer').classList.add('hidden');
        document.getElementById('pCustomBreed').value = '';
    },

    closeNewPatientModal() {
        document.getElementById('newPatientModal').classList.remove('active');
    },

    nextPStep() {
        if (this.pCurrentStep === 1) {
            const name = document.getElementById('pName').value;
            if (!name.trim()) {
                alert('Por favor ingresa el nombre de la mascota');
                return;
            }
        }
        if (this.pCurrentStep < 2) {
            this.pCurrentStep++;
            this.updatePStepUI();
        }
    },

    prevPStep() {
        if (this.pCurrentStep > 1) {
            this.pCurrentStep--;
            this.updatePStepUI();
        }
    },

    updatePStepUI() {
        // Indicadores
        document.querySelectorAll('#newPatientModal .form-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === this.pCurrentStep) {
                step.classList.add('active');
            } else if (stepNum < this.pCurrentStep) {
                step.classList.add('completed');
            }
        });

        // Contenido
        document.querySelectorAll('#newPatientModal .form-step-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`pStep${this.pCurrentStep}`).classList.add('active');

        // Botones
        document.getElementById('pPrevStep').disabled = this.pCurrentStep === 1;

        if (this.pCurrentStep === 2) {
            document.getElementById('pNextStep').classList.add('hidden');
            document.getElementById('btnSaveNewPatient').classList.remove('hidden');
        } else {
            document.getElementById('pNextStep').classList.remove('hidden');
            document.getElementById('btnSaveNewPatient').classList.add('hidden');
        }
    },

    async saveNewPatient() {
        // Early Return Pattern: validations first
        const oFirstName = document.getElementById('oFirstName').value;
        const oLastName = document.getElementById('oLastName').value;
        const oDocument = document.getElementById('oDocument').value;
        const oPhone = document.getElementById('oPhone').value;

        if (!oFirstName.trim() || !oLastName.trim() || !oDocument.trim() || !oPhone.trim()) {
            alert('Por favor completa los nombres, apellidos, documento/cédula y celular del propietario');
            return;
        }

        const btnSave = document.getElementById('btnSaveNewPatient');
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = '⏳ Guardando...';
        btnSave.disabled = true;

        try {
            // 1. Guardar/Actualizar Propietario
            const ownerData = {
                full_name: `${oFirstName.trim()} ${oLastName.trim()}`,
                document_number: document.getElementById('oDocument').value,
                phone: oPhone,
                email: document.getElementById('oEmail').value,
                address: document.getElementById('oAddress').value
            };

            let owner;
            if (this.editingPatientId) {
                const patient = await DataService.getPatientById(this.editingPatientId);
                ownerData.id = patient.owner_id;
                owner = await DataService.saveOwner(ownerData);
            } else {
                // Verificar si ya existe un propietario con este documento
                const existingOwner = await DataService.getOwnerByDocument(ownerData.document_number);
                if (existingOwner) {
                    // Reutilizar ID y actualizar datos
                    ownerData.id = existingOwner.id;
                    owner = await DataService.saveOwner(ownerData);
                    this.showToast('ℹ️ Propietario existente identificado. Datos actualizados.');
                } else {
                    owner = await DataService.saveOwner(ownerData);
                }
            }

            // 2. Guardar/Actualizar Paciente
            const breedValue = document.getElementById('pBreed').value;
            const customBreed = document.getElementById('pCustomBreed').value;

            const patientData = {
                name: document.getElementById('pName').value,
                species: document.getElementById('pSpecies').value,
                breed: breedValue === 'OTRO' ? customBreed : breedValue,
                sex: document.getElementById('pSex').value,
                microchip: document.getElementById('pMicrochip').value,
                birth_date: document.getElementById('pBirthDate').value || null,
                weight: parseFloat(document.getElementById('pWeight').value) || null,
                color: document.getElementById('pColor').value,
                owner_id: owner.id
            };

            if (this.editingPatientId) {
                patientData.id = this.editingPatientId;
                await DataService.savePatient(patientData);
            } else {
                await DataService.savePatient(patientData);
            }

            // 3. Cerrar y refrescar
            this.closeNewPatientModal();
            document.getElementById('patientsList').innerHTML = '<div style="text-align:center; padding: 20px;">Actualizando...</div>';
            const patients = await DataService.getPatients();
            document.getElementById('patientsList').innerHTML = this.renderPatientsList(patients || []);
            this.attachPatientListeners();

            // Mostrar confirmación
            this.showToast(this.editingPatientId ? '✅ Paciente actualizado exitosamente' : '✅ Paciente registrado exitosamente');
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Error al guardar el paciente. Revisa tu conexión.');
        } finally {
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
        }
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Añade listeners a los items de pacientes
     */
    attachPatientListeners() {
        document.querySelectorAll('.patient-item').forEach(item => {
            item.addEventListener('click', () => {
                const patientId = item.dataset.patientId;
                this.openPatientModal(patientId);
            });
        });
    },

    /**
     * Abre el modal con detalles del paciente
     */
    async openPatientModal(patientId) {
        const modal = document.getElementById('patientModal');
        const modalBody = document.getElementById('patientModalBody');

        modal.classList.add('active');
        modalBody.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando detalles...</div>';

        this.currentPatientId = patientId;
        const html = await this.renderPatientDetail(patientId);
        modalBody.innerHTML = html;

        // Tab switching - específico para este modal
        const modalContainer = document.getElementById('patientModalBody');
        const tabs = modalContainer.querySelectorAll('.detail-tab');
        const tabContents = modalContainer.querySelectorAll('.tab-content');

        console.log('Tabs found:', tabs.length);
        console.log('Tab contents found:', tabContents.length);

        tabs.forEach(tab => {
            tab.onclick = function () {
                const targetTab = this.dataset.tab;
                console.log('Tab clicked:', targetTab);

                // Remover active de todos los tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Remover active de todo el contenido
                tabContents.forEach(c => c.classList.remove('active'));

                // Activar el tab clickeado
                this.classList.add('active');

                // Mostrar el contenido correspondiente
                const tabContent = modalContainer.querySelector(`#tab-${targetTab}`);
                console.log('Tab content element:', tabContent);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            };
        });

        // Botones de acción del footer del modal
        const btnEdit = document.getElementById('btnEditPatient');
        const btnConsult = document.getElementById('btnModalNewConsultation');
        const btnVaccine = document.getElementById('btnModalNewVaccination');

        if (btnEdit) {
            btnEdit.onclick = () => {
                console.log('Editar clicked');
                this.closeModal();
                this.openEditPatientModal(patientId);
            };
        }

        if (btnConsult) {
            btnConsult.onclick = () => {
                console.log('Nueva Consulta clicked, navigating...');
                localStorage.setItem('autoOpenConsultation', 'true');
                localStorage.setItem('autoSelectPatientId', patientId);
                this.closeModal();
                App.navigateTo('consultations');
            };
        }

        if (btnVaccine) {
            btnVaccine.onclick = () => {
                console.log('Nueva Vacuna clicked, navigating...');
                localStorage.setItem('autoOpenVaccination', 'true');
                localStorage.setItem('autoSelectPatientId', patientId);
                this.closeModal();
                App.navigateTo('vaccinations');
            };
        }

        // Botón nueva receta desde pestaña Recetas
        const btnNewPrescription = document.getElementById('btnNewPrescriptionFromPatient');
        if (btnNewPrescription) {
            btnNewPrescription.onclick = () => {
                localStorage.setItem('autoOpenPrescription', 'true');
                localStorage.setItem('autoSelectPatientId', patientId);
                this.closeModal();
                App.navigateTo('prescriptions');
            };
        }

        // Botones ver detalle de receta
        modalContainer.querySelectorAll('.view-prescription-btn').forEach(btn => {
            btn.onclick = () => {
                const prescId = btn.dataset.id;
                this.closeModal();
                App.navigateTo('prescriptions');
                setTimeout(() => {
                    PrescriptionsPage.openViewPrescriptionModal(prescId);
                }, 200);
            };
        });

        // Botones ver detalle de consulta
        modalContainer.querySelectorAll('.view-consultation-btn').forEach(btn => {
            btn.onclick = () => {
                const consId = btn.dataset.id;
                this.closeModal();
                App.navigateTo('consultations');
                setTimeout(() => {
                    ConsultationsPage.openViewConsultationModal(consId);
                }, 200);
            };
        });
    },

    /**
     * Cierra el modal
     */
    closeModal() {
        document.getElementById('patientModal').classList.remove('active');
    },

    /**
     * Abre el modal de edición del paciente
     */
    openEditPatientModal(patientId) {
        const patient = DataService.getPatientById(patientId);
        if (!patient) return;

        this.editingPatientId = patientId;
        this.pCurrentStep = 1;
        this.updatePStepUI();

        // Cargar datos de mascota
        document.getElementById('pName').value = patient.name;
        document.getElementById('pSpecies').value = patient.species;
        this.updateBreedSelect(patient.species);

        const breedSelect = document.getElementById('pBreed');
        const breeds = DataService.getBreedsBySpecies(patient.species);
        if (breeds.includes(patient.breed)) {
            breedSelect.value = patient.breed;
        } else {
            breedSelect.value = 'OTRO';
            document.getElementById('pCustomBreedContainer').classList.remove('hidden');
            document.getElementById('pCustomBreed').value = patient.breed;
        }

        document.getElementById('pSex').value = patient.sex;
        document.getElementById('pMicrochip').value = patient.microchip || '';
        document.getElementById('pBirthDate').value = patient.birthDate || '';
        document.getElementById('pAgeDisplay').textContent = DataService.calculateAge(patient.birthDate);
        document.getElementById('pWeight').value = patient.weight || '';
        document.getElementById('pColor').value = patient.color || '';

        // Cargar datos de propietario
        const owner = DataService.getOwnerById(patient.ownerId);
        if (owner) {
            const nameParts = owner.fullName.split(' ');
            document.getElementById('oFirstName').value = nameParts[0] || '';
            document.getElementById('oLastName').value = nameParts.slice(1).join(' ') || '';
            document.getElementById('oDocument').value = owner.documentNumber || '';
            document.getElementById('oPhone').value = owner.phone || '';
            document.getElementById('oEmail').value = owner.email || '';
            document.getElementById('oAddress').value = owner.address || '';
        }

        document.querySelector('#newPatientModal .modal-title').textContent = '✏️ Editar Paciente';
        document.getElementById('newPatientModal').classList.add('active');
    },

    handleEditButtonClick() {
        if (this.currentPatientId) {
            this.closeModal();
            this.openEditPatientModal(this.currentPatientId);
        }
    },

    handleConsultationButtonClick() {
        console.log('Nueva Consulta clicked, patientId:', this.currentPatientId);
        if (this.currentPatientId) {
            localStorage.setItem('autoOpenConsultation', 'true');
            localStorage.setItem('autoSelectPatientId', this.currentPatientId);
            this.closeModal();
            App.navigateTo('consultations');
        } else {
            console.error('No currentPatientId set!');
        }
    },

    handleVaccinationButtonClick() {
        console.log('Nueva Vacuna clicked, patientId:', this.currentPatientId);
        if (this.currentPatientId) {
            localStorage.setItem('autoOpenVaccination', 'true');
            localStorage.setItem('autoSelectPatientId', this.currentPatientId);
            this.closeModal();
            App.navigateTo('vaccinations');
        } else {
            console.error('No currentPatientId set!');
        }
    },

    /**
     * Obtiene la etiqueta amigable para el sexo
     */
    getSexLabel(sexCode) {
        const labels = {
            'male': '♂ Macho',
            'male_neutered': '♂ Macho Castrado',
            'female': '♀ Hembra',
            'female_spayed': '♀ Hembra Esterilizada'
        };
        return labels[sexCode] || labels['male'];
    }
};
