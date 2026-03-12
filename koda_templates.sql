-- ==========================================
-- KODA CASE MANAGER - PLANTILLAS DE DOCUMENTOS
-- ==========================================

-- Limpiar las plantillas anteriores (opcional, si deseas reemplazarlas todas)
-- DELETE FROM plantillas_documentos;

-- ================== I-130 ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('I-130', 'Fotos pasaporte (Peticionario y Beneficiario)', 1),
('I-130', 'G-28', 2),
('I-130', 'I-130/I-130A', 3),
('I-130', 'Prueba de Estatus del Peticionario', 4),
('I-130', 'Seguro Social', 5),
('I-130', 'Actas de Nacimiento (con traducción)', 6),
('I-130', 'Acta de Matrimonio', 7),
('I-130', 'Pruebas de Relación de Buena Fe', 8);

-- ================== I-485 ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('I-485', 'G-28', 1),
('I-485', 'Formulario I-485', 2),
('I-485', 'Fotos pasaporte (4)', 3),
('I-485', 'ID con fotografía', 4),
('I-485', 'I-94 o prueba de entrada legal', 5),
('I-485', 'Examen Médico I-693', 6),
('I-485', 'Affidavit of Support I-864', 7),
('I-485', 'Tax Returns (reciente)', 8);

-- ================== N-400 ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('N-400', 'G-28', 1),
('N-400', 'Formulario N-400', 2),
('N-400', 'Copia de Green Card (frente/vuelta)', 3),
('N-400', 'Seguro Social', 4),
('N-400', 'Acta de Matrimonio', 5),
('N-400', 'Tax Returns (últimos 3-5 años)', 6),
('N-400', 'Evidencia de residencia continua', 7);

-- ================== I-821D ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('I-821D', 'G-28', 1),
('I-821D', 'I-821D / I-765 / I-765WS', 2),
('I-821D', 'Fotos pasaporte', 3),
('I-821D', 'Acta de Nacimiento con traducción', 4),
('I-821D', 'Prueba de estatus estudiantil', 5),
('I-821D', 'Prueba de entrada antes de los 16 años', 6),
('I-821D', 'Prueba de residencia continua desde 2007', 7);

-- ================== I-751 ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('I-751', 'G-28', 1),
('I-751', 'Formulario I-751', 2),
('I-751', 'Acta de Nacimiento de hijos nacidos durante el matrimonio', 3),
('I-751', 'Contrato de renta o hipoteca', 4),
('I-751', 'Records financieros conjuntos (taxes, seguros, fotos)', 5);

-- ================== I-765 (Bona Fide) ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('I-765', 'G-28', 1),
('I-765', 'Formulario I-765', 2),
('I-765', 'Fotos pasaporte (2)', 3),
('I-765', 'Copia de ID / Pasaporte', 4),
('I-765', 'I-94', 5);

-- ================== I-360 (VAWA) ==================
INSERT INTO plantillas_documentos (tipo_tramite, nombre_documento, orden) VALUES
('I-360', 'G-28', 1),
('I-360', 'Formulario I-360', 2),
('I-360', 'Declaración personal (Affidavit)', 3),
('I-360', 'Evidencia de abuso/crueldad', 4),
('I-360', 'Evidencia de buena fe del matrimonio', 5),
('I-360', 'Evidencia de residencia conjunta', 6);
