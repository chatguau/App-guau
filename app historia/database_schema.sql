-- ==========================================
-- SQL Schema para SHCV (Sistema Historia Clínica Veterinaria)
-- Base de datos: Supabase (PostgreSQL)
-- ==========================================

-- 1. Tabla: Propietarios (Owners)
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: Veterinarios (Veterinarians)
CREATE TABLE IF NOT EXISTS public.veterinarians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    professional_license VARCHAR(50) UNIQUE,
    specialty VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla: Pacientes (Patients/Mascotas)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE,
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL, -- canino, felino
    breed VARCHAR(100),
    birth_date DATE,
    sex VARCHAR(20), -- male, female
    weight NUMERIC(5,2),
    color VARCHAR(100),
    distinctive_marks TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla: Consultas (Consultations)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    consultation_date DATE NOT NULL,
    reason TEXT NOT NULL,
    anamnesis TEXT,
    temperature NUMERIC(4,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    weight NUMERIC(5,2),
    body_condition INTEGER,
    physical_exam_findings TEXT,
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla: Vacunaciones (Vaccinations)
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    vaccine_type VARCHAR(100) NOT NULL,
    application_date DATE NOT NULL,
    lot_number VARCHAR(100),
    laboratory VARCHAR(100),
    expiration_date DATE,
    next_dose_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla: Desparasitaciones (Deworming)
CREATE TABLE IF NOT EXISTS public.dewormings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    product VARCHAR(150) NOT NULL,
    application_date DATE NOT NULL,
    next_dose_date DATE,
    dose VARCHAR(100),
    type VARCHAR(50), -- internal, external
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabla: Autorizaciones (Authorizations)
CREATE TABLE IF NOT EXISTS public.authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- Surgery, Euthanasia, Anesthesia, etc.
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    signed_by VARCHAR(255),
    signature_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabla: Hospitalizaciones (Hospitalizations)
CREATE TABLE IF NOT EXISTS public.hospitalizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discharge_date TIMESTAMP WITH TIME ZONE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'admitted', -- admitted, discharged
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Políticas RLS (Row Level Security) - Opcional, pero recomendado
-- ==========================================
-- Al estar en una etapa inicial con anon_key abierta, es útil 
-- habilitarlo o deshabilitarlo según conveniencia.
-- Si prefieres usar la API pública libremente (sólo en desarrollo):
-- ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
-- (Por defecto están desactivadas a menos que las habilites explícitamente en el Dashboard)
