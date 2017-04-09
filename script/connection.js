var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: '127.0.0.1:9200'
});

// delete the term
function dropIndex(termValue) {
  return client.indices.delete({
    term: termValue,
  });
}

function createIndex(jsonMessage) {
  return client.indices.create({
    index: 'tweet',
    body: jsonMessage
  });
}

function addToIndex(jsonMessage) {
  return client.index({
    index: 'example_index',
    type: 'posts',
    id: '1',
    body: jsonMessage,
    refresh: true
  });
}

function search(termValue) {
  return client.search({
    index: 'example_index',
    type: 'posts',
    body: {
      query: {
        match: {
          body: termValue
        }
      }
    }
  });
}

function closeConnection() {
  client.close();
}

function getFromIndex() {
  return client.get({
    id: 1,
    index: 'test',
    type: 'house',
  }).then(log);

}

function waitForIndexing() {
  log('Wait for indexing ....');
  return new Promise(function(resolve) {
    setTimeout(resolve, 2000);
  });
}
