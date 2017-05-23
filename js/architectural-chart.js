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


    function create() {
        var aws = new AwsCloudMetrics();
        // make sure, these are only read only credentials!
        // aws.create("AKIAJK7MH5K6NML2YCJQ", "UPfoZdr63I4jUfOcilu5HTytpT+zA2LhhDsyF052");
        aws.create(config.accessKeyId, config.accessKeySecret);

        window.awsMetrics = aws;

        archOverview = new ArchitectureDiagramChart(architectureDiagramSelector);
        archOverview.create();

        analyzerMetricsIntervalHandler = setInterval(function pollAnalyzerWorkerNodes() {
            aws.getAnalyzerAutoScalingGroupMetrics(function (data) {
                archOverview.updateAnalyzerWorkerNodes(data.AutoScalingGroups[0].Instances.length)
            })
        }, config.intervalTimeout);

        producerMetricsIntervalHandler = setInterval(function pollProducerWorkerNodes() {
            aws.getProducerAutoScalingGroupMetrics(function (data) {
                archOverview.updateProducerWorkerNodes(data.AutoScalingGroups[0].Instances.length)
            })
        }, config.intervalTimeout);

        incomingMsgIntervalHandler = setInterval(function pollIncomingMsgs() {
            aws.getIncomingMessageCount(function (data) {
                archOverview.updateIncomingQueueLabel(
                    data.Attributes.ApproximateNumberOfMessages,
                    data.Attributes.ApproximateNumberOfMessagesDelayed,
                    data.Attributes.ApproximateNumberOfMessagesNotVisible
                );
            })
        }, config.intervalTimeout);

        outgoingMsgIntervalHandler = setInterval(function pollOutgoingMsgs() {
            aws.getOutComingMessageCount(function (data) {
                archOverview.updateOutgoingQueueLabel(
                    data.Attributes.ApproximateNumberOfMessages,
                    data.Attributes.ApproximateNumberOfMessagesDelayed,
                    data.Attributes.ApproximateNumberOfMessagesNotVisible
                );
            })
        }, config.intervalTimeout);

        loadMetricIntervalHandler = setInterval(function pollLoadMetric() {
            aws.getCpuLoadMetrics(function (requests) {
                // clear previously added metrics
                var avlblInstances = {};
                $(metricDiagramSelector + " .list-group").children().each(function () {
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

                            var instanceId =  response.request.params.Dimensions[0].Value;
                            $('#' + instanceId).remove();
                            $(metricDiagramSelector + " .list-group")
                                .append('<li id="' + instanceId + '" class="list-group-item"><h4>' + instanceId + '</h4><ul><li><strong>Average:</strong> ' + response.data.Datapoints[0].Average + '</li><li><strong>Maximum:</strong> '+ response.data.Datapoints[0].Maximum +'</li><li><strong>Minimum:</strong> '+ response.data.Datapoints[0].Minimum +'</li></ul></li>');
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
