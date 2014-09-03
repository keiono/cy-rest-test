var frisby = require('frisby');

this.deleteAll = function (url) {
    console.log('Deleting...');
    frisby.create('Remove all networks')
        .delete(url)
        .expectStatus(204)
        .toss();
}


/*
	Count return value is Long text.
*/
this.count = function (numberOfNet, url) {
    console.log('Counting...');
    frisby.create('Check number of networks.')
        .get(url)
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'text/plain')
        .expectBodyContains(numberOfNet)
        .toss();
}