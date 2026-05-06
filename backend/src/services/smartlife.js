import axios from 'axios';
import config from '../config/database.js';

class SmartLifeService {
  constructor() {
    this.apiUrl = config.smartlife.apiUrl;
    this.username = config.smartlife.username;
    this.password = config.smartlife.password;
    this.token = null;
  }
  
  async login() {
    try {
      const response = await axios.post(`${this.apiUrl}/v2/user/login`, {
        userName: this.username,
        password: this.password
      });
      this.token = response.data.token;
      return response.data;
    } catch (error) {
      console.error('SmartLife login error:', error.message);
      return null;
    }
  }
  
  async getDevices() {
    if (!this.token) {
      await this.login();
    }
    
    try {
      const response = await axios.get(`${this.apiUrl}/v2/device/list`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return response.data.devices;
    } catch (error) {
      console.error('SmartLife getDevices error:', error.message);
      return [];
    }
  }
  
  async controlDevice(deviceId, action, value = null) {
    if (!this.token) {
      await this.login();
    }
    
    try {
      let payload = { deviceId };
      
      if (action === 'on') {
        payload.state = { online: true };
      } else if (action === 'off') {
        payload.state = { online: false };
      } else if (action === 'set' && value !== null) {
        payload.state = value;
      }
      
      const response = await axios.post(
        `${this.apiUrl}/v2/device/control`,
        payload,
        { headers: { 'Authorization': `Bearer ${this.token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('SmartLife controlDevice error:', error.message);
      return null;
    }
  }
  
  async getDeviceStatus(deviceId) {
    if (!this.token) {
      await this.login();
    }
    
    try {
      const response = await axios.get(
        `${this.apiUrl}/v2/device/status/${deviceId}`,
        { headers: { 'Authorization': `Bearer ${this.token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('SmartLife getDeviceStatus error:', error.message);
      return null;
    }
  }
}

export default new SmartLifeService();