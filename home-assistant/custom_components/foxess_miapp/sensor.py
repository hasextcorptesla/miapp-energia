"""Sensor platform for FoxESS Miapp."""
from homeassistant.components.sensor import SensorEntity
from .const import DOMAIN

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up FoxESS Miapp sensors."""
    api = hass.data[DOMAIN][entry.entry_id]
    
    sensors = [
        FoxESSPowerSensor(api),
        FoxESSEnergyTodaySensor(api),
        FoxESSSolarPowerSensor(api),
        FoxESSBatterySocSensor(api),
        FoxESSGridConsumptionSensor(api),
        FoxESSLoadsPowerSensor(api),
    ]
    
    async_add_entities(sensors, True)


class FoxESSPowerSensor(SensorEntity):
    """FoxESS Power Sensor."""
    
    def __init__(self, api):
        self._api = api
        self._attr_name = "FoxESS Power"
        self._attr_unique_id = "foxess_power"
        self._attr_unit_of_measurement = "W"
    
    @property
    def state(self):
        return self._api.data.get("power", 0)


class FoxESSEnergyTodaySensor(SensorEntity):
    """FoxESS Energy Today Sensor."""
    
    def __init__(self, api):
        self._api = api
        self._attr_name = "FoxESS Energy Today"
        self._attr_unique_id = "foxess_energy_today"
        self._attr_unit_of_measurement = "kWh"
    
    @property
    def state(self):
        return self._api.data.get("energyToday", 0)


class FoxESSSolarPowerSensor(SensorEntity):
    """FoxESS Solar Power Sensor."""
    
    def __init__(self, api):
        self._api = api
        self._attr_name = "FoxESS Solar Power"
        self._attr_unique_id = "foxess_solar_power"
        self._attr_unit_of_measurement = "W"
    
    @property
    def state(self):
        return self._api.data.get("solarPower", 0)


class FoxESSBatterySocSensor(SensorEntity):
    """FoxESS Battery SOC Sensor."""
    
    def __init__(self, api):
        self._api = api
        self._attr_name = "FoxESS Battery SOC"
        self._attr_unique_id = "foxess_battery_soc"
        self._attr_unit_of_measurement = "%"
    
    @property
    def state(self):
        return self._api.data.get("batterySoc", 0)


class FoxESSGridConsumptionSensor(SensorEntity):
    """FoxESS Grid Consumption Sensor."""
    
    def __init__(self, api):
        self._api = api
        self._attr_name = "FoxESS Grid Consumption"
        self._attr_unique_id = "foxess_grid_consumption"
        self._attr_unit_of_measurement = "W"
    
    @property
    def state(self):
        return self._api.data.get("gridConsumption", 0)


class FoxESSLoadsPowerSensor(SensorEntity):
    """FoxESS Loads Power Sensor."""
    
    def __init__(self, api):
        self._api = api
        self._attr_name = "FoxESS Loads Power"
        self._attr_unique_id = "foxess_loads_power"
        self._attr_unit_of_measurement = "W"
    
    @property
    def state(self):
        return self._api.data.get("loadsPower", 0)
