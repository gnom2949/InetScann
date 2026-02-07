#!/bin/bash

REDIS_HOST="redis"
REDIS_PORT=6379
FILE="oui.txt"

if [ ! -f "$FILE" ]; then
    echo "File oui.txt not found!"
    exit 1
fi

echo "Importing MAC vendors into Redis..."

while read -r line; do
    PREFIX=$(echo "$line" | awk '{print $1}')
    VENDOR=$(echo "$line" | cut -d' ' -f2-)

    PREFIX=${PREFIX//:/}
    PREFIX=${PREFIX^^}

    redis-cli -h $REDIS_HOST -p $REDIS_PORT HSET "mac:$PREFIX" vendor "$VENDOR"
done < "$FILE"

echo "Done!"
