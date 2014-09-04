/**
 * Created by kono on 2014/06/09.
 */
var frisby = require('frisby');
var request = require('request');

var util = require('./test_utility');

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


    it('Create new network', function() {

        var spy = jasmine.createSpy();
        var networkSpy = jasmine.createSpy();
        util.deleteAll(BASE_URL + 'networks', spy);


        waitsFor(function() {
            return spy.callCount > 0;
        });

        runs(function() {
            expect(spy.callCount).toBe(1);
            spy.callCount = 0;

            util.countTest(0, BASE_URL + 'networks/count', spy);
            waitsFor(function() {
                return spy.callCount > 0;
            });
            runs(function() {
                spy.callCount = 0;

                // Create networks
                util.createNetwork(emptyNetwork, spy);
                util.createNetwork(yeastNetworkJson, networkSpy);

                waitsFor(function() {
                    return spy.callCount === 1 && networkSpy.callCount === 1;
                });

                runs(function() {
                    spy.callCount = 0;
                    var suid = spy.mostRecentCall.args;
                    console.log('Adding nodes to: ' + suid);
                    var nodes = ["a", "b", "c"];
                    util.addNodes(suid, nodes, spy);
                    waitsFor(function() {
                        return spy.callCount > 0;
                    });

                    runs(function() {
                        spy.callCount = 0;
                        var args = spy.mostRecentCall.args;
                        var edges = createEdges(args[0]);
                        console.log('Adding edges to: ' + suid);
                        util.addEdges(suid, edges, spy);
                        waitsFor(function() {
                            return spy.callCount > 0;
                        });

                    runs(function() {
                        spy.callCount = 0;
                        // Now perform tests on these networks.
                        startNetworkTests(2, 'yeast network2', 'empty network');
                        console.log('END: ================================================');
                    });                        


                    });
                });
            });
        });


    });


    // it('Test Tables.', function() {
    //     console.log(' - Table tests');

    //     runs(function() {
    //         getAllNetworks();
    //         console.log('Get all tables done');
    //     });
    //     runs(function() {
    //         console.log('Table test start.');
    //     });
    // });

});


function createEdges(nodes) {
    console.log('nodes>');
    console.log(nodes);

    var edges = [];
    var node1 = nodes[0];
    var node2 = nodes[1];
    var node3 = nodes[2];
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

    return edges;
}


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
    frisby.create('Get all columns for : ' + tableType)
        .get(BASE_URL + 'networks/' + networkId + '/tables/' + tableType + '/columns')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            expect(json.length).toBe(expectedColCount);
        })
        .toss();
}

function createColumn(networkId, tableType, columnName) {
    var newColumn = {
        name: columnName,
        type: 'Double'
    };

    frisby.create('POST new column.')
        .post(BASE_URL + 'networks/' + networkId + '/tables/' + tableType + '/columns',
            newColumn, {
                'json': true,
                'headers': {
                    'Content-Type': 'application/json',
                    'user-agent': 'frisby.js testing framework'
                }
            })
        .expectStatus(204)
        .after(function(err, res, body) {
            getColumns(networkId, 'defaultnode', 7);
            deleteColumn(networkId, 'defaultnode', columnName);
        })
        .toss();
}

function deleteColumn(networkId, tableType, columnName) {
    frisby.create('DELETE a column.')
        .delete(BASE_URL + 'networks/' + networkId + '/tables/' + tableType + '/columns/' + columnName)
        .expectStatus(204)
        .after(function(err, res, body) {
            getColumns(networkId, 'defaultnode', 6);
        })
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

function startNetworkTests(expectedNumberOfNetworks, networkName1, networkName2) {
    frisby.create('Get all networks in current session and start other tests.')
        .get(BASE_URL + 'networks')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        // .inspectJSON()
        .afterJSON(function(json) {
            expect(json.length).toBe(expectedNumberOfNetworks);
            
            var network1 = null;
            var network2 = null;
            for (var i = 0; i < json.length; i++) {
                console.log('IDX = ' + i);
                if (json[i].data.name === networkName1) {
                    network1 = json[i];
                } else if (json[i].data.name === networkName2) {
                    network2 = json[i];
                }
            }
            expect(network1).toBeDefined();
            expect(network2).toBeDefined();

            testTable(network1);
            testNetwork(network2);
        })
        .toss();
}

function testNetwork(network) {
    describe("Perform tests on network API.", function() {
        it("Check network API", function() {
            var nodeCount = network.elements.nodes.length;
            var edgeCount = network.elements.edges.length;
            expect(nodeCount).toBe(3);
            expect(edgeCount).toBe(4);

            getNodes(network.data.SUID, 3);
            getEdges(network.data.SUID, 4);

        });
    });
}


function testTable(network) {
    describe("Included matchers:", function() {
        it("Check Table API", function() {
            expect(network !== null).toBe(true);
            var nodeCount = network.elements.nodes.length;
            var edgeCount = network.elements.edges.length;
            expect(nodeCount).toBe(331);
            expect(edgeCount).toBe(362);

            getNodes(network.data.SUID, 331);
            getEdges(network.data.SUID, 362);
            getTable(network.data.SUID, 'defaultnode');
            getTable(network.data.SUID, 'defaultedge');
            getTable(network.data.SUID, 'defaultnetwork');
            getColumns(network.data.SUID, 'defaultnode', 6);
            getColumns(network.data.SUID, 'defaultedge', 11);
            getColumns(network.data.SUID, 'defaultnetwork', 6);

            runs(function() {
                createColumn(network.data.SUID, 'defaultnode', 'testColumn');
            });
        });
    });
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