import axios from 'axios';

const testData = {
  power: 1500,
  voltage: 220,
  current: 6.8,
  energyToday: 12.5,
  solarPower: 2500,
  batterySoc: 85,
  gridConsumption: 500,
  loadsPower: 1200
};

async function sendTestData() {
  try {
    const response = await axios.post('http://localhost:3000/api/nodered/data', testData);
    console.log('Datos enviados:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

sendTestData();
