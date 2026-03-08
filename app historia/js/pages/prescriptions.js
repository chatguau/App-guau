/**
 * SHCV - Página Recetas Médicas
 * Gestión de prescripciones/fórmulas médicas
 */

const PrescriptionsPage = {
    prescriptions: [],
    currentPrescription: null,

    /**
     * Inicializa prescripciones desde mock data
     */
    loadPrescriptions() {
        // Generar algunas prescripciones de ejemplo
        if (this.prescriptions.length === 0) {
            this.prescriptions = [
                {
                    id: 'presc-001',
                    consultationId: 'cons-001',
                    patientId: 'pat-001',
                    veterinarianId: 'vet-001',
                    date: '2024-01-25',
                    medications: [
                        {
                            name: 'Amoxicilina',
                            presentation: 'Tabletas 500mg',
                            dosage: '1 tableta',
                            route: 'Oral',
                            frequency: 'Cada 12 horas',
                            duration: '7 días'
                        },
                        {
                            name: 'Meloxicam',
                            presentation: 'Gotas 1.5mg/ml',
                            dosage: '0.1ml/kg',
                            route: 'Oral',
                            frequency: 'Cada 24 horas',
                            duration: '5 días'
                        }
                    ],
                    recommendations: 'Administrar con comida. Mantener hidratación adecuada.',
                    status: 'active'
                },
                {
                    id: 'presc-002',
                    consultationId: 'cons-002',
                    patientId: 'pat-002',
                    veterinarianId: 'vet-001',
                    date: '2024-01-28',
                    medications: [
                        {
                            name: 'Metoclopramida',
                            presentation: 'Gotas 4mg/ml',
                            dosage: '0.5mg/kg',
                            route: 'Oral',
                            frequency: 'Cada 8 horas',
                            duration: '3 días'
                        },
                        {
                            name: 'Omeprazol',
                            presentation: 'Cápsulas 20mg',
                            dosage: '1mg/kg',
                            route: 'Oral',
                            frequency: 'Cada 24 horas',
                            duration: '7 días'
                        }
                    ],
                    recommendations: 'Dieta blanda por 48 horas. Medicamentos en ayunas.',
                    status: 'completed'
                }
            ];
        }
    },

    /**
     * Renderiza la página de recetas
     */
    async render() {
        // En una app real, no usamos this.loadPrescriptions() sincronamente.
        // Si tuviéramos tabla prescriptions, haríamos await DataService.getPrescriptions().
        // Como MOCK temporal o porque no hay tabla para recetas aún, mantenemos array o traemos vacío.
        // Simulando que ya es asíncrona:
        let listHtml = '<div style="text-align:center; padding: 20px;">Cargando recetas...</div>';
        
        // Si queremos usar los Mocks locales por ahora:
        this.loadPrescriptions();
        listHtml = await this.renderPrescriptionsList(this.prescriptions);

        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar receta por paciente...', 'prescriptionSearch')}
                </div>
                <div class="patients-filters">
                    <select class="chart-select" id="statusFilter">
                        <option value="">Todos los estados</option>
                        <option value="active">Activas</option>
                        <option value="completed">Completadas</option>
                    </select>
                    <button class="btn btn-primary" id="btnNewPrescription">
                        <span>💊</span> Nueva Receta
                    </button>
                </div>
            </div>
            
            <!-- Prescriptions List -->
            <div class="prescriptions-grid" id="prescriptionsList">
                ${listHtml}
            </div>
            
            <!-- New Prescription Modal -->
            ${await this.renderNewPrescriptionModal()}
            
            <!-- View Prescription Modal -->
            ${this.renderViewPrescriptionModal()}
        `;
    },

    /**
     * Renderiza la lista de recetas
     */
    async renderPrescriptionsList(prescriptions) {
        if (!prescriptions || prescriptions.length === 0) {
            return Components.emptyState(
                '💊',
                'No hay recetas registradas',
                'Crea una nueva receta desde una consulta o usando el botón "Nueva Receta".'
            );
        }

        const cards = await Promise.all(prescriptions.map(p => this.renderPrescriptionCard(p)));

        return `
            <div class="prescriptions-list">
                ${cards.join('')}
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta de receta
     */
    async renderPrescriptionCard(prescription) {
        const patient = await DataService.getPatientById(prescription.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id) : null;
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const date = DataService.formatDate(prescription.date);
        const statusBadge = prescription.status === 'active'
            ? '<span class="badge badge-success">Activa</span>'
            : '<span class="badge badge-primary">Completada</span>';

        return `
            <div class="prescription-card" data-prescription-id="${prescription.id}">
                <div class="prescription-card-header">
                    <div class="prescription-patient">
                        <div class="patient-avatar-sm">${emoji}</div>
                        <div>
                            <div class="patient-name-sm">${patient ? patient.name : 'Paciente'}</div>
                            <div class="prescription-owner">${owner ? owner.fullName : ''}</div>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                <div class="prescription-card-body">
                    <div class="prescription-meta">
                        <span class="prescription-date">📅 ${date}</span>
                        <span class="prescription-count">💊 ${prescription.medications.length} medicamento${prescription.medications.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="prescription-medications-preview">
                        ${prescription.medications.slice(0, 2).map(m => `
                            <div class="medication-preview">
                                <span class="medication-name">${m.name}</span>
                                <span class="medication-dosage">${m.dosage} - ${m.frequency}</span>
                            </div>
                        `).join('')}
                        ${prescription.medications.length > 2 ? `
                            <div class="medication-more">+${prescription.medications.length - 2} más...</div>
                        ` : ''}
                    </div>
                </div>
                <div class="prescription-card-footer">
                    <button class="btn btn-ghost btn-sm print-prescription" data-id="${prescription.id}">
                        🖨️ Imprimir
                    </button>
                    <button class="btn btn-ghost btn-sm view-prescription" data-id="${prescription.id}">
                        Ver detalle →
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Modal para nueva receta
     */
    async renderNewPrescriptionModal() {
        const patients = await DataService.getPatients() || [];
        const currentUser = DataService.getCurrentUser();

        return `
            <div class="modal-backdrop" id="newPrescriptionModal">
                <div class="modal" style="max-width: 800px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 class="modal-title">💊 Nueva Receta Médica</h2>
                        <button class="modal-close" id="closeNewPrescription">✕</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto; max-height: 65vh;">
                        <!-- Selección de Paciente -->
                        <div class="form-group">
                            <label class="form-label">Seleccionar Paciente *</label>
                            <select class="input" id="prescriptionPatient">
                                <option value="">-- Seleccionar paciente --</option>
                                <!-- Se llena asincronmente o permitiremos cargarlo aqui mismo si no hay muchos -->
                                ${await Promise.all(patients.map(async p => {
                                    const owner = await DataService.getOwnerById(p.owner_id);
                                    return `<option value="${p.id}">${p.name} (${owner ? owner.full_name : 'Sin dueño'})</option>`;
                                })).then(opts => opts.join(''))}
                            </select>
                        </div>
                        
                        <!-- Selección de Veterinario -->
                        <div class="form-group">
                            <label class="form-label">Médico Veterinario *</label>
                            <select class="input" id="prescriptionVet">
                                <option value="">-- Seleccionar veterinario --</option>
                                ${(await DataService.getVeterinarians() || []).map(v => `
                                    <option value="${v.id}" ${v.id === currentUser?.id ? 'selected' : ''}>
                                        ${v.full_name || v.name} - TP: ${v.tp || 'N/A'}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- Medicamentos -->
                        <div class="form-section">
                            <div class="form-section-header">
                                <h3 class="form-section-title">Medicamentos</h3>
                                <button class="btn btn-ghost btn-sm" id="addMedication">
                                    ➕ Agregar medicamento
                                </button>
                            </div>
                            
                            <div id="medicationsList">
                                ${this.renderMedicationForm(0)}
                            </div>
                        </div>
                        
                        <!-- Próximo Control -->
                        <div class="form-group">
                            <label class="form-label">Próximo Control</label>
                            <div style="display: flex; gap: 20px; margin-bottom: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="nextControlType" value="days" checked onchange="document.getElementById('nextControlDaysContainer').style.display='block';document.getElementById('nextControlDateContainer').style.display='none'"> 
                                    En días
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="nextControlType" value="date" onchange="document.getElementById('nextControlDaysContainer').style.display='none';document.getElementById('nextControlDateContainer').style.display='block'"> 
                                    Fecha específica
                                </label>
                            </div>
                            
                            <div id="nextControlDaysContainer">
                                <input type="number" class="input" id="nextControlDays" placeholder="Ej: 15 (días)" min="1">
                            </div>
                            
                            <div id="nextControlDateContainer" style="display: none;">
                                <input type="date" class="input" id="nextControlDate">
                            </div>
                        </div>

                        <!-- Recomendaciones -->
                        <div class="form-group">
                            <label class="form-label">Recomendaciones adicionales</label>
                            <textarea class="input textarea" id="prescriptionRecommendations" rows="3" 
                                placeholder="Instrucciones especiales, dieta, cuidados..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelPrescription">Cancelar</button>
                        <button class="btn btn-primary" id="savePrescription">💾 Guardar Receta</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza un formulario de medicamento
     */
    renderMedicationForm(index) {
        return `
            <div class="medication-form" data-index="${index}">
                <div class="medication-form-header">
                    <span class="medication-number">Medicamento ${index + 1}</span>
                    ${index > 0 ? `<button class="btn-remove-medication" data-index="${index}">✕</button>` : ''}
                </div>
                <div class="medication-form-grid">
                     <div class="form-group">
                        <label class="form-label">Tipo de Formulación</label>
                        <select class="input med-type" onchange="PrescriptionsPage.onFormulationChange(this)">
                            <option value="">-- Seleccionar --</option>
                            <option value="tabletas">Tabletas / Cápsulas</option>
                            <option value="jarabe">Jarabe / Suspensión</option>
                            <option value="gotas">Gotas (Oftálmica/Ótica)</option>
                            <option value="topica">Crema / Spray / Gel (Tópico)</option>
                            <option value="shampoo">Shampoo / Baños</option>
                            <option value="inyectable">Inyectable</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nombre del medicamento *</label>
                        <input type="text" class="input med-name" placeholder="Ej: Amoxicilina">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Presentación</label>
                        <input type="text" class="input med-presentation" placeholder="Ej: Tabletas 500mg">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dosis *</label>
                        <input type="text" class="input med-dosage" placeholder="Ej: 1 tableta">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Vía</label>
                        <select class="input med-route">
                            <option value="Oral">Oral</option>
                            <option value="Subcutánea">Subcutánea</option>
                            <option value="Intramuscular">Intramuscular</option>
                            <option value="Intravenosa">Intravenosa</option>
                            <option value="Tópica">Tópica</option>
                            <option value="Oftálmica">Oftálmica</option>
                            <option value="Ótica">Ótica</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Frecuencia *</label>
                        <input type="text" class="input med-frequency" placeholder="Ej: Cada 12 horas">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duración</label>
                        <input type="text" class="input med-duration" placeholder="Ej: 7 días">
                    </div>
                </div>
            </div >
    `;
    },

    /**
     * Maneja el cambio de formulación para autocompletar campos
     */
    onFormulationChange(selectElement) {
        const form = selectElement.closest('.medication-form');
        const type = selectElement.value;
        const routeSelect = form.querySelector('.med-route');
        const dosageInput = form.querySelector('.med-dosage');
        const presentationInput = form.querySelector('.med-presentation');
        const frequencyInput = form.querySelector('.med-frequency');

        switch (type) {
            case 'tabletas':
                routeSelect.value = 'Oral';
                dosageInput.placeholder = 'Ej: 1 tableta';
                presentationInput.placeholder = 'Ej: Tabletas 500mg';
                break;
            case 'jarabe':
                routeSelect.value = 'Oral';
                dosageInput.placeholder = 'Ej: 5 ml';
                presentationInput.placeholder = 'Ej: Suspensión 250mg/5ml';
                break;
            case 'gotas':
                // Podría ser oftálmica u ótica, por defecto Oftálmica
                if (routeSelect.value !== 'Ótica') routeSelect.value = 'Oftálmica';
                dosageInput.placeholder = 'Ej: 1 gota';
                presentationInput.placeholder = 'Ej: Solución oftálmica';
                frequencyInput.placeholder = 'Ej: Cada 6 horas';
                break;
            case 'topica':
                routeSelect.value = 'Tópica';
                dosageInput.placeholder = 'Ej: Aplicar en zona afectada';
                presentationInput.placeholder = 'Ej: Tubo 15g';
                frequencyInput.placeholder = 'Ej: Cada 12 horas';
                break;
            case 'shampoo':
                routeSelect.value = 'Tópica';
                dosageInput.placeholder = 'Ej: Baño completo';
                presentationInput.placeholder = 'Ej: Frasco 250ml';
                frequencyInput.placeholder = 'Ej: Semanal';
                break;
            case 'inyectable':
                if (!['Subcutánea', 'Intramuscular', 'Intravenosa'].includes(routeSelect.value)) {
                    routeSelect.value = 'Subcutánea';
                }
                dosageInput.placeholder = 'Ej: 1 ml';
                presentationInput.placeholder = 'Ej: Ampolla 1ml';
                break;
        }
    },

    /**
     * Modal para ver receta
     */
    renderViewPrescriptionModal() {
        return `
            <div class="modal-backdrop" id="viewPrescriptionModal">
                <div class="modal" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 class="modal-title">💊 Receta Médica</h2>
                        <button class="modal-close" id="closeViewPrescription">✕</button>
                    </div>
                    <div class="modal-body" id="viewPrescriptionBody">
                        <!-- Se llena dinámicamente -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="togglePrescriptionStatus">✅ Marcar como Completada</button>
                        <button class="btn btn-secondary" id="printPrescription">🖨️ Imprimir</button>
                        <button class="btn btn-primary" id="closePrescriptionBtn">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza el detalle de una receta para impresión
     */
    async renderPrescriptionDetail(prescriptionId) {
        const prescription = this.prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) return '<p>Receta no encontrada</p>';

        const patient = await DataService.getPatientById(prescription.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id) : null;
        let vet = await DataService.getVeterinarianById(prescription.veterinarianId);
        if (!vet) vet = DataService.getCurrentUser();
        const date = DataService.formatDate(prescription.date);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';

        let nextControlText = '';
        if (prescription.nextControlType && prescription.nextControlValue) {
            if (prescription.nextControlType === 'days') {
                const days = parseInt(prescription.nextControlValue);
                if (!isNaN(days)) {
                    // Parse date manually to avoid timezone issues with current local date
                    const [y, m, d] = prescription.date.split('-').map(Number);
                    // Create date at noon to avoid boundary issues
                    const pDate = new Date(y, m - 1, d, 12, 0, 0);
                    pDate.setDate(pDate.getDate() + days);

                    nextControlText = `${pDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} (en ${days} días)`;
                }
            } else {
                nextControlText = DataService.formatDate(prescription.nextControlValue);
            }
        }

        return `
            <div class="prescription-print">
                <!-- Header de la receta -->
                <div class="prescription-print-header">
                    <div class="clinic-info">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <img src="logo.png" alt="Logo" style="width: 50px; height: 50px; object-fit: contain;">
                            <h2 style="margin: 0;">Guau - Clínica Veterinaria</h2>
                        </div>
                        <p>🐾 Gestión Veterinaria</p>
                    </div>
                    <div class="prescription-date">
                        <strong>Fecha:</strong> ${date}
                    </div>
                </div>
                
                <!-- Datos del paciente y propietario (formato compacto) -->
                <div class="prescription-section">
                    <div class="prescription-details-compact">
                        <!-- Datos del Paciente -->
                        <div class="prescription-detail-block-compact">
                            <h4>🐾 PACIENTE</h4>
                            <div class="detail-inline">
                                <span><strong>${patient ? patient.name : '-'}</strong></span>
                                <span>HC: ${patient ? patient.medicalRecordNumber : '-'}</span>
                                <span>${patient ? patient.species : '-'} / ${patient ? patient.breed : '-'}</span>
                                <span>${patient ? (patient.sex === 'male' ? 'Macho' : 'Hembra') : '-'}</span>
                                <span>Edad: ${patient ? DataService.calculateAge(patient.birthDate) : '-'}</span>
                                <span>Peso: ${patient && patient.weight ? patient.weight + ' kg' : '-'}</span>
                                <span>Color: ${patient ? patient.color : '-'}</span>
                            </div>
                        </div>
                        <!-- Datos del Propietario -->
                        <div class="prescription-detail-block-compact">
                            <h4>👤 PROPIETARIO</h4>
                            <div class="detail-inline">
                                <span><strong>${owner ? owner.full_name : '-'}</strong></span>
                                <span>ID: ${owner ? owner.document_number : '-'}</span>
                                <span>Tel: ${owner ? owner.phone : '-'}</span>
                                <span>${owner ? owner.email : '-'}</span>
                                <span>${owner ? owner.address : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Lista de medicamentos -->
                <div class="prescription-section">
                    <h4>Rx. MEDICAMENTOS PRESCRITOS</h4>
                    <div class="prescription-medications">
                        ${prescription.medications.map((med, i) => `
                            <div class="prescription-medication-item">
                                <div class="medication-header">
                                    <span class="medication-number">${i + 1}.</span>
                                    <span class="medication-name">${med.name}</span>
                                    <span class="medication-presentation">(${med.presentation})</span>
                                </div>
                                <div class="medication-instructions-text">
                                    ${this.formatMedicationInstruction(med)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Recomendaciones -->
                ${prescription.recommendations ? `
                    <div class="prescription-section">
                        <h4>📝 RECOMENDACIONES</h4>
                        <p>${prescription.recommendations}</p>
                    </div>
                ` : ''}

                <!-- Próximo Control -->
                ${nextControlText ? `
                    <div class="prescription-section" style="margin-top: 15px; border: 1px dashed #2563eb; padding: 10px; border-radius: 4px; background: #eff6ff;">
                        <h4 style="color: #2563eb; margin: 0 0 5px 0;">📅 PRÓXIMO CONTROL</h4>
                        <p style="font-size: 14px; font-weight: bold; margin: 0;">${nextControlText}</p>
                    </div>
                ` : ''}
                
                <!-- Firma -->
                <div class="prescription-footer">
                    <div class="prescription-signature">
                        <div class="signature-line"></div>
                        <p><strong>${vet.full_name || vet.name}</strong></p>
                        <p>Médico Veterinario - TP: ${vet.tp || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Genera la ventana de impresión para la receta
     */
    async printPrescription(prescriptionId) {
        const prescription = this.prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) return;

        const patient = await DataService.getPatientById(prescription.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id) : null;
        let vet = await DataService.getVeterinarianById(prescription.veterinarianId);
        if (!vet) vet = DataService.getCurrentUser();
        const date = DataService.formatDate(prescription.date);

        let nextControlText = '';
        if (prescription.nextControlType && prescription.nextControlValue) {
            if (prescription.nextControlType === 'days') {
                const days = parseInt(prescription.nextControlValue);
                if (!isNaN(days)) {
                    // Parse date manually to avoid timezone issues with current local date
                    const [y, m, d] = prescription.date.split('-').map(Number);
                    // Create date at noon to avoid boundary issues
                    const pDate = new Date(y, m - 1, d, 12, 0, 0);
                    pDate.setDate(pDate.getDate() + days);

                    nextControlText = `${pDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} (en ${days} días)`;
                }
            } else {
                nextControlText = DataService.formatDate(prescription.nextControlValue);
            }
        }

        let age = '';
        try {
            age = patient ? DataService.calculateAge(patient.birthDate) : '';
        } catch (e) {
            age = patient?.birthDate || '';
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Receta ${patient ? patient.name : ''} - ${date}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 15px; color: #1e293b; font-size: 11px; line-height: 1.3; }
                    
                    /* Header Styles */
                    .print-header { display: flex; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
                    .logo-area { width: 80px; margin-right: 15px; }
                    .logo-area img { width: 100%; height: auto; }
                    .clinic-info { flex: 1; }
                    .clinic-info h1 { margin: 0; color: #2563eb; font-size: 18px; text-transform: uppercase; }
                    .clinic-info p { margin: 2px 0 0; color: #64748b; font-size: 10px; }
                    
                    /* Grid Layout for Patient/Owner */
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 15px; }
                    .info-column h3 { margin: 0 0 5px 0; color: #0f172a; font-size: 11px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; text-transform: uppercase; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1px; }
                    .info-row:last-child { border-bottom: none; }
                    .info-label { font-weight: 600; color: #475569; width: 35%; }
                    .info-value { text-align: right; color: #000; width: 65%; word-wrap: break-word; }

                    /* Prescription Medications */
                    .med-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .med-table th { background: #eff6ff; color: #1e40af; font-size: 10px; text-align: left; padding: 6px; border-bottom: 2px solid #bfdbfe; }
                    .med-table td { padding: 8px 6px; border-bottom: 1px solid #e2e8f0; font-size: 11px; vertical-align: top; }
                    .med-name { font-weight: bold; color: #0f172a; }
                    .med-meta { color: #64748b; font-size: 10px; }
                    
                    /* Recommendations */
                    .recommendations-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 10px; border-radius: 4px; margin-top: 10px; page-break-inside: avoid; }
                    
                    /* Footer / Signature */
                    .signature-section { margin-top: 40px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
                    .signature-box { text-align: center; width: 200px; }
                    .signature-line { border-top: 1px solid #000; margin-bottom: 5px; }
                    .vet-name { font-weight: bold; font-size: 11px; }
                    .vet-tp { font-size: 10px; color: #666; }

                    .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 5px; text-align: center; font-size: 9px; color: #999; }

                    @media print {
                        @page { margin: 0.5cm; size: portrait; }
                        body { -webkit-print-color-adjust: exact; padding: 0.5cm; }
                    }
                </style>
            </head>
            <body>
                <!-- Header con Logo -->
                <div class="print-header">
                    <div class="logo-area">
                        <img src="logo.png" alt="Logo" onerror="this.onerror=null;this.src='';this.alt='[Logo]'">
                    </div>
                    <div class="clinic-info">
                        <h1>Clínica Veterinaria Guau</h1>
                        <p>Nit: 900.000.000-1 • Reg. ICA: 12345</p>
                        <p>Dirección: Calle 123 #45-67 • Tel: 601-555-5555</p>
                        <p>Email: contacto@veterinariaguau.com</p>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="info-grid">
                    <div class="info-column">
                        <h3>Datos del Paciente</h3>
                        <div class="info-row"><span class="info-label">Nombre:</span> <span class="info-value"><strong>${patient ? patient.name : 'N/A'}</strong></span></div>
                        <div class="info-row"><span class="info-label">ID/HC:</span> <span class="info-value">${patient ? patient.medicalRecordNumber : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Especie/Raza:</span> <span class="info-value">${patient ? patient.species : ''} / ${patient ? patient.breed : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Sexo/Edad:</span> <span class="info-value">${patient ? (patient.sex === 'male' ? 'Macho' : 'Hembra') : ''} / ${age}</span></div>
                        <div class="info-row"><span class="info-label">Peso:</span> <span class="info-value">${patient ? patient.weight : ''} kg</span></div>
                    </div>
                    <div class="info-column">
                        <h3>Datos del Propietario</h3>
                        <div class="info-row"><span class="info-label">Nombre:</span> <span class="info-value"><strong>${owner ? owner.full_name : 'N/A'}</strong></span></div>
                        <div class="info-row"><span class="info-label">ID:</span> <span class="info-value">${owner ? owner.document_number : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Teléfono:</span> <span class="info-value">${owner ? owner.phone : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Dirección:</span> <span class="info-value">${owner ? owner.address : 'N/A'}</span></div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 14px; color: #2563eb; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
                        💊 FÓRMULA MÉDICA
                    </h2>
                    <table class="med-table">
                        <thead>
                            <tr>
                                <th style="width: 5%">#</th>
                                <th style="width: 40%">Medicamento</th>
                                <th style="width: 55%">Indicaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prescription.medications.map((med, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>
                                    <div class="med-name">${med.name}</div>
                                    <div class="med-meta">${med.presentation || ''}</div>
                                </td>
                                <td>
                                    <div style="font-weight: 500;">${this.formatMedicationInstruction(med)}</div>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                ${prescription.recommendations ? `
                <div class="recommendations-box">
                    <strong style="font-size: 11px;">📝 RECOMENDACIONES:</strong><br>
                    <span style="font-size: 11px;">${prescription.recommendations}</span>
                </div>` : ''}

                ${nextControlText ? `
                <div style="margin-top: 15px; border: 1px dashed #2563eb; padding: 10px; border-radius: 4px; background: #eff6ff;">
                    <h4 style="color: #2563eb; margin: 0 0 5px 0; font-size: 11px;">📅 PRÓXIMO CONTROL</h4>
                    <p style="font-size: 12px; font-weight: bold; margin: 0;">${nextControlText}</p>
                </div>` : ''}

                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="vet-name">${vet.full_name || vet.name}</div>
                        <div class="vet-tp">Médico Veterinario - TP: ${vet.tp || ''}</div>
                    </div>
                </div>

                <div class="footer">
                    Generado el ${new Date().toLocaleString()} • Válido por 30 días
                </div>

                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    /**
     * Formatea las instrucciones del medicamento en lenguaje natural
     */
    formatMedicationInstruction(med) {
        const type = med.type || 'tabletas'; // Default si no existe
        const dosage = med.dosage || '';
        const frequency = med.frequency || '';
        const duration = med.duration || '';
        const route = med.route || '';

        let instruction = '';

        switch (type) {
            case 'tabletas':
            case 'jarabe':
            case 'inyectable':
                // Ej: Administrar via oral 1 tableta cada 12 horas x 8 dias
                instruction = `Administrar vía ${route.toLowerCase()} ${dosage} ${frequency} x ${duration}`;
                break;
            case 'gotas':
                // Ej: Aplicar en el ojo 1 gota cada 6 horas x 10 dias
                const site = route === 'Ótica' ? 'el oído' : 'el ojo';
                instruction = `Aplicar en ${site} ${dosage} ${frequency} x ${duration}`;
                break;
            case 'topica':
                // Ej: Aplicar en la zona afectada cada 12 horas x 15 dias
                // Si el usuario puso dosis, la incluimos, si no, asumimos "capa fina" o similar implícito en "zona afectada"
                // Pero para ser genérico: "Aplicar en la zona afectada [dosis] [frecuencia] x [duración]"
                instruction = `Aplicar en la zona afectada ${dosage !== 'Aplicar en zona afectada' ? dosage : ''} ${frequency} x ${duration}`;
                break;
            case 'shampoo':
                // Ej: Realizar 1 baño semanal x 4 semanas
                instruction = `Realizar ${dosage} ${frequency} x ${duration}`;
                break;
            default:
                // Fallback genérico
                instruction = `Administrar ${dosage} vía ${route} ${frequency} durante ${duration}`;
        }

        // Limpiar espacios dobles
        return instruction.replace(/\s+/g, ' ').trim();
    },

    /**
     * Inicializa los eventos de la página
     */
    init() {
        this.medicationCount = 1;

        // Verificar si se debe abrir el modal automáticamente (viniendo de Consultas)
        if (localStorage.getItem('autoOpenPrescription') === 'true') {
            const autoPatientId = localStorage.getItem('autoSelectPatientId');
            localStorage.removeItem('autoOpenPrescription');
            localStorage.removeItem('autoSelectPatientId');

            setTimeout(() => {
                console.log('Auto-opening prescription modal for patient:', autoPatientId);
                this.openNewPrescriptionModal();
                if (autoPatientId) {
                    const patientSelect = document.getElementById('prescriptionPatient');
                    if (patientSelect) {
                        patientSelect.value = autoPatientId;
                    }
                }
            }, 100);
        }

        // Botón nueva receta
        document.getElementById('btnNewPrescription')?.addEventListener('click', () => {
            this.openNewPrescriptionModal();
        });

        // Cerrar modales
        document.getElementById('closeNewPrescription')?.addEventListener('click', () => {
            document.getElementById('newPrescriptionModal').classList.remove('active');
        });
        document.getElementById('cancelPrescription')?.addEventListener('click', () => {
            document.getElementById('newPrescriptionModal').classList.remove('active');
        });
        document.getElementById('closeViewPrescription')?.addEventListener('click', () => {
            document.getElementById('viewPrescriptionModal').classList.remove('active');
        });
        document.getElementById('closePrescriptionBtn')?.addEventListener('click', () => {
            document.getElementById('viewPrescriptionModal').classList.remove('active');
        });

        // Agregar medicamento
        document.getElementById('addMedication')?.addEventListener('click', () => {
            this.addMedicationForm();
        });

        // Guardar receta
        document.getElementById('savePrescription')?.addEventListener('click', () => {
            this.savePrescription();
        });

        // Imprimir receta
        document.getElementById('printPrescription')?.addEventListener('click', () => {
            if (this.currentPrescriptionId) {
                this.printPrescription(this.currentPrescriptionId);
            }
        });

        // Toggle estado de receta
        document.getElementById('togglePrescriptionStatus')?.addEventListener('click', () => {
            this.togglePrescriptionStatus();
        });

        // Ver recetas
        this.attachCardListeners();
    },

    attachCardListeners() {
        document.querySelectorAll('.prescription-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openViewPrescriptionModal(card.dataset.prescriptionId);
            });
        });

        document.querySelectorAll('.view-prescription').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openViewPrescriptionModal(btn.dataset.id);
            });
        });

        document.querySelectorAll('.print-prescription').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.printPrescription(btn.dataset.id);
            });
        });
    },

    openNewPrescriptionModal() {
        this.medicationCount = 1;
        document.getElementById('medicationsList').innerHTML = this.renderMedicationForm(0);
        document.getElementById('newPrescriptionModal').classList.add('active');
        this.attachRemoveMedicationListeners();
    },

    async openViewPrescriptionModal(prescriptionId) {
        this.currentPrescriptionId = prescriptionId;
        const prescription = this.prescriptions.find(p => p.id === prescriptionId);
        const body = document.getElementById('viewPrescriptionBody');
        
        document.getElementById('viewPrescriptionModal').classList.add('active');
        body.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando detalles de receta...</div>';
        
        body.innerHTML = await this.renderPrescriptionDetail(prescriptionId);

        // Update toggle button text based on current status
        const toggleBtn = document.getElementById('togglePrescriptionStatus');
        if (toggleBtn && prescription) {
            if (prescription.status === 'active') {
                toggleBtn.textContent = '✅ Marcar como Completada';
                toggleBtn.classList.remove('btn-success');
                toggleBtn.classList.add('btn-secondary');
            } else {
                toggleBtn.textContent = '🔄 Reactivar Receta';
                toggleBtn.classList.remove('btn-secondary');
                toggleBtn.classList.add('btn-success');
            }
        }

        document.getElementById('viewPrescriptionModal').classList.add('active');
    },

    togglePrescriptionStatus() {
        if (!this.currentPrescriptionId) return;

        const prescription = this.prescriptions.find(p => p.id === this.currentPrescriptionId);
        if (!prescription) return;

        // Toggle status
        prescription.status = prescription.status === 'active' ? 'completed' : 'active';

        // Update the button
        const toggleBtn = document.getElementById('togglePrescriptionStatus');
        if (prescription.status === 'active') {
            toggleBtn.textContent = '✅ Marcar como Completada';
            toggleBtn.classList.remove('btn-success');
            toggleBtn.classList.add('btn-secondary');
            this.showToast('✅ Receta reactivada');
        } else {
            toggleBtn.textContent = '🔄 Reactivar Receta';
            toggleBtn.classList.remove('btn-secondary');
            toggleBtn.classList.add('btn-success');
            this.showToast('✅ Receta marcada como completada');
        }

        // Refresh the prescriptions list
        this.renderPrescriptionsListWrapper();
    },

    async renderPrescriptionsListWrapper() {
        document.getElementById('prescriptionsList').innerHTML = await this.renderPrescriptionsList(this.prescriptions);
        this.attachCardListeners();
    },

    addMedicationForm() {
        const list = document.getElementById('medicationsList');
        const newForm = document.createElement('div');
        newForm.innerHTML = this.renderMedicationForm(this.medicationCount);
        list.appendChild(newForm.firstElementChild);
        this.medicationCount++;
        this.attachRemoveMedicationListeners();
    },

    attachRemoveMedicationListeners() {
        document.querySelectorAll('.btn-remove-medication').forEach(btn => {
            btn.addEventListener('click', () => {
                const form = btn.closest('.medication-form');
                form.remove();
            });
        });
    },

    savePrescription() {
        const patientId = document.getElementById('prescriptionPatient').value;
        if (!patientId) {
            alert('Por favor selecciona un paciente');
            return;
        }

        // Recopilar medicamentos
        const medications = [];
        document.querySelectorAll('.medication-form').forEach(form => {
            const name = form.querySelector('.med-name').value;
            if (!name.trim()) return;

            medications.push({
                type: form.querySelector('.med-type').value,
                name: name,
                presentation: form.querySelector('.med-presentation').value,
                dosage: form.querySelector('.med-dosage').value,
                route: form.querySelector('.med-route').value,
                frequency: form.querySelector('.med-frequency').value,
                duration: form.querySelector('.med-duration').value
            });
        });

        if (medications.length === 0) {
            alert('Por favor agrega al menos un medicamento');
            return;
        }

        // Crear nueva receta
        const newPrescription = {
            id: `presc-${Date.now()}`,
            consultationId: null,
            patientId: patientId,
            veterinarianId: document.getElementById('prescriptionVet')?.value || 'vet-001',
            date: new Date().toISOString().split('T')[0],
            medications: medications,
            recommendations: document.getElementById('prescriptionRecommendations').value,
            nextControlType: document.querySelector('input[name="nextControlType"]:checked').value,
            nextControlValue: document.querySelector('input[name="nextControlType"]:checked').value === 'days'
                ? document.getElementById('nextControlDays').value
                : document.getElementById('nextControlDate').value,
            status: 'active'
        };

        this.prescriptions.unshift(newPrescription);

        // Cerrar modal y refrescar
        document.getElementById('newPrescriptionModal').classList.remove('active');
        this.renderPrescriptionsListWrapper();

        // Toast
        this.showToast('✅ Receta guardada exitosamente');
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
