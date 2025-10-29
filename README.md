# ANMAC Taller OS

Aplicación web moderna para el control de producción de talleres de moda. Incluye panel ejecutivo, gestión integral de pedidos (tabla, kanban y timeline), inventario con semáforos, costeo, simulador de punto de equilibrio, gestión de operarias, asistencia, clientes, proveedores, facturas y un panel de administración para personalizar alertas y moneda.

## Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS.
- **Estado remoto:** TanStack Query.
- **Backend:** Express + TypeScript con datos en memoria y validaciones con Zod.
- **Estilos:** Tailwind + diseño oscuro visual con semáforos y componentes reutilizables.

## Datos semilla

La API expone datos demo para acelerar pruebas:

- **Usuarios:**
  - `admin@anmac.local` / `admin123`
  - `oper@anmac.local` / `oper123`
- **Pedidos:** 4 pedidos (1 rojo, 1 ámbar y 2 verdes) con etapas e ítems completos.
- **Productos:** 2 productos, uno con BOM de 2 materiales.
- **Inventario:** 6 materiales con estados Normal, Bajo y Crítico.
- **Clientes:** 2 clientes.
- **Proveedores:** 2 proveedores.
- **Operarias:** 2 operarias.
- **Asistencia:** registros de ejemplo.
- **Facturas:** 1 factura vinculada a pedido.
- **Settings:** alerta ámbar a 3 días y moneda MXN.

## Scripts

```bash
npm install          # instala dependencias de servidor y herramientas base
cd client && npm install  # instala dependencias del frontend

npm run dev          # inicia API (puerto 4000) + frontend (puerto 5173) con proxy
npm run dev:server   # solo API
npm run dev:client   # solo frontend
npm run build        # compila API (tsc) y frontend (vite build)
npm run preview      # sirve el build de Vite
```

El frontend proxea las peticiones `/api/*` al backend Express.

## Roles y accesos

La autenticación se realiza contra el mock de usuarios. Cada rol expone vistas y acciones acordes: `admin`, `manager`, `operator`, `viewer`. El layout oculta acciones críticas a usuarios sin permisos y protege rutas con `ProtectedRoute`.

## Endpoints destacados

- `GET /api/dashboard` métricas y pedidos recientes.
- CRUD de pedidos, productos, inventario, clientes, proveedores, operarias, asistencia, facturas.
- `POST /api/movimientos` + `/api/movimientos/:id/aplicar` para ajustes de inventario con bloqueo de salidas superiores a disponibilidad.
- `GET/PUT /api/settings` para cambiar días de alerta y moneda.
- `POST /api/export/sheets` mock para exportaciones a Google Sheets.

## Impresión y exportación

Todas las vistas cuentan con botonera universal (Agregar, Editar, Eliminar, Imprimir/PDF, Exportar). La acción de impresión utiliza `window.print()` enfocada en el contenedor visible, mientras que `Exportar` invoca el endpoint mock a Google Sheets con la estructura solicitada.

## Próximos pasos sugeridos

- Reemplazar la capa mock por Google Sheets o base de datos real.
- Implementar autenticación persistente y control granular de permisos en backend.
- Conectar acciones de edición y eliminación a formularios y confirmaciones reales.
