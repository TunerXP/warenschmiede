[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = $PSScriptRoot
$deployRoot = Join-Path $repoRoot '_deploy'

# This allowlist is intentionally explicit: repository and maintenance files must
# never become part of the upload package.
$websiteDirectories = @(
    'assets',
    '3d_druck',
    'docs',
    'download',
    'druck',
    'ki',
    'kontakt',
    'leistungen',
    'tools',
    'verification',
    'admin'
)

$websiteRootFiles = @(
    'CNAME',
    'robots.txt',
    'sitemap.xml',
    'styles.css',
    'ws.png'
)

if (Test-Path -LiteralPath $deployRoot) {
    Remove-Item -LiteralPath $deployRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $deployRoot | Out-Null

# All public HTML pages in the repository root are deployable.
Get-ChildItem -LiteralPath $repoRoot -File -Filter '*.html' | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $deployRoot
}

foreach ($file in $websiteRootFiles) {
    $source = Join-Path $repoRoot $file
    if (Test-Path -LiteralPath $source -PathType Leaf) {
        Copy-Item -LiteralPath $source -Destination $deployRoot
    }
}

foreach ($directory in $websiteDirectories) {
    $source = Join-Path $repoRoot $directory
    if (Test-Path -LiteralPath $source -PathType Container) {
        Copy-Item -LiteralPath $source -Destination $deployRoot -Recurse
    }
}

# Defense in depth for development helpers that may live below an otherwise
# public directory. Productive documents such as PDF files remain untouched.
Get-ChildItem -LiteralPath $deployRoot -Recurse -File | Where-Object {
    $_.Extension -in @('.py', '.ps1', '.md') -or
    $_.Name -match '(?i)(seo|perf(?:ormance)?)[-_]?report'
} | Remove-Item -Force

$forbiddenDirectories = @('.git', '.vs', 'dateien', 'logs', 'webseite_2_0', '_deploy')
$unexpected = Get-ChildItem -LiteralPath $deployRoot -Recurse -Force | Where-Object {
    $relativeParts = $_.FullName.Substring($deployRoot.Length).TrimStart('/', '\') -split '[/\\]'
    @($relativeParts | Where-Object { $_ -in $forbiddenDirectories }).Count -gt 0
}
if ($unexpected) {
    throw "Nicht erlaubter Inhalt im Deploy-Ordner gefunden: $($unexpected.FullName -join ', ')"
}

Write-Host "Deploy-Ordner wurde neu erstellt: $deployRoot"
Write-Host 'Hinweis: IONOS /dateien und /logs werden von diesem Skript nicht berührt.'
