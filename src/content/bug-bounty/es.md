# Programa de Bug Bounty

> Última actualización: {{LAST_UPDATED}}

## Introducción

En {{SITE_NAME}}, colaboramos con investigadores de seguridad para crear un entorno de Internet más seguro. Si ha encontrado una vulnerabilidad de seguridad en nuestro servicio, comuníquese con nosotros de inmediato.

Este programa opera actualmente como un **Canal de Divulgación de Vulnerabilidades** centrado en la notificación responsable y la colaboración en lugar de recompensas monetarias. Valoramos y cooperamos de manera transparente con los investigadores que divulgan vulnerabilidades de forma ética.

## Alcance (In-Scope)

Los investigadores solo pueden probar los siguientes dominios y servicios:

- Sitio web oficial de {{SITE_NAME}} y sus subdominios
- Aplicaciones móviles oficiales de {{SITE_NAME}} (cuando estén disponibles)
- Endpoints de API operados directamente por {{SITE_NAME}}

Los dominios y servicios de terceros (pasarelas de pago, herramientas de análisis, proveedores de alojamiento, etc.) no listados anteriormente no están cubiertos por este programa. Si no está seguro de si un objetivo está dentro del alcance, contáctenos antes de realizar la prueba.

## Política de Recompensas

Actualmente, el Programa de Bug Bounty de {{SITE_NAME}} no ofrece recompensas monetarias regulares. Sin embargo, para mostrar nuestro agradecimiento por contribuciones significativas, operamos lo siguiente:

- **Salón de la Fama (Hall of Fame)**: Listado de los nombres de los investigadores que informaron vulnerabilidades válidas (cuando esté operativo).
- **Reconocimiento Público**: Proporcionar reconocimiento público o una carta de recomendación con el consentimiento del investigador.
- **Prioridad Futura**: Proporcionar oportunidades de participación prioritaria si hacemos la transición a un programa pago en el futuro.

Podemos introducir un sistema de recompensas monetarias (Bounty) en el futuro dependiendo del presupuesto y la escala del servicio, y lo anunciaremos en esta página si se implementa.

## Criterios de Severidad

| Severidad | CVSS | Ejemplos |
|---|---|---|
| Critical | 9.0-10.0 | Ejecución remota de código (RCE), fuga completa de BD, toma masiva de cuentas |
| High | 7.0-8.9 | Inyección SQL, XSS almacenado, elusión de autenticación |
| Medium | 4.0-6.9 | XSS reflejado, CSRF en acciones sensibles, divulgación de información |
| Low | 0.1-3.9 | Falta de encabezados de seguridad, divulgación de versión |

La severidad puede ajustarse según el impacto real.

## Reporte de Vulnerabilidades

### Canales de Reporte

- **Correo electrónico**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Asunto**: [Security Report] Vulnerability Summary (Resumen de la vulnerabilidad)
- **Idioma**: Por favor escriba en coreano, inglés o español.

### Formato del Reporte

Para ayudarnos a analizar y reproducir el problema, incluya lo siguiente:

1. Tipo de vulnerabilidad y descripción detallada.
2. Pasos específicos para reproducir el problema (incluidos scripts o líneas de comando).
3. URL, endpoints de API o componentes afectados.
4. Código de prueba de concepto (PoC) o capturas de pantalla.

### Estándares de Calidad del Reporte

- Es posible que no se acepten informes que no se puedan reproducir o que carezcan de detalles suficientes.
- No se aceptan informes de resultados de escáneres automatizados.
- **Duplicados**: Las vulnerabilidades duplicadas solo se acreditan al primer reportero. (Basado en la marca de tiempo de recepción del servidor de correo electrónico)

### Proceso

1. **Confirmación de Recepción**: Enviaremos un correo electrónico de confirmación dentro de las 72 horas posteriores a su informe.
2. **Análisis y Planificación**: Una vez verificada la vulnerabilidad, evaluaremos su severidad y le informaremos el tiempo estimado de corrección. Si no podemos cumplir con la fecha límite, explicaremos el motivo y proporcionaremos un cronograma actualizado.
3. **Resolución y Notificación**: Le notificaremos una vez que se complete el parche. La resolución puede llevar tiempo si se requieren cambios estructurales para la estabilidad del servicio.
4. **Divulgación y Reconocimiento**: Una vez resuelto, decidiremos sobre la divulgación en consulta con el investigador. Los informes válidos serán reconocidos de acuerdo con la 'Política de Recompensas' anterior.
5. **Emisión de CVE**: Para vulnerabilidades significativas, podemos solicitar la emisión de un número CVE con el consentimiento del reportero.

### Política de Divulgación Pública (Public Disclosure)

- Recomendamos la divulgación después de que se complete el parche y solicitamos que comparta los detalles de la divulgación con nosotros con anticipación.
- Si no se toman las medidas adecuadas dentro de los **60 días** posteriores al informe, el reportero tiene derecho a divulgar los detalles de la vulnerabilidad de una manera acordada mutuamente. (Sin embargo, podemos solicitar un ajuste de horario para problemas complejos).
- En casos urgentes donde se observe una explotación activa, podemos coordinar con usted para una divulgación más temprana.

## Política y Pautas de Prueba

Siga las siguientes pautas para realizar pruebas de vulnerabilidad seguras.

### Actividades Permitidas

- Probar vulnerabilidades utilizando cuentas de su propiedad o cuentas de prueba que haya creado.
- **Verificación Mínima**: Acceda solo a los datos mínimos necesarios para probar la vulnerabilidad. Si accede accidentalmente a información confidencial de otros, deténgase de inmediato e incluya solo información enmascarada en su informe.

### Entorno de Prueba

- **Solicitud de Cuenta de Prueba**: Si necesita una cuenta de prueba, puede solicitarla en [{{EMAIL}}](mailto:{{EMAIL}}).
- **Escaneos Automatizados**: Se permiten escaneos ligeros, pero los escaneos de alta carga que generan solicitudes excesivas por segundo o afectan la calidad del servicio requieren coordinación previa.

### Actividades Prohibidas (Fuera del Alcance)

Las siguientes actividades están estrictamente prohibidas y es posible que no estén legalmente protegidas si se violan:

- Ejecutar **escaneos automatizados excesivos** (a un nivel que cause carga en el servicio) sin coordinación previa.
- Cualquier actividad que agote intencionalmente los recursos del servidor (CPU, memoria, disco, ancho de banda de red).
- Acceder o modificar las cuentas, datos o información personal de otros usuarios.
- Ingeniería social (phishing, etc.) o ataques de seguridad física.

### Fuera del Alcance Explícito (Out-of-Scope)

- Vulnerabilidades encontradas en servicios o infraestructura de terceros.
- Seguridad física, sistemas de RR.HH., redes internas.
- Vulnerabilidades ya públicas o informes duplicados.
- Problemas causados únicamente por el envío de correos electrónicos no deseados (spam) o phishing.

### Vulnerabilidades de Bajo Riesgo (No Aceptadas)

Los siguientes se excluyen del programa ya que presentan un riesgo de seguridad bajo o son un comportamiento intencionado:

- CSRF de bajo impacto, como CSRF de cierre de sesión
- Clickjacking en páginas sin información confidencial
- Divulgación simple de versión (banner grabbing)
- Faltan configuraciones de seguridad sin una ruta de explotación probada (por ejemplo, falta de encabezados de seguridad sin impacto directo, políticas de envío de correo electrónico no configuradas, etc.)
- Autocompletar del navegador habilitado

Sin embargo, incluso los elementos anteriores pueden evaluarse si se encadenan con otras vulnerabilidades para probar un escenario de ataque real.

### Protección del Investigador (Safe Harbor)

Si investiga e informa vulnerabilidades de buena fe y en cumplimiento con esta política, prometemos lo siguiente **en la medida permitida por la ley aplicable**:

1. Consideramos sus actividades de investigación como investigación de seguridad autorizada y no tomaremos ninguna acción legal civil o penal en su contra.
2. No lo reportaremos voluntariamente a las fuerzas del orden ni presentaremos una denuncia.
3. Si un tercero inicia una acción legal con respecto a sus actividades de investigación, brindaremos apoyo dentro de un rango razonable, como proporcionar documentación que demuestre que es un investigador que cumple con las normas.

Sin embargo, Safe Harbor no se aplica en los siguientes casos:

- Violar claramente las actividades prohibidas en este documento.
- Pruebas no autorizadas de sistemas o infraestructura de terceros fuera de nuestro control.

## Contacto

Si tiene alguna pregunta sobre nuestro Programa de Bug Bounty, no dude en contactarnos en [{{EMAIL}}](mailto:{{EMAIL}}).
