---
title: "Diseño de Bases de Datos para el Control de Activos TI (ITAM)"
description: "Cómo estructurar tablas y relaciones para rastrear hardware, software y licencias, usando diagramas entidad-relación. Una guía práctica sin necesidad de escribir código complejo."
pubDate: 2026-05-13
banner: "/blog/basededatos.jpg"
tags: ["ITAM", "bases de datos", "modelado de datos"]
format: "guía-técnica"
---

# Guía Práctica: Diseño de Bases de Datos para el Control de Activos (ITAM)

---

## De la teoría a la práctica

En el artículo anterior se presentaron los fundamentos del ITAM. Ahora se aborda la **implementación técnica** del repositorio central que da soporte a esos procesos: una base de datos relacional.

Una base de datos bien diseñada permite responder en segundos preguntas como:
- ¿Cuántos portátiles tiene el departamento de ventas?
- ¿Qué licencias de Adobe están asignadas a usuarios que ya no pertenecen a la empresa?
- ¿Qué equipos tienen más de 4 años y deberían renovarse?

En esta guía se explica **cómo estructurar las tablas y sus relaciones** para que cualquier administrador pueda implementarlo en SQL Server, MariaDB o similares, sin necesidad de escribir código complicado.

---

## Principios básicos del diseño

Antes de definir las tablas, se aplican tres principios fundamentales:

1. **Normalización**  
   Evitar repetir información. Por ejemplo, el nombre de un departamento no debe guardarse en cada fila de la tabla de activos; se crea una tabla separada para departamentos y se relaciona mediante una clave.

2. **Integridad referencial**  
   Asegurar que no existan licencias asignadas a equipos que ya fueron dados de baja. Se usan relaciones entre tablas (lo que en SQL se llaman claves foráneas).

3. **Auditoría y trazabilidad**  
   Incluir fechas de creación y modificación para saber quién cambió qué y cuándo.

---

## Entidades principales (las "cajas" de información)

Estas son las tablas necesarias y lo que guarda cada una:

### 1. Departamentos
Almacena los nombres de las áreas de la empresa (Ventas, TI, Marketing, etc.). Cada departamento tiene un identificador único y un nombre.

### 2. Ubicaciones
Registra dónde están físicamente los equipos (ej: "Edificio A, Planta 3, Sala 12"). Permite saber, por ejemplo, qué portátiles están en la oficina de Madrid.

### 3. Modelos de hardware
Catálogo de modelos de equipos: portátiles, servidores, monitores, periféricos. Guarda fabricante (Dell, HP), nombre del modelo (Latitude 5430) y especificaciones técnicas (RAM, disco).

### 4. Activos de hardware
Es el corazón del sistema. Cada fila representa un equipo físico real, con su número de serie único, fecha de compra, estado actual (operativo, en reparación, almacenado o dado de baja) y costo de adquisición. Se relaciona con modelos, ubicaciones y departamentos.

### 5. Software
Lista de programas informáticos: nombre (Microsoft Office 365), fabricante y versión.

### 6. Licencias
Registra los contratos o claves adquiridas. Incluye el tipo de licencia (perpetua, suscripción anual), fecha de compra, fecha de expiración (si la tiene) y cuántas instalaciones permite como máximo.

### 7. Asignaciones (histórico)
Guarda qué usuario usó cada equipo y durante qué período. Así se sabe quién tiene hoy el portátil y quién lo tuvo antes.

### 8. Software instalado
Relaciona activos con software. Permite saber qué programas están instalados en cada equipo y qué licencia se aplicó.

---

## Diagrama de relaciones (qué se conecta con qué)

- Un **activo de hardware** pertenece a un **modelo** (un modelo puede tener muchos activos).
- Un **activo** puede estar en una **ubicación** (opcional) y pertenecer a un **departamento**.
- Un **activo** puede tener muchas **asignaciones** a lo largo del tiempo (un empleado lo usa, luego otro).
- Un **software** puede tener varias **licencias** (por ejemplo, versiones 2021 y 2024).
- La tabla **software instalado** conecta activos con software, y opcionalmente con una licencia específica.

---

## Estructura de cada tabla (columnas y tipo de información)

A continuación se describe cada tabla con sus columnas, sin usar sintaxis de código.

### Tabla: departamentos
- **id_departamento**: número único que identifica al departamento.
- **nombre**: texto de hasta 100 caracteres (ej. "Ventas").

### Tabla: ubicaciones
- **id_ubicacion**: número único.
- **nombre**: texto (ej. "Edificio Central - Oficina 204").

### Tabla: modelos_hardware
- **id_modelo**: número único.
- **tipo_equipo**: puede ser "portátil", "servidor", "monitor" o "periférico".
- **fabricante**: texto (ej. "Dell").
- **nombre_modelo**: texto (ej. "Latitude 5430").
- **especificaciones**: texto largo (RAM 16GB, SSD 512GB...).

### Tabla: activos_hardware
- **id_activo**: número único.
- **numero_serie**: texto único (no pueden repetirse dos equipos con el mismo número de serie).
- **id_modelo**: referencia a la tabla modelos_hardware.
- **id_ubicacion**: referencia a la tabla ubicaciones (puede estar vacío si se desconoce).
- **id_departamento**: referencia a departamentos.
- **fecha_compra**: fecha de adquisición.
- **fecha_baja**: fecha en que se retiró (vacío si sigue activo).
- **estado**: puede ser "operativo", "reparación", "almacenado", "dado_baja". Por defecto "operativo".
- **costo_adquisicion**: número decimal con dos decimales (ej. 1250.00).

### Tabla: software
- **id_software**: número único.
- **nombre**: texto (ej. "Adobe Photoshop").
- **fabricante**: texto.

### Tabla: licencias
- **id_licencia**: número único.
- **id_software**: referencia al software correspondiente.
- **tipo_licencia**: texto ("perpetua", "suscripción anual").
- **clave_licencia**: texto (puede guardarse ofuscada por seguridad).
- **fecha_compra**: fecha.
- **fecha_expiracion**: fecha (vacío si perpetua).
- **numero_instancias_max**: número entero (cuántos equipos pueden usar esta licencia).

### Tabla: asignaciones
- **id_asignacion**: número único.
- **id_activo**: referencia al activo.
- **id_usuario**: referencia a una tabla de empleados (no se detalla aquí).
- **fecha_inicio**: fecha desde que se asignó.
- **fecha_fin**: fecha de devolución (vacío si sigue asignado).

### Tabla: software_instalado
- **id_activo**: referencia al activo.
- **id_software**: referencia al software.
- **fecha_instalacion**: fecha y hora.
- **id_licencia_aplicada**: referencia a la licencia usada (opcional).

---

## Consultas útiles (qué preguntas responder, sin escribir código)

Estas son las preguntas que el sistema debe poder responder fácilmente. Un administrador puede traducirlas a consultas SQL, pero aquí se explican en lenguaje natural.

### 1. Equipos operativos que no están asignados a nadie (los "perdidos en un cajón")
Se busca en la tabla de activos aquellos con estado "operativo" que no tengan una asignación actual (fecha_fin vacía). Esto permite recuperar equipos olvidados.

### 2. Licencias que vencen en los próximos 30 días
Se revisa la tabla de licencias, se filtra por fechas de expiración entre hoy y hoy+30 días. Así se evitan renovaciones fuera de plazo.

### 3. Software instalado en más equipos de lo permitido por la licencia
Se cuenta cuántos equipos tienen instalado cada software, se compara con el número máximo de instancias que permite la licencia. Si el conteo supera el límite, hay incumplimiento.

### 4. Valor total de activos por departamento
Se suman los costos de adquisición de los activos que pertenecen a cada departamento (excluyendo los dados de baja). Da una visión financiera.

### 5. Historial de un activo concreto
Para un número de serie dado, se muestran todas sus asignaciones: qué usuarios lo tuvieron y en qué fechas.

---

## Buenas prácticas para mantener el orden

- **No borrar información físicamente**. En lugar de eliminar una fila, se agrega una columna "activo" (sí/no) o se usa la fecha de baja. Así se conserva el historial.
- **Usar índices** en columnas como número de serie, fecha de expiración y las claves que relacionan tablas. Esto acelera las búsquedas.
- **Documentar cada tabla y columna** con un comentario breve (la mayoría de las bases de datos lo permiten). Esto ayuda a quien herede el sistema.
- **Automatizar la asignación de fechas**. La fecha de creación se puede poner automáticamente al insertar un registro.

---

## Limitaciones y alternativas

Una base de datos relacional es excelente para mantener la consistencia y hacer consultas complejas. Sin embargo, si la organización tiene miles de activos y necesita detección automática en la red (escaneo de equipos), se recomienda usar herramientas especializadas como GLPI o Lansweeper, que pueden volcar su información a estas tablas.

Si el volumen de cambios es muy alto (ej. movimientos diarios de 500 portátiles), puede ser útil separar los datos en dos zonas: una para el estado actual (rápida) y otra para el histórico (más detallada).

---

## Conclusión

Un esquema de base de datos bien pensado, aunque se describa sin código, permite:

- Saber en todo momento qué hardware hay, dónde está y quién lo usa.
- Controlar licencias de software y evitar multas por incumplimiento.
- Planificar renovaciones y presupuestos con datos reales.

Se puede empezar con solo cuatro tablas (activos, modelos, software y asignaciones) e ir creciendo. Lo fundamental es dejar de usar hojas de cálculo aisladas.

---

## Referencias conceptuales

- Elmasri, R., & Navathe, S. (2016). *Fundamentals of Database Systems*.
- ISO/IEC 19770-1:2017 – Procesos para la gestión de activos TI.

---

