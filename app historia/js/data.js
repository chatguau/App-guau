/**
 * SHCV - Data Service (Supabase Integration)
 * Maneja las peticiones asíncronas a la base de datos Supabase
 */

const DataService = {
    /**
     * Helper para manejar respuestas de Supabase
     */
    handleResponse(data, error) {
        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message);
        }
        return data; // Si no hay datos, retornará null o [] según corresponda
    },

    /**
     * =================================
     * PACIENTES (Patients)
     * =================================
     */
    async getPatients() {
        const { data, error } = await window.supabaseClient
            .from('patients')
            .select(`
                *,
                owners:owner_id (*)
            `)
            .order('created_at', { ascending: false });
        // Mapeamos array "owners" singularizado a "owner" para compatibilidad (Supabase lo devuelve como objeto único al ser relación directa, pero por si acaso)
        if (!error && data) {
            return data.map(p => ({ ...p, owner: p.owners }));
        }
        return this.handleResponse(data, error);
    },

    async getPatientById(id) {
        const { data, error } = await window.supabaseClient
            .from('patients')
            .select(`*, owners:owner_id (*)`)
            .eq('id', id)
            .single();
        if (!error && data) {
            data.owner = data.owners;
        }
        return this.handleResponse(data, error);
    },

    async savePatient(patientData) {
        if (patientData.id) {
            // Actualizar
            const { id, owner, owners, ...updateData } = patientData;
            const { data, error } = await window.supabaseClient
                .from('patients')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            return this.handleResponse(data, error);
        } else {
            // Crear
            // Generar un número de historia clínico temporal básico (Idealmente debe hacerse en backend o trigger)
            const recordNumber = `HC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            const { data, error } = await window.supabaseClient
                .from('patients')
                .insert([{ ...patientData, medical_record_number: recordNumber }])
                .select()
                .single();
            return this.handleResponse(data, error);
        }
    },

    async searchPatients(query) {
        // Búsqueda simple en nombre o número de documento del owner
        const { data, error } = await window.supabaseClient
            .from('patients')
            .select(`*, owners:owner_id (*)`)
            .or(`name.ilike.%${query}%,medical_record_number.ilike.%${query}%`);
        return this.handleResponse(data, error);
    },

    /**
     * =================================
     * PROPIETARIOS (Owners)
     * =================================
     */
    async getOwnerById(id) {
        const { data, error } = await window.supabaseClient
            .from('owners')
            .select('*')
            .eq('id', id)
            .single();
        return this.handleResponse(data, error);
    },

    async getOwnerByDocument(documentNumber) {
        if (!documentNumber) return null;
        const { data, error } = await window.supabaseClient
            .from('owners')
            .select('*')
            .eq('document_number', documentNumber)
            .single();
        
        if (error && error.code === 'PGRST116') return null; // No encontrado
        return this.handleResponse(data, error);
    },

    async saveOwner(ownerData) {
        if (ownerData.id) {
            // Update
            const { id, ...updateData } = ownerData;
            const { data, error } = await window.supabaseClient
                .from('owners')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            return this.handleResponse(data, error);
        } else {
            // Insert
            const { data, error } = await window.supabaseClient
                .from('owners')
                .insert([ownerData])
                .select()
                .single();
            return this.handleResponse(data, error);
        }
    },

    /**
     * =================================
     * VETERINARIOS (Veterinarians)
     * =================================
     */
    async getVeterinarians() {
        const { data, error } = await window.supabaseClient
            .from('veterinarians')
            .select('*');
        return this.handleResponse(data, error);
    },

    async getVeterinarianById(id) {
        const { data, error } = await window.supabaseClient
            .from('veterinarians')
            .select('*')
            .eq('id', id)
            .single();
        return this.handleResponse(data, error);
    },

    getCurrentUser() {
        // En un futuro, esto debería usar supabase.auth.getUser()
        // Por ahora mantenemos este mock para la UI, ya que la tabla "users" nativa de auth no está expuesta igual.
        return {
            id: 'vet-001',
            name: 'Dr. Nanda Bagus Pratmoko',
            role: 'admin',
            email: 'nanda@clinicaveterinaria.com',
            avatar: 'https://ui-avatars.com/api/?name=Dr+Nanda&background=2563eb&color=fff'
        };
    },

    /**
     * =================================
     * CONSULTAS (Consultations)
     * =================================
     */
    async getConsultationsByPatient(patientId) {
        const { data, error } = await window.supabaseClient
            .from('consultations')
            .select(`*, veterinarians:veterinarian_id (*)`)
            .eq('patient_id', patientId)
            .order('consultation_date', { ascending: false });
        return this.handleResponse(data, error);
    },

    async saveConsultation(consultationData) {
        const { data, error } = await window.supabaseClient
            .from('consultations')
            .insert([consultationData])
            .select()
            .single();
        return this.handleResponse(data, error);
    },

    /**
     * =================================
     * VACUNACIONES (Vaccinations)
     * =================================
     */
    async getVaccinationsByPatient(patientId) {
        const { data, error } = await window.supabaseClient
            .from('vaccinations')
            .select('*')
            .eq('patient_id', patientId)
            .order('application_date', { ascending: false });
        return this.handleResponse(data, error);
    },

    async saveVaccination(vaccineData) {
        const { data, error } = await window.supabaseClient
            .from('vaccinations')
            .insert([vaccineData])
            .select()
            .single();
        return this.handleResponse(data, error);
    },

    /**
     * =================================
     * DESPARASITACIONES (Dewormings)
     * =================================
     */
    async getDewormingByPatient(patientId) {
        const { data, error } = await window.supabaseClient
            .from('dewormings')
            .select('*')
            .eq('patient_id', patientId)
            .order('application_date', { ascending: false });
        return this.handleResponse(data, error);
    },

    async getDewormings() {
        const { data, error } = await window.supabaseClient
            .from('dewormings')
            .select(`*, patients:patient_id (name, species, breed)`)
            .order('application_date', { ascending: false });
        return this.handleResponse(data, error);
    },

    async saveDeworming(dewormingData) {
        const { data, error } = await window.supabaseClient
            .from('dewormings')
            .insert([dewormingData])
            .select()
            .single();
        return this.handleResponse(data, error);
    },

    /**
     * =================================
     * AUTORIZACIONES (Authorizations)
     * =================================
     */
    async getAuthorizations() {
        const { data, error } = await window.supabaseClient
            .from('authorizations')
            .select(`*, patients:patient_id (name, species)`)
            .order('created_at', { ascending: false });
        return this.handleResponse(data, error);
    },

    async getAuthorizationsByPatient(patientId) {
        const { data, error } = await window.supabaseClient
            .from('authorizations')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        return this.handleResponse(data, error);
    },

    async saveAuthorization(authData) {
        const { data, error } = await window.supabaseClient
            .from('authorizations')
            .insert([authData])
            .select()
            .single();
        return this.handleResponse(data, error);
    },

    /**
     * =================================
     * HOSPITALIZACIONES (Hospitalizations)
     * =================================
     */
    async getHospitalizationsByPatient(patientId) {
        const { data, error } = await window.supabaseClient
            .from('hospitalizations')
            .select('*')
            .eq('patient_id', patientId)
            .order('admission_date', { ascending: false });
        return this.handleResponse(data, error);
    },

    async getActiveHospitalizations() {
        const { data, error } = await window.supabaseClient
            .from('hospitalizations')
            .select(`*, patients:patient_id (*)`)
            .eq('status', 'admitted')
            .order('admission_date', { ascending: false });
        return this.handleResponse(data, error);
    },

    async saveHospitalization(hospData) {
        const { data, error } = await window.supabaseClient
            .from('hospitalizations')
            .insert([hospData])
            .select()
            .single();
        return this.handleResponse(data, error);
    },

    /**
     * =================================
     * UTILIDADES & UI HELPERS
     * =================================
     */
    calculateAge(birthDate) {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        if (age === 0) {
            const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
            return `${months} meses`;
        }

        return `${age} años`;
    },

    formatDate(dateString) {
        if (!dateString) return '-';

        // Manejo de strings YYYY-MM-DD
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    getSpeciesEmoji(species) {
        const emojis = {
            canino: '🐕',
            felino: '🐱'
        };
        return emojis[species] || '🐾';
    },

    getBreedsBySpecies(species) {
        const breeds = {
            canino: [
                'Labrador Retriever', 'Pastor Alemán', 'Golden Retriever', 'Bulldog Francés',
                'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Bóxer',
                'Dachshund (Teckel)', 'Siberian Husky', 'Gran Danés', 'Chihuahua',
                'Shih Tzu', 'Border Collie', 'Pinscher', 'Pitbull', 'Criollo/Mestizo'
            ],
            felino: [
                'Persa', 'Siamés', 'Maine Coon', 'Bengala', 'Ragdoll', 'Sphynx',
                'Abisinio', 'Bosque de Noruega', 'Birmano', 'Ruso Azul',
                'Scottish Fold', 'Común Europeo', 'Angora', 'Mestizo'
            ]
        };
        return breeds[species] || [];
    },

    // Mocks para features del dashboard que no tienen tabla en base de datos aún
    async getDashboardStats() {
        const stats = { enCola: 12, sirviendo: 9, finalizados: 11, totalPacientes: 21 };
        try {
            const { count } = await window.supabaseClient
                .from('patients')
                .select('*', { count: 'exact', head: true });
            stats.totalPacientes = count || 0;
            return stats;
        } catch (e) {
            return stats;
        }
    },

    getNotifications() {
        return [
            { id: 'not-1', title: 'Clínica Veterinaria', message: 'Notificaciones en tiempo real pronto...', time: 'Ahora', icon: '🏥', type: 'info' }
        ];
    },

    getMessages() { return []; },

    getSchedule() { return []; },

    getChartData() {
        return {
            labels: ['Sep 1', 'Sep 2', 'Sep 3'],
            datasets: [
                { label: 'Hospitalizados', data: [40, 45, 50], color: '#2563eb' }
            ]
        };
    }
};
