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
    .post('http://localhost:1234/v1/networks', yeastNetworkJson, {
        'json': true,
        'headers': {
            'Content-Type': 'application/json',
            'user-agent': 'node.js'
        }
    })
    .expectStatus(200)
    .toss();
