# Enable Long Paths in Windows
# Run this script as Administrator

Write-Host "Enabling Long Paths in Windows..." -ForegroundColor Cyan

try {
    New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                     -Name "LongPathsEnabled" `
                     -Value 1 `
                     -PropertyType DWORD `
                     -Force | Out-Null
    
    Write-Host "✓ Long Paths enabled successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You must restart your computer for this change to take effect." -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure you're running PowerShell as Administrator." -ForegroundColor Yellow
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

