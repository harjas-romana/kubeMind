import asyncio
import json
import websockets
import psutil
import os

# CONFIGURATION
# REPLACE THIS with your actual Render URL (use wss:// for secure websocket)
# Example: "wss://kubemind-backend-xyz.onrender.com/ws/stats"
BACKEND_URL = "wss://kubemind.onrender.com/ws/stats"

class Agent:
    def __init__(self, uri):
        self.uri = uri

    async def gather_metrics(self):
        """Reads the actual heartbeat of this machine."""
        return {
            "cpu": psutil.cpu_percent(interval=None),
            "ram": psutil.virtual_memory().percent,
            "source": "Agent-MacBook" # or "Agent-Linux"
        }

    async def start(self):
        print(f"[Agent] Attempting connection to {self.uri}...")
        while True:
            try:
                async with websockets.connect(self.uri) as websocket:
                    print("[Agent] ✅ Connected to KubeMind Cloud.")
                    
                    while True:
                        # 1. Get Real Data
                        metrics = await self.gather_metrics()
                        
                        # 2. Send to Cloud
                        await websocket.send(json.dumps(metrics))
                        print(f"[Agent] 📤 Sent: {metrics}")
                        
                        # 3. Wait
                        await asyncio.sleep(1) # 1-second resolution
                        
            except (websockets.exceptions.ConnectionClosed, OSError) as e:
                print(f"[Agent] ❌ Connection lost: {e}. Retrying in 3s...")
                await asyncio.sleep(3)

if __name__ == "__main__":
    agent = Agent(BACKEND_URL)
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        print("[Agent] Stopping...")