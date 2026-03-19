@echo off
echo Starting Vibo AI Backend Temporary Servers...
echo Make sure your Python (app.py) and Node (server.js) servers are already running!

start cmd /k "echo Starting Node API Tunnel... && npx localtunnel --port 5001 --subdomain vibo-node-api-mh2026"
start cmd /k "echo Starting Python API Tunnel... && npx localtunnel --port 5000 --subdomain vibo-py-api-mh2026"

echo "Tunnels launched! Your mobile app can now connect globally."
