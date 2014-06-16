/**
 * Created by kono on 2014/06/09.
 */
var frisby = require('frisby');
var fs = require('fs');

/**
 * Comprehensive test suite for Cytoscape REST API
 */

var BASE_URL = "http://localhost:1234/v1/";

/////////////// Helper Functions ////////////////


/////////////// Actual tests /////////////////

var yeastNetworkJson = require('./yeast1.json');
var firstNetworkID = null;

// TODO: initialize Cytoscape.

console.log("Test start...");
frisby.create('Get number of networks in current session. (Assume this is a new session)')
    .get(BASE_URL + 'networks/count')
    .expectStatus(200)
    .expectHeaderContains('Content-Type', 'application/json')
    .expectJSON({
        networkCount: 0
    })
    .expectJSONTypes({
        networkCount: Number
    })
    .toss();


console.log("Test count");
frisby.create('Get number of networks in current session. (Assume this is a new session)')
    .get(BASE_URL + 'networks/count')
    .expectStatus(200)
    .expectHeaderContains('Content-Type', 'application/json')
    .expectJSON({
        networkCount: 0
    })
    .expectJSONTypes({
        networkCount: Number
    })
    .toss();


console.log("Test POST");
frisby.create('POST a network (Total # of network is 1.')
    .post(BASE_URL + 'networks', yeastNetworkJson, {
        'json': true,
        'headers': {
            'Content-Type': 'application/json',
            'user-agent': 'frisby.js testing framework'
        }
    })
    .expectStatus(200)
    .expectJSONTypes({
        networkSUID: Number
    })
    .afterJSON(function(json) {
        firstNetworkID = json.networkSUID;
        console.log("New Network SUID = " + firstNetworkID);
        frisby.create('Get the new network data')
            .get(BASE_URL + 'networks/' + firstNetworkID)
            .expectStatus(200)
            .expectHeaderContains('Content-Type', 'application/json')
            .afterJSON(function(json) {
                var data = json.data.SUID;
                console.log("Extracted SUID = " + data);
            })
            .toss();
    })
    .toss();