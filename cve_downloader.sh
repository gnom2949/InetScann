#!/bin/bash

# Количество
LIMIT=280

echo "Downloading a CVE's list"
DATA=$(curl -s "https://cve.circl.lu/api/last")

echo "Importing a CVE into Redis"

COUNT=0

echo "$DATA" | jq -c '.[]' | while read -r item; do
	CVE_ID=$(echo "$item" | jq -r '.id')
	SUMMARY=$(echo "$item" | jq -r '.summary')
	CVSS=$(echo "$item" | jq -r '.cvss // 0')
	PUBLISHED=$(echo "$item" | jq -r '.Published')
	MODIFIED=$(echo "$item" | jq -r '.Modified')

	# Добавляем Hash
	redis-cli HSET "cve:$CVE_ID" \
		id "$CVE_ID" \
		summary "$SUMMARY" \
		cvss "$CVSS" \
		published "$PUBLISHED" \
		modified "$MODIFIED" > /dev/null
	# Индекс по CVSS
	redis-cli ZADD "cve:severity" "$CVSS" "$CVE_ID" > /dev/null COUNT=$((COUNT+1))

	COUNT=$((COUNT+1))

	echo "Added: $CVE_ID"

	if [ "$COUNT" -ge "$LIMIT" ]; then
		echo "Import complete. Downloaded $COUNT CVEs."
		exit 0
	fi
done