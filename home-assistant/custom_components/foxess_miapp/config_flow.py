"""Config flow for FoxESS Miapp."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, CONF_API_KEY, CONF_INVERTER_SN, CONF_MIAPP_URL, DEFAULT_MIAPP_URL

STEP_USER_DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_API_KEY): cv.string,
    vol.Required(CONF_INVERTER_SN): cv.string,
    vol.Optional(CONF_MIAPP_URL, default=DEFAULT_MIAPP_URL): cv.string,
})

@config_entries.HANDLERS.register(DOMAIN)
class FoxESSMiappFlowHandler(config_entries.ConfigFlow):
    """Handle a config flow for FoxESS Miapp."""
    
    VERSION = 1
    
    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if user_input is None:
            return self.async_show_form(
                step_id="user", data_schema=STEP_USER_DATA_SCHEMA
            )
        
        return self.async_create_entry(
            title=f"FoxESS Miapp ({user_input[CONF_INVERTER_SN]})",
            data=user_input
        )
