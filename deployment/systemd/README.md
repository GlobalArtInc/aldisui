# Systemd

This is a sample systemd unit and environment file that you could use to run Aldis with.
It makes no assumptions about running proxies or databases on the same machine, 
therefore if you do this you may wish to add addition requirements to the unit.
The unit will write logs to the journal which you can read with
`journalctl -u aldis.service`

Example install, and for convenience uninstall, scripts are located in the util subdir.
The scripts expect that you manually install aldis in /usr/bin and have the config file
`/etc/aldis/config.json`. The config file location can be altered via the env file,
which the script installs as `/etc/aldis/env`.

## Environment variables

The sample `env` file sets `ALDIS_CONFIG`. You can add optional runtime overrides:

| Variable                 | Purpose                                                    |
|--------------------------|------------------------------------------------------------|
| `ALDIS_LOG_LEVEL`    | Log verbosity (`DEBUG`, `INFO`, `WARN`, `ERROR`)           |
| `ALDIS_DEBUG_FILTER` | Namespace filter for debug output (requires `DEBUG` level) |
| `ALDIS_DB_DIALECT`   | Database dialect override (`sqlite`, `mysql`, `postgres`)  |

Example `/etc/aldis/env` snippet for troubleshooting:

```bash
ALDIS_CONFIG=/etc/aldis/config.json
ALDIS_LOG_LEVEL=DEBUG
ALDIS_DEBUG_FILTER=runner,task_pool
```

After editing the env file, reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart aldis.service
journalctl -u aldis.service -f
```

> **BoltDB removed in 2.19:** Configs with `"dialect": "bolt"` will not start. Use
> `sqlite`, `mysql`, or `postgres` instead.