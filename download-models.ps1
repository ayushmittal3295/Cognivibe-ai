# Stop the dev server first (Ctrl+C)

Write-Host "Downloading face-api.js models..." -ForegroundColor Green

cd D:\Cognivibe-AI\frontend\public

# Remove old models if any
if (Test-Path "models") {
    Remove-Item -Recurse -Force models -ErrorAction SilentlyContinue
}

# Create models directory
New-Item -ItemType Directory -Force -Path models | Out-Null
cd models

# Download model files
Write-Host "Downloading tiny_face_detector_model..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json" -OutFile "tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1" -OutFile "tiny_face_detector_model-shard1"

Write-Host "Downloading face_expression_model..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json" -OutFile "face_expression_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1" -OutFile "face_expression_model-shard1"

Write-Host "Download complete!" -ForegroundColor Green
Write-Host "Files in models directory:" -ForegroundColor Green
dir

cd D:\Cognivibe-AI\frontend
Write-Host "
You can now run: npm run dev" -ForegroundColor Cyan
