# Caro Server

This is caro online' server

## Connect Server

using websocket `wss://caro-server-ooooo.herokuapp.com/ws?token=${token}`

Example

```javascript
const token = "tokenstring";
const ws = new WebSocket(
  `wss://caro-server-ooooo.herokuapp.com/ws?token=${token}`
);
```

## Register

Send request to server

- Path: `/users/login`
- Method: **POST**
- Body:

  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

## Login

Send request to server

- Path: `/users/register`
- Method: **POST**
- Body:

```json
{
  "username": "string",
  "password": "string"
}
```

- Example Response:

```json
{
  "money": 50300,
  "status": "ONLINE",
  "rankPoint": 20,
  "_id": "612a03f8d439ae497297aca2",
  "username": "abd",
  "password": "",
  "__v": 0,
  "rfToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFiZCIsIl9pZCI6IjYxMmEwM2Y4ZDQzOWFlNDk3Mjk3YWNhMiIsImlhdCI6MTYzMTI2OTM3OH0.aY4xVKYOh2236BFagTmFcpPIlMsQr3HUStr8cVT55Xc"
}
```

## How to send Socket message

- send JSON of object. includes:

  - **key**: message's key
  - **payload**: content need to send
  - **type**: _ROOM_ or _PERSONAL_, _PERSONAL_ is default

- Example

```javascript
ws.send(JSON.stringify({ key: "findMatch" }));
```

## Find Match

Find game and start game

- Socket Message:

```json
{ "key": "findMatch" }
```

- Example Response

```json
{ "key": "findMatch", "payload": { "message": "INFIND" }, "type": "ROOM" }
```

- When finded. You will receive message:

```json
{
  "key": "gameStart",
  "payload": { "roomId": "613b32de3e0f4f001629e185", "player": "firstPlayer" },
  "type": "ROOM"
}
```

## Cancel Match

Find game and start game

- Socket Message:

```json
{ "key": "cancelFindMatch" }
```

- Example Response

```json
{ "key": "cencelFindMatch", "payload": { "message": "OK" }, "type": "PERSONAL" }
```

## Play

play point (x, y)

- Socket Message:

```json
{ "key": "play", "payload": { "x": 0, "y": 0 }, "type": "ROOM" }
```

- Example Response

you don't receive any response

- Count down when your turn is 1 minute
- You will receive a message if your opponent is disconnected

```json
{
  "key": "oppenentDisconnected",
  "payload": { "userId": "612a040fd439ae497297aca6" },
  "type": "ROOM"
}
```

- When you win or lose, you also receive a message:

```json
{
  "key": "wingame||losegame",
  "payload": { "reason": "timeout" },
  "type": "ROOM"
}
```

## Surrender

- Socket Message:

```json
{ "key": "surrender", "type": "ROOM" }
```

- Example Response
  receive endgame message `wingame` or `losegame`
