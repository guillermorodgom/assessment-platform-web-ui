# Interfaz web Angular

Proyecto Angular 17, TypeScript y PrimeNG. El código presente incluye modelos, guards, interceptores, servicio de autenticación y un componente de login. No aparecen las vistas de administración, examen ni editor de código en `src/app`.

## Requisitos y comandos

Se requieren Node.js 18+ y npm. Desde este directorio use `npm ci`, `npm start` para desarrollo y `npm run build` para producción. El puerto habitual es `4200`.

**Estado actual:** `src/main.ts` importa `src/app/app.component.ts` y `src/app/app.config.ts`, que faltan. También faltan `src/assets` y `src/favicon.ico`, referenciados por `angular.json`. Complete estos archivos antes de considerar compilable la UI.

## API y configuración

`environment.ts` usa URL absolutas locales: auth `http://localhost:8081/api`, mngr `http://localhost:8082/api` y compiler `http://localhost:8083/api`. Producción usa `/api` para los tres y requiere un gateway que distinga los servicios. `proxy.conf.json` apunta a `localhost:8080`, pero `npm start` solo ejecuta `ng serve` y no carga ese proxy.

El token se guarda en `sessionStorage` con una clave de cifrado incluida en el frontend. No trate esa clave como secreto. `package.json` define `npm test`, pero no están los archivos base y de configuración de pruebas necesarios para ejecutarlo.
