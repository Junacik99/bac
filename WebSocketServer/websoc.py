#########################
#     Martin Takács     #
#       xtakac07        #
#     Websocket server  #
# executable script for #
#       websockets      #
#########################

import asyncio
import websockets

USERS = set()
port = 8765

async def msg_handler(websocket):
    global USERS
    try:
        # Register user
        USERS.add(websocket)
        # Broadcast incoming messages from the registered user
        async for message in websocket:
            # print(message)
            websockets.broadcast(USERS, message)
       
    finally:
        # Unregister user
        USERS.remove(websocket)
        

async def main():
    print("Starting websocket server")
    # The port number is always 8765
    server1 = await websockets.serve(msg_handler, '', port)
    await asyncio.gather(server1.wait_closed())


asyncio.run(main())
