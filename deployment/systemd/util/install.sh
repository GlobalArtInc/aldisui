#!/usr/bin/env bash
set -e

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mkdir -p /etc/aldis
cp ${HERE}/../aldis.service /etc/systemd/system
cp ${HERE}/../env /etc/aldis/env
systemctl daemon-reload
systemctl start aldis.service