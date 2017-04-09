function StatsChart(sentimentAvgSelector, docCountSelector, sentimentMinSelector, sentimentMaxSelector, sentimentVarianceSelector) {

    var intervalHandler = null;

    return {
        create: create,
        destroy: destroy
    };

    function create(searchTerm) {
        var esClient = new ElasticsearchClient();

        intervalHandler = setInterval(function pollStats() {
            var result = esClient.stats(searchTerm);

            result.then(function (data) {
                if ("aggregations" in data && "sentiment_stats" in data.aggregations ) {
                    $(sentimentAvgSelector).html(data.aggregations.sentiment_stats.avg.toFixed(2));
                    $(docCountSelector).html(data.aggregations.sentiment_stats.count);
                    $(sentimentMinSelector).html(data.aggregations.sentiment_stats.min.toFixed(2));
                    $(sentimentMaxSelector).html(data.aggregations.sentiment_stats.max.toFixed(2));
                    $(sentimentVarianceSelector).html(data.aggregations.sentiment_stats.variance.toFixed(2));
                }
            });
        }, 1000);
    }

    function destroy() {
        if (intervalHandler !== null) {
            intervalHandler.clear();
        }
    }
}
