import asyncio
import websockets

prev_message = ""
USERS = set()

async def echo(websocket):
    async for message in websocket:
        print(message)
        await websocket.send(message)



async def echo2(websocket):
    async for message in websocket:
        print(message)
        await websocket.send(message)



USERS = set()
def register(websocket):
    if websocket not in USERS:
        USERS.add(websocket)

async def ph(websocket, path):
    while True:
        register(websocket) #not sure if you need to place it here
        need_update = await websocket.recv()
        #check unique token to verify that it's the database
        message = 'update'#here we receive message that the data
        #has been added and need to message the
        #browser to update
        print('socket executed')
        if USERS:       # asyncio.wait doesn't accept an empty list
            await asyncio.wait([user.send(message) for user in USERS])

async def counter(websocket):
    global USERS
    try:
        # Register user
        USERS.add(websocket)
        async for message in websocket:
            print(message)
            websockets.broadcast(USERS, message)
       
    finally:
        # Unregister user
        USERS.remove(websocket)
        

async def main():
    server1 = await websockets.serve(counter, '', 8765)
    server2 = await websockets.serve(echo2, '', 8766)
    await asyncio.gather(server1.wait_closed(), server2.wait_closed())


asyncio.run(main())