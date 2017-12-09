#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////
// JavaScript SNMP "get" command
//     - async/await style
//     - Promise all - used to SNMP "get" to multiple hosts in parallel
////////////////////////////////////////////////////////////////////////////////
const { callSnmpGet } = require('./lib/callSnmpGet.js');
////////////////////////////////////////////////////////////////////////////////
// MAIN //
//////////

// target hosts array can be a single host in the array or many
let targets = ["172.28.0.12", "172.28.0.13"];

// Create the array of SSH session objects needed to feed Promise all
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

// async await style!
async function snmpGetTaskRunner(arr) {
    try {
        const respones = await Promise.all(arr);
        for (let res of respones) {
            if (res.err) {
                throw new error(res.snmpTarget + ' ' + res.err);
            }
        }
        console.log(JSON.stringify(respones, null, 2));
    } catch (error) {
        console.error(error);
    }
}

snmpGetTaskRunner(snmpGetPromiseArr);
////////////////////////////////////////////////////////////////////////////////
