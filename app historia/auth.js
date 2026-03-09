/**
 * SHCV - Authentication Module
 * Maneja el inicio de sesión y el estado de la sesión de Supabase
 */

const Auth = {
    currentUser: null,
    currentVeterinarian: null,

    /**
     * Inicializa el listener de autenticación
     */
    init() {
        // Escuchar cambios en la sesión de Supabase
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
                if (session) {
                    await this.handleSession(session);
                } else {
                    this.showLoginScreen();
                }
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });

        // Configurar el formulario de Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }

        // Agregar botón de logout al Header (dinámicamente)
        this.addLogoutButton();
    },

    /**
     * Procesa una sesión activa (ejecutado en log in exitoso o si ya había sesión)
     */
    async handleSession(session) {
        this.currentUser = session.user;
        
        try {
            // 1. Buscar si el email de este usuario existe en la tabla veterinarians
            const { data: vetData, error: vetError } = await window.supabaseClient
                .from('veterinarians')
                .select('*')
                .eq('email', this.currentUser.email)
                .single();

            if (vetError && vetError.code !== 'PGRST116') { // PGRST116 es "No rows found"
                throw vetError;
            }

            if (!vetData) {
                // El usuario está en Supabase Auth, pero no es veterinario en la tabla.
                throw new Error("Su cuenta no tiene permisos de Veterinario en el sistema.");
            }

            this.currentVeterinarian = vetData;

            // Inyectar el veterinario activo globalmente para que DataService lo use de inmediato
            window.activeVeterinarian = this.currentVeterinarian;

            // 2. Actualizar el UI del Header con sus datos
            this.updateHeaderUI();

            // 3. Ocultar Login y Mostrar App
            this.hideLoginScreen();
            
            // 4. Inicializar la app principal si no se ha hecho
            if (typeof App !== 'undefined' && typeof App.init === 'function') {
                // Para evitar inicializar doble, lo ejecutamos si estamos en la página correcta
                // Pero como onAuthStateChange firea primero, esto está bien
                if(!document.getElementById('app').classList.contains('initialized')) {
                     document.getElementById('app').classList.add('initialized');
                     App.init(); 
                }
            }

        } catch (error) {
            console.error('Error verificando rol de veterinario:', error);
            this.showLoginError(error.message || "Error validando cuenta.");
            // Cerrar la sesión si no es válido
            await window.supabaseClient.auth.signOut();
        }
    },

    /**
     * Maneja el evento de Submit del formulario de Login
     */
    async handleLoginSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('btnLogin');
        const originalText = btn.innerHTML;

        this.hideLoginError();
        btn.innerHTML = '⏳ Entrando...';
        btn.disabled = true;

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }
            
            // Si el inicio de sesión es exitoso, onAuthStateChange tomará el control.

        } catch (error) {
            let errorMsg = "Credenciales incorrectas o error en el servidor.";
            if (error.message.includes('Invalid login credentials')) {
                errorMsg = "Correo o contraseña incorrectos.";
            } else if (error.message.includes('Email not confirmed')) {
                 errorMsg = "Por favor confirme su correo electrónico primero.";
            }
            this.showLoginError(errorMsg);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    /**
     * Cierra la sesión
     */
    async signOut() {
        await window.supabaseClient.auth.signOut();
    },

    handleSignOut() {
        this.currentUser = null;
        this.currentVeterinarian = null;
        window.activeVeterinarian = null;
        this.showLoginScreen();
    },

    /**
     * UI Helpers
     */
    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    },

    hideLoginScreen() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    },

    showLoginError(message) {
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    },

    hideLoginError() {
        document.getElementById('loginError').classList.add('hidden');
    },

    updateHeaderUI() {
        if (!this.currentVeterinarian) return;
        
        const userNameEl = document.querySelector('.user-name');
        const userAvatarEl = document.querySelector('.user-avatar img');
        
        if (userNameEl) {
            userNameEl.textContent = this.currentVeterinarian.full_name || this.currentVeterinarian.name;
        }
        
        if (userAvatarEl) {
            const nameForUrl = encodeURIComponent(this.currentVeterinarian.full_name || this.currentVeterinarian.name);
            userAvatarEl.src = `https://ui-avatars.com/api/?name=${nameForUrl}&background=2563eb&color=fff`;
        }
    },

    addLogoutButton() {
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('btnLogout')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'btnLogout';
            logoutBtn.className = 'btn btn-ghost btn-sm';
            logoutBtn.style.marginLeft = '1rem';
            logoutBtn.innerHTML = '🚪 Salir';
            logoutBtn.onclick = () => this.signOut();
            headerRight.appendChild(logoutBtn);
        }
    }
};

// Exportar
window.Auth = Auth;
