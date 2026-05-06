# Acceso desde Internet - Miapp Energía

## Opción 1: Router (Gratis)

### Pasos para abrir puertos:

1. **Accede a tu router**
   - usually: `192.168.90.1` o `192.168.1.1`
   - Usuario/Contraseña: admin/admin o printed on router

2. **Configura Port Forwarding**
   - Busca "Port Forwarding" o "Redirección de Puertos"
   - Crea una nueva regla:
     - **Puerto externo**: 3000
     - **Puerto interno**: 3000
     - **IP interno**: 192.168.90.100
     - **Protocolo**: TCP

3. **Guarda y reinicia el router**

4. **Tu IP pública**
   - Visita https://whatismyipaddress.com para ver tu IP
   - Para acceder: `http://TU-IP-PUBLICA:3000`

### ⚠️ Problema con IP dinámica
Tu ISP cambia tu IP periódicamente. Soluciones:
- **DDNS**: Usa un servicio como no-ip.org o duckdns.org
- **Consulta a tu proveedor** si ofrece IP estática

---

## Opción 2: Cloudflare Tunnel (Gratis y推荐)

### Instalación:

1. **Crea una cuenta en cloudflare.com**

2. **Instala cloudflared:**
   ```cmd
   wings install cloudflared
   ```

3. **Autentica:**
   ```cmd
   cloudflared tunnel login
   ```

4. **Crea un túnel:**
   ```cmd
   cloudflared tunnel create miapp
   ```

5. **Configura el tunneling:**
   Crea archivo `config.yml`:
   ```yaml
   tunnel: TU-TUNNEL-ID
   credentials-file: C:\Users\tu-usuario\.cloudflared\credentials.json
   
   ingress:
     - service: http://localhost:3000
   ```

6. **Ejecuta:**
   ```cmd
   cloudflared run --config config.yml
   ```

7. **DNS:**
   ```cmd
   cloudflared tunnel route dns miapp miapp.tudominio.duckdns.org
   ```

---

## Opción 3: ngrok (Gratis para pruebas)

1. **Descarga ngrok:**
   https://ngrok.com/download

2. **Instala:**
   ```cmd
   unzip ngrok.zip
   ```

3. **Conecta tu cuenta:**
   ```cmd
   ngrok authtoken TU-TOKEN
   ```

4. **Crea el túnel:**
   ```cmd
   ngrok http 3000
   ```

5. **Usa la URL que ngrok te da**

---

## Para Play Store

### Generar APK:

1. **Instala Android Studio** o usa build local

2. **Build release:**
   ```cmd
   cd frontend
   npm run build
   ```

3. **El APK estará en** `dist/`

4. **Firmar (solo una vez):**
   - Genera keystore:
     ```cmd
     keytool -genkey -v -keystore miapp.keystore -alias miapp -keyalg RSA -keysize 2048 -validity 10000
     ```
   - Firma el APK:
     ```cmd
     jarsigner -keystore miapp.keystore -signedjar app-signed.apk app.apk miapp
     ```

### Subir a Play Store:
1. Ve a https://play.google.com/console
2. Crea una app
3. Sube el APK
4. Completa información (capturas, descripción)
5. Publica (tarda horas en revisar)

---

## Configuración SMTP (Correo)

Para recibir correos de bienvenida, configura en el `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=tu-email@gmail.com
```

Para Gmail, necesitas una "App Password" de 16 caracteres.