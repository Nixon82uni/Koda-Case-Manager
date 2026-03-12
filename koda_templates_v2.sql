-- Limpiar la tabla de plantillas actual (opcional, para borrar las de prueba)
TRUNCATE TABLE plantillas_documentos;

-- ===============================================
-- 1. I-485 Variation #1: Based on Asylum Grant (Template Name: 'I-485 (Asylum)')
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-485 (Asylum)', 1, 'Four (4) Passport Photos'),
('I-485 (Asylum)', 2, 'G-28, Notice of Entry of Appearance'),
('I-485 (Asylum)', 3, 'I-797, Notice of Action (if applicable)'),
('I-485 (Asylum)', 4, 'I-485, Application to Register Permanent Residence or Adjust Status'),
('I-485 (Asylum)', 5, 'Copy of Applicant''s Birth Certificate'),
('I-485 (Asylum)', 6, 'Translation of Applicant''s Birth Certificate'),
('I-485 (Asylum)', 7, 'Copy of issued Identity Document with Photograph'),
('I-485 (Asylum)', 8, 'Passport Biographical Page'),
('I-485 (Asylum)', 9, 'Consular ID'),
('I-485 (Asylum)', 10, 'Employment Authorization Document'),
('I-485 (Asylum)', 11, 'I-765, Application for Employment Authorization (c)(09)'),
('I-485 (Asylum)', 12, 'I-693, Report of Immigration Medical Examination and Vaccination Record'),
('I-485 (Asylum)', 13, 'IJ Order Granting Asylum or Asylum Approval from USCIS');

-- ===============================================
-- 2. I-485 Variation #2: Based on VAWA Approval (Template Name: 'I-485 (VAWA)')
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-485 (VAWA)', 1, 'Filing fees of I-485'),
('I-485 (VAWA)', 2, 'Passport Photos (4)'),
('I-485 (VAWA)', 3, 'G-28, Notice of Entry of Appearance'),
('I-485 (VAWA)', 4, 'I-797, Notice of Action (if applicable)'),
('I-485 (VAWA)', 5, 'I-485, Application to Register Permanent Resident'),
('I-485 (VAWA)', 6, 'Copy of Applicant''s Birth Certificate'),
('I-485 (VAWA)', 7, 'Translation of Applicant''s Birth Certificate'),
('I-485 (VAWA)', 8, 'Copy of issued Identity Document with Photograph'),
('I-485 (VAWA)', 9, 'Passport page with nonimmigrant visa'),
('I-485 (VAWA)', 10, 'Passport page with admission or parole stamp'),
('I-485 (VAWA)', 11, 'Form I-94 arrival/departure record'),
('I-485 (VAWA)', 12, 'I-864W Exemption for Intending Immigrant''s Affidavit of Support'),
('I-485 (VAWA)', 13, 'I-765 under (c)(9) Application for Employment Authorization'),
('I-485 (VAWA)', 14, 'I-693, Medical Exam issued no more than 60 days'),
('I-485 (VAWA)', 15, 'Certified Police and Court Records for Criminal Charges (if applicable)'),
('I-485 (VAWA)', 16, 'I-485 VAWA Approval');

-- ===============================================
-- 3. I-485 Variation #3: Based on U-Nonimmigrant Status ('I-485 (U-Status)')
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-485 (U-Status)', 1, 'Filing Fees for I-485, $1140 & $85'),
('I-485 (U-Status)', 2, 'G-28'),
('I-485 (U-Status)', 3, 'I-485, Application to Register Permanent Residence'),
('I-485 (U-Status)', 4, 'Index of Documents'),
('I-485 (U-Status)', 5, 'I-797, Notice of Action I-918 U-Nonimmigrant Status Approval Notice'),
('I-485 (U-Status)', 6, 'I-797, Notice of Action, I-192 Permission to Enter As Nonimmigrant'),
('I-485 (U-Status)', 7, 'Copy of Applicant''s Birth Certificate'),
('I-485 (U-Status)', 8, 'Copy of Applicant''s Employment Authorization Card'),
('I-485 (U-Status)', 9, 'Copy of Applicant''s Social Security Card'),
('I-485 (U-Status)', 10, 'Copy of Applicant''s Present and Past Passport (entire pages)'),
('I-485 (U-Status)', 11, 'Affidavit In Support of 3 Year Continuous Presence'),
('I-485 (U-Status)', 12, 'Proof of 3 Year Continuous Presence: Tax Return with W2'),
('I-485 (U-Status)', 13, 'Proof of 3 Year Continuous Presence: Monthly Statements of Utility Bills'),
('I-485 (U-Status)', 14, 'Proof of 3 Year Continuous Presence: Rent Receipts'),
('I-485 (U-Status)', 15, 'Proof of 3 Year Continuous Presence: Lease Contract'),
('I-485 (U-Status)', 16, 'Proof of 3 Year Continuous Presence: Monthly Statements of Cell phone bills'),
('I-485 (U-Status)', 17, 'Proof of 3 Year Continuous Presence: Monthly Statements of Credit Cards'),
('I-485 (U-Status)', 18, 'Proof of 3 Year Continuous Presence: Medical Bills'),
('I-485 (U-Status)', 19, 'Affidavit in Support of Continued Cooperation (Principal only)'),
('I-485 (U-Status)', 20, 'Proof that Discretion Should be Exercised: Family Ties within the United States'),
('I-485 (U-Status)', 21, 'Proof that Discretion Should be Exercised: Residence of Long Duration'),
('I-485 (U-Status)', 22, 'Proof that Discretion Should be Exercised: Hardship to the Applicant or Family'),
('I-485 (U-Status)', 23, 'Proof that Discretion Should be Exercised: Service in the U.S. Armed Forces'),
('I-485 (U-Status)', 24, 'Proof that Discretion Should be Exercised: History of Employment'),
('I-485 (U-Status)', 25, 'Proof that Discretion Should be Exercised: Existence of Business or Property ties'),
('I-485 (U-Status)', 26, 'Evidence of value and service to the community'),
('I-485 (U-Status)', 27, 'Proof of Rehabilitation (if criminal record exists)'),
('I-485 (U-Status)', 28, 'Evidence attesting to good moral character'),
('I-485 (U-Status)', 29, 'I-693 Medical Exam'),
('I-485 (U-Status)', 30, 'I-765 Under (c)(9) Application for Employment Authorization Document'),
('I-485 (U-Status)', 31, 'Passport Pictures (4)');

-- ===============================================
-- 4. I-485 Variation #4: General AOS ('I-485 (General)')
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-485 (General)', 1, 'Filing Fees for I-485: $1,140 & $85 ($1,000 if 245i)'),
('I-485 (General)', 2, 'Passport Photos (4)'),
('I-485 (General)', 3, 'G-28, Notice of Entry of Appearance'),
('I-485 (General)', 4, 'I-797, Notice of Action (if applicable)'),
('I-485 (General)', 5, 'I-485, Application to Register Permanent Residence'),
('I-485 (General)', 6, 'I-485 Supplement A (if applicable)'),
('I-485 (General)', 7, 'Petitioner''s Proof of Status'),
('I-485 (General)', 8, 'Petitioner''s Social Security Card'),
('I-485 (General)', 9, 'Copy of Petitioner''s Birth Certificate'),
('I-485 (General)', 10, 'Translation of Petitioner''s Birth Certificate'),
('I-485 (General)', 11, 'Copy of Beneficiary''s Birth Certificate'),
('I-485 (General)', 12, 'Translation of Beneficiary''s Birth Certificate'),
('I-485 (General)', 13, 'Government Issued Identity Document with Photograph'),
('I-485 (General)', 14, 'Proof of Lawful Entry (Passport page with admission or parole stamp)'),
('I-485 (General)', 15, 'Passport page with nonimmigrant visa'),
('I-485 (General)', 16, 'Form I-94 arrival-departure record'),
('I-485 (General)', 17, 'Marriage Certificate or Other Proof of Relationship'),
('I-485 (General)', 18, 'Divorce Decree (if applicable)'),
('I-485 (General)', 19, 'I-864 Affidavit of Support and I-864A (if applicable)'),
('I-485 (General)', 20, '1040 Income Tax Return for Most Recent Tax Year with W2'),
('I-485 (General)', 21, 'Employment Verification Letter or Pay Stubs'),
('I-485 (General)', 22, 'I-765 under (c)(9) Application for Employment Authorization'),
('I-485 (General)', 23, 'I-693, Medical Exam issued no more than 60 days'),
('I-485 (General)', 24, 'Certified Police and Court Records for Criminal Charges');

-- ===============================================
-- 5. I-751 (Removal of Conditional Status)
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-751', 1, 'Filing fee of $595.00 and $85.00 per application'),
('I-751', 2, 'Attorney''s consultation form'),
('I-751', 3, 'G-28'),
('I-751', 4, 'I-751 Application for Removal of Conditional Status'),
('I-751', 5, 'Petitioner proof of status'),
('I-751', 6, 'Petitioner''s social security card'),
('I-751', 7, 'Beneficiary''s birth certificate'),
('I-751', 8, 'Translation beneficiary''s birth certificate'),
('I-751', 9, 'Marriage certificate and Translation'),
('I-751', 10, 'Birth Certificate of Children born during time of marriage'),
('I-751', 11, 'Lease or Mortgage contracts'),
('I-751', 12, 'Joint Financial Records (Bills, loans, Insurance, Income Taxes, Photos etc.)'),
('I-751', 13, 'Affidavits sworn by at least 2 people'),
('I-751', 14, 'Criminal History (Original or Certified Copies of sentence, probation, rehab...)');

-- ===============================================
-- 6. I-360 (VAWA Self Petition)
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-360', 1, 'G-28'),
('I-360', 2, 'I-360'),
('I-360', 3, 'Index of Documents'),
('I-360', 4, 'Applicants Affidavit'),
('I-360', 5, 'Proof Applicant''s Identity (Birth Certificate, Matricula Consular)'),
('I-360', 6, 'Proof of Marriage to a United States Citizen (Marriage Cert, USA Birth Cert, SSN)'),
('I-360', 7, 'Proof of Good Faith Marriage (ITIN, I-130 Notice, Bank Statements)'),
('I-360', 8, 'Proof of Residence Together (Lease/Homeowner Papers, Pictures, Bank Statements, Insurance)'),
('I-360', 9, 'Proof of Abuse (Applicant''s Affidavits, Counselor Assessment, Witnesses, Police/Court Records)'),
('I-360', 10, 'Proof of Good Moral Character (Letter from Church, FBI Background Check, Police Check)');

-- ===============================================
-- 7. N-400 (Naturalization)
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('N-400', 1, 'Filing fee of $ 640 and $85 per application'),
('N-400', 2, 'G-28'),
('N-400', 3, 'N-400'),
('N-400', 4, 'Photocopy of Permanent Resident Card (Front/Back)'),
('N-400', 5, 'Photocopy of Social Security Card (Front/Back)'),
('N-400', 6, 'Photocopy of Current Marital Status Document'),
('N-400', 7, 'Selective Service Registration Proof'),
('N-400', 8, 'Evidence of Termination of Your Spouse''s Prior Marriage'),
('N-400', 9, '2 Passport Style Pictures if Applicant lives overseas'),
('N-400', 10, 'Interview: Copy of Executed Application'),
('N-400', 11, 'Interview: Original Lawful Permanent Resident Card'),
('N-400', 12, 'Interview: State Issued Identification'),
('N-400', 13, 'Interview: Passport and Travel Documents'),
('N-400', 14, 'Interview: Original Marriage Certificate'),
('N-400', 15, 'Interview: Certified Copy of Marriage Termination Document'),
('N-400', 16, 'Interview: Birth Certificate for all children you claim'),
('N-400', 17, 'Tax Returns for the Past 5 or 3 Years'),
('N-400', 18, 'Evidence of continuous residence (Letter of Employment, Rent, Bank statements)'),
('N-400', 19, 'Certified copy of all Final Disposition of all arrests reports');

-- ===============================================
-- 8. I-821D (DACA Initial)
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-821D', 1, 'Filing fee of $ 495.00'),
('I-821D', 2, 'G-28'),
('I-821D', 3, 'I-821D'),
('I-821D', 4, 'I-765 under category (C)(33)'),
('I-821D', 5, 'I-765WS'),
('I-821D', 6, 'Two passport pictures'),
('I-821D', 7, 'Birth Certificate'),
('I-821D', 8, 'Birth certificate translation'),
('I-821D', 9, 'Picture ID'),
('I-821D', 10, 'Proof of student education status (diploma, GED, in school)'),
('I-821D', 11, 'Proof of coming to the U.S. before the 16th birthday'),
('I-821D', 12, 'Proof of continuously residing in the U.S. since June 15, 2007'),
('I-821D', 13, 'If arrested, provide final disposition');

-- ===============================================
-- 9. I-130 (Petition for Alien Relative)
-- ===============================================
INSERT INTO plantillas_documentos (tipo_tramite, orden, nombre_documento) VALUES
('I-130', 1, '2 Passport Style Pictures for Petitioner (Spouse Case Only)'),
('I-130', 2, '2 Passport Style Pictures for Beneficiary (Spouse Case Only)'),
('I-130', 3, 'Filing fee of $625 Online / $675 Paper'),
('I-130', 4, 'G-28'),
('I-130', 5, 'I-130 Alien Relative Petition'),
('I-130', 6, 'I-130A (Spouse cases only)'),
('I-130', 7, 'Petitioner''s Proof of Status'),
('I-130', 8, 'Petitioner''s Social Security Card'),
('I-130', 9, 'Copy of Beneficiary''s Birth Certificate'),
('I-130', 10, 'Summary Translation of Beneficiary''s Birth Certificate'),
('I-130', 11, 'Copy of Marriage Certificate'),
('I-130', 12, 'Summary Translation of Marriage Certificate'),
('I-130', 13, 'Divorce Decree (If applicable)'),
('I-130', 14, 'Proof of Bona Fide Relationship (Birth Certificates of Children, Joint ownership docs, Lease...)');
