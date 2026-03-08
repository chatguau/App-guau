/**
 * SHCV - Página de Autorizaciones
 * Gestión de consentimientos informados
 */

const AuthorizationsPage = {
    templates: {
        hospitalization: `Por medio de la presente autorizo al equipo médico de la Clínica Veterinaria Guau para realizar los procedimientos de hospitalización requeridos para mi mascota.
        
Entiendo que la hospitalización implica costos diarios y procedimientos médicos necesarios para la estabilización y tratamiento del paciente. He sido informado sobre el estado de salud de mi mascota, el pronóstico (reservado/bueno/malo) y los riesgos inherentes a su condición.
        
Me comprometo a abonar los costos generados durante la estancia hospitalaria.`,

        anesthesia: `Autorizo la administración de anestesia (sedación, anestesia local, regional o general) a mi mascota.
        
Certifico que he sido informado de los riesgos que todo procedimiento anestésico conlleva, inclusive la muerte, a pesar de que se tomen todas las precauciones y se utilicen medicamentos seguros.
        
He informado al veterinario sobre cualquier antecedente médico, alergia o medicamento que mi mascota esté tomando actualmente.`,

        surgery: `Autorizo la realización del procedimiento quirúrgico a mi mascota.
        
Entiendo la naturaleza del procedimiento, sus riesgos y complicaciones potenciales. Se me ha explicado el propósito de la cirugía y las alternativas disponibles.
        
Autorizo al cirujano a realizar cualquier intervención adicional que considere necesaria en caso de surgir complicaciones durante el procedimiento.`,

        other: `Texto de autorización personalizada...`
    },

    /**
     * Renderiza la página principal
     */
    async render() {
        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                     ${Components.searchInput('Buscar autorización...', 'authSearch')}
                </div>
                <div class="patients-filters">
                    <button class="btn btn-primary" id="btnNewAuth">
                        <span>📝</span> Nueva Autorización
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="card">
                <div class="panel-header">
                    <span class="panel-title">📑 Historial de Autorizaciones</span>
                </div>
                ${await this.renderAuthList()}
            </div>

            <!-- New Auth Modal -->
            ${this.renderNewModal()}
        `;
    },

    async renderAuthList() {
        const auths = (await DataService.getAuthorizations() || []).sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

        if (auths.length === 0) {
            return Components.emptyState('📄', 'Gestión de Autorizaciones', 'Registra consentimientos informados para procedimientos.');
        }

        return Components.table(
            ['Fecha', 'Paciente', 'Tipo', 'Firmado Por', 'Acciones'],
            await Promise.all(auths.map(async a => {
                const patient = await DataService.getPatientById(a.patient_id || a.patientId);
                const typeLabels = {
                    hospitalization: 'Hospitalización',
                    anesthesia: 'Anestesia',
                    surgery: 'Cirugía',
                    other: 'Otro'
                };
                return [
                    DataService.formatDate(a.created_at || a.createdAt),
                    patient ? patient.name : 'Desconocido',
                    typeLabels[a.type] || a.type,
                    a.signed_by || a.signedBy,
                    `<button class="btn btn-sm btn-secondary" onclick="AuthorizationsPage.printAuth('${a.id}')">🖨️ Imprimir</button>`
                ];
            }))
        );
    },

    renderNewModal() {
        return `
            <div class="modal-backdrop" id="newAuthModal">
                <div class="modal" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 class="modal-title">📝 Nueva Autorización</h2>
                        <button class="modal-close" id="closeAuthModal">✕</button>
                    </div>
                    <div class="modal-body">
                        <!-- Step 1: Patient -->
                        <div class="form-group">
                            <label class="form-label">Paciente *</label>
                            <input type="text" class="input" id="authPatientSearch" placeholder="Buscar paciente...">
                            <input type="hidden" id="authPatientId">
                            <div id="authPatientResults" class="search-results hidden"></div>
                        </div>

                        <!-- Step 2: Type -->
                        <div class="form-group">
                            <label class="form-label">Tipo de Procedimiento *</label>
                            <div class="grid-cols-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <button class="btn btn-outline type-btn" data-type="hospitalization">🏥 Hospitalización</button>
                                <button class="btn btn-outline type-btn" data-type="anesthesia">💤 Anestesia</button>
                                <button class="btn btn-outline type-btn" data-type="surgery">🔪 Cirugía</button>
                                <button class="btn btn-outline type-btn" data-type="other">📄 Otro</button>
                            </div>
                            <input type="hidden" id="authType">
                        </div>

                        <!-- Step 3: Content -->
                        <div class="form-group">
                            <label class="form-label">Contenido Legal *</label>
                            <textarea class="input" id="authContent" rows="8"></textarea>
                        </div>

                        <!-- Step 4: Signature -->
                         <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Firmado por (Propietario/Responsable) *</label>
                                <input type="text" class="input" id="authSignedBy">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Cédula</label>
                                <input type="text" class="input" id="authDocNumber">
                            </div>
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="btnCancelAuth">Cancelar</button>
                        <button class="btn btn-primary" id="btnSaveAuth">Guardar y Generar</button>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Modal Events
        document.getElementById('btnNewAuth')?.addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('closeAuthModal')?.addEventListener('click', () => {
            document.getElementById('newAuthModal').classList.remove('active');
        });

        document.getElementById('btnCancelAuth')?.addEventListener('click', () => {
            document.getElementById('newAuthModal').classList.remove('active');
        });

        // Search Patient
        const searchInput = document.getElementById('authPatientSearch');
        const resultsDiv = document.getElementById('authPatientResults');
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                const query = e.target.value;
                if (query.length < 2) {
                    resultsDiv.classList.add('hidden');
                    return;
                }
                const patients = await DataService.searchPatients(query);
                if (patients && patients.length > 0) {
                    const htmlItems = await Promise.all(patients.map(async p => {
                        const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
                        return `<div class="search-result-item" data-id="${p.id}" data-name="${p.name}" data-owner="${owner?.full_name || owner?.fullName || ''}" data-doc="${owner?.document_number || owner?.documentNumber || ''}">
                            ${p.name} - ${owner?.full_name || owner?.fullName || 'Sin dueño'}
                        </div>`;
                    }));
                    resultsDiv.innerHTML = htmlItems.join('');
                    resultsDiv.classList.remove('hidden');

                    resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            document.getElementById('authPatientId').value = item.dataset.id;
                            searchInput.value = item.dataset.name;
                            document.getElementById('authSignedBy').value = item.dataset.owner || '';
                            document.getElementById('authDocNumber').value = item.dataset.doc || '';
                            resultsDiv.classList.add('hidden');
                        });
                    });
                } else {
                    resultsDiv.classList.add('hidden');
                }
            });
        }

        // Type Selection
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Toggle active
                document.querySelectorAll('.type-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-outline');
                });
                const target = e.target;
                target.classList.remove('btn-outline');
                target.classList.add('btn-primary');

                const type = target.dataset.type;
                document.getElementById('authType').value = type;
                document.getElementById('authContent').value = this.templates[type] || '';
            });
        });

        // Save
        document.getElementById('btnSaveAuth')?.addEventListener('click', () => {
            this.save();
        });
    },

    openModal() {
        document.getElementById('newAuthModal').classList.add('active');
        // Reset
        document.getElementById('authPatientId').value = '';
        document.getElementById('authPatientSearch').value = '';
        document.getElementById('authType').value = '';
        document.getElementById('authContent').value = '';
        document.getElementById('authSignedBy').value = '';
        document.getElementById('authDocNumber').value = '';

        document.querySelectorAll('.type-btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline');
        });
    },

    async save() {
        const patientId = document.getElementById('authPatientId').value;
        const type = document.getElementById('authType').value;
        const content = document.getElementById('authContent').value;
        const signedBy = document.getElementById('authSignedBy').value;
        const docNumber = document.getElementById('authDocNumber').value;

        if (!patientId || !type || !signedBy) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        const btnSave = document.getElementById('btnSaveAuth');
        btnSave.disabled = true;
        btnSave.innerHTML = '⏳ Guardando...';

        try {
            const auth = await DataService.saveAuthorization({
                patient_id: patientId,
                type,
                content,
                signed_by: signedBy,
                doc_number: docNumber,
                created_at: new Date().toISOString()
            });

            alert('Autorización guardada correctamente');
            document.getElementById('newAuthModal').classList.remove('active');

            if (auth) {
                this.printAuth(auth.id);
            }

            App.loadPage('authorizations');
        } catch (error) {
            console.error('Error saving auth:', error);
            alert('Error al guardar la autorización');
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = 'Guardar y Generar';
        }
    },

    async printAuth(authId) {
        // En supabase, no podemos filtrarlo localmente siempre de forma síncrona,
        // Pero DataService.getAuthorizations() probablemente lo cachea, o creamos un getById
        const auths = await DataService.getAuthorizations() || [];
        const auth = auths.find(a => a.id === authId);
        if (!auth) return;

        const patient = await DataService.getPatientById(auth.patient_id || auth.patientId);
        const owner = patient ? await DataService.getOwnerById(patient.owner_id || patient.ownerId) : null;

        const typeLabels = {
            hospitalization: 'HOSPITALIZACIÓN',
            anesthesia: 'ANESTESIA',
            surgery: 'CIRUGÍA',
            other: 'PROCEDIMIENTO'
        };

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                    <h2 style="color: #2563eb; margin:0;">AUTORIZACIÓN DE ${typeLabels[auth.type] || 'PROCEDIMIENTO'}</h2>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">Clínica Veterinaria Guau - Nit: 900.000.000-1</p>
                </div>

                <div style="margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px;">
                     <table style="width: 100%;">
                        <tr><td><strong>Paciente:</strong> ${patient.name}</td><td><strong>Raza:</strong> ${patient.breed}</td></tr>
                        <tr><td><strong>Propietario:</strong> ${owner?.full_name || owner?.fullName}</td><td><strong>CC:</strong> ${owner?.document_number || owner?.documentNumber}</td></tr>
                     </table>
                </div>

                <div style="margin: 30px 0; text-align: justify;">
                    ${auth.content.replace(/\n/g, '<br>')}
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <div style="border-top: 1px solid #000; margin-top: 40px; padding-top: 10px;">
                            <strong>${auth.signed_by || auth.signedBy}</strong><br>
                            C.C. ${auth.doc_number || auth.docNumber || ''}<br>
                            Propietario / Responsable
                        </div>
                    </div>
                    
                     <div style="text-align: center; width: 45%;">
                        <div style="border-top: 1px solid #000; margin-top: 40px; padding-top: 10px;">
                             <strong>Dr. ${DataService.getCurrentUser()?.full_name || DataService.getCurrentUser()?.name || ''}</strong><br>
                             Médico Veterinario
                        </div>
                    </div>
                </div>

                <div style="margin-top: 40px; font-size: 10px; color: #999; text-align: center;">
                    Documento generado digitalmente el ${new Date(auth.created_at || auth.createdAt || new Date()).toLocaleString()}
                </div>
            </div>
        `;

        // Use the global PDF helper from ReportsPage or create a simpler one if not accessible
        // Since ReportsPage.generatePDF is accessible globally if loaded...
        if (typeof ReportsPage !== 'undefined' && ReportsPage.generatePDF) {
            ReportsPage.generatePDF(`Autorización - ${patient.name}`, html);
        } else {
            // Fallback
            const printWindow = window.open('', '_blank');
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
        }
    }
};
