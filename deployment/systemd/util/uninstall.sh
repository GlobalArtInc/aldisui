#!/usr/bin/env bash
set -e

systemctl stop aldis.service
systemctl disable aldis.service
rm /etc/systemd/system/aldis.service
rm -rf /etc/aldis