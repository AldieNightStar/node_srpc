const { newServer } = require("./server");
const wsocketer = require("wsocketer");

async function newClient(addr, password, name) {
    let funcs = {};
    let clientClosed = false;

    let clientPromise = new Promise(async ok => {
        return await wsocketer.newClient(addr, password, name, {
            onConnect: (client) => ok(client),
            onDisconnect: () => clientClosed = true,
            onMessage: async (sender, message) => {
                message = readMessage(message);
                if (message === null) return generateErrorResponse("Message cannot be parsed.");
    
                let func = funcs[message.func];
                if (func === undefined || func === null) return generateErrorResponse("No such function: " + message.func);
                let response = await func(...[sender, ...message.args])
                if (response !== undefined) {
                    return generateResponse(response);
                }
            }
        });
    })
    let client = await awaitOrTimeout(clientPromise, 9000);
    if (client === null) throw new Error("Connection time out!");
    
    return {
        funcs,
        of(name) {
            if (clientClosed) throw new Error("Client was closed");
            return _functionCaller(client, name);
        },
        close() {
            clientClosed = true;
            client.disconnect();
        },
        callOf(name, funcName, ...args) {
            if (clientClosed) throw new Error("Client was closed");
            return this.of(name).call(funcName, ...args);
        }
    }
}

function readMessage(msg) {
    if (msg === undefined || msg === null) return null;
    if (!msg.func) return null;
    if (msg.args === undefined || msg.args === null || !Array.isArray(msg.args)) return null;
    return msg;
}

function generateErrorResponse(message) {
    return { error: message };
}

function generateResponse(message) {
    return { response: message };
}

function createMessage(func, args) {
    if (!Array.isArray(args)) {
        throw new Error("args have to be array");
    }
    return { func, args }
}

function _functionCaller(clientObject, clientName) {
    return {
        async call(funcName, ...args) {
            let message = createMessage(funcName, args);
            let response = await clientObject.send(clientName, message);
            if (response === null) return;
            if (typeof (response) !== "object") return;
            if (response.error) throw new Error(response.error);
            return response.response;
        }
    }
}

function awaitOrTimeout(promise, ms) {
	let timer = new Promise(ok => setTimeout(() => ok(null), ms));
	return Promise.race([promise, timer]);
}



// TEST
async function main() {
    newServer(8080, "s");
    
    let c1 = await newClient("ws://localhost:8080", "s", "cc1");
    c1.funcs.getName = (sender) => {
        return "Harold!"
    };


    let c2 = await newClient("ws://localhost:8080", "s", "cc2");
    c2.funcs.greet = async (sender) => {
        let name = await c2.of("cc1").call("getName")
        return "Hello, " + name;
    };

    console.log(c1);
    let s = await c1.of("cc2").call("greet");
    console.log(s);
}

main();

module.exports = { newServer }