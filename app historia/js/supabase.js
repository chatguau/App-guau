/**
 * Configuración de Supabase
 * Reemplaza '<TU_SUPABASE_ANON_KEY>' con la anon_key proporcionada en tu panel de Supabase
 */

const SUPABASE_URL = 'https://liriysxowbwqrgpygjkl.supabase.co';
const SUPABASE_ANON_KEY = '<TU_SUPABASE_ANON_KEY>'; // <-- PEGA TU CLAVE AQUÍ

// Inicializar el cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para uso global
window.supabaseClient = supabase;
