/**
 * Created by kono on 2014/06/09.
 */
var frisby = require('frisby');
// var fs = require('fs');
// var async = require('async');
// var request = require('request');

/**
 * Comprehensive test suite for Cytoscape REST API
 */
var BASE_URL = 'http://localhost:1234/v1/';

// Sample JSON file generated from galFiltered.sif
var yeastNetworkJson = require('./yeast1.json');

// An empty network JSON in Cytoscape.js format
var emptyNetwork = {
    data: {
        name: 'empty network'
    },
    elements: {
        nodes: [],
        edges: []
    }
};


/**
    Suite 1: Network model API tests.
*/
describe('Suite 1: Network Model API tests', function() {

    it('Cleanup.  Delete all networks.', function(done) {
        deleteAll();
        done();
        count(0);
    });

    it('Create a network from scratch.', function(done) {
        createEmptyNetwork();
        done();
        count(1);
    }, 1000);

    it('POST a network from file.', function(done) {
        post();
        done();
    });

    it('POST one more network from file.', function(done) {
        post();
        done();
        count(3);
    });


    it('Get all networks.', function(done) {
        getAllNetworks();
        done();
    });
});


function count(numberOfNet) {
    console.log('Counting...');
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


function getNetworkById(suid) {
    frisby.create('Get a network by SUID: ' + suid)
        .get(BASE_URL + 'networks/' + suid)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .inspectJSON()
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            var targetSuid = json.data.SUID;
            expect(targetSuid).toBe(suid);
        })
        .toss();
}

function getAllNetworks() {
    frisby.create('Get number of networks in current session. (Assume this is a new session)')
        .get(BASE_URL + 'networks')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json.length).toBe(3);
            // TODO: add more tests here...
        })
        .toss();
}

function deleteAll() {
    console.log('Deleting...');
    frisby.create('Get number of networks in current session. (Assume this is a new session)')
        .delete(BASE_URL + 'networks')
        .expectStatus(204)
        .toss();
}

function createEmptyNetwork() {
    frisby.create('POST an empty network.')
        .post(BASE_URL + 'networks', emptyNetwork, {
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
            var suid = json.networkSUID;
            var nodes = [
                'node1', 'node2', 'node3'
            ];
            addNodes(suid, nodes);
        })
        .toss();
}

function addNodes(networkid, nodes) {
    frisby.create('Add nodes to existing network.')
        .post(BASE_URL + 'networks/' + networkid + '/nodes', nodes, {
            'json': true,
            'headers': {
                'Content-Type': 'application/json',
                'user-agent': 'frisby.js testing framework'
            }
        })
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json.length).toBe(3);

            var edges = [];
            var node1 = json[0];
            var node2 = json[1];
            var node3 = json[2];
            var edge1 = {
                source: node1.SUID,
                target: node2.SUID,
                interaction: 'pp'
            };

            var edge2 = {
                source: node1.SUID,
                target: node2.SUID,
                interaction: 'pd'
            };

            var edge3 = {
                source: node1.SUID,
                target: node3.SUID,
                interaction: 'pd'
            };

            var edge4 = {
                source: node2.SUID,
                target: node3.SUID,
                interaction: 'pd'
            }
            edges.push(edge1);
            edges.push(edge2);
            edges.push(edge3);
            edges.push(edge4);
            addEdges(networkid, edges);
        })
        .inspectJSON()
        .toss();
}

function addEdges(networkid, edges) {
    frisby.create('Add edges to existing network.')
        .post(BASE_URL + 'networks/' + networkid + '/edges', edges, {
            'json': true,
            'headers': {
                'Content-Type': 'application/json',
                'user-agent': 'frisby.js testing framework'
            }
        })
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            var edges = json;
            expect(edges.length).toBe(4);
            getNetworkById(networkid);
        })
        .inspectJSON()
        .toss();
}

function getCount() {
    frisby.create('Add nodes to existing network.')
        .post(BASE_URL + 'networks/' + networkid + '/nodes', nodes, {
            'json': true,
            'headers': {
                'Content-Type': 'application/json',
                'user-agent': 'frisby.js testing framework'
            }
        })
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            getNetwork();
        })
        .inspectJSON()
        .toss();
}

function post() {

    console.log('POSTing');
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
    console.log('Posting new network 2');
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