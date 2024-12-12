#!/bin/bash

cmd="$@"

until (echo > localhost:8888) &> /dev/null; do
  echo "Server is unavailable"
  sleep 10
done

echo "Server is up"
exec $cmd +