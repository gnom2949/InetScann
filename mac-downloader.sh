#!/bin/bash

# Настройки подключения к Redis в Docker
REDIS_HOST="redis"
REDIS_PORT="6379"

echo "Downloading IEEE OUI list (MAC addresses)..."
DATA_URL="https://standards-oui.ieee.org"
RAW_DATA=$(curl -s "$DATA_URL")

echo "Importing MAC Vendors into Redis..."

COUNT=0
echo "$RAW_DATA" | sed 1d | while IFS=',' read -r registry assignment organization address; do
    # Убираем лишние кавычки из данных
    OUI=$(echo "$assignment" | tr -d '"')
    VENDOR=$(echo "$organization" | tr -d '"')
    
    if [ -z "$OUI" ] || [ -z "$VENDOR" ]; then continue; fi

    # 1. Сохраняем подробную информацию о вендоре
    docker exec -i $REDIS_HOST redis-cli HMSET "mac:$OUI" \
        vendor "$VENDOR" \
        address "$address" \
        registry "$registry" > /dev/null

    # 2. Создаем индекс: список всех OUI для конкретного вендора
    # Это позволит потом связать вендора с CVE
    docker exec -i $REDIS_HOST redis-cli SADD "vendor_to_oui:$VENDOR" "$OUI" > /dev/null

    COUNT=$((COUNT+1))
    
    if (( COUNT % 500 == 0 )); then
        echo "Processed $COUNT vendors..."
    fi
done

echo "Import complete. Added $COUNT MAC prefixes."