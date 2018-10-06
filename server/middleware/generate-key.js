var rand = require("random-key");

var generateKey = function() {
    return rand.generate(40); 
}

module.exports = {
    generateKey
}