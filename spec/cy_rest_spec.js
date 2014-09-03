/**
 * Created by kono on 2014/06/09.
 */
var frisby = require('frisby');
var util = require('./test_utility');
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

var yeastNetworkSUID;

/**
    Suite 1: Network model API tests.
*/
describe('Suite 1: Network Model API tests', function() {

    console.log('======== Network API Test =========');


    it('Clean-up and load networks.', function() {
        runs(function() {
            util.deleteAll(BASE_URL + 'networks');
        });
        runs(function() {
            util.count('0', BASE_URL + 'networks/count');
        });
        runs(function() {
            createEmptyNetwork();
        });
        runs(function() {
            util.count('1', BASE_URL + 'networks/count');
        });
        runs(function() {
            post();
            post();
        });
        runs(function() {
            util.count('3', BASE_URL + 'networks/count');
            console.log('almost there...');
        });
    });

    it('Test Tables.', function() {

        runs(function() {
            getAllNetworks();
            console.log('Get all tables done');
        });
        runs(function() {
            console.log('Table test start.');
        });
    });

});


function getNetwork(column, query) {
    frisby.create('Get a network by query: ' + query)
        .get(BASE_URL + 'networks?column=' + column + '&query=' + query)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
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

function getNodes(networkId, expectedSize) {
    frisby.create('Get all nodes for network with SUID: ' + networkId)
        .get(BASE_URL + 'networks/' + networkId + '/nodes')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            var len = json.length;
            expect(len).toBe(expectedSize);
        })
        .toss();
}

function getEdges(networkId, expectedSize) {
    frisby.create('Get all edges for network with SUID: ' + networkId)
        .get(BASE_URL + 'networks/' + networkId + '/edges')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            var len = json.length;
            expect(len).toBe(expectedSize);
        })
        .toss();
}

function getTable(networkId, tableType) {
    frisby.create('Get all edges for network with SUID: ' + networkId)
        .get(BASE_URL + 'networks/' + networkId + '/tables/' + tableType)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json).toBeDefined();
        })
        .toss();
}

function getColumns(networkId, tableType, expectedColCount) {
    frisby.create('Get all edges for network with SUID: ' + networkId)
        .get(BASE_URL + 'networks/' + networkId + '/tables/' + tableType + '/columns')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            expect(json.length).toBe(expectedColCount);
        })
        .inspectJSON()
        .toss();
}

function getNetworkById(suid) {
    frisby.create('Get a network by SUID: ' + suid)
        .get(BASE_URL + 'networks/' + suid)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
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
            testTable(json);
        })
        .toss();
}

function testTable(json) {
    describe("Included matchers:", function() {
        it("Check Table API", function() {
            for (var i = 0; i <= json.length; i++) {
                var network1 = null;
                if (json[i].data.name === 'yeast network2') {
                    network1 = json[i];
                    break;
                }
            }
            expect(network1 !== null).toBe(true);
            var nodeCount = network1.elements.nodes.length;
            var edgeCount = network1.elements.edges.length;
            expect(nodeCount).toBe(331);
            expect(edgeCount).toBe(362);

            getNodes(network1.data.SUID, 331);
            getEdges(network1.data.SUID, 362);
            getTable(network1.data.SUID, 'defaultnode');
            getTable(network1.data.SUID, 'defaultedge');
            getTable(network1.data.SUID, 'defaultnetwork');
            getColumns(network1.data.SUID, 'defaultnode', 6);
            getColumns(network1.data.SUID, 'defaultedge', 11);
            getColumns(network1.data.SUID, 'defaultnetwork', 6);


        });
    });
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
                "node1", "node2", "node3"
            ];
            console.log(nodes);
            addNodes(suid, nodes);
        })
        .toss();
}

function addNodes(networkid, nodes) {
    console.log('Adding new nodes test...');

    frisby.create('Add new nodes to existing network.')
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