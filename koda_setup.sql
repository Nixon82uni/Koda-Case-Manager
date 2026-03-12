-- ==========================================
-- KODA CASE MANAGER - SUPABASE SETUP SCRIPT
-- ==========================================

-- 1. Crear tabla de Plantillas de Documentos
-- Esto define qué documentos son necesarios para cada tipo de trámite
CREATE TABLE IF NOT EXISTS plantillas_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_tramite TEXT NOT NULL, -- ej. 'F2A', 'DACA', 'EB-2'
    nombre_documento TEXT NOT NULL,
    es_requerido BOOLEAN DEFAULT true,
    orden INT DEFAULT 0
);

-- 2. Crear tabla de Casos
CREATE TABLE IF NOT EXISTS casos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_cliente TEXT NOT NULL,
    numero_caso TEXT NOT NULL UNIQUE,
    tipo_tramite TEXT NOT NULL, -- F2A, DACA, etc. (Debe coincidir con plantillas_documentos)
    categoria_tramite TEXT, -- Family, Employment, DACA, TPS
    estado TEXT DEFAULT 'En proceso', -- Nuevo, En proceso, Urgente, Al día
    priority_date DATE, -- Para la lógica del Visa Bulletin
    fecha_apertura DATE DEFAULT CURRENT_DATE,
    paralegal_asignado TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Crear tabla de Documentos por Caso
CREATE TABLE IF NOT EXISTS documentos_koda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    nombre_documento TEXT NOT NULL,
    estado TEXT DEFAULT 'Pendiente', -- Pendiente, Recibido, Urgente
    link_dropbox TEXT, -- Enlace al archivo en Dropbox
    orden INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Crear tabla de Notas
CREATE TABLE IF NOT EXISTS notas_koda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    autor TEXT NOT NULL,
    nivel_importancia TEXT DEFAULT 'normal', -- normal, importante, consulta
    contenido TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Crear tabla Visa Bulletin (Opcional/Mock)
CREATE TABLE IF NOT EXISTS visa_bulletin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mes_boletin DATE NOT NULL,
    categoria TEXT NOT NULL, -- ej. 'F2A'
    final_action_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- Habilitar y Configurar Row Level Security (RLS)
-- Nota: Para desarrollo rápido, las políticas permiten acceso anónimo a todo.
-- EN PRODUCCIÓN: Ocultar acceso anónimo y requerir autenticación.
-- ==========================================

ALTER TABLE plantillas_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_koda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_koda ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_bulletin ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (Solo para demostración/desarrollo)
CREATE POLICY "Permitir todo en plantillas" ON plantillas_documentos FOR ALL USING (true);
CREATE POLICY "Permitir todo en casos" ON casos FOR ALL USING (true);
CREATE POLICY "Permitir todo en documentos" ON documentos_koda FOR ALL USING (true);
CREATE POLICY "Permitir todo en notas" ON notas_koda FOR ALL USING (true);
CREATE POLICY "Permitir todo en visa_bulletin" ON visa_bulletin FOR ALL USING (true);

-- ==========================================
-- (Opcional) Datos MOCK para Iniciar
-- ==========================================

-- Insertar plantillas para F2A
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('F2A', 'Pasaporte Peticionario (copia)', 1),
('F2A', 'Acta de matrimonio (apostillada)', 2),
('F2A', 'Prueba de ciudadanía o residencia', 3),
('F2A', 'Pasaporte Beneficiario', 4),
('F2A', 'Acta de nacimiento Beneficiario', 5),
('F2A', 'Foto pasaporte (2x2)', 6),
('F2A', 'Examen médico I-693 (sellado)', 7),
('F2A', 'Police clearance', 8),
('F2A', 'Affidavit of Support (I-864)', 9);

-- Insertar datos del boletín
INSERT INTO visa_bulletin (mes_boletin, categoria, final_action_date) VALUES 
('2025-03-01', 'F2A', '2022-07-01');
