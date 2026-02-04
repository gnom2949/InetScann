#!/bin/bash

# Настройки
REDIS_CONTAINER="redis"
OUI_URL="http://standards-oui.ieee.org"

echo "Downloading OUI data..."
# Скачиваем CSV, убираем заголовки, парсим поля
# Формат OUI.csv: Registry,Assignment,Organization Name,Organization Address
curl -s "$OUI_URL" | sed 1d > oui.csv

echo "Generating Redis commands..."
# Генерируем команды в формате Redis Protocol или просто CLI
awk -F',' '{
    gsub(/"/, "", $2); # Assignment (OUI)
    gsub(/"/, "", $3); # Organization
    gsub(/"/, "", $4); # Address
    if ($2 != "" && $3 != "") {
        # Команда для хеша вендора
        printf "HMSET mac:%s vendor \"%s\" address \"%s\" registry \"%s\"\n", $2, $3, $4, $1;
        # Команда для индекса
        printf "SADD vendor_to_oui:\"%s\" %s\n", $3, $2;
    }
}' oui.csv > redis_commands.txt

echo "Piping commands to Redis..."
# Пробрасываем файл внутрь контейнера и исполняем за один проход
cat redis_commands.txt | docker exec -i $REDIS_CONTAINER redis-cli --pipe

echo "Done! Clean up..."
rm oui.csv redis_commands.txt
