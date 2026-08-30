# Aldis

Modern web UI for Ansible, OpenTofu/Terraform/Terragrunt, PowerShell and other DevOps tools.

[![Dev](https://github.com/GlobalArtInc/aldisui/actions/workflows/dev.yml/badge.svg)](https://github.com/GlobalArtInc/aldisui/actions/workflows/dev.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Aldis lets you run playbooks and infrastructure code from a browser instead of a terminal:
schedule them, hand them to teammates without handing out SSH keys, and see what failed and why.

## Key concepts

1. **Project** — a collection of related resources, configurations and tasks.
2. **Task template** — a reusable definition of a job that can be run on demand or on a schedule.
3. **Task** — a single execution of a template.
4. **Schedule** — automated execution at a given time or interval.
5. **Inventory** — the target hosts a task runs against.
6. **Variable group** — environment variables and secrets available to a task at run time.

## Getting started

### Docker

```bash
docker run -p 3000:3000 --name aldis \
	-e ALDIS_DB_DIALECT=sqlite \
	-e ALDIS_ADMIN=admin \
	-e ALDIS_ADMIN_PASSWORD=changeme \
	-e ALDIS_ADMIN_NAME=Admin \
	-e ALDIS_ADMIN_EMAIL=admin@localhost \
	-d globalartinc/aldis:latest
```

Ready-made Compose files for the server, runners and a database live in [deployment/compose](deployment/compose).

### From source

Requires Go and Node.js; see [CONTRIBUTING.md](CONTRIBUTING.md) for the full development setup.

```bash
git clone https://github.com/GlobalArtInc/aldisui.git
cd aldisui
go-task all
```

## Configuration

Every setting can be supplied through a config file, an environment variable or both.
Environment variables use the `ALDIS_` prefix; the complete, authoritative list of options
is [config.schema.yaml](config.schema.yaml). The HTTP API is described in [api-docs.yml](api-docs.yml).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).

Aldis is a fork of [Semaphore UI](https://github.com/semaphoreui/semaphore) by Denis Gukov and
Castaway Labs LLC, rebranded and maintained independently by GlobalArt. It is not affiliated with,
endorsed by, or supported by the Semaphore UI project. Upstream copyright notices are retained in
[LICENSE](LICENSE) as the MIT license requires.
