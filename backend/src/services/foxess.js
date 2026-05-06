import axios from 'axios';
import crypto from 'crypto';

const DOMAIN = 'https://www.foxesscloud.com';

class FoxESSService {
  constructor(apiKey = '', deviceSN = '') {
    this.apiKey = apiKey;
    this.deviceSN = deviceSN;
  }

  getSignature(path) {
    const timestamp = Date.now();
    const signature = crypto
      .createHash('md5')
      .update(`${path}\r\n${this.apiKey}\r\n${timestamp}`)
      .digest('hex');
    
    return {
      token: this.apiKey,
      lang: 'en',
      timestamp: String(timestamp),
      signature,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  }

  async getDeviceList() {
    try {
      const path = '/op/v0/device/list';
      const headers = this.getSignature(path);
      const response = await axios.post(
        `${DOMAIN}${path}`,
        { currentPage: 1, pageSize: 500 },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('FoxES getDeviceList error:', error.message);
      return { errno: -1, error: error.message };
    }
  }

  async getRealTimeData(sn = this.deviceSN) {
    try {
      const path = '/op/v0/device/real/query';
      const headers = this.getSignature(path);
      const response = await axios.post(
        `${DOMAIN}${path}`,
        { sn, variables: [] },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('FoxES getRealTimeData error:', error.message);
      return { errno: -1, error: error.message };
    }
  }

  async getHistoryData(sn = this.deviceSN, begin, end) {
    try {
      const path = '/op/v0/device/history/query';
      const headers = this.getSignature(path);
      const response = await axios.post(
        `${DOMAIN}${path}`,
        { sn, variables: [], begin, end },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('FoxES getHistoryData error:', error.message);
      return { errno: -1, error: error.message };
    }
  }

  async getTodayGeneration(sn = this.deviceSN) {
    try {
      const path = '/op/v0/device/generation';
      const headers = this.getSignature(path);
      const response = await axios.get(
        `${DOMAIN}${path}`,
        { params: { sn }, headers }
      );
      return response.data;
    } catch (error) {
      console.error('FoxES getTodayGeneration error:', error.message);
      return { errno: -1, error: error.message };
    }
  }

  async getBatterySOC(sn = this.deviceSN) {
    try {
      const path = '/op/v0/device/battery/soc/get';
      const headers = this.getSignature(path);
      const response = await axios.get(
        `${DOMAIN}${path}`,
        { params: { sn }, headers }
      );
      return response.data;
    } catch (error) {
      console.error('FoxES getBatterySOC error:', error.message);
      return { errno: -1, error: error.message };
    }
  }

  parseRealTimeData(data) {
    if (!data || !data.result || !data.result[0] || !data.result[0].data) return null;
    
    const d = data.result[0].data;
    return {
      pvPower: d.pvPower || 0,
      pv1Power: d.pv1Power || 0,
      pv2Power: d.pv2Power || 0,
      todayYield: d.todayYield || 0,
      gridConsumption: d.gridConsumption || 0,
      feedin: d.feedin || 0,
      batterySoc: d.batterySoc || 0,
      chargeEnergyToTal: d.chargeEnergyToTal || 0,
      dischargeEnergyToTal: d.dischargeEnergyToTal || 0,
      loadsPower: d.loadsPower || 0,
      RPower: d.RPower || 0,
      timestamp: new Date().toISOString()
    };
  }
}

export default FoxESSService;