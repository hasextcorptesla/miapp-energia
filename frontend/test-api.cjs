const axios = require('axios');

async function test() {
  const today = new Date();
  let startDate = today.toISOString().slice(0, 8) + '01';
  let endDate = today.toISOString().split('T')[0];
  
  console.log('startDate:', startDate);
  console.log('endDate:', endDate);
  
  const response = await axios.get('http://localhost:3000/api/reports/daily', {
    params: { start: startDate, end: endDate }
  });
  
  console.log('Response:', JSON.stringify(response.data, null, 2));
}

test().catch(console.error);