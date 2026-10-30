# Render docs/design/mockups.html frames to PNG via headless Chrome.
# Usage:
#   powershell -ExecutionPolicy Bypass -File docs/design/tools/render-previews.ps1
#   powershell -ExecutionPolicy Bypass -File docs/design/tools/render-previews.ps1 -Only content-light,content-dark
param(
    [string[]]$Only = @(),
    [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$designDir = Split-Path -Parent $scriptDir
$previewDir = if ($OutDir) { $OutDir } else { Join-Path $designDir "preview" }

$frameIds = @(
    # section 1: full screens
    "start-playing",
    "start-revealed",
    "loading",
    "content-light",
    "content-dark",
    "content-split",
    "content-en",
    "content-chat-chip",
    "content-anatomy",
    # section 2: per-panel closeups
    "p-topbar",
    "p-sidebar",
    "p-detail",
    "p-chat",
    "p-stage",
    "p-start",
    "p-loading",
    "p-control"
)

if ($Only.Count -gt 0) {
    $frameIds = $frameIds | Where-Object { $Only -contains $_ }
}
if ($frameIds.Count -eq 0) {
    throw "No frame matched -Only filter."
}

function Find-Chrome {
    $candidates = @(
        $env:CHROME_PATH,
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path $c)) { return $c }
    }
    throw "Chrome/Edge not found. Set CHROME_PATH to the browser executable."
}

$chrome = Find-Chrome
$html = Join-Path $designDir "mockups.html"
if (-not (Test-Path $html)) { throw "mockups.html not found: $html" }

if (-not (Test-Path $previewDir)) {
    New-Item -ItemType Directory -Path $previewDir | Out-Null
}

$uri = ([System.Uri]$html).AbsoluteUri
$profileRoot = Join-Path $env:TEMP ("anatomy-shot-" + [System.Guid]::NewGuid().ToString("N"))

Write-Host "chrome : $chrome"
Write-Host "source : $uri"
Write-Host "output : $previewDir"
Write-Host ""

$failed = 0
foreach ($id in $frameIds) {
    $out = Join-Path $previewDir ("{0}.png" -f $id)
    $profile = Join-Path $profileRoot $id
    $url = "{0}?shot={1}" -f $uri, $id

    # Use Start-Process: Chrome writes extension warnings to stderr, and a direct
    # call (& chrome ...) would be treated as a terminating error while Stop is set.
    $chromeArgs = @(
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--user-data-dir=`"$profile`"",
        "--window-size=1920,1080",
        "--force-device-scale-factor=1",
        "--virtual-time-budget=2500",
        "--screenshot=`"$out`"",
        "`"$url`""
    )
    $log = Join-Path $profileRoot ("{0}.log" -f $id)
    Start-Process -FilePath $chrome -ArgumentList $chromeArgs -Wait -WindowStyle Hidden `
        -RedirectStandardError $log -RedirectStandardOutput ($log + ".out") | Out-Null

    # 阈值只用来抓"空白/失败"帧：纯白遮罩帧压缩后只有几 KB，所以放到 3KB
    if ((Test-Path $out) -and ((Get-Item $out).Length -gt 3000)) {
        Write-Host ("  OK   {0,-20} {1,8:N0} bytes" -f $id, (Get-Item $out).Length)
    }
    else {
        Write-Host ("  FAIL {0}" -f $id)
        $failed++
    }
}

Remove-Item -Recurse -Force $profileRoot -ErrorAction SilentlyContinue

if ($failed -gt 0) {
    throw "$failed frame(s) failed to render."
}
Write-Host ""
Write-Host ("Done: {0} frame(s) -> {1}" -f $frameIds.Count, $previewDir)
