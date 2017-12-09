#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////
// JavaScript SNMP "get" command
//     - Callback style
////////////////////////////////////////////////////////////////////////////////
// REF: https://github.com/stephenwvickers/node-net-snmp
const snmp = require("net-snmp");
const localDebug = false;
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// SNMP "get" in Callback style //
//////////////////////////////////
function snmpGetInfo(snmpRequest, callback) {
    const session = snmp.createSession(snmpRequest.snmpTarget, snmpRequest.snmpString, snmpRequest.snmpOptions);
    session.get(snmpRequest.snmpOids, (err, varbinds) => {
        let res = {};
        res.oids = [];
        res.snmpTarget = snmpRequest.snmpTarget;
        if (err) {
            if (localDebug) { console.error(err); }
            callback(err)
        } else {
            for (let varbind of varbinds) {
                if (snmp.isVarbindError(varbind)) {
                    if (localDebug) { console.error(snmp.varbindError(varbind)) }
                    res.err = snmp.varbindError(varbind);
                    callback(res.err);
                } else {
                    res.oids.push(varbind.oid + " = " + varbind.value);
                }
            }
            if (localDebug) { console.log(res); }
            callback(null, res);
        }
    });
};
module.exports.snmpGetInfo = snmpGetInfo;
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// MAIN //
//////////

let target = '172.28.0.12';

let snmpRequest = {
    snmpOptions: {
        port: 161,
        retries: 3,
        timeout: 5000,
        transport: 'udp4',
        version: 1 // Boolean value only! 0 = SNMPv1 and 1 = SNMPv2c
    },
    snmpOids: ["1.3.6.1.2.1.1.1.0", "1.3.6.1.2.1.1.2.0", "1.3.6.1.2.1.1.3.0", "1.3.6.1.2.1.1.4.0", "1.3.6.1.2.1.1.5.0", "1.3.6.1.2.1.1.6.0"],
    snmpString: 'public',
    snmpTarget: target
}

snmpGetInfo(snmpRequest, (error, results) => {
    if (error) {
        console.log(error.snmpTarget);
        console.log(error.err);
    }
    console.log(JSON.stringify(results, null, 2));
});
////////////////////////////////////////////////////////////////////////////////
