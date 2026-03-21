@echo off
title Internet Gateway - Ngrok Tunnel
echo Starting Permanent Ngrok Tunnel for Vibo AI...
echo Domain: valvar-jacquelin-gradualistic.ngrok-free.dev
echo.
echo Please wait, establishing secure connection to Ngrok servers...
ngrok http --domain=valvar-jacquelin-gradualistic.ngrok-free.dev 5001
pause
