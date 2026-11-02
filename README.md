# My Wallet

App para controlar gastos, cuentas, tarjetas de crédito, presupuestos y metas de ahorro.
Funciona en la computadora como página web y en el celular como app instalable (PWA).

**Abrir la app:** https://kydium.github.io/MyWallet/

## Qué hace

- Inicio de sesión con Google; cada usuario ve solo su propia billetera.
- Cuentas propias: efectivo, billeteras digitales (Yape, Plin), cuentas bancarias, ahorros y tarjetas de crédito (con línea, deuda, crédito disponible, cierre y día de pago).
- Gastos, ingresos y transferencias entre cuentas (incluido pagar la tarjeta), editables.
- Categorías personalizables (nombre, ícono, color y límite mensual).
- Presupuesto del mes, reportes por categoría y por mes, metas de ahorro y pagos fijos.
- Color de la app, moneda y nombre personalizables.
- Sincronización al instante entre celular y computadora.

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Pantallas y estilos |
| `app.js` | Lógica de la app |
| `firebase-config.js` | Datos del proyecto de Firebase |
| `database.rules.json` | Reglas de seguridad (copia de las que están en Firebase) |
| `manifest.json`, `sw.js`, `icons/` | Para instalarla como app y que abra sin conexión |

## Firebase

Los datos se guardan en Realtime Database, en `billetera/{uid}`. Las reglas (`database.rules.json`)
solo dejan leer y escribir a cada usuario en su propia carpeta. Para que el inicio de sesión funcione:

1. Authentication → Sign-in method → **Google** habilitado.
2. Authentication → Settings → Dominios autorizados → `kydium.github.io`.

## Instalar en el celular

- **Android (Chrome):** abre la app, menú ⋮ → **Instalar app**. También aparece un botón en *Personalizar*.
- **iPhone (Safari):** botón Compartir → **Agregar a pantalla de inicio**.

## Actualizar

Al subir cambios a `main`, GitHub Pages publica la nueva versión. Si cambias archivos de la app,
sube también el número de `VERSION` en `sw.js` para que los celulares descarguen la versión nueva.
