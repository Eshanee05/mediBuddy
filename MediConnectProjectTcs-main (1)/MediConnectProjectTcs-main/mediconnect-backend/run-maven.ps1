$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.0/binaries/apache-maven-3.9.0-bin.zip"
$zipFile = "maven.zip"
$extractDir = ".maven"

if (-not (Test-Path $extractDir)) {
    Write-Host "Downloading Maven from Archive..."
    # Fallback to older secure protocol handling for older powershell versions
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $mavenUrl -OutFile $zipFile
    Write-Host "Extracting Maven..."
    Expand-Archive -Path $zipFile -DestinationPath $extractDir
    Remove-Item -Path $zipFile -ErrorAction SilentlyContinue
}

$mavenBin = Get-ChildItem -Path $extractDir -Filter "mvn.cmd" -Recurse | Select-Object -First 1

if ($mavenBin) {
    Write-Host "Starting Spring Boot with local Maven..."
    & $mavenBin.FullName spring-boot:run
} else {
    Write-Host "Failed to find Maven executable."
}
