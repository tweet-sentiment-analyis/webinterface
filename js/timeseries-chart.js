function TimeseriesChart(selector) {
    var chart = null;
    var intervalHandler = null;

    return {
        create: create,
        destroy: destroy
    };

    function create(searchTerm) {
        chart = Highcharts.chart(selector, {
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {
                        updateChart(this, searchTerm);
                    }
                }
            },
            title: {
                text: 'Sentiment Value for term ' + searchTerm
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Sentiment Value'
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Sentiment Series for ' + searchTerm,
                lineWidth: 0.5,
                marker: {
                    enabled: true,
                    radius: 2
                },
                data: (function () {
                    // generate an array of random data
                    return [
                        // {
                        //     id: 0,
                        //     x: (new Date()).getTime(),
                        //     y: 2.5
                        // }
                    ];
                }())
            }]
        });
    }

    function updateChart(esHighChartThis, searchTerm) {
        var esClient = new ElasticsearchClient();

        var series = esHighChartThis.series[0];
        intervalHandler = setInterval(function () {
            var result = esClient.search(searchTerm);

            result.then(function (data) {
                if ("aggregations" in data && "time_buckets" in data.aggregations && "buckets" in data.aggregations.time_buckets) {
                    var buckets = data.aggregations.time_buckets.buckets;

                    var dataPointsAdded = false;
                    for (var i=0; i<buckets.length; i++) {
                        if (buckets[i].doc_count > 0) {
                            dataPointsAdded = true;
                            var dataPoint = {
                                id: buckets[i].key,
                                x: buckets[i].key,
                                y: buckets[i].sentiment.value
                            };

                            if (-1 === series.data.indexOf(dataPoint)) {
                                series.addPoint(
                                    dataPoint,
                                    false,
                                    false,
                                    false
                                );
                            }
                        }
                    }

                    if (dataPointsAdded) {
                        chart.redraw(false);
                    }
                }
            });
        }, 1000);
    }

    function destroy() {
        if (null !== intervalHandler) {
            clearInterval(intervalHandler);
        }
    }
}
