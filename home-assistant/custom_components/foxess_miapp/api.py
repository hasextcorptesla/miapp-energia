"""FoxESS Miapp API module."""
import asyncio
import logging
import aiohttp
from homeassistant.core import HomeAssistant
from .const import CONF_API_KEY, CONF_INVERTER_SN, CONF_MIAPP_URL, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)

class FoxESSMiappAPI:
    """FoxESS Miapp API class."""
    
    def __init__(self, hass: HomeAssistant, config_data: dict):
        self.hass = hass
        self.api_key = config_data.get(CONF_API_KEY)
        self.inverter_sn = config_data.get(CONF_INVERTER_SN)
        self.miapp_url = config_data.get(CONF_MIAPP_URL, "http://localhost:3000")
        self._cancel_update = None
        self._data = {}
        
    async def start(self):
        """Start the update loop."""
        _LOGGER.info("FoxESS Miapp starting...")
        await self.async_update()
        
    async def stop(self):
        """Stop the update loop."""
        if self._cancel_update:
            self._cancel_update()
            self._cancel_update = None
            
    async def async_update(self):
        """Fetch data from FoxESS and send to Miapp."""
        try:
            data = await self.fetch_foxess_data()
            if data:
                await self.send_to_miapp(data)
                self._data = data
        except Exception as e:
            _LOGGER.error("Error updating: %s", e)
            
    async def fetch_foxess_data(self):
        """Fetch data from FoxESS cloud."""
        try:
            import time
            import hashlib
            from aiohttp import ClientSession
            
            timestamp = str(int(time.time() * 1000))
            path = "/op/v0/device/real/query"
            signature = hashlib.md5(
                f"{path}\r\n{self.api_key}\r\n{timestamp}".encode()
            ).hexdigest()
            
            headers = {
                "token": self.api_key,
                "lang": "en",
                "timestamp": timestamp,
                "signature": signature
            }
            
            payload = {
                "sn": self.inverter_sn,
                "variables": []
            }
            
            async with ClientSession() as session:
                async with session.post(
                    "https://www.foxesscloud.com/op/v0/device/real/query",
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._parse_foxess_data(result)
                    else:
                        _LOGGER.error("FoxESS API error: %s", response.status)
                        return None
        except Exception as e:
            _LOGGER.error("Error fetching FoxESS data: %s", e)
            return None
            
    def _parse_foxess_data(self, data):
        """Parse FoxESS API response."""
        try:
            if not data.get("result") or not data["result"][0].get("data"):
                return None
                
            d = data["result"][0]["data"]
            return {
                "power": float(d.get("pvPower", 0)) * 1000,
                "voltage": 220,
                "current": float(d.get("pvPower", 0)) * 1000 / 220,
                "energyToday": float(d.get("todayYield", 0)),
                "solarPower": float(d.get("pvPower", 0)) * 1000,
                "batterySoc": float(d.get("batterySoc", 0)),
                "gridConsumption": float(d.get("gridConsumption", 0)) * 1000,
                "loadsPower": float(d.get("loadsPower", 0)) * 1000
            }
        except Exception as e:
            _LOGGER.error("Error parsing FoxESS data: %s", e)
            return None
            
    async def send_to_miapp(self, data):
        """Send data to Miapp."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.miapp_url}/api/nodered/data",
                    json=data
                ) as response:
                    if response.status == 200:
                        _LOGGER.info("Data sent to Miapp successfully")
                    else:
                        _LOGGER.error("Miapp API error: %s", response.status)
        except Exception as e:
            _LOGGER.error("Error sending to Miapp: %s", e)
            
    @property
    def data(self):
        """Return current data."""
        return self._data
