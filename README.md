# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


## Guía de Despliegue a Producción

Para asegurar que tu aplicación funcione correctamente en un entorno de producción, sigue estos pasos:

### 1. Configuración de Variables de Entorno del Frontend

Asegúrate de que el archivo `frontend/.env.production` esté configurado con las URLs y claves correctas para tu entorno de producción. Este archivo se carga automáticamente cuando construyes la aplicación para producción.

Ejemplo de `frontend/.env.production`:
```
REACT_APP_GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID_DE_PRODUCCION
REACT_APP_FIREBASE_SERVICE_ACCOUNT_KEY_PATH=TU_RUTA_FIREBASE_PRODUCCION
REACT_APP_FIREBASE_STORAGE_BUCKET_URL=TU_URL_BUCKET_FIREBASE_PRODUCCION
REACT_APP_API_URL=https://tu-dominio-backend.com/graphql
REACT_APP_API_BASE_URL=https://tu-dominio-backend.com
```

### 2. Construir el Frontend para Producción

Antes de desplegar, debes construir tu aplicación frontend. Este proceso optimiza el código y lo prepara para un rendimiento óptimo en producción. Ve al directorio `frontend/` en tu terminal y ejecuta:

```bash
npm run build
```

Esto creará una carpeta `build/` (o `dist/`) con todos los archivos estáticos listos para ser desplegados.

### 3. Desplegar el Frontend Construido

Los contenidos de la carpeta `build/` son los que debes desplegar en tu servicio de alojamiento (por ejemplo, Netlify, Vercel, un servidor web estático, etc.). Consulta la documentación de tu proveedor de alojamiento para los pasos específicos de despliegue.

### 4. Configurar Variables de Entorno del Backend en Producción

Tu backend también utiliza variables de entorno. Es **crucial** que estas variables se configuren directamente en la plataforma de alojamiento de tu backend (por ejemplo, Render, Heroku, AWS, etc.), y **no** a través de un archivo `.env` en el servidor de producción por motivos de seguridad y buenas prácticas.

Algunas de las variables importantes para el backend incluyen:
- `NODE_ENV=production`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (contenido del JSON, no la ruta del archivo)
- `FIREBASE_STORAGE_BUCKET_URL`
- `CORS_ORIGIN` (la URL de tu frontend en producción)
- `PORT` (generalmente lo asigna el proveedor de alojamiento)
- `DATABASE_URL` (para bases de datos PostgreSQL, etc.)

Consulta la documentación de tu proveedor de alojamiento para saber cómo configurar estas variables de entorno.