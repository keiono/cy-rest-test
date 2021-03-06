var frisby = require('frisby');

var BASE_URL = 'http://localhost:1234/v1/';

this.deleteAll = function(url, spy) {
	console.log('Deleting...');
	frisby.create('Remove all networks')
		.delete(url)
		.expectStatus(204)
		.after(function() {
			console.log('Deleted!');
			spy();
		})
		.toss();
}


/*
	Count return value is Long text.
*/
this.countTest = function(numberOfObjects, url, spy) {
	console.log('Counting...');
	frisby.create('Check number of objects.')
		.get(url)
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.expectJSONTypes({
			count: Number
		})
		.afterJSON(function(json) {
			expect(json.count).toBe(numberOfObjects);
			console.log('Count Test Done: ' + json.count);
			spy();
		})
		.toss();
}


this.createNetwork = function(networkObject, spy) {
	console.log('Creating new network...');
	frisby.create('POST an empty network.')
		.post(BASE_URL + 'networks', networkObject, {
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
			console.log('Network Created.  New SUID = ' + json.networkSUID);
			spy(json.networkSUID);
		})
		.toss();
}

this.getNetwork = function(networkId, spy) {
	frisby.create('Get a network by SUID: ' + networkId)
		.get(BASE_URL + 'networks/' + networkId)
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.afterJSON(function(json) {
			expect(json).toBeDefined();
			spy(json);
		})
		.toss();
}


this.addNodes = function(networkid, nodes, spy) {
	console.log('Adding new nodes...');
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
			// Return JSON should includes name-suid pair
			expect(json.length).toBe(nodes.length);
			spy(json);
		})
		.inspectJSON()
		.toss();
}

this.addEdges = function(networkid, edges, spy) {
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
			expect(edges.length).toBe(edges.length);
			spy(json);
		})
		.inspectJSON()
		.toss();
}

this.getNodes = function(networkId, expectedSize, spy) {
	frisby.create('Get all nodes for network with SUID: ' + networkId)
		.get(BASE_URL + 'networks/' + networkId + '/nodes')
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.afterJSON(function(json) {
			expect(json).toBeDefined();
			var len = json.length;
			expect(len).toBe(expectedSize);
			spy(json);
		})
		.toss();
}

this.getNode = function(networkId, nodeId, spy) {
	frisby.create('Get all nodes for network with SUID: ' + networkId)
		.get(BASE_URL + 'networks/' + networkId + '/nodes/' + nodeId)
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.afterJSON(function(json) {
			expect(json).toBeDefined();
			expect(json.data.SUID).toBe(nodeId);
			spy(json);
		})
		.inspectJSON()
		.toss();
}

this.testNodeApi = function(networkId, nodeId, spy) {
	frisby.create('Get first neighbours: ' + nodeId)
		.get(BASE_URL + 'networks/' + networkId + '/nodes/' + nodeId + '/neighbors')
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.afterJSON(function(json) {
			expect(json).toBeDefined();
			spy(json);
		})
		.inspectJSON()
		.toss();

	frisby.create('Get connecting edges: ' + nodeId)
		.get(BASE_URL + 'networks/' + networkId + '/nodes/' + nodeId + '/adjEdges')
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.afterJSON(function(json) {
			expect(json).toBeDefined();
			spy(json);
		})
		.inspectJSON()
		.toss();
}

this.getEdge = function(networkId, edgeId, spy) {
	frisby.create('Get all nodes for network with SUID: ' + networkId)
		.get(BASE_URL + 'networks/' + networkId + '/edges/' + edgeId)
		.expectStatus(200)
		.expectHeaderContains('Content-Type', 'application/json')
		.afterJSON(function(json) {
			expect(json).toBeDefined();
			expect(json.data.SUID).toBe(edgeId);
			expect(json.data.source).toBeDefined();
			expect(json.data.target).toBeDefined();
			expect(json.data.interaction).toBeDefined();
			spy(json);
		})
		.inspectJSON()
		.toss();
}


this.getEdges = function(networkId, expectedSize, spy) {
    frisby.create('Get all edges for network with SUID: ' + networkId)
        .get(BASE_URL + 'networks/' + networkId + '/edges')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'application/json')
        .afterJSON(function(json) {
            expect(json).toBeDefined();
            var len = json.length;
            expect(len).toBe(expectedSize);
            spy(json);
        })
        .toss();
}