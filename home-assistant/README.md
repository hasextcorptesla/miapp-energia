# FoxESS Miapp - Home Assistant Addon

Este addon conecta Home Assistant con tu aplicación Miapp para enviar datos del inversor FoxES.

## Instalación

### Opción 1: Manual (recomendado)

1. Descarga el archivo `foxess_miapp.zip`
2. Copia el contenido a tu carpeta `config/custom_components/foxess_miapp/`
   ```
   config/
   └── custom_components/
       └── foxess_miapp/
           ├── __init__.py
           ├── api.py
           ├── config_flow.py
           ├── const.py
           ├── manifest.json
           └── sensor.py
   ```

### Opción 2: HACS

1. Ve a HACS → Settings → Custom Repositories
2. Agrega: `https://github.com/tu-usuario/foxess_miapp`
3. Instala "FoxESS Miapp"

## Configuración

1. Ve a **Settings → Devices & Services → Add Integration**
2. Busca "FoxESS Miapp"
3. Ingresa:
   - **API Key**: Tu API Key de FoxESS Cloud
   - **Inverter SN**: Número de serie de tu inversor (ej: 609M4ELF33VA2)
   - **Miapp URL**: URL de tu Miapp (http://192.168.1.x:3000)

## Datos enviados a Miapp

| Sensor | Descripción |
|--------|-------------|
| power | Potencia PV actual (W) |
| energyToday | Energía generada hoy (kWh) |
| solarPower | Potencia solar (W) |
| batterySoc | Estado de batería (%) |
| gridConsumption | Consumo de red (W) |
| loadsPower | Potencia de carga (W) |

## Notas

- El addon actualiza cada 30 segundos
- Requiere API Key de FoxESS Cloud
- El inversor debe estar vinculado a tu cuenta FoxESS

## Generar API Key FoxESS

1. Ve a [foxesscloud.com](https://www.foxesscloud.com)
2. Inicia sesión
3. Ve a **Mi cuenta → API Management**
4. Genera una nueva API Key
5. Copia la API Key y el número de serie del inversor
