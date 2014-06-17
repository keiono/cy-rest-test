/**
 * Created by kono on 2014/06/09.
 */
var frisby = require('frisby');
var fs = require('fs');

/**
 * Comprehensive test suite for Cytoscape REST API
 */
var BASE_URL = "http://localhost:1234/v1/";

/////////////// Actual tests /////////////////

var yeastNetworkJson = require('./yeast1.json');
var emptyNetwork = {
    data: {
        name: 'empty network'
    },
    elements: {
        nodes:[],
        edges:[]
    }
};

// TODO: initialize Cytoscape.
describe("Suite 1: Network Model API tests", function() {

    console.log("############### Cytoscpe REST API Test Suite #####################");
    it("Cleanup.  Delete all networks.", function(done) {
        deleteAll();
        done();
        count(0);
    });

    it("Create an empty network.", function(done) {
        console.log("Creating empty network...");
        createEmptyNetwork();
        done();
        count(1);
        getNetwork('name', 'empty network');
    });

    it("Post first network.", function(done) {
        console.log("#2 Posting");
        post();
        done();
    });

    it("Post first network 2.", function(done) {
        post();
        done();
    });

    it("Check number of network.", function() {
        console.log("#3 Checking network count");
        count(3);
    });

    it("contains spec with an expectation", function(done) {
        post2();
        console.log("####### PASSED2.");
        done();
    });
    it("Get all networks.", function(done) {
        getAllNetworks();
        done();
    });

    it("test4", function() {
        count(4);

    });
});


function count(numberOfNet) {
    console.log("Counting...");
    frisby.create('Get number of networks in current session. (Assume this is a new session)')
        .get(BASE_URL + 'networks/count')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .expectJSON({
            networkCount: numberOfNet
        })
        .expectJSONTypes({
            networkCount: Number
        })
        .toss();
}

function getNetwork(column, query) {
    frisby.create('Get a network by query: ' + query)
        .get(BASE_URL + 'networks?column=' + column + '&query=' + query)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .inspectJSON()
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            var len = json.length;
            expect(len).toBe(1);

            var network = json[0];
            expect(network).toBeDefined();
            var networkName = network.data.name;
            expect(networkName).toBe('empty network');
        })
        .toss();

}

function getAllNetworks() {
    frisby.create('Get number of networks in current session. (Assume this is a new session)')
        .get(BASE_URL + 'networks')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .toss();
}

function deleteAll() {
    console.log("Deleting...");
    frisby.create('Get number of networks in current session. (Assume this is a new session)')
        .delete(BASE_URL + 'networks')
        .expectStatus(204)
        .toss();
}

function createEmptyNetwork() {
    frisby.create('POST an empty network.')
        .post(BASE_URL + 'networks',emptyNetwork, {
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
        .inspectJSON()
        .toss();
}

function post() {

    console.log("POSTing");
    frisby.create('POST a new network.')
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
        .inspectJSON()
        .afterJSON(function(json) {
            var suid = json.networkSUID;
            expect(suid).toBeDefined();
            console.log('SUID: ' + suid);
        })
        .toss();
}

function post2() {
    console.log("Posting new network 2");
    frisby.create('POST a network (Total # of network is 1.')
        .post(BASE_URL + 'networks', yeastNetworkJson, {
            'json': true,
            'headers': {
                'Content-Type': 'application/json',
                'user-agent': 'frisby.js testing framework'
            }
        })
        .expectStatus(200)
        .toss();
}