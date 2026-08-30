#!/bin/sh

export ALDIS_MAX_TASKS_PER_TEMPLATE=300
export ALDIS_APPS='{"ansible": {}}'
./aldis server --config .dredd/config.json