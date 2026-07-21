import axios from 'axios';

const DOMAIN = 'https://www.foxesscloud.com';

async function loginFoxES(username, password) {
  try {
    console.log('Intentando login en FoxES Cloud...');
    
    const response = await axios.post(`${DOMAIN}/v2/user/login`, {
      userName: username,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('Login response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error de login:', error.response?.data || error.message);
    return null;
  }
}

async function getDevices(token) {
  try {
    console.log('Obteniendo dispositivos...');
    
    const timestamp = Date.now();
    const path = '/op/v0/device/list';
    const crypto = await import('crypto');
    const signature = crypto.createHash('md5')
      .update(`${path}\r\n${token}\r\n${timestamp}`)
      .digest('hex');
    
    const response = await axios.post(`${DOMAIN}${path}`, {
      currentPage: 1,
      pageSize: 500
    }, {
      headers: {
        'token': token,
        'lang': 'en',
        'timestamp': String(timestamp),
        'signature': signature
      }
    });
    
    console.log('Devices:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error getting devices:', error.response?.data || error.message);
    return null;
  }
}

async function getRealTimeData(token, sn) {
  try {
    console.log('Obteniendo datos en tiempo real para:', sn);
    
    const timestamp = Date.now();
    const path = '/op/v0/device/real/query';
    const crypto = await import('crypto');
    const signature = crypto.createHash('md5')
      .update(`${path}\r\n${token}\r\n${timestamp}`)
      .digest('hex');
    
    const response = await axios.post(`${DOMAIN}${path}`, {
      sn: sn,
      variables: []
    }, {
      headers: {
        'token': token,
        'lang': 'en',
        'timestamp': String(timestamp),
        'signature': signature
      }
    });
    
    console.log('Real-time data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error getting real-time data:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  const username = 'ing.pinilla@gmail.com';
  const password = 'CorpTesla12_';
  
  console.log('=== FoxES Cloud Login Test ===\n');
  
  const loginResult = await loginFoxES(username, password);
  
  if (loginResult && loginResult.token) {
    console.log('\n✓ Login exitoso!');
    console.log('Token:', loginResult.token.substring(0, 20) + '...');
    
    console.log('\n=== Obteniendo dispositivos ===');
    const devicesResult = await getDevices(loginResult.token);
    
    if (devicesResult && devicesResult.result) {
      console.log('\n✓ Dispositivos obtenidos!');
      console.log('Total dispositivos:', devicesResult.result.length);
      
      const targetSN = '609M4ELF33VA2';
      const device = devicesResult.result.find(d => d.serialNumber === targetSN);
      
      if (device) {
        console.log('\n✓ Encontrado inversor:', device.deviceName);
        console.log('SN:', device.serialNumber);
        console.log('Modelo:', device.deviceType);
        
        console.log('\n=== Obteniendo datos en tiempo real ===');
        await getRealTimeData(loginResult.token, targetSN);
      } else {
        console.log('\n⚠ No se encontró el dispositivo con SN:', targetSN);
        console.log('Dispositivos disponibles:', devicesResult.result.map(d => d.serialNumber));
      }
    }
  } else {
    console.log('\n✗ Login fallido');
    console.log('Respuesta:', loginResult);
  }
}

main();
