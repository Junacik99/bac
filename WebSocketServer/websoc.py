import asyncio
import websockets

USERS = set()

async def msg_handler(websocket):
    global USERS
    try:
        # Register user
        USERS.add(websocket)
        # Broadcast messasge
        async for message in websocket:
            print(message)
            websockets.broadcast(USERS, message)
       
    finally:
        # Unregister user
        USERS.remove(websocket)
        

async def main():
    server1 = await websockets.serve(msg_handler, '', 8765)
    await asyncio.gather(server1.wait_closed())


asyncio.run(main())
