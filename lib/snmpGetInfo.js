////////////////////////////////////////////////////////////////////////////////
// REF: https://github.com/stephenwvickers/node-net-snmp
const snmp = require("net-snmp");
const localDebug = false;
////////////////////////////////////////////////////////////////////////////////
// SNMP "get" in Promise style //
/////////////////////////////////
function snmpGetInfo(snmpRequest) {
    return new Promise((resolve, reject) => {
        const session = snmp.createSession(snmpRequest.snmpTarget, snmpRequest.snmpString, snmpRequest.snmpOptions);
        session.get(snmpRequest.snmpOids, (err, varbinds) => {
            let res = {};
            res.oids = [];
            res.snmpTarget = snmpRequest.snmpTarget;
            if (err) {
                if (localDebug) { console.error(err); }
                reject(err)
            } else {
                for (let varbind of varbinds) {
                    if (snmp.isVarbindError(varbind)) {
                        if (localDebug) { console.error(snmp.varbindError(varbind)) }
                        res.err = snmp.varbindError(varbind);
                        resovle(res.err);
                    } else {
                        res.oids.push(varbind.oid + " = " + varbind.value);
                    }
                }
                if (localDebug) { console.log(res); }
                resolve(res);
            }
        });
    })
};
module.exports.snmpGetInfo = snmpGetInfo;
////////////////////////////////////////////////////////////////////////////////
