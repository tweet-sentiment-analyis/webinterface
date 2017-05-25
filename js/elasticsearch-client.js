function ElasticsearchClient() {
    var client = new elasticsearch.Client({
        hosts: window.ELASTICSEARCH_URL
    });

    return {
        search: search,
        stats: stats
    };

    function search(termValue) {
        return client.search({
            index: 'twitter',
            type: 'tweet',
            body: {
                "size": 10,
                "query": {
                    "bool": {
                        "must": [{
                            "term": {
                                "term": termValue
                            }
                        }]
                    }
                },
                "aggs": {
                    "time_buckets": {
                        "date_histogram": {
                            "field": "timestamp",
                            "interval": "second"
                        },
                        "aggs": {
                            "sentiment": {
                                "avg": {"field": "sentiment"}
                            }
                        }
                    }
                }
            }
        });
    }

    function stats(termValue) {
        return client.search({
            index: 'twitter',
            type: 'tweet',
            body: {
                "query": {
                    "bool": {
                        "must": [{
                            "term": {
                                "term": termValue
                            }
                        }]
                    }
                },
                "aggs" : {
                    "sentiment_stats" : { "extended_stats" : { "field" : "sentiment" } }
                }
            }
        });
    }
}
