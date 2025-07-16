#!/bin/bash

# Brand configuration
BRAND_NAME=${BRAND_NAME:-"Your Company"}
# Health Check Script for $BRAND_NAME
# Monitors system health and sends alerts if issues are detected

BASE_URL=${1:-"http://localhost:5173"}
WEBHOOK_URL=${WEBHOOK_URL:-""}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check endpoint
check_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    
    echo "Checking $url..."
    
    response=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" "$url")
    status_code=$(echo $response | cut -d',' -f1)
    response_time=$(echo $response | cut -d',' -f2)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $url - Status: $status_code, Time: ${response_time}s${NC}"
        return 0
    else
        echo -e "${RED}❌ $url - Status: $status_code, Time: ${response_time}s${NC}"
        return 1
    fi
}

# Function to send alert
send_alert() {
    local message=$1
    
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🚨 $BRAND_NAME Alert: $message\"}"
    fi
    
    echo -e "${RED}🚨 ALERT: $message${NC}"
}

echo "🏥 Starting $BRAND_NAME Health Check..."
echo "Target: $BASE_URL"
echo "Timestamp: $(date)"

# Critical endpoints to check
ENDPOINTS=(
    "$BASE_URL/"
    "$BASE_URL/properties"
    "$BASE_URL/early-access"
    "$BASE_URL/system-health"
)

# Check each endpoint
failed_checks=0
for endpoint in "${ENDPOINTS[@]}"; do
    if ! check_endpoint "$endpoint"; then
        failed_checks=$((failed_checks + 1))
        send_alert "Endpoint $endpoint is failing"
    fi
    sleep 1
done

# Check Supabase health
echo "Checking Supabase services..."
SUPABASE_URL="https://qncfxkgjydeiefyhyllk.supabase.co"

if ! check_endpoint "$SUPABASE_URL/rest/v1/" 401; then
    failed_checks=$((failed_checks + 1))
    send_alert "Supabase API is not responding"
fi

# Check edge functions
if ! check_endpoint "$SUPABASE_URL/functions/v1/get-exchange-rates" 200; then
    echo -e "${YELLOW}⚠️ Edge functions may be cold starting${NC}"
fi

# Performance checks
echo "🚀 Running performance checks..."

# Check if response times are acceptable (< 2 seconds)
for endpoint in "${ENDPOINTS[@]}"; do
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$endpoint")
    
    if (( $(echo "$response_time > 2.0" | bc -l) )); then
        send_alert "Slow response time detected for $endpoint: ${response_time}s"
        failed_checks=$((failed_checks + 1))
    fi
done

# SSL certificate check (for production)
if [[ $BASE_URL == https* ]]; then
    echo "🔒 Checking SSL certificate..."
    domain=$(echo $BASE_URL | sed 's|https://||' | sed 's|/.*||')
    
    cert_expiry=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    cert_expiry_timestamp=$(date -d "$cert_expiry" +%s)
    current_timestamp=$(date +%s)
    days_until_expiry=$(( (cert_expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_until_expiry -lt 30 ]; then
        send_alert "SSL certificate expires in $days_until_expiry days"
        failed_checks=$((failed_checks + 1))
    else
        echo -e "${GREEN}✅ SSL certificate valid for $days_until_expiry days${NC}"
    fi
fi

# Summary
echo "📊 Health Check Summary:"
echo "- Timestamp: $(date)"
echo "- Failed checks: $failed_checks"

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 $failed_checks health checks failed${NC}"
    send_alert "$failed_checks health checks failed"
    exit 1
fi