# Aplicación de Feed de Facebook

Esta aplicación es un proyecto de React que se integra con el SDK de Facebook para mostrar el perfil y las publicaciones de un usuario de Facebook. La aplicación admite diferentes plantillas de visualización y puede ser incrustada en otras páginas web.

## Características

- **Inicio de Sesión con Facebook**: Los usuarios pueden iniciar sesión utilizando su cuenta de Facebook para ver su perfil y publicaciones.
- **Modo Embed**: La aplicación puede ser incrustada en otras páginas web con diferentes plantillas de visualización.
- **Selección de Plantillas**: Los usuarios pueden elegir entre diferentes plantillas para mostrar las publicaciones.
- **Modo Demo**: Simula el inicio de sesión con un token de demostración para previsualizar la funcionalidad de la aplicación.
- **Diseño Responsivo**: La aplicación está diseñada para ser responsiva y funciona bien en diferentes tamaños de pantalla.

## Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/facebook-feed-app.git
   cd facebook-feed-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

4. **Abrir la aplicación**:
   Abre tu navegador y navega a `http://localhost:3000`.

## Uso

- **Iniciar Sesión con Facebook**: Haz clic en "Iniciar sesión con Facebook" para iniciar sesión y ver tu perfil y publicaciones.
- **Seleccionar Plantilla**: Usa la barra lateral para elegir entre diferentes plantillas para ver las publicaciones.
- **Generar Código Embed**: Haz clic en "Genera Código Embed" para generar un código de incrustación para la plantilla seleccionada.
- **Modo Demo**: Haz clic en "Vista Previa" para simular el inicio de sesión y ver un perfil y publicaciones de demostración.

## Modo Embed

Para usar la aplicación en modo embed, añade `?embed=true` al URL. Este modo obtiene datos de manera segura sin exponer el token.

## Manejo de Errores

La aplicación intercepta errores específicos de la consola relacionados con solicitudes fallidas para evitar que saturen la consola.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request para cualquier mejora o corrección de errores.

## Contacto

Para preguntas o soporte, por favor contacta a [spiritboom672@gmail.com](mailto:spiritboom672@gmail.com).
