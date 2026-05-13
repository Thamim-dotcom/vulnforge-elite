"""
VulnForge Elite - The Apex VAPT/Bug Bounty Domination Platform

Copyright (C) 2024-2035 VulnForge Elite Team
Licensed under AGPLv3
"""

__version__ = "1.0.0"
__author__ = "VulnForge Elite Team"

from vulnforge.core.engine import VulnForge
from vulnforge.core.config import Config

__all__ = ["VulnForge", "Config", "__version__"]
