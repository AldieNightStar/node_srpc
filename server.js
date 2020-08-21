const wsocketer = require("wsocketer");

function newServer(port, password) {
    return wsocketer.newServer(port, password);
}

module.exports = { newServer }