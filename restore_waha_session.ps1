# Restore WAHA WhatsApp Session Script
Write-Host "[*] Restoring WAHA WhatsApp sessions..." -ForegroundColor Cyan

if (-not (Test-Path ".\waha_sessions_backup.tar.gz")) {
    Write-Host "[-] Error: 'waha_sessions_backup.tar.gz' not found." -ForegroundColor Red
    exit 1
}

# 1. Copy archive into container
docker cp .\waha_sessions_backup.tar.gz waha:/tmp/waha_sessions.tar.gz

# 2. Extract into /app/.sessions
docker exec waha tar -xzf /tmp/waha_sessions.tar.gz -C /app/.sessions

# 3. Clean up archive in container
docker exec waha rm -f /tmp/waha_sessions.tar.gz

# 4. Restart WAHA container to reload session
docker restart waha

Write-Host "[+] Restore complete. WAHA restarted and session is reloading." -ForegroundColor Green
