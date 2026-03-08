/**
 * SHCV - Página Vacunación
 * Gestión de esquemas de vacunación y registro de vacunas
 */

const VaccinationsPage = {
    vaccinations: [],
    vaccineSchemes: {
        canino: [
            { name: 'Puppy', age: '6-8 semanas', doses: 1, interval: '3-4 semanas' },
            { name: 'Triple Canina', age: '8-10 semanas', doses: 1, interval: '3-4 semanas' },
            { name: 'Pentavalente', age: '10-12 semanas', doses: 1, interval: '3-4 semanas' },
            { name: 'Parvovirosis', age: '6 semanas', doses: 2, interval: '3-4 semanas' },
            { name: 'Hexavalente / Anual', age: '14-16 semanas', doses: 1, interval: 'Anual' },
            { name: 'Rabia', age: '12 semanas', doses: 1, interval: 'Anual' },
            { name: 'KC / Bronchicine', age: '8 semanas', doses: 2, interval: '3-4 semanas' }
        ],
        felino: [
            { name: 'Triple Felina (FVRCP)', age: '6-8 semanas', doses: 3, interval: '3-4 semanas' },
            { name: 'Rabia', age: '12 semanas', doses: 1, interval: 'Anual' },
            { name: 'Leucemia Felina (FeLV)', age: '8 semanas', doses: 2, interval: '3-4 semanas' },
            { name: 'PIF (Peritonitis Infecciosa)', age: '16 semanas', doses: 2, interval: '3-4 semanas' }
        ]
    },

    /**
     * Inicializa vacunaciones desde mock data
     */
    loadVaccinations() {
        if (this.vaccinations.length === 0) {
            this.vaccinations = [
                ...MockData.vaccinations,
                {
                    id: 'vac-004',
                    patientId: 'pat-001',
                    vaccineName: 'Polivalente (DHPP)',
                    date: '2024-01-15',
                    nextDoseDate: '2024-04-15',
                    batch: 'BATCH-V789',
                    veterinarianId: 'vet-001',
                    notes: 'Segunda dosis aplicada sin reacciones adversas'
                },
                {
                    id: 'vac-005',
                    patientId: 'pat-003',
                    vaccineName: 'Triple Felina (FVRCP)',
                    date: '2024-01-20',
                    nextDoseDate: '2024-02-17',
                    batch: 'BATCH-F456',
                    veterinarianId: 'vet-001',
                    notes: 'Primera dosis'
                }
            ];
        }
    },

    /**
     * Renderiza la página de vacunación
     */
    async render() {

        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar por paciente o vacuna...', 'vaccinationSearch')}
                </div>
                <div class="patients-filters">

                    <button class="btn btn-primary" id="btnNewVaccination">
                        <span>💉</span> Registrar Vacuna
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="vaccination-tabs">
                <button class="tab-btn active" data-tab="records">📋 Registros</button>

                <button class="tab-btn" data-tab="pending">⏰ Próximas</button>
            </div>
            
            <!-- Tab Content -->
            <div class="vaccination-content">
                <div class="tab-content active" id="tab-records">
                    ${await this.renderVaccinationRecords()}
                </div>

                <div class="tab-content" id="tab-pending">
                    ${await this.renderPendingVaccinations()}
                </div>
            </div>
            
            <!-- New Vaccination Modal -->
            ${await this.renderNewVaccinationModal()}
        `;
    },

    /**
     * Renderiza registros de vacunación
     */
    async renderVaccinationRecords() {
        this.vaccinations = await DataService.getVaccinations() || [];

        if (this.vaccinations.length === 0) {
            return Components.emptyState(
                '💉',
                'No hay vacunas registradas',
                'Registra la primera vacuna usando el botón "Registrar Vacuna".'
            );
        }

        const rows = await Promise.all(this.vaccinations.map(v => this.renderVaccinationRow(v)));

        return `
            <div class="vaccinations-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Vacuna</th>
                            <th>Fecha</th>
                            <th>Veterinario</th>
                            <th>Próxima dosis</th>
                            <th>Lote</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Renderiza una fila de vacunación
     */
    async renderVaccinationRow(vaccination) {
        const patient = await DataService.getPatientById(vaccination.patient_id || vaccination.patientId);
        const vet = await DataService.getVeterinarianById(vaccination.veterinarian_id || vaccination.veterinarianId);
        const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
        const date = DataService.formatDate(vaccination.date || vaccination.applicationDate);
        const nextDate = (vaccination.next_dose_date || vaccination.nextDoseDate) ? DataService.formatDate(vaccination.next_dose_date || vaccination.nextDoseDate) : '-';

        // Verificar si está pendiente
        const rawNextDate = vaccination.next_dose_date || vaccination.nextDoseDate;
        const isPending = rawNextDate && new Date(rawNextDate) <= new Date();
        const statusBadge = isPending
            ? '<span class="badge badge-warning">Pendiente</span>'
            : '<span class="badge badge-success">Al día</span>';

        return `
            <tr>
                <td>
                    <div class="table-patient">
                        <span class="patient-emoji">${emoji}</span>
                        <span>${patient ? patient.name : 'Desconocido'}</span>
                    </div>
                </td>
                <td><strong>${vaccination.vaccine_name || vaccination.vaccineType || vaccination.vaccineName}</strong></td>
                <td>${date}</td>
                <td>
                    <span style="font-size: 0.85em;">${vet ? vet.full_name || vet.name : '-'}</span>
                    ${vet ? `<br><span class="text-muted" style="font-size: 0.75em;">TP: ${vet.tp || 'N/A'}</span>` : ''}
                </td>
                <td>
                    ${nextDate}
                    ${statusBadge}
                </td>
                <td><code>${vaccination.batch || vaccination.lotNumber || '-'}</code></td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="VaccinationsPage.viewDetails('${vaccination.id}')">
                        👁️ Ver
                    </button>
                </td>
            </tr>
        `;
    },



    /**
     * Renderiza vacunas pendientes/próximas
     */
    async renderPendingVaccinations() {
        this.vaccinations = await DataService.getVaccinations() || [];
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

        const pending = this.vaccinations.filter(v => {
            const nextDose = v.next_dose_date || v.nextDoseDate;
            if (!nextDose) return false;
            const nextDate = new Date(nextDose);
            return nextDate <= thirtyDaysFromNow;
        }).sort((a, b) => new Date(a.next_dose_date || a.nextDoseDate) - new Date(b.next_dose_date || b.nextDoseDate));

        if (pending.length === 0) {
            return Components.emptyState(
                '✅',
                'No hay vacunas pendientes',
                'Todas las vacunas están al día en los próximos 30 días.'
            );
        }

        const pendingHtml = await Promise.all(pending.map(async v => {
            const patient = await DataService.getPatientById(v.patient_id || v.patientId);
            const owner = patient ? await DataService.getOwnerById(patient.owner_id || patient.ownerId) : null;
            const emoji = patient ? DataService.getSpeciesEmoji(patient.species) : '🐾';
            const nextDoseDateStr = v.next_dose_date || v.nextDoseDate;
            const nextDate = DataService.formatDate(nextDoseDateStr);
            const daysUntil = Math.ceil((new Date(nextDoseDateStr) - today) / (24 * 60 * 60 * 1000));
            const urgency = daysUntil <= 0 ? 'overdue' : daysUntil <= 7 ? 'urgent' : 'normal';

            return `
                            <div class="pending-item ${urgency}">
                                <div class="pending-patient">
                                    <span class="patient-emoji">${emoji}</span>
                                    <div>
                                        <div class="pending-patient-name">${patient ? patient.name : 'Paciente'}</div>
                                        <div class="pending-owner">${owner ? owner.full_name || owner.fullName : ''}</div>
                                    </div>
                                </div>
                                <div class="pending-vaccine">
                                    <strong>${v.vaccine_name || v.vaccineName}</strong>
                                </div>
                                <div class="pending-date">
                                    <span class="date-value">${nextDate}</span>
                                    <span class="days-until ${urgency}">
                                        ${daysUntil <= 0 ? '⚠️ Vencida' : daysUntil === 1 ? '⏰ Mañana' : `📅 En ${daysUntil} días`}
                                    </span>
                                </div>
                                <div class="pending-actions">
                                    <button class="btn btn-primary btn-sm" onclick="VaccinationsPage.openNewModal('${v.patient_id || v.patientId}', '${v.vaccine_name || v.vaccineName}')">
                                        💉 Aplicar
                                    </button>
                                    ${owner ? `<button class="btn btn-ghost btn-sm" onclick="alert('Llamar a: ${owner.phone}')">📞 Llamar</button>` : ''}
                                </div>
                            </div>
                        `;
        }));

        return `
            <div class="pending-vaccinations">
                <h3>⏰ Vacunas próximas a vencer (30 días)</h3>
                <div class="pending-list">
                    ${pendingHtml.join('')}
                </div>
            </div>
        `;
    },

    /**
     * Modal para registrar vacuna
     */
    async renderNewVaccinationModal() {
        const patients = await DataService.getPatients() || [];
        const currentUser = DataService.getCurrentUser() || {};

        return `
            <div class="modal-backdrop" id="newVaccinationModal">
                <div class="modal" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 class="modal-title">💉 Registrar Vacuna</h2>
                        <button class="modal-close" id="closeNewVaccination">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Paciente *</label>
                            <select class="input" id="vaccinationPatient">
                                <option value="">-- Seleccionar paciente --</option>
                                ${await Promise.all(patients.map(async p => {
                                    const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
                                    const emoji = DataService.getSpeciesEmoji(p.species);
                                    return `<option value="${p.id}" data-species="${p.species}">${emoji} ${p.name} (${owner ? owner.full_name || owner.fullName : 'Sin dueño'})</option>`;
                                })).then(opts => opts.join(''))}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Vacuna *</label>
                            <select class="input" id="vaccineName">
                                <option value="">-- Primero selecciona paciente --</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha de aplicación *</label>
                                <input type="date" class="input" id="vaccinationDate" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Días hasta próxima dosis</label>
                                <input type="number" class="input" id="daysUntilNextDose" placeholder="Ej: 21" min="1">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Próxima dosis (calculada o manual)</label>
                            <input type="date" class="input" id="nextDoseDate">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Número de lote</label>
                            <input type="text" class="input" id="vaccineBatch" placeholder="Ej: BATCH-2024-001">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Observaciones</label>
                            <textarea class="input textarea" id="vaccinationNotes" rows="2" placeholder="Reacciones, notas adicionales..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Médico Veterinario *</label>
                            <select class="input" id="vaccinationVet">
                                <!-- Podría llenarse si se requiere, o usar el currentUser por defecto -->
                                <option value="${currentUser.id}" selected>
                                    ${currentUser.name || 'Veterinario Actual'}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelVaccination">Cancelar</button>
                        <button class="btn btn-primary" id="saveVaccination">💾 Registrar Vacuna</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa eventos
     */
    init() {
        // Verificar si se debe abrir el modal automáticamente (viniendo de Pacientes)
        if (localStorage.getItem('autoOpenVaccination') === 'true') {
            const autoPatientId = localStorage.getItem('autoSelectPatientId');
            localStorage.removeItem('autoOpenVaccination');
            localStorage.removeItem('autoSelectPatientId');

            setTimeout(() => {
                console.log('Auto-opening vaccination modal for patient:', autoPatientId);
                this.openNewModal(autoPatientId);
            }, 100);
        }

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });



        // Botón nueva vacuna
        document.getElementById('btnNewVaccination')?.addEventListener('click', () => {
            this.openNewModal();
        });

        // Cerrar modal
        document.getElementById('closeNewVaccination')?.addEventListener('click', () => {
            document.getElementById('newVaccinationModal').classList.remove('active');
        });
        document.getElementById('cancelVaccination')?.addEventListener('click', () => {
            document.getElementById('newVaccinationModal').classList.remove('active');
        });

        // Cambio de paciente para cargar vacunas
        document.getElementById('vaccinationPatient')?.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            if (option) {
                const species = option.dataset.species;
                this.loadVaccinesForSpecies(species);
            }
        });

        // Guardar vacuna
        document.getElementById('saveVaccination')?.addEventListener('click', () => {
            this.saveVaccination();
        });

        // Búsqueda
        document.getElementById('vaccinationSearch')?.addEventListener('input', (e) => {
            this.filterVaccinations(e.target.value);
        });

        // Calcular próxima dosis automáticamente
        document.getElementById('daysUntilNextDose')?.addEventListener('input', (e) => {
            const days = parseInt(e.target.value);
            const applicationDate = document.getElementById('vaccinationDate').value;

            if (days > 0 && applicationDate) {
                const nextDate = new Date(applicationDate);
                nextDate.setDate(nextDate.getDate() + days);
                document.getElementById('nextDoseDate').value = nextDate.toISOString().split('T')[0];
            }
        });

        // Re-calcular si cambia la fecha de aplicación
        document.getElementById('vaccinationDate')?.addEventListener('change', (e) => {
            const days = parseInt(document.getElementById('daysUntilNextDose').value);

            if (days > 0) {
                const nextDate = new Date(e.target.value);
                nextDate.setDate(nextDate.getDate() + days);
                document.getElementById('nextDoseDate').value = nextDate.toISOString().split('T')[0];
            }
        });
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    },

    async openNewModal(patientId = '', vaccineName = '') {
        document.getElementById('newVaccinationModal').classList.add('active');
        if (patientId) {
            document.getElementById('vaccinationPatient').value = patientId;
            const patient = await DataService.getPatientById(patientId);
            if (patient) {
                this.loadVaccinesForSpecies(patient.species);
                if (vaccineName) {
                    setTimeout(() => {
                        document.getElementById('vaccineName').value = vaccineName;
                    }, 100);
                }
            }
        }
    },

    loadVaccinesForSpecies(species) {
        const vaccines = this.vaccineSchemes[species] || [];
        const select = document.getElementById('vaccineName');
        select.innerHTML = `
            <option value="">-- Seleccionar vacuna --</option>
            ${vaccines.map(v => `<option value="${v.name}">${v.name}</option>`).join('')}
            <option value="Otra">📝 Otra (especificar)</option>
        `;
    },

    async saveVaccination() {
        const patientId = document.getElementById('vaccinationPatient').value;
        const vaccineName = document.getElementById('vaccineName').value;
        const date = document.getElementById('vaccinationDate').value;
        const nextDoseDate = document.getElementById('nextDoseDate').value;
        const batch = document.getElementById('vaccineBatch').value;
        const notes = document.getElementById('vaccinationNotes').value;
        const vetId = document.getElementById('vaccinationVet')?.value;

        if (!patientId || !vaccineName || !date) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        try {
            await DataService.saveVaccination({
                patient_id: patientId,
                vaccine_name: vaccineName,
                date: date,
                next_dose_date: nextDoseDate || null,
                batch: batch,
                veterinarian_id: vetId || DataService.getCurrentUser().id,
                notes: notes
            });

            // Cerrar y refrescar
            document.getElementById('newVaccinationModal').classList.remove('active');
            
            // Recargar datos
            document.getElementById('tab-records').innerHTML = await this.renderVaccinationRecords();
            document.getElementById('tab-pending').innerHTML = await this.renderPendingVaccinations();

            this.showToast('✅ Vacuna registrada exitosamente');
        } catch (error) {
            console.error('Error saving vaccination:', error);
            alert('Error al guardar la vacuna. Intenta de nuevo.');
        }
    },

    async filterVaccinations(query) {
        let filtered = [];
        for (const v of this.vaccinations) {
            const patient = await DataService.getPatientById(v.patient_id || v.patientId);
            const searchText = `${patient ? patient.name : ''} ${v.vaccine_name || v.vaccineType || v.vaccineName}`.toLowerCase();
            if (searchText.includes(query.toLowerCase())) {
                filtered.push(v);
            }
        }

        document.getElementById('tab-records').innerHTML = await this.renderFilteredRecords(filtered);
    },

    async renderFilteredRecords(vaccinations) {
        if (vaccinations.length === 0) {
            return Components.emptyState('🔍', 'Sin resultados', 'No se encontraron vacunas con ese criterio.');
        }

        const rows = await Promise.all(vaccinations.map(v => this.renderVaccinationRow(v)));

        return `
            <div class="vaccinations-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Vacuna</th>
                            <th>Fecha</th>
                            <th>Veterinario</th>
                            <th>Próxima dosis</th>
                            <th>Lote</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async viewDetails(vaccinationId) {
        const v = this.vaccinations.find(vac => vac.id === vaccinationId);
        if (!v) return;

        const patient = await DataService.getPatientById(v.patient_id || v.patientId);
        const vet = await DataService.getVeterinarianById(v.veterinarian_id || v.veterinarianId);
        alert(`Vacuna: ${v.vaccine_name || v.vaccineType || v.vaccineName}\nPaciente: ${patient ? patient.name : '-'}\nFecha: ${v.date || v.applicationDate}\nLote: ${v.batch || v.lotNumber || '-'}\nVeterinario: ${vet ? vet.full_name || vet.name + ' (TP: ' + vet.tp + ')' : '-'}\nNotas: ${v.notes || 'Sin notas'}`);
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
