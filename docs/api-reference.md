# 🔌 Core Python SDK & API Reference

Integrate automated vulnerability scanning directly inside your internal infrastructure pipelines using the pure Python bindings.

## Class Definition: `VulnForge`

```python
from vulnforge import VulnForge

vf = VulnForge(
    config_path="~/.vulnforge/elite.toml",
    sim_mode=False
)
```

### Module Interfaces

#### `vf.recon.enumerate(target: str) -> list[str]`
Executes deep passive subdomain matching, public certificate queries, and exposed directory path extractions.

#### `vf.scan.hunt(targets: list[str], modules: list[str]) -> list[dict]`
Spawns highly concurrent execution passes triggering specific vulnerability validation scripts against live endpoints.

#### `vf.report.generate(findings: list[dict], format: str = "json") -> str`
Compiles standardized export arrays complete with automated CVSS scoring matrices and payload proof traces.
