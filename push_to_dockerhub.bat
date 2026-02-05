@echo off
echo --- 🐳 Docker Hub Backup Strategy ---
echo This script will build the images on YOUR laptop and push them to Docker Hub.
echo This bypasses Render's weak CPU/RAM limits.
echo.

set /p DOCKER_USERNAME="Enter your Docker Hub Username: "
set BACKEND_IMAGE=%DOCKER_USERNAME%/face-attendance-backend:latest
set FRONTEND_IMAGE=%DOCKER_USERNAME%/face-attendance-frontend:latest

echo.
echo 1. Logging into Docker Hub...
docker login

echo.
echo 2. Building Backend Image...
echo    (This might take 5-10 minutes the first time)
docker build -t %BACKEND_IMAGE% -f backend/Dockerfile .

echo.
echo 3. Building Frontend Image...
docker build -t %FRONTEND_IMAGE% -f frontend/Dockerfile ./frontend

echo.
echo 4. Pushing to Docker Hub...
docker push %BACKEND_IMAGE%
docker push %FRONTEND_IMAGE%

echo.
echo ✅ DONE! 
echo Now update your deployment configuration to use:
echo Backend: %BACKEND_IMAGE%
echo Frontend: %FRONTEND_IMAGE%
pause
