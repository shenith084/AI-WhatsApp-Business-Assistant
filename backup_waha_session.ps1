# Backup WAHA WhatsApp Session Script
Write-Host "[*] Backing up WAHA WhatsApp sessions..." -ForegroundColor Cyan

# 1. Create tar archive inside WAHA container
docker exec waha tar -czf /tmp/waha_sessions.tar.gz -C /app/.sessions .

if ($LASTEXITCODE -eq 0) {
    # 2. Copy the archive to host
    docker cp waha:/tmp/waha_sessions.tar.gz ./waha_sessions_backup.tar.gz
    # 3. Clean up inside container
    docker exec waha rm -f /tmp/waha_sessions.tar.gz

    $backupFile = Get-Item .\waha_sessions_backup.tar.gz
    $sizeMB = [math]::Round($backupFile.Length / 1MB, 2)
    Write-Host "[+] Backup complete: waha_sessions_backup.tar.gz ($sizeMB MB)" -ForegroundColor Green
} else {
    Write-Host "[-] Failed to create backup from WAHA container." -ForegroundColor Red
}
