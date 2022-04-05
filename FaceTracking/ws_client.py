# WebSocket Client
import websockets

# Send message
async def send(message):
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send(str(message))
        await websocket.recv()