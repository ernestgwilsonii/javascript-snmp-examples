#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////
// JavaScript SNMP "get" command
//     - Promise style
//     - Promise all - used to SNMP "get" to multiple hosts in parallel
////////////////////////////////////////////////////////////////////////////////
// REF: https://github.com/stephenwvickers/node-net-snmp
const snmp = require("net-snmp");
const localDebug = false;
////////////////////////////////////////////////////////////////////////////////


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


////////////////////////////////////////////////////////////////////////////////
// SNMP "get" Promise wrapper //
////////////////////////////////
function callSnmpGet(snmpRequest) {
    return new Promise((resolve, reject) => {
        snmpGetInfo(snmpRequest)
            .then((res) => {
                resolve(res);
            }).catch(err => {
                reject(err)
            });
    })
}
module.exports.callSnmpGet = callSnmpGet;
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// MAIN //
//////////

// target hosts array can be a single host in the array or many
let targets = ["172.28.0.12", "172.28.0.13"];

// Create the array of SNMP session objects needed to feed Promise all
let snmpGetPromiseArr = [];
for (let target of targets) {
    let snmpRequest = {
        snmpOptions: {
            port: 161,
            retries: 3,
            timeout: 5000,
            transport: 'udp4',
            version: 1 // Boolean value only! 0 = SNMPv1 and 1 = SNMPv2c
        },
        snmpOids: ["1.3.6.1.2.1.1.1.0", "1.3.6.1.2.1.1.2.0", "1.3.6.1.2.1.1.3.0", "1.3.6.1.2.1.1.4.0", "1.3.6.1.2.1.1.5.0", "1.3.6.1.2.1.1.6.0"],
        snmpString: 'public'
    }
    snmpRequest.snmpTarget = target;
    snmpGetPromiseArr.push(callSnmpGet(snmpRequest));
}

// Promise all style!
Promise.all(snmpGetPromiseArr)
    .then((arr) => {
        for (let res of arr) {
            if (res.err) {
                throw new error(res.snmpTarget + ' ' + res.err);
            }
        }
        console.log(JSON.stringify(arr, null, 2));
    }).catch(error => {
        console.log(error);
    });
////////////////////////////////////////////////////////////////////////////////
