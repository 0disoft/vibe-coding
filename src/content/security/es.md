# Política de Seguridad

> Última actualización: {{LAST_UPDATED}}

## Principios y Tecnologías de Protección de Datos

Los datos de los usuarios se procesan de forma segura con medidas de protección aplicadas en múltiples capas, incluido el cifrado en reposo y TLS en tránsito.

### Protección de Contraseñas
**Las contraseñas de los usuarios nunca se almacenan en texto plano y están protegidas utilizando las últimas tecnologías de hash.**
- **Algoritmo**: {{ENC_ALGO_PASSWORD}}
- **Razón**: {{ENC_REASON_PASSWORD}}
- Se aplica una Sal (Salt) única a cada contraseña para evitar ataques de tabla arcoíris.

### Cifrado de Datos
**La información confidencial se cifra inmediatamente antes del almacenamiento, con una gestión de claves estrictamente separada.**
- **Algoritmo**: {{ENC_ALGO_DATA}}
- **Razón**: {{ENC_REASON_DATA}}
- **Derivación de Claves**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Utilizamos el Cifrado de Sobre (Envelope Encryption) para proteger las Claves de Cifrado de Datos (DEK) con Claves de Cifrado de Claves (KEK) separadas.

### Integridad de los Datos
**Se utilizan funciones hash de alto rendimiento para verificar que los datos críticos del sistema no hayan sido manipulados.**
- **Algoritmo**: {{ENC_ALGO_INTEGRITY}}
- **Razón**: {{ENC_REASON_INTEGRITY}}

### Seguridad del Transporte
**Toda la comunicación entre los usuarios y los servidores está protegida por un túnel cifrado utilizando los últimos protocolos de seguridad.**
- **Protocolo**: {{ENC_ALGO_TRANSPORT}}
- **Razón**: {{ENC_REASON_TRANSPORT}}
- Se impone HTTPS para todas las comunicaciones y se aplica HSTS para prevenir estrictamente ataques de degradación.

## Seguridad Administrativa y Física

Más allá de las medidas técnicas, gestionamos minuciosamente la seguridad en relación con las personas y los procesos.

- **Control de Acceso de Empleados**: El acceso a los datos se otorga solo al personal esencial según el 'Principio de Privilegio Mínimo'. Todo el historial de acceso se registra y audita. El acceso sin motivo legítimo está estrictamente prohibido.
- **Seguridad Física**: Toda la infraestructura en la nube de terceros opera en centros de datos que han obtenido certificaciones de seguridad física como ISO 27001.

## Seguridad de Cuenta y Sesión

- **Protección de Inicio de Sesión**: Aplicamos límites de intentos de inicio de sesión y mecanismos de retraso para bloquear ataques automatizados de fuerza bruta.
- **Gestión de Sesiones**: Las sesiones expiran automáticamente después de un período de inactividad, y se envían notificaciones para cambios importantes en la cuenta.
- **Autenticación de Dos Factores**: Planeamos introducir la funcionalidad 2FA en el futuro.

## Seguridad de la Aplicación

Diseñamos teniendo en cuenta las mejores prácticas de seguridad, como OWASP Top 10, desde la etapa de desarrollo.

- **Validación de Entrada**: Se utilizan declaraciones preparadas y ORM para consultas de bases de datos, y la entrada del usuario se valida tanto en el lado del servidor como en el del cliente.
- **Defensa contra Ataques**: Se aplican tokens CSRF, atributos de cookie SameSite y CSP (Política de Seguridad de Contenido) para mitigar el secuestro de sesiones y los ataques de inyección de scripts.

## Seguridad de la Cadena de Suministro de Software

- **Gestión de Dependencias**: Las bibliotecas y paquetes externos solo se instalan desde registros oficiales, y se aseguran versiones verificadas a través de archivos de bloqueo.
- **Comprobaciones de Vulnerabilidad**: Los informes de vulnerabilidad se revisan periódicamente y las dependencias de alto riesgo se priorizan para las actualizaciones.

## Retención y Eliminación de Datos

- **Eliminación de Cuenta**: Tras la solicitud de eliminación de cuenta, los datos relacionados se destruyen permanentemente después de un período de gracia de 30 días (para recuperación de eliminación accidental).
- **Datos de Respaldo**: Las copias de seguridad para la estabilidad del sistema se conservan por un máximo de 90 días y luego se eliminan de forma segura. Debido a limitaciones técnicas, la eliminación completa de los sistemas de respaldo puede requerir tiempo adicional.
- **Datos de Registro**: Los registros de acceso se conservan durante 1 año para el análisis de amenazas de seguridad a largo plazo y la identificación de tendencias.
- **Excepción de Retención Legal**: Los datos requeridos por ley para ser conservados por un período específico pueden almacenarse por separado durante el tiempo aplicable.

## Respuesta a Incidentes

En caso de un incidente de seguridad, seguimos estos procedimientos para una respuesta rápida y minimización de daños:

1. **Detección y Contención (Inmediata)**: Aislar amenazas y prevenir daños mayores.
2. **Análisis de Impacto**: Evaluar el alcance y la gravedad lo más rápido posible, generalmente en cuestión de horas.
3. **Notificación al Usuario**: Para incidentes que afectan a los usuarios (por ejemplo, fugas de datos), notificar a los usuarios lo más rápido posible y cumplir con los plazos legales (por ejemplo, 72 horas).
4. **Divulgación Transparente**: Publicar un informe detallado (causa, acciones, medidas preventivas) después de que se resuelva el incidente.

## Auditorías de Seguridad y Servicios de Terceros

- **Auditorías de Seguridad**: Actualmente estamos en la fase de estabilización del servicio y realizamos revisiones periódicas de código interno y controles de seguridad. Planeamos introducir auditorías de seguridad periódicas de terceros a medida que el servicio crezca.
- **Infraestructura de Terceros**: Nos adherimos al principio de no almacenar información confidencial no cifrada directamente. Para funciones principales como pagos y autenticación, utilizamos servicios de confianza ({{THIRD_PARTY_PROVIDERS}}, etc.) que han obtenido certificaciones de seguridad reconocidas internacionalmente (SOC 2, ISO 27001) o se someten a evaluaciones de seguridad equivalentes regularmente.

## Recomendaciones de Seguridad para Usuarios

La seguridad de la cuenta es una responsabilidad compartida.

- **Contraseñas Seguras**: Utilice contraseñas únicas y complejas que no se usen en otros sitios.
- **Cuidado con el Phishing**: Tenga cuidado con los mensajes que dicen ser correos electrónicos oficiales y verifique la dirección antes de hacer clic en los enlaces.

## Contacto

Si tiene alguna pregunta sobre nuestra Política de Seguridad, contáctenos en [{{EMAIL}}](mailto:{{EMAIL}}).

Para informes de vulnerabilidad y políticas de protección de investigadores, consulte nuestra página del [Programa de Bug Bounty](/es/bug-bounty).
