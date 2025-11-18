# PLANTILLA DE REPORTE DE ERROR

## Información General
| Campo | Valor |
|-------|-------|
| Número de Bug | BG002 |
| Nombre del Tester | Jose Zabaleta |
| Título | Desfase de fechas en DatePicker del formulario de descuentos (App Móvil) |
| Día del Reporte | 14/11/2025 |
| Sistema Operativo | Android, iOS |
| Browser | React Native / Expo |
| Prioridad | **Media** (Afecta creación de descuentos con fechas incorrectas) |
| Asignado a | Jose Zabaleta - Nombre del programador de la funcionalidad |

---

## Descripción

**Descripción detallada del bug encontrado:**

En la app móvil (Expo/React Native), el componente `DateTimePicker` presentaba un desfase de un día al seleccionar fechas para crear o editar descuentos. Cuando el usuario seleccionaba una fecha específica (por ejemplo, 14 de noviembre), el sistema guardaba automáticamente la siguiente (15 de noviembre).

**Causa raíz:** El `DateTimePicker` devuelve fechas en zona horaria local del dispositivo, pero la conversión con `.toISOString()` las transformaba a UTC, causando un desfase horario que resultaba en un cambio de día completo.

**Impacto:** Los descuentos creados con fechas incorrectas no cumplían la validación `NOW() BETWEEN fecha_inicio AND fecha_fin` en el backend, por lo que no se mostraban en ninguna vista del cliente (web ni móvil).

---

## Pasos para la reproducción

1. **Paso detallado 1**: Abrir la app móvil y entrar al panel administrativo (Admin)
2. **Paso detallado 2**: Navegar a "Añadir Descuento" o "Descuentos"
3. **Paso detallado 3**: Hacer clic en "Fecha de inicio"
4. **Paso detallado + datos de prueba**: 
   - Seleccionar: 14 de noviembre de 2025
   - Zona horaria del dispositivo: Colombia (GMT-5) o cualquier zona horaria
   
5. **Verificación**:
   - Observar el texto mostrado después de seleccionar
   - Guardar el descuento
   - Revisar la fecha guardada en la BD

---

## Resultado Esperado

- Al seleccionar 14 de noviembre en el DatePicker, debe mostrarse: **2025-11-14**
- El descuento debe guardarse con fecha_inicio: **2025-11-14**
- El descuento debe guardarse con fecha_fin: **2025-11-20** (u otra fecha seleccionada)
- Las fechas deben ser exactas sin conversión de zona horaria

---

## Resultado Actual

- Al seleccionar 14 de noviembre en el DatePicker, se guardaba: **2025-11-15** ❌
- La fecha se desfasaba exactamente 1 día hacia adelante
- Esto causaba que descuentos creados no aparecieran porque no cumplían `NOW() BETWEEN fecha_inicio Y fecha_fin`
- Ejemplo: Si hoy es 14/11/2025 y creas descuento desde 14/11, se guardaba como 15/11 (fecha futura)

---

## Soluciones Implementadas

### **Fix del calendario (Timezone Issue)** ✅

- **Archivo**: `movil/src/screens/admin/FormularioDescuento.jsx`
  - **Problema**: `.toISOString().slice(0, 19).replace("T", " ")` convertía la fecha local a UTC
  - **Solución**: Crear función `formatDate(date)` que extrae componentes de fecha sin conversión
  ```javascript
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  ```
  - **Línea 78-85**: Aplicación de la función para ambas fechas
  - **Cambio**: 
    - Antes: `fecha_inicio: fechaInicio.toISOString().slice(0, 19).replace("T", " ")`
    - Después: `fecha_inicio: formatDate(fechaInicio)`

- **Archivo**: `movil/src/screens/admin/EditarDescuento.jsx`
  - Mismo fix aplicado en línea 59-66
  - Nueva función `formatDate()` en el método `handleSubmit()`
  - Uso: `fecha_inicio: formatDate(form.fecha_inicio)` y `fecha_fin: formatDate(form.fecha_fin)`

---

## Commits Relacionados

- `8f43a24` (rama zabaleta_AWS6): Fix: Corregir desfase de fechas en calendar DatePicker (timezone issue)
- `2436fdd` (rama main): Fix: Corregir desfase de fechas en calendar DatePicker (timezone issue)

---

## Pruebas Realizadas

✅ Fecha de inicio se guarda correctamente sin desfase
✅ Fecha de fin se guarda correctamente sin desfase
✅ Fechas se almacenan en formato YYYY-MM-DD correcto
✅ Descuentos creados aparecen en vistas del cliente
✅ Validación de fechas funciona correctamente en backend
✅ Descuentos con fechas correctas pasan validación `NOW() BETWEEN fecha_inicio AND fecha_fin`

---

## Estado

**RESUELTO** - El bug del desfase de fechas ha sido corregido en:
- Rama `main` (producción - web + móvil)
- Rama `zabaleta_AWS6` (staging para AWS)

Los descuentos creados desde ahora guardarán fechas correctas.

---

## Notas Técnicas

### Root Cause Analysis (RCA)
- `DateTimePicker` de React Native usa zona horaria local del dispositivo
- `.toISOString()` convierte objetos Date a string ISO 8601 en UTC
- Ejemplo: `new Date("2025-11-14")` en GMT-5 se convierte a UTC como "2025-11-14T05:00:00Z"
- Al extraer solo la fecha con `.slice(0, 10)`, obtenías "2025-11-15"

### Solución Implementada
- Extraer componentes de fecha (`getFullYear()`, `getMonth()`, `getDate()`) directamente del objeto Date
- Formatear manualmente sin conversión de zona horaria
- Resultado: Siempre se obtiene la fecha local exacta sin desfase

### Impacto en el Sistema
- **Antes**: Descuentos no se veían porque las fechas estaban incorrectas
- **Después**: Descuentos se muestran correctamente con fechas precisas

---

## Notas Adicionales

- Se recomienda usar esta función `formatDate()` en cualquier otra conversión de fechas en la app móvil
- El backend ya valida fechas correctamente
- La sincronización entre web y móvil ahora es consistente
