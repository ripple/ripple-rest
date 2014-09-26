// check if obj has keys
var hasKeys = function(obj,keys) {
    var list = Object.keys(obj);
    var hasAllKeys = true;
    var missing = {};
    keys.forEach(function(key) {
        if (list.indexOf(key) == -1) {
            hasAllKeys = false
            missing[key] = true;
        }
    })
    return { hasAllKeys : hasAllKeys, missing : missing }
}
exports.hasKeys = hasKeys;

// used to mark the orderings and count of incoming rippled
exports.orderlist = function(list) {
    // list = [{command:<command>}, ... ]
    var _list = list;
    var idx = 0;
    this.isMock = true;
    this.create = function(list) {
        console.log("CREATE:", list)
        _list = list;
        idx = 0
    }
    this.mark = function(command) {
        console.log("MARK:", command, _list,idx,_list[idx])
        if ((_list[idx]) && (_list[idx].command === command)) {
            console.log("INcrementing idx:",idx)
            idx++
        } else {
            throw new Error("out of order rippled command",command)
        }
    }
    this.test = function() {
        if (this.isMock)
        return (idx === _list.length)
        else return true
    }
    this.reset = function() {
        _list = []
        idx = 0;
    }
};
