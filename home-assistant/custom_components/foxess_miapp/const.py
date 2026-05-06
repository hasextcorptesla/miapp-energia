"""Constants for FoxESS Miapp integration."""
import logging

DOMAIN = "foxess_miapp"
PLATFORMS = ["sensor", "switch"]

_LOGGER = logging.getLogger(__name__)

CONF_API_KEY = "api_key"
CONF_INVERTER_SN = "inverter_sn"
CONF_MIAPP_URL = "miapp_url"

DEFAULT_MIAPP_URL = "http://localhost:3000"
DEFAULT_SCAN_INTERVAL = 30
