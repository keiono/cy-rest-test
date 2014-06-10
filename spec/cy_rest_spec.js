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
console.log(yeastNetworkJson.data);


var firstNetworkID = null;

// TODO: initialize Cytoscape.

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
    })
    .toss();


