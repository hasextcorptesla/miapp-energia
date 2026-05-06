const axios = require('axios');

async function test() {
  const today = new Date();
  const startDate = today.getFullYear() + '-04-01';
  const endDate = today.toISOString().split('T')[0];
  
  console.log('Consultando API...');
  console.log('startDate:', startDate);
  console.log('endDate:', endDate);
  
  try {
    const response = await axios.get('http://localhost:5173/api/reports/daily', {
      params: { start: startDate, end: endDate }
    });
    
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      console.log('Data length:', data.length);
      
      if (data.length > 0) {
        const totalConsumption = data.reduce((sum, d) => sum + (d.consumo_dia || 0), 0);
        console.log('Total Consumption:', totalConsumption.toFixed(2), 'kWh');
        
        const totalSolar = data.reduce((sum, d) => sum + (d.solar_dia || 0), 0);
        console.log('Total Solar:', totalSolar.toFixed(2), 'kWh');
      }
    } else {
      console.log('No data found or request failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

test();