/**
 * SHCV - Aplicación Principal
 * Sistema de Historia Clínica Veterinaria
 */

const App = {
    currentPage: 'dashboard',

    /**
     * Inicializa la aplicación
     */
    init() {
        this.setupNavigation();
        this.setupMobileMenu();

        // Soporte para navegación por hash
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.replace('#', '') || 'dashboard';
            this.navigateTo(page);
        });

        // Cargar página inicial
        const initialPage = window.location.hash.replace('#', '') || 'dashboard';
        this.loadPage(initialPage);

        console.log('🐾 Guau - Gestión Veterinaria');
        console.log('📋 Versión: 1.0.0 (Supabase)');
    },

    /**
     * Configura la navegación del sidebar
     */
    setupNavigation() {
        const vet = Auth.currentVeterinarian;
        // Asume 'veterinarian' si no hay un rol explícito o si no es el admin principal
        const role = vet?.role || 'veterinarian';
        console.log('Navigation Setup - Active Role:', role);

        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.dataset.page;

            // Permission Check: Hide Reports for Veterinarians
            if (page === 'reports') {
                if (role === 'veterinarian') {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
                return;
            }

            item.style.display = 'flex';

            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
    },

    /**
     * Configura el menú móvil
     */
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            // Crear overlay
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.id = 'sidebarOverlay';
            document.body.appendChild(overlay);

            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    },

    /**
     * Navega a una página
     */
    navigateTo(pageName) {
        // Actualizar nav activo
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Cerrar menú móvil si está abierto
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');

        // Cargar página
        this.loadPage(pageName);
    },

    /**
     * Carga una página
     */
    async loadPage(pageName) {
        this.currentPage = pageName;
        const pageContent = document.getElementById('pageContent');
        const pageTitle = document.getElementById('pageTitle');

        // Definir títulos de página
        const pageTitles = {
            dashboard: 'Dashboard',
            patients: 'Pacientes',
            consultations: 'Consultas Médicas',
            prescriptions: 'Recetas Médicas',
            vaccinations: 'Vacunación',
            deworming: 'Desparasitación',
            surgeries: 'Cirugías',
            hospitalization: 'Hospitalización',
            records: 'Cirugías', // Backward compatibility
            reports: 'Reportes',
            settings: 'Configuración'
        };

        // Actualizar título
        pageTitle.textContent = pageTitles[pageName] || 'Dashboard';

        // Mostrar Loading inicial mientras resuelve el render() asíncrono
        pageContent.innerHTML = `<div class="page" id="page-${pageName}">
            <div style="display: flex; justify-content: center; align-items: center; height: 300px;">
                <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid var(--color-primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        </div>`;

        // Renderizar contenido
        let html = '';
        try {
            switch (pageName) {
                case 'dashboard':
                    html = await DashboardPage.render();
                    break;
                case 'patients':
                    html = await PatientsPage.render();
                    break;
                case 'consultations':
                    html = await ConsultationsPage.render(); // Todas las páginas deben volverse async
                    break;
                case 'prescriptions':
                    html = await PrescriptionsPage.render();
                    break;
                case 'vaccinations':
                    html = await VaccinationsPage.render();
                    break;
                case 'deworming':
                    html = await DewormingPage.render();
                    break;
                case 'authorizations':
                    html = await AuthorizationsPage.render();
                    break;
                case 'surgeries':
                case 'records':
                    html = await SurgeriesPage.render();
                    break;
                case 'hospitalization':
                    html = await HospitalizationPage.render();
                    break;
                case 'reports':
                    html = await ReportsPage.render();
                    break;
                default:
                    html = this.renderPlaceholderPage(pageName, pageTitles[pageName]);
            }
        } catch (error) {
            console.error(`Error renderizando página ${pageName}:`, error);
            html = Components.emptyState('⚠️', 'Error al cargar', 'No se pudo cargar la vista. Verifica tu conexión a Supabase.');
        }

        pageContent.innerHTML = `<div class="page" id="page-${pageName}">${html}</div>`;

        // Inicializar lógica de la página
        setTimeout(() => {
            this.initPageLogic(pageName);
        }, 50); // Pequeño delay para asegurar que el DOM se pintó
    },

    /**
     * Inicializa la lógica específica de cada página
     */
    initPageLogic(pageName) {
        switch (pageName) {
            case 'dashboard':
                DashboardPage.init();
                break;
            case 'patients':
                PatientsPage.init();
                break;
            case 'consultations':
                ConsultationsPage.init();
                break;
            case 'prescriptions':
                PrescriptionsPage.init();
                break;
            case 'vaccinations':
                VaccinationsPage.init();
                break;
            case 'deworming':
                DewormingPage.init();
                break;
            case 'authorizations':
                AuthorizationsPage.init();
                break;
            case 'surgeries':
            case 'records':
                SurgeriesPage.init();
                break;
            case 'hospitalization':
                HospitalizationPage.init();
                break;
            case 'reports':
                ReportsPage.init();
                break;
        }
    },

    /**
     * Renderiza una página placeholder
     */
    renderPlaceholderPage(pageName, title) {
        return `
            <div class="empty-state" style="min-height: 400px;">
                <div class="empty-state-icon">🚧</div>
                <div class="empty-state-title">${title || pageName}</div>
                <div class="empty-state-text">
                    Esta sección está en desarrollo.<br>
                    Próximamente estará disponible.
                </div>
            </div>
        `;
    }
};

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar primero la Autenticación
    if (typeof Auth !== 'undefined' && typeof Auth.init === 'function') {
        Auth.init();
    } else {
        // Fallback si no hay autenticación
        App.init();
    }
});
