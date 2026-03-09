/**
 * Configuración de Supabase
 * Reemplaza '<TU_SUPABASE_ANON_KEY>' con la anon_key proporcionada en tu panel de Supabase
 */

const SUPABASE_URL = 'https://liriysxowbwqrgpygjkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcml5c3hvd2J3cXJncHlnamtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODc0ODEsImV4cCI6MjA4ODU2MzQ4MX0.-zvts06ylfB9XUzWuYbh45eMLv-uJI2SHUYzDlCec3Q'; // <-- PEGA TU CLAVE AQUÍ

// Inicializar el cliente de Supabase y exportar para uso global
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
