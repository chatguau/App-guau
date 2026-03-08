**Documento de Especificación de Requerimientos (SRS)**

**Sistema de Historia Clínica Veterinaria**

**Versión:** 1.0  
**Fecha:** 31 de enero de 2026  
**Autor:** Equipo de Desarrollo

---

**1\. Introducción**

**1.1 Propósito**

Este documento define las especificaciones funcionales y no funcionales para el desarrollo de una aplicación web de gestión de historias clínicas veterinarias. El sistema permitirá la administración integral de pacientes veterinarios, optimizando los procesos médicos y administrativos en clínicas veterinarias.

**1.2 Alcance**

El Sistema de Historia Clínica Veterinaria (SHCV) es una aplicación web moderna que permitirá:

* Gestión completa de historias clínicas de pacientes veterinarios

* Registro y seguimiento de consultas médicas, diagnósticos y tratamientos

* Administración de procedimientos quirúrgicos y hospitalizaciones

* Gestión documental de exámenes diagnósticos

* Generación de reportes clínicos y estadísticos

* Control de acceso basado en roles de usuario

* Interfaz responsive adaptable a múltiples dispositivos

**1.3 Definiciones, Acrónimos y Abreviaturas**

* **SHCV:** Sistema de Historia Clínica Veterinaria

* **HC:** Historia Clínica

* **UX/UI:** Experiencia de Usuario / Interfaz de Usuario

* **API:** Application Programming Interface

* **CRUD:** Create, Read, Update, Delete

* **Responsive:** Diseño adaptable a diferentes tamaños de pantalla

* **Supabase:** Plataforma de base de datos PostgreSQL como servicio

**1.4 Referencias**

* Buenas prácticas en gestión de historias clínicas veterinarias

* Estándares de seguridad en aplicaciones web

* Documentación oficial de Supabase

* Normativas de protección de datos aplicables

**1.5 Visión General del Documento**

Este documento se estructura en las siguientes secciones: descripción general del sistema, requerimientos funcionales, requerimientos no funcionales, modelo de datos, arquitectura del sistema y consideraciones de implementación.

---

**2\. Descripción General**

**2.1 Perspectiva del Producto**

El SHCV es una aplicación web independiente que utilizará Supabase como backend (base de datos PostgreSQL y autenticación). La aplicación funcionará en navegadores web modernos y será accesible desde computadores, tablets y dispositivos móviles.

**2.2 Funciones del Producto**

**Gestión de Pacientes:**

* Registro y actualización de información de mascotas (especie, raza, edad, peso, color, señas particulares)

* Almacenamiento de datos del propietario (nombre, contacto, dirección)

* Registro de antecedentes médicos y alergias

* Historial completo de consultas y procedimientos

**Gestión Clínica:**

* Registro de consultas médicas con motivo, anamnesis, examen físico

* Registro de diagnósticos y planes de tratamiento

* Creación de fórmulas médicas (prescripciones)

* Seguimiento de evolución clínica

* Gestión de procedimientos quirúrgicos

* Control de hospitalizaciones

**Gestión Documental:**

* Carga y visualización de exámenes de laboratorio

* Almacenamiento de imágenes diagnósticas (radiografías, ecografías)

* Archivo de documentos y reportes médicos

**Reportes y Consultas:**

* Historia clínica completa por paciente

* Consultas médicas por periodo

* Reporte de productividad médica

* Reporte de vacunación

* Búsqueda avanzada de pacientes

**Administración:**

* Gestión de usuarios (médicos veterinarios, auxiliares, administradores)

* Control de acceso basado en roles

* Configuración de parámetros del sistema

**2.3 Características de los Usuarios**

| Rol | Descripción | Nivel Técnico | Permisos |
| :---- | :---- | :---- | :---- |
| Administrador | Gestiona usuarios y configuración del sistema | Medio-Alto | Acceso total |
| Médico Veterinario | Profesional que atiende pacientes | Medio | Crear/editar HC, registrar consultas, procedimientos, generar reportes |
| Auxiliar | Personal de apoyo clínico | Básico-Medio | Registrar pacientes, consultar HC, registro básico |

**2.4 Restricciones**

* La aplicación debe funcionar en navegadores web modernos (Chrome, Firefox, Safari, Edge \- últimas 2 versiones)

* Debe utilizar Supabase como backend exclusivamente

* Debe cumplir con normativas de protección de datos personales

* Requiere conexión a internet para funcionar

* Los tiempos de respuesta no deben exceder 3 segundos para operaciones comunes

**2.5 Suposiciones y Dependencias**

* Los usuarios tendrán acceso a internet estable

* Supabase mantendrá disponibilidad del servicio ≥99.9%

* Los navegadores soportarán tecnologías web modernas (ES6+, CSS3, HTML5)

* Existirá un proceso de capacitación para usuarios finales

* Se realizarán backups periódicos de la base de datos

---

**3\. Requerimientos Funcionales**

**3.1 Módulo de Autenticación y Usuarios**

**RF-001: Registro de Usuario**

**Prioridad:** Alta  
**Descripción:** El sistema debe permitir al administrador registrar nuevos usuarios con su información básica y rol asignado.

**Criterios de Aceptación:**

* Campos obligatorios: nombre completo, email, rol, contraseña inicial

* Validación de formato de email

* Contraseña mínimo 8 caracteres con complejidad adecuada

* Confirmación de registro exitoso

* Usuario creado inactivo hasta activación

**RF-002: Inicio de Sesión**

**Prioridad:** Alta  
**Descripción:** Los usuarios deben poder autenticarse con credenciales válidas.

**Criterios de Aceptación:**

* Login con email y contraseña

* Validación de credenciales contra Supabase Auth

* Redirección al dashboard según rol

* Mensaje de error claro para credenciales incorrectas

* Bloqueo temporal después de 5 intentos fallidos

**RF-003: Gestión de Perfiles**

**Prioridad:** Media  
**Descripción:** Los usuarios pueden actualizar su información de perfil.

**Criterios de Aceptación:**

* Edición de nombre, teléfono, foto de perfil

* Cambio de contraseña con validación de contraseña actual

* Actualización de preferencias de notificación

**RF-004: Control de Acceso por Roles**

**Prioridad:** Alta  
**Descripción:** El sistema debe restringir funcionalidades según el rol del usuario.

**Criterios de Aceptación:**

* Administrador: acceso total

* Médico Veterinario: acceso a módulos clínicos y reportes

* Auxiliar: acceso limitado a registro y consulta

* Validación de permisos en frontend y backend

* Mensajes claros de acceso denegado

**3.2 Módulo de Gestión de Pacientes**

**RF-005: Registro de Paciente**

**Prioridad:** Alta  
**Descripción:** Permite registrar un nuevo paciente veterinario con su información completa.

**Criterios de Aceptación:**

* Campos del paciente: nombre, especie, raza, fecha de nacimiento/edad, sexo, peso, color, señas particulares

* Campos del propietario: nombre, cédula/documento, teléfono(s), email, dirección

* Asignación automática de número de historia clínica único

* Validación de datos obligatorios

* Confirmación de registro exitoso

**RF-006: Búsqueda de Pacientes**

**Prioridad:** Alta  
**Descripción:** Permite buscar pacientes por diferentes criterios.

**Criterios de Aceptación:**

* Búsqueda por: nombre del paciente, nombre del propietario, número de HC, documento del propietario

* Autocompletado durante escritura

* Resultados en tiempo real

* Mostrar información resumida en resultados

* Acceso rápido a la HC desde resultados

**RF-007: Actualización de Información del Paciente**

**Prioridad:** Media  
**Descripción:** Permite modificar la información registrada de un paciente.

**Criterios de Aceptación:**

* Edición de todos los campos del paciente y propietario

* Validación de datos modificados

* Registro de auditoría (quién modificó, cuándo)

* Confirmación antes de guardar cambios

**RF-008: Visualización de Historia Clínica Completa**

**Prioridad:** Alta  
**Descripción:** Muestra toda la información histórica del paciente de forma organizada.

**Criterios de Aceptación:**

* Vista cronológica de todas las consultas

* Acceso a procedimientos quirúrgicos

* Visualización de hospitalizaciones

* Historial de vacunación

* Antecedentes médicos

* Documentos adjuntos

* Navegación intuitiva entre secciones

**3.3 Módulo de Consultas Médicas**

**RF-009: Registro de Consulta**

**Prioridad:** Alta  
**Descripción:** Permite registrar una nueva consulta médica completa.

**Criterios de Aceptación:**

* Campos obligatorios: fecha/hora, médico, motivo de consulta, anamnesis

* Examen físico: temperatura, frecuencia cardíaca, frecuencia respiratoria, peso, condición corporal, hallazgos

* Lista de problemas identificados

* Diagnóstico presuntivo y/o definitivo

* Plan diagnóstico y terapéutico

* Observaciones adicionales

* Autoguardado temporal

**RF-010: Registro de Diagnóstico**

**Prioridad:** Alta  
**Descripción:** Permite documentar diagnósticos asociados a consultas.

**Criterios de Aceptación:**

* Tipo de diagnóstico: presuntivo, definitivo, diferencial

* Descripción detallada del diagnóstico

* CIE-10 veterinario (opcional)

* Vinculación a consulta específica

* Posibilidad de múltiples diagnósticos por consulta

**RF-011: Creación de Fórmula Médica**

**Prioridad:** Alta  
**Descripción:** Genera prescripciones médicas para el paciente.

**Criterios de Aceptación:**

* Medicamento: nombre, presentación, dosis, vía de administración, frecuencia, duración

* Múltiples medicamentos por fórmula

* Recomendaciones adicionales

* Firma digital del médico

* Generación de PDF imprimible

* Vinculación a consulta

**RF-012: Seguimiento de Evolución**

**Prioridad:** Media  
**Descripción:** Registra la evolución clínica del paciente en consultas de seguimiento.

**Criterios de Aceptación:**

* Referencia a consulta o tratamiento previo

* Estado actual del paciente

* Respuesta al tratamiento

* Modificaciones al plan terapéutico

* Nuevos hallazgos o complicaciones

**3.4 Módulo de Procedimientos Quirúrgicos**

**RF-013: Registro de Cirugía**

**Prioridad:** Alta  
**Descripción:** Documenta procedimientos quirúrgicos realizados.

**Criterios de Aceptación:**

* Tipo de procedimiento, fecha/hora, duración

* Equipo quirúrgico (cirujano, anestesiólogo, auxiliares)

* Protocolo anestésico utilizado

* Descripción del procedimiento

* Hallazgos quirúrgicos

* Complicaciones (si aplica)

* Indicaciones postoperatorias

* Estado al finalizar

**RF-014: Control Postoperatorio**

**Prioridad:** Media  
**Descripción:** Registra seguimiento después de cirugía.

**Criterios de Aceptación:**

* Vinculación a cirugía específica

* Evaluación de herida quirúrgica

* Signos vitales

* Nivel de dolor

* Complicaciones presentadas

* Ajustes al tratamiento

* Fecha de próximo control

**3.5 Módulo de Hospitalización**

**RF-015: Registro de Ingreso**

**Prioridad:** Media  
**Descripción:** Registra el ingreso de un paciente para hospitalización.

**Criterios de Aceptación:**

* Fecha/hora de ingreso, motivo

* Médico responsable

* Diagnóstico de ingreso

* Plan de manejo inicial

* Jaula/ubicación asignada

* Estado general al ingreso

**RF-016: Hoja de Evolución Hospitalaria**

**Prioridad:** Media  
**Descripción:** Registro diario de la evolución del paciente hospitalizado.

**Criterios de Aceptación:**

* Múltiples registros por día

* Hora de evaluación

* Signos vitales

* Examen físico

* Procedimientos realizados

* Medicamentos administrados

* Evolución y observaciones

* Médico que evalúa

**RF-017: Registro de Alta**

**Prioridad:** Media  
**Descripción:** Documenta el egreso del paciente hospitalizado.

**Criterios de Aceptación:**

* Fecha/hora de alta

* Tipo de alta: mejoría, remisión, voluntaria, fallecimiento

* Resumen de hospitalización

* Diagnóstico de egreso

* Tratamiento al alta

* Recomendaciones

* Cita de control

**3.6 Módulo de Gestión Documental**

**RF-018: Carga de Documentos**

**Prioridad:** Alta  
**Descripción:** Permite adjuntar archivos a la historia clínica.

**Criterios de Aceptación:**

* Formatos soportados: PDF, JPG, PNG, DICOM

* Tamaño máximo por archivo: 10MB

* Categorización: laboratorio, imágenes, reportes, otros

* Descripción del documento

* Fecha del examen

* Vinculación a consulta o procedimiento

* Previsualización de imágenes

**RF-019: Visualización de Documentos**

**Prioridad:** Alta  
**Descripción:** Permite ver documentos adjuntos.

**Criterios de Aceptación:**

* Visor integrado para PDF e imágenes

* Zoom y navegación en imágenes

* Descarga de documentos

* Organización cronológica

* Filtros por tipo de documento

**RF-020: Eliminación de Documentos**

**Prioridad:** Baja  
**Descripción:** Permite eliminar documentos cargados erróneamente.

**Criterios de Aceptación:**

* Solo usuarios autorizados (médicos, administrador)

* Confirmación antes de eliminar

* Registro en auditoría

* No eliminar físicamente, marcar como eliminado

**3.7 Módulo de Reportes**

**RF-021: Reporte de Historia Clínica Completa**

**Prioridad:** Alta  
**Descripción:** Genera un documento con toda la información del paciente.

**Criterios de Aceptación:**

* Información del paciente y propietario

* Todas las consultas cronológicamente

* Procedimientos quirúrgicos

* Hospitalizaciones

* Vacunaciones

* Formato PDF descargable

* Opción de imprimir

**RF-022: Reporte de Consultas por Periodo**

**Prioridad:** Media  
**Descripción:** Lista consultas realizadas en un rango de fechas.

**Criterios de Aceptación:**

* Filtros: fecha inicio, fecha fin, médico, tipo de consulta

* Información resumida por consulta

* Total de consultas

* Exportación a PDF y Excel

* Gráficos estadísticos opcionales

**RF-023: Reporte de Productividad Médica**

**Prioridad:** Media  
**Descripción:** Muestra estadísticas de actividad por médico.

**Criterios de Aceptación:**

* Periodo seleccionable

* Consultas atendidas por médico

* Cirugías realizadas

* Pacientes nuevos vs reconsultas

* Diagnósticos más frecuentes

* Visualización gráfica

* Exportación a PDF/Excel

**RF-024: Reporte de Vacunación**

**Prioridad:** Media  
**Descripción:** Genera listado de vacunaciones aplicadas.

**Criterios de Aceptación:**

* Filtros por periodo, tipo de vacuna, especie

* Pacientes vacunados

* Vacunas próximas a vencer

* Esquemas incompletos

* Exportación a PDF/Excel

**3.8 Módulo de Vacunación**

**RF-025: Registro de Vacuna**

**Prioridad:** Media  
**Descripción:** Documenta la aplicación de vacunas.

**Criterios de Aceptación:**

* Tipo de vacuna, fecha de aplicación

* Lote, laboratorio, fecha de vencimiento

* Dosis aplicada

* Sitio de aplicación

* Próxima dosis (si aplica)

* Médico responsable

* Reacciones adversas

**RF-026: Esquema de Vacunación**

**Prioridad:** Media  
**Descripción:** Muestra el plan de vacunación del paciente.

**Criterios de Aceptación:**

* Vacunas aplicadas con fechas

* Próximas vacunas pendientes

* Alertas de vacunas vencidas

* Recordatorios automáticos (opcional)

---

**4\. Requerimientos No Funcionales**

**4.1 Rendimiento**

**RNF-001: Tiempo de Respuesta**

* Las operaciones de consulta deben completarse en menos de 2 segundos

* Las operaciones de escritura deben completarse en menos de 3 segundos

* La carga inicial de la aplicación no debe exceder 5 segundos

**RNF-002: Capacidad**

* El sistema debe soportar al menos 50 usuarios concurrentes

* Capacidad de almacenar mínimo 10,000 historias clínicas

* Hasta 100,000 consultas registradas sin degradación significativa

**RNF-003: Escalabilidad**

* Arquitectura debe permitir escalamiento horizontal

* Base de datos debe soportar crecimiento progresivo

**4.2 Seguridad**

**RNF-004: Autenticación**

* Implementar autenticación mediante Supabase Auth

* Tokens JWT para sesiones

* Expiración de sesión después de 8 horas de inactividad

* Cierre de sesión seguro

**RNF-005: Autorización**

* Control de acceso basado en roles (RBAC)

* Validación de permisos en cada operación

* Principio de mínimo privilegio

**RNF-006: Protección de Datos**

* Cifrado de datos en tránsito (HTTPS/TLS)

* Cifrado de datos sensibles en reposo

* Cumplimiento de normativas de protección de datos

* Política de contraseñas fuertes

**RNF-007: Auditoría**

* Registro de operaciones críticas (quién, qué, cuándo)

* Trazabilidad de cambios en historias clínicas

* Logs de acceso al sistema

* Retención de logs por mínimo 1 año

**4.3 Usabilidad**

**RNF-008: Interfaz de Usuario**

* Diseño intuitivo y amigable

* Cumplimiento de principios de UX/UI modernos

* Feedback visual claro para acciones del usuario

* Mensajes de error comprensibles

**RNF-009: Accesibilidad**

* Cumplimiento de estándares WCAG 2.1 nivel AA

* Navegación mediante teclado

* Contraste adecuado de colores

* Textos alternativos en imágenes

**RNF-010: Curva de Aprendizaje**

* Usuario nuevo debe poder realizar operaciones básicas con máximo 2 horas de capacitación

* Ayuda contextual disponible

* Tooltips y guías visuales

**4.4 Compatibilidad**

**RNF-011: Navegadores Web**

* Soporte para Chrome, Firefox, Safari, Edge (últimas 2 versiones)

* Funcionamiento completo en navegadores modernos

* Degradación elegante en navegadores antiguos

**RNF-012: Dispositivos**

* Diseño responsive adaptable a: 

  * Desktop (1920x1080 y superiores)

  * Laptop (1366x768 y similares)

  * Tablet (768x1024 y similares)

  * Móvil (360x640 y superiores)

* Funcionamiento táctil optimizado

**RNF-013: Resoluciones**

* Soporte desde 360px de ancho

* Adaptación automática del layout

* Imágenes responsive

**4.5 Mantenibilidad**

**RNF-014: Código**

* Código limpio y bien documentado

* Uso de patrones de diseño establecidos

* Separación de responsabilidades

* Comentarios en funciones complejas

**RNF-015: Modularidad**

* Arquitectura modular

* Componentes reutilizables

* Bajo acoplamiento, alta cohesión

**RNF-016: Testing**

* Cobertura de pruebas unitarias ≥70%

* Pruebas de integración para flujos críticos

* Pruebas end-to-end automatizadas

**4.6 Disponibilidad**

**RNF-017: Uptime**

* Disponibilidad objetivo: 99.5%

* Mantenimientos programados en horarios de baja demanda

* Notificación previa de mantenimientos

**RNF-018: Recuperación**

* Backups automáticos diarios de base de datos

* Retención de backups por 30 días

* Plan de recuperación ante desastres (RTO \< 4 horas, RPO \< 1 hora)

**4.7 Portabilidad**

**RNF-019: Independencia de Plataforma**

* Funcionamiento en sistemas operativos: Windows, macOS, Linux, iOS, Android

* No requerir instalación de software adicional

* Acceso mediante navegador web únicamente

**4.8 Conformidad Legal**

**RNF-020: Normatividad**

* Cumplimiento de leyes de protección de datos personales aplicables

* Términos de uso y política de privacidad

* Consentimiento informado para tratamiento de datos

---

**5\. Modelo de Datos**

**5.1 Entidades Principales**

**Usuarios (users)**

* id (UUID, PK)

* email (string, unique)

* full\_name (string)

* role (enum: admin, veterinarian, assistant)

* phone (string, nullable)

* avatar\_url (string, nullable)

* is\_active (boolean)

* created\_at (timestamp)

* updated\_at (timestamp)

**Propietarios (owners)**

* id (UUID, PK)

* document\_type (string)

* document\_number (string, unique)

* full\_name (string)

* phone\_primary (string)

* phone\_secondary (string, nullable)

* email (string, nullable)

* address (text, nullable)

* city (string, nullable)

* created\_at (timestamp)

* updated\_at (timestamp)

**Pacientes (patients)**

* id (UUID, PK)

* medical\_record\_number (string, unique)

* name (string)

* species (string)

* breed (string)

* birth\_date (date, nullable)

* approximate\_age (string, nullable)

* sex (enum: male, female)

* weight (decimal)

* color (string)

* distinctive\_marks (text, nullable)

* owner\_id (UUID, FK → owners)

* is\_active (boolean)

* created\_at (timestamp)

* updated\_at (timestamp)

**Antecedentes Médicos (medical\_history)**

* id (UUID, PK)

* patient\_id (UUID, FK → patients)

* allergies (text, nullable)

* chronic\_conditions (text, nullable)

* previous\_surgeries (text, nullable)

* current\_medications (text, nullable)

* observations (text, nullable)

* updated\_at (timestamp)

**Consultas (consultations)**

* id (UUID, PK)

* patient\_id (UUID, FK → patients)

* veterinarian\_id (UUID, FK → users)

* consultation\_date (timestamp)

* reason (text)

* anamnesis (text)

* temperature (decimal, nullable)

* heart\_rate (integer, nullable)

* respiratory\_rate (integer, nullable)

* weight (decimal, nullable)

* body\_condition (integer, nullable)

* physical\_exam\_findings (text, nullable)

* problems\_identified (text, nullable)

* observations (text, nullable)

* created\_at (timestamp)

* updated\_at (timestamp)

**Diagnósticos (diagnoses)**

* id (UUID, PK)

* consultation\_id (UUID, FK → consultations)

* diagnosis\_type (enum: presumptive, definitive, differential)

* description (text)

* cie10\_code (string, nullable)

* created\_at (timestamp)

**Fórmulas Médicas (prescriptions)**

* id (UUID, PK)

* consultation\_id (UUID, FK → consultations)

* prescription\_date (timestamp)

* additional\_recommendations (text, nullable)

* veterinarian\_id (UUID, FK → users)

* created\_at (timestamp)

**Medicamentos Prescritos (prescribed\_medications)**

* id (UUID, PK)

* prescription\_id (UUID, FK → prescriptions)

* medication\_name (string)

* presentation (string)

* dosage (string)

* route (string)

* frequency (string)

* duration (string)

* created\_at (timestamp)

**Cirugías (surgeries)**

* id (UUID, PK)

* patient\_id (UUID, FK → patients)

* surgery\_date (timestamp)

* procedure\_type (string)

* duration\_minutes (integer)

* surgeon\_id (UUID, FK → users)

* anesthesiologist\_id (UUID, FK → users, nullable)

* anesthetic\_protocol (text)

* procedure\_description (text)

* surgical\_findings (text, nullable)

* complications (text, nullable)

* postoperative\_instructions (text)

* final\_status (string)

* created\_at (timestamp)

* updated\_at (timestamp)

**Controles Postoperatorios (postoperative\_controls)**

* id (UUID, PK)

* surgery\_id (UUID, FK → surgeries)

* control\_date (timestamp)

* wound\_evaluation (text)

* vital\_signs (jsonb)

* pain\_level (integer)

* complications (text, nullable)

* treatment\_adjustments (text, nullable)

* next\_control\_date (date, nullable)

* veterinarian\_id (UUID, FK → users)

* created\_at (timestamp)

**Hospitalizaciones (hospitalizations)**

* id (UUID, PK)

* patient\_id (UUID, FK → patients)

* admission\_date (timestamp)

* discharge\_date (timestamp, nullable)

* admission\_reason (text)

* admission\_diagnosis (text)

* responsible\_veterinarian\_id (UUID, FK → users)

* cage\_location (string, nullable)

* admission\_status (text)

* discharge\_type (enum: improvement, remission, voluntary, death, nullable)

* discharge\_summary (text, nullable)

* discharge\_diagnosis (text, nullable)

* discharge\_treatment (text, nullable)

* discharge\_recommendations (text, nullable)

* follow\_up\_date (date, nullable)

* created\_at (timestamp)

* updated\_at (timestamp)

**Evoluciones Hospitalarias (hospitalization\_evolutions)**

* id (UUID, PK)

* hospitalization\_id (UUID, FK → hospitalizations)

* evolution\_datetime (timestamp)

* vital\_signs (jsonb)

* physical\_exam (text)

* procedures\_performed (text, nullable)

* medications\_administered (text, nullable)

* evolution\_notes (text)

* veterinarian\_id (UUID, FK → users)

* created\_at (timestamp)

**Vacunas (vaccinations)**

* id (UUID, PK)

* patient\_id (UUID, FK → patients)

* vaccine\_type (string)

* application\_date (date)

* lot\_number (string)

* laboratory (string)

* expiration\_date (date)

* dose (string)

* application\_site (string)

* next\_dose\_date (date, nullable)

* adverse\_reactions (text, nullable)

* veterinarian\_id (UUID, FK → users)

* created\_at (timestamp)

**Documentos (documents)**

* id (UUID, PK)

* patient\_id (UUID, FK → patients)

* consultation\_id (UUID, FK → consultations, nullable)

* surgery\_id (UUID, FK → surgeries, nullable)

* document\_type (enum: laboratory, imaging, report, other)

* file\_name (string)

* file\_url (string)

* file\_size (integer)

* mime\_type (string)

* description (text, nullable)

* exam\_date (date, nullable)

* uploaded\_by (UUID, FK → users)

* is\_deleted (boolean)

* created\_at (timestamp)

**Auditoría (audit\_logs)**

* id (UUID, PK)

* user\_id (UUID, FK → users)

* action (string)

* table\_name (string)

* record\_id (UUID)

* old\_values (jsonb, nullable)

* new\_values (jsonb, nullable)

* ip\_address (string, nullable)

* created\_at (timestamp)

**5.2 Relaciones**

* Un **propietario** puede tener múltiples **pacientes** (1:N)

* Un **paciente** pertenece a un **propietario** (N:1)

* Un **paciente** tiene múltiples **consultas** (1:N)

* Una **consulta** puede tener múltiples **diagnósticos** (1:N)

* Una **consulta** puede tener una **fórmula médica** (1:1)

* Una **fórmula médica** tiene múltiples **medicamentos prescritos** (1:N)

* Un **paciente** puede tener múltiples **cirugías** (1:N)

* Una **cirugía** puede tener múltiples **controles postoperatorios** (1:N)

* Un **paciente** puede tener múltiples **hospitalizaciones** (1:N)

* Una **hospitalización** tiene múltiples **evoluciones** (1:N)

* Un **paciente** tiene múltiples **vacunas** (1:N)

* Un **paciente** tiene múltiples **documentos** (1:N)

* Un **usuario** (veterinario) atiende múltiples **consultas** (1:N)

---

**6\. Arquitectura del Sistema**

**6.1 Arquitectura General**

El sistema seguirá una arquitectura de **aplicación web de tres capas**:

**Capa de Presentación (Frontend):**

* Framework: React.js o Vue.js

* Librería UI: Tailwind CSS o Material-UI

* Gestión de estado: Redux o Zustand

* Cliente HTTP: Axios

* Routing: React Router

**Capa de Lógica de Negocio (Backend/API):**

* Supabase PostgreSQL Database

* Supabase Auth para autenticación

* Supabase Storage para archivos

* Row Level Security (RLS) para seguridad a nivel de datos

* Edge Functions (opcional) para lógica compleja

**Capa de Datos:**

* PostgreSQL (a través de Supabase)

* Supabase Storage para documentos e imágenes

**6.2 Componentes del Sistema**

**Frontend Web Application:**

* Módulo de autenticación

* Dashboard principal

* Módulo de gestión de pacientes

* Módulo de consultas médicas

* Módulo de procedimientos

* Módulo de reportes

* Módulo de administración

**Backend Services (Supabase):**

* Database PostgreSQL

* Authentication Service

* Storage Service

* Realtime subscriptions (opcional)

* Edge Functions

**Integraciones:**

* Generación de PDFs (librerías como jsPDF o PDFKit)

* Visualización de imágenes DICOM (opcional, librerías especializadas)

**6.3 Diagrama de Arquitectura Conceptual**

┌─────────────────────────────────────────────────┐

│           NAVEGADOR WEB (Cliente)               │

│  ┌──────────────────────────────────────────┐   │

│  │     Aplicación Web Frontend              │   │

│  │  (React/Vue \+ Tailwind/Material-UI)      │   │

│  └──────────────────────────────────────────┘   │

└─────────────────────────────────────────────────┘

                      │

                      │ HTTPS/WSS

                      ▼

┌─────────────────────────────────────────────────┐

│              SUPABASE PLATFORM                  │

│  ┌──────────────┐  ┌───────────┐  ┌──────────┐ │

│  │   Auth       │  │ Database  │  │ Storage  │ │

│  │   Service    │  │PostgreSQL │  │ Service  │ │

│  └──────────────┘  └───────────┘  └──────────┘ │

│  ┌──────────────┐  ┌───────────┐               │

│  │   Realtime   │  │   Edge    │               │

│  │ Subscriptions│  │ Functions │               │

│  └──────────────┘  └───────────┘               │

└─────────────────────────────────────────────────┘

**6.4 Seguridad en la Arquitectura**

**Autenticación:**

* JWT tokens gestionados por Supabase Auth

* Refresh tokens para sesiones persistentes

* Magic links o autenticación por email (opcional)

**Autorización:**

* Row Level Security (RLS) en PostgreSQL

* Políticas definidas por rol

* Validación en frontend y backend

**Protección de Datos:**

* HTTPS obligatorio

* CORS configurado apropiadamente

* Sanitización de entradas

* Prepared statements para queries

---

**7\. Consideraciones de Implementación**

**7.1 Tecnologías Recomendadas**

**Frontend:**

* React 18+ o Vue 3+

* TypeScript (altamente recomendado)

* Tailwind CSS o Material-UI

* React Query o SWR para data fetching

* Formik o React Hook Form para formularios

* Yup o Zod para validación

* Recharts o Chart.js para gráficos

**Backend:**

* Supabase (PostgreSQL, Auth, Storage)

* Edge Functions con Deno (si se requiere lógica serverless)

**Herramientas de Desarrollo:**

* Git para control de versiones

* ESLint y Prettier para código limpio

* Jest o Vitest para testing

* Cypress o Playwright para E2E testing

**Despliegue:**

* Vercel, Netlify o similares para frontend

* Supabase maneja el backend automáticamente

**7.2 Fases de Implementación**

**Fase 1 \- Fundamentos (4-6 semanas):**

* Configuración de proyecto y repositorio

* Setup de Supabase (database, auth)

* Diseño e implementación del modelo de datos

* Módulo de autenticación

* Layout base y sistema de diseño

* Módulo de gestión de usuarios

**Fase 2 \- Gestión de Pacientes (3-4 semanas):**

* CRUD de pacientes y propietarios

* Búsqueda de pacientes

* Vista de historia clínica

* Antecedentes médicos

**Fase 3 \- Consultas Médicas (4-5 semanas):**

* Registro de consultas

* Diagnósticos

* Fórmulas médicas

* Seguimiento de evolución

**Fase 4 \- Procedimientos (3-4 semanas):**

* Módulo de cirugías

* Controles postoperatorios

* Módulo de hospitalización

* Evoluciones hospitalarias

**Fase 5 \- Complementarios (2-3 semanas):**

* Gestión documental

* Módulo de vacunación

* Sistema de notificaciones (opcional)

**Fase 6 \- Reportes (2-3 semanas):**

* Reporte de historia clínica

* Reportes estadísticos

* Reporte de vacunación

* Exportación a PDF/Excel

**Fase 7 \- Testing y Refinamiento (2-3 semanas):**

* Testing integral

* Corrección de bugs

* Optimización de rendimiento

* Ajustes de UX/UI

**Fase 8 \- Despliegue y Capacitación (1-2 semanas):**

* Despliegue a producción

* Documentación de usuario

* Capacitación de usuarios

* Monitoreo post-lanzamiento

**7.3 Consideraciones de Diseño UX/UI**

**Principios de Diseño:**

* Simplicidad y claridad

* Jerarquía visual clara

* Feedback inmediato

* Consistencia en toda la aplicación

* Accesibilidad

**Flujos Críticos a Optimizar:**

* Búsqueda y selección de paciente

* Registro de consulta (flujo más frecuente)

* Visualización de historia clínica

* Generación de reportes

**Responsive Design:**

* Mobile-first approach

* Breakpoints estándar (sm, md, lg, xl)

* Menús colapsables en móvil

* Touch-friendly en dispositivos táctiles

**7.4 Plan de Pruebas**

**Pruebas Unitarias:**

* Funciones de utilidad

* Validaciones

* Componentes individuales

* Servicios de datos

**Pruebas de Integración:**

* Flujos completos (ej: registrar consulta completa)

* Integración con Supabase

* Autenticación y autorización

**Pruebas E2E:**

* Casos de uso principales

* Flujos críticos del negocio

* Diferentes roles de usuario

**Pruebas de Usabilidad:**

* Testing con usuarios reales

* Feedback sobre UX

* Identificación de puntos de fricción

**Pruebas de Rendimiento:**

* Carga de páginas

* Consultas a base de datos

* Manejo de múltiples usuarios concurrentes

**Pruebas de Seguridad:**

* Penetration testing básico

* Validación de permisos

* Protección contra ataques comunes (XSS, CSRF, SQL Injection)

**7.5 Mantenimiento y Evolución**

**Monitoreo:**

* Logs de errores (ej: Sentry)

* Métricas de uso (ej: Google Analytics, Mixpanel)

* Monitoreo de rendimiento

* Uptime monitoring

**Actualizaciones:**

* Actualizaciones de seguridad mensuales

* Nuevas funcionalidades trimestrales

* Refactorización continua del código

**Soporte:**

* Canal de soporte para usuarios

* Sistema de tickets para bugs

* Documentación actualizada

* FAQ y base de conocimientos

---

**8\. Glosario**

* **Historia Clínica (HC):** Documento que contiene el registro completo de la información médica de un paciente.

* **Anamnesis:** Información recopilada mediante preguntas al propietario sobre el historial y síntomas del paciente.

* **Diagnóstico Presuntivo:** Diagnóstico preliminar basado en los síntomas y examen físico.

* **Diagnóstico Definitivo:** Diagnóstico confirmado mediante pruebas diagnósticas.

* **Fórmula Médica:** Prescripción de medicamentos y tratamientos.

* **RLS (Row Level Security):** Característica de PostgreSQL que permite definir políticas de acceso a nivel de fila.

* **JWT (JSON Web Token):** Estándar para tokens de autenticación.

* **CRUD:** Create, Read, Update, Delete \- operaciones básicas de base de datos.

---

**9\. Anexos**

**9.1 Mockups y Wireframes**

(Esta sección debe incluir diseños visuales de las principales pantallas \- se recomienda crearlos con Figma, Sketch o similar)

**9.2 Diccionario de Datos Extendido**

(Descripción detallada de cada campo de cada tabla, incluyendo tipos de datos, restricciones, valores por defecto, etc.)

**9.3 Casos de Uso Detallados**

(Descripción paso a paso de los casos de uso principales con actores, precondiciones, flujo normal, flujos alternativos, postcondiciones)

**9.4 Matriz de Trazabilidad**

(Tabla que relaciona requerimientos funcionales con casos de uso, componentes del sistema y casos de prueba)

