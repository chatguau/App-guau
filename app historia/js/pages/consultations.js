/**
 * SHCV - Página Consultas Médicas
 * Gestión de consultas veterinarias
 */

const ConsultationsPage = {
    currentConsultation: null,
    selectedPatient: null,
    formData: {},

    /**
     * Renderiza la página de consultas
     */
    async render() {
        // Obtenemos todas las consultas o un subconjunto relevante
        // Por ahora, DataService.getConsultations() no existe explícitamente sin paciente
        // pero podemos crear un método para traer las recientes o buscar
        // O asumiendo que el buscador se encarga, mostraremos un estado inicial o recientes
        let consultations = [];
        try {
            // Buscaremos las recientes, para ello usaremos el buscador vacío o buscaremos por paciente
            // Como mock, mostramos un listado vacío hasta buscar, o implementamos getRecentConsultations
        } catch(e) { console.error(e); }

        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar consulta por paciente o fecha...', 'consultationSearch')}
                </div>
                <div class="patients-filters">
                    <select class="chart-select" id="dateFilter">
                        <option value="">Todas las fechas</option>
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                    </select>
                    <button class="btn btn-primary" id="btnNewConsultation">
                        <span>➕</span> Nueva Consulta
                    </button>
                </div>
            </div>
            
            <!-- Consultations List -->
            <div class="consultations-grid" id="consultationsList">
                ${await this.renderConsultationsList(consultations)}
            </div>
            
            <!-- New Consultation Modal -->
            ${await this.renderNewConsultationModal()}
            
            <!-- View Consultation Modal -->
            ${this.renderViewConsultationModal()}
        `;
    },

    /**
     * Renderiza la lista de consultas
     */
    async renderConsultationsList(consultations) {
        if (!consultations || consultations.length === 0) {
            return Components.emptyState(
                '📋',
                'No hay consultas registradas',
                'Registra la primera consulta haciendo clic en "Nueva Consulta" o busca un paciente.'
            );
        }

        const cards = await Promise.all(consultations.map(c => this.renderConsultationCard(c)));

        return `
            <div class="consultations-list">
                ${cards.join('')}
            </div>
        `;
    },

    /**
     * Renderiza una tarjeta de consulta
     */
    async renderConsultationCard(consultation) {
        const patient = await DataService.getPatientById(consultation.patient_id);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const date = DataService.formatDate(consultation.date);

        return `
            <div class="consultation-card" data-consultation-id="${consultation.id}">
                <div class="consultation-card-header">
                    <div class="consultation-patient">
                        <div class="patient-avatar-sm">${emoji}</div>
                        <div>
                            <div class="patient-name-sm">${patient ? patient.name : 'Paciente'}</div>
                            <div class="consultation-date">${date}</div>
                        </div>
                    </div>
                    <span class="badge badge-primary">${consultation.diagnosis ? 'Completada' : 'Pendiente'}</span>
                </div>
                <div class="consultation-card-body">
                    <div class="consultation-reason">
                        <strong>Motivo:</strong> ${consultation.reason}
                    </div>
                    ${consultation.diagnosis ? `
                        <div class="consultation-diagnosis">
                            <strong>Diagnóstico:</strong> ${consultation.diagnosis}
                        </div>
                    ` : ''}
                </div>
                <div class="consultation-card-footer">
                    <div class="vital-signs-mini">
                        ${consultation.temperature ? `<span>🌡️ ${consultation.temperature}°C</span>` : ''}
                        ${consultation.weight ? `<span>⚖️ ${consultation.weight}kg</span>` : ''}
                        ${consultation.heart_rate ? `<span>❤️ ${consultation.heart_rate}bpm</span>` : ''}
                    </div>
                    <button class="btn btn-ghost btn-sm view-consultation" data-id="${consultation.id}">
                        Ver detalle →
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Modal para nueva consulta
     */
    async renderNewConsultationModal() {
        const patients = await DataService.getPatients() || [];
        const currentUser = DataService.getCurrentUser();

        return `
            <div class="modal-backdrop" id="newConsultationModal">
                <div class="modal" style="max-width: 800px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 class="modal-title">📋 Nueva Consulta Médica</h2>
                        <button class="modal-close" id="closeNewConsultation">✕</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto; max-height: 60vh;">
                        <!-- Step Indicator -->
                        <div class="form-steps">
                            <div class="form-step active" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-label">Paciente</span>
                            </div>
                            <div class="form-step" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-label">Motivo</span>
                            </div>
                            <div class="form-step" data-step="3">
                                <span class="step-number">3</span>
                                <span class="step-label">Examen</span>
                            </div>
                            <div class="form-step" data-step="4">
                                <span class="step-number">4</span>
                                <span class="step-label">Diagnóstico</span>
                            </div>
                        </div>

                        <!-- Step 1: Selección de Paciente -->
                        <div class="form-step-content active" id="step1">
                            <h3 class="form-section-title">Seleccionar Paciente</h3>
                            <div class="form-group">
                                <label class="form-label">Buscar paciente</label>
                                <input type="text" class="input" id="patientSearchModal" placeholder="Nombre del paciente o propietario...">
                            </div>
                            <div class="patient-select-list" id="patientSelectList">
                                <!-- Cargado dinámicamente -->
                            </div>

                            </div>
                        </div>

                        <!-- Step 2: Motivo y Anamnesis -->
                        <div class="form-step-content" id="step2">
                            <h3 class="form-section-title">Motivo de Consulta</h3>
                            
                            <!-- Selected Patient Info -->
                            <div class="selected-patient-card" id="selectedPatientCard">
                                <!-- Se llena dinámicamente -->
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Médico Veterinario *</label>
                                <select class="input" id="consultationVet" required>
                                    <option value="">Seleccione el veterinario...</option>
                                    ${(await DataService.getVeterinarians() || []).map(v => `
                                        <option value="${v.id}" ${v.id === currentUser?.id ? 'selected' : ''}>
                                            ${v.full_name || v.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Motivo de la consulta *</label>
                                <input type="text" class="input" id="consultationReason" placeholder="Ej: Vacunación, Control, Emergencia...">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Anamnesis (Historia clínica) *</label>
                                <textarea class="input textarea" id="consultationAnamnesis" rows="4" placeholder="Describa los síntomas reportados por el propietario, duración, circunstancias..."></textarea>
                            </div>
                        </div>

                        <!-- Step 3: Examen Físico -->
                        <div class="form-step-content" id="step3">
                            <h3 class="form-section-title">Examen Físico</h3>
                            
                            <div class="vital-signs-grid">
                                <div class="form-group">
                                    <label class="form-label">🌡️ Temperatura (°C)</label>
                                    <input type="number" class="input" id="temperature" step="0.1" placeholder="38.5">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">❤️ Frec. Cardíaca (bpm)</label>
                                    <input type="number" class="input" id="heartRate" placeholder="80">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">🫁 Frec. Respiratoria</label>
                                    <input type="number" class="input" id="respiratoryRate" placeholder="20">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">⚖️ Peso (kg)</label>
                                    <input type="number" class="input" id="weight" step="0.1" placeholder="10.5">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Condición Corporal (1-5)</label>
                                <div class="body-condition-slider">
                                    <input type="range" id="bodyCondition" min="1" max="5" value="3" class="slider">
                                    <div class="slider-labels">
                                        <span>1 (Caquexia)</span>
                                        <span id="bodyConditionValue">3 (Ideal)</span>
                                        <span>5 (Obeso)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Hallazgos del examen físico</label>
                                <textarea class="input textarea" id="physicalExam" rows="4" placeholder="Describa los hallazgos del examen físico..."></textarea>
                            </div>
                        </div>

                        <!-- Step 4: Diagnóstico y Plan -->
                        <div class="form-step-content" id="step4">
                            <h3 class="form-section-title">Diagnóstico y Plan Terapéutico</h3>
                            
                            <div class="form-group">
                                <label class="form-label">Exámenes Paraclínicos</label>
                                <textarea class="input textarea" id="paraclinicalExams" rows="2" placeholder="Describa los exámenes realizados (sangre, rayos x, ecografía...)"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Tipo de diagnóstico</label>
                                <select class="input" id="diagnosisType">
                                    <option value="presumptive">Presuntivo</option>
                                    <option value="definitive">Definitivo</option>
                                    <option value="differential">Diferencial</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Diagnóstico *</label>
                                <textarea class="input textarea" id="diagnosis" rows="3" placeholder="Diagnóstico del paciente..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Plan terapéutico</label>
                                <textarea class="input textarea" id="treatmentPlan" rows="3" placeholder="Tratamiento recomendado, medicamentos, indicaciones..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Observaciones adicionales</label>
                                <textarea class="input textarea" id="observations" rows="2" placeholder="Notas adicionales..."></textarea>
                            </div>
                            
                            <div class="form-group" style="margin-top: 16px;">
                                <button type="button" class="btn btn-secondary" id="btnGoToPrescription" style="width: 100%;">
                                    💊 Crear Receta Médica
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="prevStep" disabled>← Anterior</button>
                        <button class="btn btn-primary" id="nextStep">Siguiente →</button>
                        <button class="btn btn-primary hidden" id="saveConsultation">💾 Guardar Consulta</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para ver consulta
     */
    renderViewConsultationModal() {
        return `
            <div class="modal-backdrop" id="viewConsultationModal">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 class="modal-title">📋 Detalle de Consulta</h2>
                        <button class="modal-close" id="closeViewConsultation">✕</button>
                    </div>
                    <div class="modal-body" id="viewConsultationBody">
                        <!-- Se llena dinámicamente -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="btnPrintConsultation">🖨️ Imprimir</button>
                        <button class="btn btn-primary">💊 Crear Receta</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ... (renderConsultationDetail remains mostly the same, no changes needed there strictly speaking, but I need to make sure I can call it or logic similar)

    async openViewConsultationModal(consultationId) {
        this.viewingConsultationId = consultationId; // Store for printing
        const body = document.getElementById('viewConsultationBody');
        body.innerHTML = '<div style="text-align:center; padding: 40px;">Cargando detalles...</div>';
        document.getElementById('viewConsultationModal').classList.add('active');
        
        body.innerHTML = await this.renderConsultationDetail(consultationId);
    },

    // ...



    printConsultation(consultationId) {
        const consultation = MockData.consultations.find(c => c.id === consultationId);
        if (!consultation) return;

        const patient = DataService.getPatientById(consultation.patientId);
        const owner = patient ? DataService.getOwnerById(patient.ownerId) : null;
        const veterinarian = DataService.getVeterinarianById(consultation.veterinarianId);

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
                <title>HC ${patient ? patient.name : ''} - ${DataService.formatDate(consultation.date)}</title>
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

                    /* Event Header */
                    .event-header { background: #eff6ff; padding: 8px; border-left: 3px solid #2563eb; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
                    .event-title { font-size: 14px; font-weight: bold; color: #1e40af; }
                    .event-meta { font-size: 10px; color: #3b82f6; }

                    /* Content Sections */
                    .section { margin-bottom: 10px; }
                    .section-title { font-size: 10px; font-weight: bold; color: #334155; text-transform: uppercase; margin-bottom: 3px; border-bottom: 1px dotted #ccc; }
                    .section-content { text-align: justify; white-space: pre-wrap; font-size: 11px; }

                    /* Vitals Compact */
                    .vitals-row { display: flex; gap: 10px; background: #fff; border: 1px solid #ddd; padding: 5px; border-radius: 4px; justify-content: space-around; }
                    .vital-item { font-weight: bold; font-size: 11px; text-align: center; }

                    /* Highlight Box */
                    .observation-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 8px; border-radius: 4px; margin-top: 10px; page-break-inside: avoid; }
                    
                    /* Footer */
                    .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 5px; text-align: center; font-size: 9px; color: #999; }

                    @media print {
                        @page { margin: 0.5cm; size: portrait; }
                        body { -webkit-print-color-adjust: exact; padding: 0.5cm; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <!-- Header con Logo -->
                <div class="print-header">
                    <div class="logo-area">
                        <img src="logo.png" alt="Logo Clínica" onerror="this.onerror=null;this.src='';this.alt='[Logo]'">
                    </div>
                    <div class="clinic-info">
                        <h1>Clínica Veterinaria Guau</h1>
                        <p>Nit: 900.000.000-1 • Reg. ICA: 12345</p>
                        <p>Dirección: Calle 123 #45-67 • Tel: 601-555-5555</p>
                        <p>Email: contacto@veterinariaguau.com</p>
                    </div>
                </div>

                <!-- Info Grid: Paciente y Propietario -->
                <div class="info-grid">
                    <div class="info-column">
                        <h3>Datos del Paciente</h3>
                        <div class="info-row"><span class="info-label">Nombre:</span> <span class="info-value"><strong>${patient ? patient.name : 'N/A'}</strong></span></div>
                        <div class="info-row"><span class="info-label">ID/HC:</span> <span class="info-value">${patient ? patient.medicalRecordNumber : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Especie/Raza:</span> <span class="info-value">${patient ? patient.species : ''} / ${patient ? patient.breed : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Sexo/Edad:</span> <span class="info-value">${patient ? (patient.sex === 'male' ? 'Macho' : 'Hembra') : ''} / ${age}</span></div>
                        <div class="info-row"><span class="info-label">Peso:</span> <span class="info-value">${patient ? patient.weight : ''} kg</span></div>
                        <div class="info-row"><span class="info-label">Color:</span> <span class="info-value">${patient ? patient.color : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Señas Part.:</span> <span class="info-value">${patient ? patient.distinctiveMarks : 'N/A'}</span></div>
                    </div>
                    <div class="info-column">
                        <h3>Datos del Propietario</h3>
                        <div class="info-row"><span class="info-label">Nombre:</span> <span class="info-value"><strong>${owner ? owner.fullName : 'N/A'}</strong></span></div>
                        <div class="info-row"><span class="info-label">Identificación:</span> <span class="info-value">${owner ? owner.documentNumber : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Teléfono:</span> <span class="info-value">${owner ? owner.phone : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Email:</span> <span class="info-value">${owner ? owner.email : 'N/A'}</span></div>
                        <div class="info-row"><span class="info-label">Dirección:</span> <span class="info-value">${owner ? owner.address : 'N/A'}</span></div>
                    </div>
                </div>

                <!-- Event Details -->
                <div class="event-header">
                    <div class="event-title">CONSULTA MÉDICA - ${DataService.formatDate(consultation.date)}</div>
                    <div class="event-meta">
                        <strong>Atendido por:</strong> ${veterinarian ? veterinarian.name : 'N/A'} (TP. ${veterinarian ? veterinarian.tp : ''})
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Motivo de Consulta</div>
                    <div class="section-content">${consultation.reason}</div>
                </div>

                <div class="section">
                    <div class="section-title">Anamnesis</div>
                    <div class="section-content">${consultation.anamnesis}</div>
                </div>

                <div class="section">
                    <div class="section-title">Signos Vitales</div>
                    <div class="vitals-row">
                        <div class="vital-item">Temp: ${consultation.temperature || '-'}°C</div>
                        <div class="vital-item">FC: ${consultation.heartRate || '-'} bpm</div>
                        <div class="vital-item">FR: ${consultation.respiratoryRate || '-'} rpm</div>
                        <div class="vital-item">Peso: ${consultation.weight || '-'} kg</div>
                        <div class="vital-item">CC: ${consultation.bodyCondition || '-'}/5</div>
                    </div>
                </div>

                ${consultation.physicalExamFindings ? `
                <div class="section">
                    <div class="section-title">Hallazgos Examen Físico</div>
                    <div class="section-content">${consultation.physicalExamFindings}</div>
                </div>` : ''}

                ${consultation.paraclinicalExams ? `
                <div class="section">
                    <div class="section-title">Exámenes Paraclínicos</div>
                    <div class="section-content">${consultation.paraclinicalExams}</div>
                </div>` : ''}

                 <div class="section" style="margin-top: 10px;">
                    <div class="section-title" style="color: #2563eb; border-color: #2563eb;">DIAGNÓSTICO (${consultation.diagnosisType || 'General'})</div>
                    <div class="section-content" style="font-weight: bold;">${consultation.diagnosis}</div>
                </div>

                ${consultation.treatmentPlan ? `
                <div class="section">
                    <div class="section-title">Plan Terapéutico</div>
                    <div class="section-content">${consultation.treatmentPlan}</div>
                </div>` : ''}

                ${consultation.observations ? `
                <div class="observation-box">
                    <strong style="font-size: 11px;">⚠️ OBSERVACIONES:</strong><br>
                    <span style="font-size: 11px;">${consultation.observations}</span>
                </div>` : ''}

                <div class="footer">
                    Generado el ${new Date().toLocaleString()} • Documento informativo
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
     * Renderiza el detalle de una consulta
     */
    async renderConsultationDetail(consultationId) {
        // En una app real, traeríamos la consulta por ID. 
        // Puesto que DataService no tiene getConsultationById, la buscamos desde todos o pacientes.
        // Dado que solo tenemos getConsultationsByPatient, se requiere un refactor o un endpoint.
        // Simularemos o haremos el query directamente:
        
        let consultation;
        try {
            const { data, error } = await supabaseClient
                .from('consultations')
                .select('*, veterinarian:veterinarian_id(*)')
                .eq('id', consultationId)
                .single();
            if (error) throw error;
            consultation = data;
        } catch (e) {
            console.error('Error fetching consultation details:', e);
            return '<p>Consulta no encontrada</p>';
        }

        const patient = await DataService.getPatientById(consultation.patient_id);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id) : null;
        const veterinarian = consultation.veterinarian;
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const date = DataService.formatDate(consultation.date);

        return `
            <!-- Patient Header -->
            <div class="consultation-detail-header">
                <div class="patient-detail-avatar" style="width: 60px; height: 60px; font-size: 30px;">${emoji}</div>
                <div class="consultation-detail-info">
                    <h3>${patient ? patient.name : 'Paciente'}</h3>
                    <p class="text-muted">${owner ? owner.fullName : ''} • ${patient ? patient.breed : ''}</p>
                    <span class="badge badge-primary">${date}</span>
                </div>
            </div>
            
            <!-- Veterinarian Info -->
            <div class="detail-section" style="background: var(--color-primary-bg); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0;"><strong>👨‍⚕️ Atendido por:</strong> ${veterinarian ? veterinarian.name : 'No especificado'} 
                ${veterinarian ? `<span class="text-muted">• TP: ${veterinarian.tp}</span>` : ''}</p>
            </div>

            <!-- Reason & Anamnesis -->
            <div class="detail-section">
                <h4 class="detail-section-title">📝 Motivo de Consulta</h4>
                <p>${consultation.reason}</p>
            </div>

            <div class="detail-section">
                <h4 class="detail-section-title">📖 Anamnesis</h4>
                <p>${consultation.anamnesis}</p>
            </div>

            <!-- Vital Signs -->
            <div class="detail-section">
                <h4 class="detail-section-title">📊 Signos Vitales</h4>
                <div class="vital-signs-display">
                    <div class="vital-sign-item">
                        <span class="vital-icon">🌡️</span>
                        <span class="vital-value">${consultation.temperature || '-'}°C</span>
                        <span class="vital-label">Temperatura</span>
                    </div>
                    <div class="vital-sign-item">
                        <span class="vital-icon">❤️</span>
                        <span class="vital-value">${consultation.heartRate || '-'} bpm</span>
                        <span class="vital-label">Frec. Cardíaca</span>
                    </div>
                    <div class="vital-sign-item">
                        <span class="vital-icon">🫁</span>
                        <span class="vital-value">${consultation.respiratoryRate || '-'}</span>
                        <span class="vital-label">Frec. Respiratoria</span>
                    </div>
                    <div class="vital-sign-item">
                        <span class="vital-icon">⚖️</span>
                        <span class="vital-value">${consultation.weight || '-'} kg</span>
                        <span class="vital-label">Peso</span>
                    </div>
                </div>
            </div>

            <!-- Physical Exam -->
            ${consultation.physicalExamFindings ? `
                <div class="detail-section">
                    <h4 class="detail-section-title">🔍 Examen Físico</h4>
                    <p>${consultation.physicalExamFindings}</p>
                </div>
            ` : ''}

            <!-- Paraclinical Exams -->
            ${consultation.paraclinicalExams ? `
                <div class="detail-section">
                    <h4 class="detail-section-title">🧪 Exámenes Paraclínicos</h4>
                    <p>${consultation.paraclinicalExams}</p>
                </div>
            ` : ''}

            <!-- Diagnosis -->
            ${consultation.diagnosis ? `
                <div class="detail-section highlight">
                    <h4 class="detail-section-title">🩺 Diagnóstico</h4>
                    <p class="diagnosis-text">${consultation.diagnosis}</p>
                </div>
            ` : ''}

            <!-- Treatment Plan -->
            ${consultation.treatmentPlan ? `
                <div class="detail-section">
                    <h4 class="detail-section-title">💊 Plan Terapéutico</h4>
                    <p>${consultation.treatmentPlan}</p>
                </div>
            ` : ''}

            <!-- Observations -->
            ${consultation.observations ? `
                <div class="detail-section" style="background: #fffbeb; padding: 10px; border-radius: 4px;">
                    <h4 class="detail-section-title">⚠️ Observaciones / Notas Adicionales</h4>
                    <p>${consultation.observations}</p>
                </div>
            ` : ''}
        `;
    },

    /**
     * Inicializa los eventos de la página
     */
    init() {
        this.currentStep = 1;
        this.selectedPatient = null;

        // Verificar si se debe abrir el modal automáticamente
        if (localStorage.getItem('autoOpenConsultation') === 'true') {
            const autoPatientId = localStorage.getItem('autoSelectPatientId');
            localStorage.removeItem('autoOpenConsultation');
            localStorage.removeItem('autoSelectPatientId');

            setTimeout(() => {
                this.openNewConsultationModal();
                if (autoPatientId) {
                    this.selectPatient(autoPatientId);
                    this.nextStep(); // Ir al paso de datos clínicos
                }
            }, 100);
        }

        // Botón nueva consulta
        const btnNew = document.getElementById('btnNewConsultation');
        if (btnNew) {
            btnNew.addEventListener('click', () => this.openNewConsultationModal());
        }

        // Cerrar modales
        document.getElementById('closeNewConsultation')?.addEventListener('click', () => {
            document.getElementById('newConsultationModal').classList.remove('active');
        });

        document.getElementById('closeViewConsultation')?.addEventListener('click', () => {
            document.getElementById('viewConsultationModal').classList.remove('active');
        });

        // Navegación de pasos
        document.getElementById('prevStep')?.addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep')?.addEventListener('click', () => this.nextStep());
        document.getElementById('saveConsultation')?.addEventListener('click', async () => {
             const btn = document.getElementById('saveConsultation');
             const originalText = btn.innerHTML;
             btn.innerHTML = '⏳ Guardando...';
             btn.disabled = true;
             await this.saveConsultation();
             btn.innerHTML = originalText;
             btn.disabled = false;
        });

        // Botón para ir a recetas
        document.getElementById('btnGoToPrescription')?.addEventListener('click', async () => {
            if (!this.selectedPatient) {
                alert('Por favor selecciona un paciente primero');
                return;
            }

            // Guardar la consulta automáticamente en Supabase
            const consultationData = {
                patient_id: this.selectedPatient.id,
                veterinarian_id: document.getElementById('consultationVet')?.value,
                date: new Date().toISOString().split('T')[0],
                reason: document.getElementById('consultationReason')?.value,
                anamnesis: document.getElementById('consultationAnamnesis')?.value,
                temperature: parseFloat(document.getElementById('temperature')?.value) || null,
                heart_rate: parseInt(document.getElementById('heartRate')?.value) || null,
                respiratory_rate: parseInt(document.getElementById('respiratoryRate')?.value) || null,
                weight: parseFloat(document.getElementById('weight')?.value) || null,
                body_condition: parseInt(document.getElementById('bodyCondition')?.value) || null,
                physical_exam_findings: document.getElementById('physicalExam')?.value,
                paraclinical_exams: document.getElementById('paraclinicalExams')?.value,
                diagnosis_type: document.getElementById('diagnosisType')?.value,
                diagnosis: document.getElementById('diagnosis')?.value,
                treatment_plan: document.getElementById('treatmentPlan')?.value,
                observations: document.getElementById('observations')?.value
            };

            const btn = document.getElementById('btnGoToPrescription');
            btn.innerHTML = '⏳ Guardando...';
            btn.disabled = true;

            try {
                await DataService.saveConsultation(consultationData);
                this.showToast('✅ Consulta guardada. Creando receta...');

                // Setup para autoabrir receta
                localStorage.setItem('autoOpenPrescription', 'true');
                localStorage.setItem('autoSelectPatientId', this.selectedPatient.id);

                document.getElementById('newConsultationModal').classList.remove('active');
                App.navigateTo('prescriptions');
            } catch (error) {
                console.error('Error saving before prescription:', error);
                alert('No se pudo guardar la consulta antes de ir a recetas.');
            } finally {
                btn.innerHTML = '💊 Crear Receta Médica';
                btn.disabled = false;
            }
        });

        // Selector de paciente
        document.querySelectorAll('.patient-select-item').forEach(item => {
            item.addEventListener('click', () => this.selectPatient(item.dataset.patientId));
        });

        // Búsqueda de pacientes en modal
        const patientSearch = document.getElementById('patientSearchModal');
        if (patientSearch) {
            patientSearch.addEventListener('input', (e) => this.filterPatients(e.target.value));
        }

        // Slider de condición corporal
        const bodyConditionSlider = document.getElementById('bodyCondition');
        if (bodyConditionSlider) {
            bodyConditionSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                const labels = ['Caquexia', 'Delgado', 'Ideal', 'Sobrepeso', 'Obeso'];
                document.getElementById('bodyConditionValue').textContent = `${value} (${labels[value - 1]})`;
            });
        }

        // Ver consulta
        document.querySelectorAll('.view-consultation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openViewConsultationModal(btn.dataset.id);
            });
        });

        // Click en tarjeta de consulta
        document.querySelectorAll('.consultation-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openViewConsultationModal(card.dataset.consultationId);
            });
        });

        // Botón Imprimir
        const btnPrint = document.getElementById('btnPrintConsultation');
        if (btnPrint) {
            // Eliminar listeners previos clonando el elemento
            const newBtn = btnPrint.cloneNode(true);
            btnPrint.parentNode.replaceChild(newBtn, btnPrint);

            newBtn.addEventListener('click', () => {
                if (this.viewingConsultationId) {
                    this.printConsultation(this.viewingConsultationId);
                }
            });
        }
    },

    openNewConsultationModal() {
        this.currentStep = 1;
        this.selectedPatient = null;
        this.updateStepUI();
        document.getElementById('newConsultationModal').classList.add('active');
    },



    selectPatient(patientId) {
        this.selectedPatient = DataService.getPatientById(patientId);

        // Marcar seleccionado
        document.querySelectorAll('.patient-select-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.patientId === patientId) {
                item.classList.add('selected');
            }
        });

        // Actualizar card del paciente seleccionado
        const owner = DataService.getOwnerById(this.selectedPatient.ownerId);
        const emoji = DataService.getSpeciesEmoji(this.selectedPatient.species);

        document.getElementById('selectedPatientCard').innerHTML = `
            <div class="selected-patient-info">
                <div class="patient-avatar-sm">${emoji}</div>
                <div>
                    <div class="patient-name-sm">${this.selectedPatient.name}</div>
                    <div class="patient-owner-sm">${owner ? owner.fullName : ''} • ${this.selectedPatient.breed}</div>
                </div>
                <span class="badge badge-success">✓ Seleccionado</span>
            </div>
        `;
    },

    async filterPatients(query) {
        let listHtml = '<div style="padding: 20px; text-align: center;">Buscando...</div>';
        document.getElementById('patientSelectList').innerHTML = listHtml;

        const patients = query ? await DataService.searchPatients(query) : await DataService.getPatients();
        
        if (!patients || patients.length === 0) {
           document.getElementById('patientSelectList').innerHTML = '<div style="padding: 20px; text-align: center;">No se encontraron pacientes.</div>';
           return;
        }

        const itemsHtml = await Promise.all(patients.map(async p => {
            const owner = await DataService.getOwnerById(p.owner_id);
            const emoji = DataService.getSpeciesEmoji(p.species);
            const isSelected = this.selectedPatient && this.selectedPatient.id === p.id;
            return `
                <div class="patient-select-item ${isSelected ? 'selected' : ''}" data-patient-id="${p.id}">
                    <div class="patient-avatar-sm">${emoji}</div>
                    <div class="patient-select-info">
                        <div class="patient-name-sm">${p.name}</div>
                        <div class="patient-owner-sm">${owner ? owner.full_name : ''} • ${p.breed}</div>
                    </div>
                    <span class="badge badge-primary">ID: ${p.id.substring(0,6)}</span>
                </div>
            `;
        }));

        document.getElementById('patientSelectList').innerHTML = itemsHtml.join('');

        // Re-attach listeners
        document.querySelectorAll('.patient-select-item').forEach(item => {
            item.addEventListener('click', () => this.selectPatient(item.dataset.patientId));
        });
    },

    nextStep() {
        // Validación básica
        if (this.currentStep === 1 && !this.selectedPatient) {
            alert('Por favor selecciona un paciente');
            return;
        }
        if (this.currentStep === 2) {
            const reason = document.getElementById('consultationReason').value;
            if (!reason.trim()) {
                alert('Por favor ingresa el motivo de la consulta');
                return;
            }
        }

        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStepUI();
        }
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepUI();
        }
    },

    updateStepUI() {
        // Actualizar indicadores de pasos
        document.querySelectorAll('.form-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Mostrar/ocultar contenido de pasos
        document.querySelectorAll('.form-step-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`step${this.currentStep}`).classList.add('active');

        // Botones de navegación
        document.getElementById('prevStep').disabled = this.currentStep === 1;

        if (this.currentStep === 4) {
            document.getElementById('nextStep').classList.add('hidden');
            document.getElementById('saveConsultation').classList.remove('hidden');
        } else {
            document.getElementById('nextStep').classList.remove('hidden');
            document.getElementById('saveConsultation').classList.add('hidden');
        }
    },

    async saveConsultation() {
        if (!this.selectedPatient) {
            alert('Por favor selecciona un paciente primero');
            return;
        }

        // Recopilar datos del formulario para Supabase
        const consultationData = {
            patient_id: this.selectedPatient.id,
            veterinarian_id: document.getElementById('consultationVet')?.value,
            date: new Date().toISOString().split('T')[0],
            reason: document.getElementById('consultationReason').value,
            anamnesis: document.getElementById('consultationAnamnesis').value,
            temperature: parseFloat(document.getElementById('temperature').value) || null,
            heart_rate: parseInt(document.getElementById('heartRate').value) || null,
            respiratory_rate: parseInt(document.getElementById('respiratoryRate').value) || null,
            weight: parseFloat(document.getElementById('weight').value) || null,
            body_condition: parseInt(document.getElementById('bodyCondition').value) || null,
            physical_exam_findings: document.getElementById('physicalExam').value,
            paraclinical_exams: document.getElementById('paraclinicalExams').value,
            diagnosis_type: document.getElementById('diagnosisType').value,
            diagnosis: document.getElementById('diagnosis').value,
            treatment_plan: document.getElementById('treatmentPlan').value,
            observations: document.getElementById('observations').value
        };

        try {
            await DataService.saveConsultation(consultationData);

            document.getElementById('newConsultationModal').classList.remove('active');

            // Refrescar la vista (render llamará a list)
            App.loadPage('consultations');

            this.showToast('✅ Consulta guardada exitosamente');
        } catch (error) {
            console.error('Error saving consultation:', error);
            alert('Error al guardar la consulta. Verifica tu conexión.');
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
    }
};
