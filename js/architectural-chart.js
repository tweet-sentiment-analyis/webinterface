/**
 * A chart rendering on the one hand side an architectural overview diagram
 * and on the other hand side a list of metrics of compute nodes.
 *
 * @param architectureDiagramSelector The element selector as string in which the overview should be rendered
 * @param metricDiagramSelector The element selector as string in which the metrics should be rendered
 *
 * @returns {{config: {accessKeyId: null, accessKeySecret: null, intervalTimeout: number}, create: create, destroy: destroy}}
 * @constructor
 */
function ArchitecturalChart(architectureDiagramSelector, metricDiagramSelector) {
    var config = {
        accessKeyId: null,
        accessKeySecret: null,
        intervalTimeout: 2500
    };

    var archOverview = null;
    var analyzerMetricsIntervalHandler = null;
    var producerMetricsIntervalHandler = null;
    var incomingMsgIntervalHandler = null;
    var outgoingMsgIntervalHandler = null;
    var loadMetricIntervalHandler = null;

    return {
        config: config,
        create: create,
        destroy: destroy
    };

    /**
     * Creates both diagram types, i.e. the architectural overview as well as the metrics list.
     * Additionally, starts to fetch these metrics in an interval specified by the config available
     * of this object.
     */
    function create() {
        var aws = new AwsCloudMetrics();
        // make sure, these are only read only credentials!
        aws.create(config.accessKeyId, config.accessKeySecret);

        window.awsMetrics = aws;

        archOverview = new ArchitectureDiagramChart(architectureDiagramSelector);
        archOverview.create();

        // fetch data about the autoscaling group in order to render the number of
        // analyzer workers correctly
        analyzerMetricsIntervalHandler = setInterval(function pollAnalyzerWorkerNodes() {
            aws.getAnalyzerAutoScalingGroupMetrics(function (data) {
                archOverview.updateAnalyzerWorkerNodes(data.AutoScalingGroups[0].Instances.length)
            })
        }, config.intervalTimeout);

        // fetch data about the autoscaling group in order to render the number of
        // ES producer workers correctly
        producerMetricsIntervalHandler = setInterval(function pollProducerWorkerNodes() {
            aws.getProducerAutoScalingGroupMetrics(function (data) {
                archOverview.updateProducerWorkerNodes(data.AutoScalingGroups[0].Instances.length)
            })
        }, config.intervalTimeout);

        // fetch data on how many messages we get from the incoming SQS queue
        incomingMsgIntervalHandler = setInterval(function pollIncomingMsgs() {
            aws.getIncomingMessageCount(function (data) {
                archOverview.updateIncomingQueueLabel(
                    data.Attributes.ApproximateNumberOfMessages,
                    data.Attributes.ApproximateNumberOfMessagesDelayed,
                    data.Attributes.ApproximateNumberOfMessagesNotVisible
                );
            })
        }, config.intervalTimeout);

        // fetch data on how many mesages we got in the outgoing SQS queue
        outgoingMsgIntervalHandler = setInterval(function pollOutgoingMsgs() {
            aws.getOutComingMessageCount(function (data) {
                archOverview.updateOutgoingQueueLabel(
                    data.Attributes.ApproximateNumberOfMessages,
                    data.Attributes.ApproximateNumberOfMessagesDelayed,
                    data.Attributes.ApproximateNumberOfMessagesNotVisible
                );
            })
        }, config.intervalTimeout);

        // get CPU metrics of each compute node
        loadMetricIntervalHandler = setInterval(function pollLoadMetric() {
            aws.getAnalyzerCpuLoadMetrics(function (requests) {
                // clear previously added metrics
                var avlblInstances = {};
                $(metricDiagramSelector).children().each(function () {
                    var id = $(this).attr('id');
                    avlblInstances[id] = id;
                });

                // remove nodes which do not exist anymore and update the ones which do exist
                for (var instanceId in requests) {
                    if (!requests.hasOwnProperty(instanceId)) {
                        continue;
                    }

                    delete avlblInstances[instanceId];

                    requests[instanceId].cpuMetric.on('success', function (response) {
                        if (response.data.Datapoints.length > 0) {

                            var instanceId = response.request.params.Dimensions[0].Value;
                            var avg = Number((response.data.Datapoints[0].Average).toFixed(2)) + " (avg)";
                            var min = Number((response.data.Datapoints[0].Minimum).toFixed(2)) + " (min)";
                            var max = Number((response.data.Datapoints[0].Maximum).toFixed(2)) + " (max)";
                            $('#' + instanceId).remove();
                            $(metricDiagramSelector)
                                .append('<tr id="' + instanceId + '"><td>' + instanceId + '</td><td>Analyzer</td><td>' + avg + '<br>' + max + '<br>' + min + '</td>');
                        }
                    });

                    // eventually send the request
                    requests[instanceId].cpuMetric.send();
                }

                // all nodes which are still contained, are not listed in the responses anymore
                for (var key in avlblInstances) {
                    $('#' + key).remove();
                }
            });

            aws.getProducerCpuLoadMetrics(function (requests) {
                // clear previously added metrics
                var avlblInstances = {};
                $(metricDiagramSelector).children().each(function () {
                    var id = $(this).attr('id');
                    avlblInstances[id] = id;
                });

                // remove nodes which do not exist anymore and update the ones which do exist
                for (var instanceId in requests) {
                    if (!requests.hasOwnProperty(instanceId)) {
                        continue;
                    }

                    delete avlblInstances[instanceId];

                    requests[instanceId].cpuMetric.on('success', function (response) {
                        if (response.data.Datapoints.length > 0) {

                            var instanceId = response.request.params.Dimensions[0].Value;
                            var avg = Number((response.data.Datapoints[0].Average).toFixed(2)) + " (avg)";
                            var min = Number((response.data.Datapoints[0].Minimum).toFixed(2)) + " (min)";
                            var max = Number((response.data.Datapoints[0].Maximum).toFixed(2)) + " (max)";
                            $('#' + instanceId).remove();
                            $(metricDiagramSelector)
                                .append('<tr id="' + instanceId + '"><td>' + instanceId + '</td><td>ES Producer</td><td>' + avg + '<br>' + max + '<br>' + min + '</td>');
                        }
                    });

                    // eventually send the request
                    requests[instanceId].cpuMetric.send();
                }

                // all nodes which are still contained, are not listed in the responses anymore
                for (var key in avlblInstances) {
                    $('#' + key).remove();
                }
            });
        }, config.intervalTimeout);

    }

    /**
     * Stop fetching data and remove the rendered diagrams
     */
    function destroy() {
        archOverview.destroy();

        if (analyzerMetricsIntervalHandler !== null) {
            clearInterval(analyzerMetricsIntervalHandler);
        }

        if (incomingMsgIntervalHandler !== null) {
            clearInterval(incomingMsgIntervalHandler);
        }

        if (outgoingMsgIntervalHandler !== null) {
            clearInterval(outgoingMsgIntervalHandler);
        }

        if (loadMetricIntervalHandler !== null) {
            clearInterval(loadMetricIntervalHandler);
        }
    }
}
