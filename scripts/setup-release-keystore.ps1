$ErrorActionPreference = "Stop"

Write-Host "Configuracao da keystore de release (softscan)" -ForegroundColor Cyan
Write-Host "Os valores digitados aqui NAO aparecem no chat, ficam soh no seu computador." -ForegroundColor Cyan
Write-Host ""

$storeFile = Read-Host "Cole o caminho COMPLETO do arquivo .jks (ja copiado para um lugar fixo, ex: C:\Users\Felipe Silva\Documents\keystores\softscan-release.jks)"
$storePasswordSecure = Read-Host "Keystore Password" -AsSecureString
$keyAlias = Read-Host "Key Alias"
$keyPasswordSecure = Read-Host "Key Password" -AsSecureString

function ConvertFrom-SecureStringPlain($secure) {
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

$storePassword = ConvertFrom-SecureStringPlain $storePasswordSecure
$keyPassword = ConvertFrom-SecureStringPlain $keyPasswordSecure

if (-not (Test-Path $storeFile)) {
    Write-Host "AVISO: nao encontrei um arquivo nesse caminho. Confira se copiou certo antes de continuar." -ForegroundColor Yellow
}

$gradleDir = "$env:USERPROFILE\.gradle"
if (-not (Test-Path $gradleDir)) {
    New-Item -ItemType Directory -Path $gradleDir -Force | Out-Null
}

$propsPath = "$gradleDir\gradle.properties"
$storeFileEscaped = $storeFile -replace '\\', '\\\\'

$lines = @(
    "SOFTSCAN_RELEASE_STORE_FILE=$storeFileEscaped"
    "SOFTSCAN_RELEASE_STORE_PASSWORD=$storePassword"
    "SOFTSCAN_RELEASE_KEY_ALIAS=$keyAlias"
    "SOFTSCAN_RELEASE_KEY_PASSWORD=$keyPassword"
)

$existing = @()
if (Test-Path $propsPath) {
    $existing = Get-Content $propsPath | Where-Object { $_ -notmatch '^SOFTSCAN_RELEASE_' }
}

($existing + $lines) | Set-Content -Path $propsPath -Encoding utf8

Write-Host ""
Write-Host "Pronto. Configuracao salva em $propsPath" -ForegroundColor Green
Write-Host "Pode fechar este terminal e avisar o Claude que terminou." -ForegroundColor Green
