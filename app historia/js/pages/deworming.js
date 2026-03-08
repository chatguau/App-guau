/**
 * SHCV - Página Desparasitación
 * Gestión de desparasitación interna y externa
 */

const DewormingPage = {
    dewormingRecords: [],

    /**
     * Carga los registros
     */
    loadRecords() {
        // En una app real, esto vendría del DataService
        if (!DataService.getDewormingByPatient) return;

        // Simplemente referenciamos los datos globales por ahora o cargamos todos
        // Para la vista principal, tal vez queramos ver LOS DEL DÍA o TODOS?
        // Por ahora, cargamos mock data directo si es necesario o vacio
    },

    /**
     * Renderiza la página
     */
    async render() {
        return `
            <!-- Header -->
            <div class="patients-header">
                <div class="patients-search">
                    ${Components.searchInput('Buscar por paciente o producto...', 'dewormingSearch')}
                </div>
                <div class="patients-filters">
                    <button class="btn btn-primary" id="btnNewDeworming">
                        <span>💊</span> Registrar Desparasitación
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="card">
                <div class="panel-header">
                    <span class="panel-title">📋 Registros Recientes</span>
                </div>
                ${await this.renderRecordsTable()}
            </div>

            <!-- New Record Modal -->
            ${this.renderNewModal()}
        `;
    },

    async renderRecordsTable() {
        const records = (await DataService.getDewormings() || []).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (records.length === 0) {
            return Components.emptyState('💊', 'Gestión de Desparasitación', 'Busca un paciente para ver su historial o registrar una nueva dosis.');
        }

        const rows = await Promise.all(records.map(async r => {
            const patient = await DataService.getPatientById(r.patient_id || r.patientId);
            return [
                DataService.formatDate(r.date),
                patient ? `<a href="#" onclick="App.navigateTo('patients'); setTimeout(() => { PatientsPage.openPatientDetail('${patient.id}'); document.querySelector('[data-tab=deworming]').click(); }, 100); return false;">${patient.name}</a>` : 'Desconocido',
                r.product,
                r.type === 'internal' ? 'Interna' : 'Externa',
                DataService.formatDate(r.next_dose_date || r.nextDoseDate)
            ];
        }));

        return Components.table(
            ['Fecha', 'Paciente', 'Producto', 'Tipo', 'Próxima Dosis'],
            rows
        );
    },

    /**
     * Renderiza el modal de nuevo registro
     */
    renderNewModal() {
        return `
            <div class="modal-backdrop" id="newDewormingModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title">💊 Registrar Desparasitación</h2>
                        <button class="modal-close" id="closeDewormingModal">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Paciente *</label>
                            <input type="text" class="input" id="dPatientSearch" placeholder="Buscar paciente...">
                            <input type="hidden" id="dPatientId">
                            <div id="dPatientResults" class="search-results hidden"></div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Producto *</label>
                                <input type="text" class="input" id="dProduct" placeholder="Nombre del producto">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="input" id="dType">
                                    <option value="internal">Interna</option>
                                    <option value="external">Externa</option>
                                    <option value="full">Completa</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Dosis Suministrada *</label>
                                <input type="text" class="input" id="dDose" placeholder="Ej: 1 tableta, 0.5ml">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fecha Aplicación *</label>
                                <input type="date" class="input" id="dDate" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Próxima Dosis *</label>
                            <input type="date" class="input" id="dNextDate">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Observaciones</label>
                            <textarea class="input" id="dNotes" rows="2"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="btnCancelDeworming">Cancelar</button>
                        <button class="btn btn-primary" id="btnSaveDeworming">Guardar Registro</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa lógica
     */
    init() {
        // Modal Events
        document.getElementById('btnNewDeworming')?.addEventListener('click', () => {
            document.getElementById('newDewormingModal').classList.add('active');
        });

        document.getElementById('closeDewormingModal')?.addEventListener('click', () => {
            document.getElementById('newDewormingModal').classList.remove('active');
        });

        document.getElementById('btnCancelDeworming')?.addEventListener('click', () => {
            document.getElementById('newDewormingModal').classList.remove('active');
        });

        // Search Patient Logic (Autocomplete)
        const searchInput = document.getElementById('dPatientSearch');
        const resultsDiv = document.getElementById('dPatientResults');

        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                const query = e.target.value;
                if (query.length < 2) {
                    resultsDiv.classList.add('hidden');
                    return;
                }

                try {
                    const patients = await DataService.searchPatients(query);

                    if (!patients || patients.length === 0) {
                        resultsDiv.innerHTML = '<div class="search-result-item">No se encontraron pacientes</div>';
                    } else {
                        const htmlItems = await Promise.all(patients.map(async p => {
                            const owner = await DataService.getOwnerById(p.owner_id || p.ownerId);
                            const ownerName = owner ? owner.full_name || owner.fullName : 'Sin dueño';
                            return `
                                <div class="search-result-item" data-id="${p.id}" data-name="${p.name}">
                                    ${p.name} (${p.breed || 'Sin raza'}) - ${ownerName}
                                </div>
                            `;
                        }));
                        resultsDiv.innerHTML = htmlItems.join('');
                    }
                    resultsDiv.classList.remove('hidden');

                    // Attach clicks
                    resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            if (item.dataset.id) {
                                document.getElementById('dPatientId').value = item.dataset.id;
                                searchInput.value = item.dataset.name;
                                resultsDiv.classList.add('hidden');
                            }
                        });
                    });
                } catch (err) {
                    console.error('Error searching patients:', err);
                }
            });
        }

        // Save Logic
        document.getElementById('btnSaveDeworming')?.addEventListener('click', () => {
            this.save();
        });

        // Calc Next Date Logic (Default +3 months)
        document.getElementById('dDate')?.addEventListener('change', (e) => {
            const date = new Date(e.target.value);
            date.setMonth(date.getMonth() + 3); // Default 3 months
            document.getElementById('dNextDate').value = date.toISOString().split('T')[0];
        });
    },

    async save() {
        const patientId = document.getElementById('dPatientId').value;
        const product = document.getElementById('dProduct').value;
        const date = document.getElementById('dDate').value;
        const nextDate = document.getElementById('dNextDate').value;
        const dose = document.getElementById('dDose').value;
        const type = document.getElementById('dType').value;
        const notes = document.getElementById('dNotes').value;

        if (!patientId || !product || !date || !dose) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        const currentUser = DataService.getCurrentUser() || {};

        try {
            await DataService.saveDeworming({
                patient_id: patientId,
                product,
                date,
                next_dose_date: nextDate,
                dose,
                type,
                veterinarian_id: currentUser.id,
                notes: notes
            });

            alert('Desparasitación registrada correctamente');
            document.getElementById('newDewormingModal').classList.remove('active');
            // Reload dashboard to show new record
            App.loadPage('deworming');
        } catch (error) {
            console.error('Error saving deworming:', error);
            alert('Error al guardar registro');
        }
    }
};
