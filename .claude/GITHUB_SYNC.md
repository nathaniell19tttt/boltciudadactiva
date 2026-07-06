# Sincronizacion con GitHub

## Estado Actual

El proyecto esta conectado a GitHub. Bolt no tiene sincronizacion automatica en tiempo real, pero mantiene el codigo disponible.

## Mecanismo de Sincronizacion Manual

Para mantener el repositorio actualizado con los ultimos cambios:

### Opcion 1: Descargar y Subir
1. En Bolt, haz clic en "Download Code" (icono de descarga)
2. Esto descargara un archivo `.zip` con todo el proyecto
3. Descomprime el archivo
4. Abre una terminal en la carpeta descomprimida
5. Ejecuta los siguientes comandos:

```bash
git init
git add .
git commit -m "Actualizacion desde Ciudad Activa"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ciudad-activa.git
git push -u origin main --force
```

### Opcion 2: Usar GitHub Desktop
1. Descarga el codigo desde Bolt
2. Abre GitHub Desktop
3. File > Add Local Repository > selecciona la carpeta
4. Public branch > Push origin

## Recomendacion

Para no perder avances:
- **Despues de cada sesion importante en Bolt**: Descarga el codigo y actuliza tu repositorio
- **Antes de cerrar el navegador**: Verifica que tengas la ultima version descargada
- **Usa la funcion "Download Code"** frecuentemente

## Nota sobre OAuth
Los bots de OAuth (Google, LinkedIn) estan visibles en la pantalla de login pero requieren:
1. Configurar las credenciales en el dashboard de Supabase
2. Configurar los proveedores OAuth en Google Cloud Console y LinkedIn Developer Portal
3. Agregar las URLs de redireccion correctamente

Una vez configurados, los botones funcionaran automaticamente.
