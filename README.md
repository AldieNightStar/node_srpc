# NodeJS WS - Node SRPC

# Install
```
npm install AldieNightStar/node_srpc
```

# Server
```js
// Import
const srpc = require("srpc");

let server = srpc.newServer(8080, "MyPassword")
```

# Client
```js
// Import
const srpc = require("srpc");

// Can throw Error if password is wrong or name is busy
let client = await srpc.newClient("ws://localhost:8080", "MyPassword", "NAME");

// Register remote function for other clients
// sender - name of client who calls this function
// arg1, arg2, arg3 ... - arguments from caller
// All that function will return - will be sent to caller
client.funcs.someFunc = function(sender, arg1, arg2, arg3) {};
```

```js
// ===============================================
// ===============================================

// We will chat with "Service1"
let s1 = client.of("Service1")

// Call some of the functions on "Server1" client
// resp - is answer string/object. Depends from response
let resp = await s1.call("someFunc", arg1, arg2, arg3 ...);
let resp = await s1.call( "func2"  , arg1, arg2, arg3 ...);
let resp = await s1.call( "func3"  , arg1, arg2, arg3 ...);

// ===============================================
// ===============================================

// Call function of Service1 without need to create 'of' object for 'Service1'. Just call it and all
let resp = let client.callOf("Service1", "someFunc", arg1, arg2, arg3 ...);

// Close client.
// We can't then communicate with server if we do so
client.close();
```

