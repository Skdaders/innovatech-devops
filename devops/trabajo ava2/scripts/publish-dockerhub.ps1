

param(
    [Parameter(Mandatory = $true)]
    [string] $DockerHubUser="thomasmanquepan",

    [string] $Tag = "latest",

    [string] $ViteApiUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$backendImage = "${DockerHubUser}/innovatech-backend:${Tag}"
$frontendImage = "${DockerHubUser}/innovatech-frontend:${Tag}"

Write-Host "Building $backendImage ..."
docker build -t $backendImage ./backend

Write-Host "Building $frontendImage (VITE_API_URL=$ViteApiUrl) ..."
docker build --build-arg "VITE_API_URL=$ViteApiUrl" -t $frontendImage ./frontend

Write-Host "Pushing $backendImage ..."
docker push $backendImage

Write-Host "Pushing $frontendImage ..."
docker push $frontendImage

Write-Host "Listo."
