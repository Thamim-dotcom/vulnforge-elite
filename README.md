# 🔥 VulnForge Elite

> **The Apex VAPT/Bug Bounty Domination Platform for 2035+**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Tests](https://github.com/vulnforge/vulnforge-elite/workflows/CI/badge.svg)](https://github.com/vulnforge/vulnforge-elite/actions)

VulnForge Elite is a sentient, AI-orchestrated vulnerability assessment and bug bounty automation platform. It fuses quantum-AI orchestration, autonomous multi-vector campaigns, and end-to-end bug bounty automation.

## ✨ Features

- 🤖 **AI-Powered Hunting**: Multi-modal LLM orchestra with local (Ollama) and cloud AI
- 🎯 **Bounty Autopilot**: Autonomous recon → hunt → report → negotiate workflow
- 🔍 **30+ Hunt Modules**: XSS, SQLi, SSRF, IDOR, logic bugs, API fuzzing, and more
- 📊 **Smart Reporting**: AI-generated reports with CVSS, PoC videos, and auto-submission
- 🛡️ **Ethical by Design**: Mandatory bounty-mode enforcement with killswitches
- 🧪 **Self-Testing**: Comprehensive verification suite for all modules

## 🚀 Quick Install

```bash
# One-liner install
curl -sSL https://raw.githubusercontent.com/vulnforge/vulnforge-elite/main/scripts/install.sh | bash

# Or with pip
pip install vulnforge-elite

# Or from source
git clone https://github.com/vulnforge/vulnforge-elite.git
cd vulnforge-elite
pip install -e ".[dev]"
```

## 📖 Usage

### CLI Wizard
```bash
# Interactive mode
vulnforge

# Quick hunt
vulnforge hunt --target example.com --scope web

# Bounty autopilot
vulnforge autopilot --program hackerone/example --max-time 4h

# Verify all modules
vulnforge verify_all
```

### As a Library
```python
import asyncio
from vulnforge import VulnForge

async def main():
    vf = VulnForge()
    
    # Run reconnaissance
    targets = await vf.recon.enumerate("example.com")
    
    # Hunt for vulnerabilities
    vulns = await vf.scan.hunt(targets, modules=["xss", "sqli", "idor"])
    
    # Generate report
    report = await vf.report.generate(vulns, format="pdf")
    
    print(f"Found {len(vulns)} vulnerabilities!")

asyncio.run(main())
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VulnForge Elite                         │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   CLI       │   Web GUI   │   REST API  │   Python SDK     │
├─────────────┴─────────────┴─────────────┴──────────────────┤
│                   Orchestration Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Workflow │  │  Events  │  │ Plugins  │  │ Supervision │ │
│  │  Engine  │  │   Bus    │  │  Nexus   │  │    Trees    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
├────────────────────────────────────────────────────────────┤
│                      AI Brain                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │   LLM    │  │   RLHF   │  │   PoC    │  │ Predictive  │ │
│  │ Orchestra│  │  Agents  │  │Generator │  │  Analytics  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
├────────────────────────────────────────────────────────────┤
│                    Hunt Modules                             │
│  ┌───────┐ ┌───────┐ ┌─────────┐ ┌────────┐ ┌───────────┐  │
│  │ Recon │ │ Scan  │ │ Exploit │ │ Report │ │  Bounty   │  │
│  └───────┘ └───────┘ └─────────┘ └────────┘ └───────────┘  │
└────────────────────────────────────────────────────────────┘
```

## 📂 Module Overview

| Category | Modules | Description |
|----------|---------|-------------|
| **Recon** | subdomain, dns, crt, tech_stack, wayback | Asset enumeration & fingerprinting |
| **Web Scan** | xss, sqli, ssrf, idor, lfi, rce, csrf | Web vulnerability scanning |
| **API** | rest_fuzz, graphql, websocket, grpc | API security testing |
| **Logic** | race_condition, auth_bypass, bola, bfla | Business logic flaws |
| **Exploit** | chain_builder, poc_capture, payload_gen | Exploitation & PoC |
| **Report** | generator, cvss_calc, submitter, negotiator | Reporting & submission |

## 🧪 Testing

```bash
# Run all tests
vulnforge verify_all

# Unit tests
pytest tests/unit -v

# Integration tests
pytest tests/integration -v

# E2E tests
behave tests/e2e

# With coverage
pytest --cov=vulnforge --cov-report=html
```

## 🎮 Demo Mode

Test safely with built-in vulnerable environments:

```bash
# Start demo environment
vulnforge demo start

# Hunt in simulation mode
vulnforge hunt --sim-mode --target vuln.example.com

# Stop demo
vulnforge demo stop
```

## 📚 Documentation

- [Getting Started Guide](docs/guides/getting-started.md)
- [Bounty Reporting Guide](docs/guides/bounty-reporting.md)
- [Negotiation Tips](docs/guides/negotiation-tips.md)
- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api-reference.md)

## ⚖️ Ethics & Compliance

VulnForge Elite is designed for **ethical security testing only**:

- ✅ Mandatory `--bounty-mode` enforces non-destructive testing
- ✅ Automatic scope validation against program rules
- ✅ Built-in killswitches for immediate halt
- ✅ Full audit logging for compliance
- ❌ Never use against unauthorized targets

## 📄 License

AGPLv3 - See [LICENSE](LICENSE) for details.

---

**Built with 🔥 by security researchers, for security researchers.**
