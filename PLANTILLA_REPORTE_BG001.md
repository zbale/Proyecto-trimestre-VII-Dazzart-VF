# PLANTILLA DE REPORTE DE ERROR

## Información General
| Campo | Valor |
|-------|-------|
| Número de Bug | BG001 |
| Nombre del Tester | Jose Zabaleta |
| Título | Descuentos no aparecen en carrousel de inicio, detalle de producto y otras vistas (carritoController, pedidoController y descuentoController) |
| Día del Reporte | 14/11/2025 |
| Sistema Operativo | Windows 10 / Mac Lion etc |
| Browser | Chrome, Firefox, Safari etc |
| Prioridad | **Alta** (Afecta funcionalidad principal de descuentos) |
| Asignado a | Jose Zabaleta - Nombre del programador de la funcionalidad |

---

## Descripción

**Descripción detallada del bug encontrado:**

Los descuentos creados desde el panel administrativo no se visualizaban en:
- Página de inicio (carrousel - Torre Vhangua)
- Detalle del producto

Aunque los descuentos se guardaban correctamente en la base de datos, existían múltiples problemas que impedían que se mostraran:

1. **Inconsistencia en nombres de campos en Controllers**: Controllers retornaban `descuento` en algunos casos y `descuento_aplicado` en otros, causando que el frontend no encontrara los datos
2. **Desfase de fechas en calendario**: El `DateTimePicker` de React Native convertía fechas a UTC, causando un desfase de un día (ej: seleccionar 14 de nov guardaba como 15 de nov). Los descuentos guardados con fechas incorrectas no pasaban la validación `NOW() BETWEEN fecha_inicio AND fecha_fin`
3. **Validaciones inconsistentes de tipos de descuento en Backend**: El backend aceptaba 'fijo', 'valor' y 'porcentaje', pero algunos controllers no normalizaban correctamente estos tipos

---

## Pasos para la reproducción

1. **Paso detallado 1**: Ingresar al panel administrativo y dirigirse a Gestionar Descuentos
2. **Paso detallado 2**: Crear un nuevo descuento con:
   - Tipo: Porcentaje o Fijo
   - Valor: cantidad del descuento
   - Fecha inicio: 14 de noviembre (por ejemplo)
   - Fecha fin: 20 de noviembre (por ejemplo)
   - Aplicar a: Producto o Categoría

3. **Paso detallado + datos de prueba**: 
   - Producto de prueba: "Torre Changua"
   - Descuento de prueba: 15% (porcentaje)
   - Rango de fechas: 14/11/2025 - 30/11/2025

4. **Verificación**:
   - Dejar campo con nombre y apellido vacío
   - Clic en botón guardar

---

## Resultado Esperado

- El descuento debe guardarse correctamente con las fechas exactas seleccionadas (sin desfase)
- El descuento debe aparecer inmediatamente en:
  - **Página de inicio** (carrousel de productos nuevos / Torre Vhangua)
  - **Vista detalle del producto** (al hacer clic en un producto)
- El precio debe mostrar el precio original tachado y el precio con descuento en rojo
- Debe mostrar un badge con el porcentaje o monto del descuento

---

## Resultado Actual

- Los descuentos NO aparecían en la página de inicio
- Los descuentos NO aparecían en el detalle del producto
- Los controllers retornaban estructuras inconsistentes de descuentos, causando que el frontend no encontrara los datos

---

## Soluciones Implementadas

### 1. **Normalización de campos en Controllers Backend** ✅

- **Archivo**: `backend/src/controllers/carritoController.js`
  - Cambio: Normalizar field a `descuento_aplicado` 
  - Línea 78: `return {..., descuento_aplicado, urlImagen: prod.imagen}`
  - Agregado: `Math.round()` para cálculos de porcentaje
  - Agregado: Validación de ambos tipos 'fijo' y 'valor'
  - Agregado: Date validation `NOW() BETWEEN fecha_inicio AND fecha_fin`

- **Archivo**: `backend/src/controllers/pedidosController.js`
  - Cambio: Normalización consistente del field `descuento_aplicado`
  - Línea 171: `return {..., descuento_aplicado}`
  - Agregado: Mismo tratamiento de tipos de descuento
  - Agregado: Date validation en queries

- **Archivo**: `backend/src/controllers/productosController.js`
  - Verificación: Ya estaba correctamente implementado retornando `descuento_aplicado`

### 2. **Fix del calendario (Timezone Issue)** ✅

- **Archivo**: `movil/src/screens/admin/FormularioDescuento.jsx`
  - **Problema**: `DateTimePicker` devuelve fecha local pero `.toISOString()` la convertía a UTC, causando desfase de 1 día
  - **Solución**: Nueva función `formatDate()` que extrae año, mes, día sin conversión de zona horaria
  - **Línea 78-85**: Convierte `new Date()` a `YYYY-MM-DD` local correctamente

- **Archivo**: `movil/src/screens/admin/EditarDescuento.jsx`
  - Mismo fix aplicado en línea 59-66

### 3. **Validaciones mejoradas en Backend** ✅

- **Archivo**: `backend/src/controllers/descuentocontroller.js`
  - Línea 25-31: Validación de valores positivos
  - Línea 29-31: Validación de rango de fechas (fecha_fin > fecha_inicio)
  - Línea 56-73: Enhanced conflict checking con date ranges
  - Agregado: Normalización de tipos a minúsculas para comparaciones consistentes

---

## Commits Relacionados

- `08ee1f8`: Backend controllers - Field normalization y calculations
- `5da34c5`: Frontend index.jsx - Auto-reload functionality
- `65a5f5a`: Frontend VistaProductos & VistaBusqueda - Auto-reload
- `ed0537e`: Frontend ProductoCard & ProductoDetalle - Improved validation
- `8f43a24` / `2436fdd`: Timezone fix en DatePicker (mobile)

---

## Pruebas Realizadas

✅ Descuentos por porcentaje se calculan correctamente
✅ Descuentos por valor fijo se calculan correctamente
✅ Las fechas se guardan sin desfase
✅ Los descuentos aparecen en todas las vistas
✅ Auto-recarga funciona al volver del admin
✅ Se muestran badges con descuentos
✅ Prices se formatean correctamente con separadores de miles

---

## Estado

**RESUELTO** - Todos los bugs relacionados han sido corregidos y subidos a:
- Rama `main` (producción)
- Rama `zabaleta_AWS6` (staging para AWS)

---

## Notas Adicionales

- Los descuentos ahora se validan automáticamente por fecha vigente
- El sistema rechaza descuentos con fechas inválidas
- Se recomienda hacer deploy en AWS para que la app móvil reciba los cambios
- Considerar implementar WebSockets en el futuro para sincronización real-time entre múltiples dispositivos
