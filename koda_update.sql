-- ==========================================
-- KODA CASE MANAGER - APP UPDATE O SCRIPT DESDE CERO
-- Si ya tenías datos, ejecuta sólo los ALTER TABLE.
-- ==========================================

-- AÑANDIENDO LOS NUEVOS CAMPOS

-- Tabla casos: Añadir receipt_number para marcar si está con inmigración
ALTER TABLE casos ADD COLUMN IF NOT EXISTS receipt_number TEXT DEFAULT NULL;

-- Asegurarse de que el número de caso sea el KODA-AÑO-XXX autogenerado
-- El paralegal_asignado ya existe como TEXT (serán iniciales o user_id)

-- Tabla notas_koda: Las categorías de nivel de importancia se expanden en la UI a "normal, update, decision"
-- (En SQL se guarda como texto plano así que no requiere alter table del enum, salvo que hayas forzado CHECK)

-- Tabla visa_bulletin: La lógica "over estimated time" se manejará desde el front-end
-- comparando el mes actual contra meses anteriores de la misma tabla.
