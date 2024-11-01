#!/bin/bash

host="$1"
shift
cmd="$@"

until (echo > /dev/tcp/$host/5433) &> /dev/null; do
  echo "Postgres is unavailable"
  sleep 10
done

echo "Postgres is up"
exec $cmd +