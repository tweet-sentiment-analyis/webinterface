function ArchitecturalChart(chartSelector) {
    var config = {
        accessKeyId: null,
        accessKeySecret: null,
        intervalTimeout: 2500
    };

    var archOverview = null;
    var metricsIntervalHandler = null;
    var incomingMsgIntervalHandler = null;
    var outgoingMsgIntervalHandler = null;

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

        archOverview = new ArchitecturalOverview(chartSelector);
        archOverview.create();

        window.archOverview = archOverview;

        metricsIntervalHandler = setInterval(function pollWorkerNodes() {
            aws.getAutoScalingGroupMetrics(function (data) {
                archOverview.updateWorkerNodes(data.AutoScalingGroups[0].Instances.length)
            })
        }, config.intervalTimeout);

        incomingMsgIntervalHandler = setInterval(function pollIncomingMsgs() {
            aws.getIncomingMessageCount(function (data) {
                console.log(data);
                archOverview.updateIncomingQueueLabel(
                    data.Attributes.ApproximateNumberOfMessages,
                    data.Attributes.ApproximateNumberOfMessagesDelayed,
                    data.Attributes.ApproximateNumberOfMessagesNotVisible
                );
            })
        }, config.intervalTimeout);

        outgoingMsgIntervalHandler = setInterval(function pollOutgoingMsgs() {
            aws.getOutComingMessageCount(function (data) {
                console.log(data);
                archOverview.updateOutgoingQueueLabel(
                    data.Attributes.ApproximateNumberOfMessages,
                    data.Attributes.ApproximateNumberOfMessagesDelayed,
                    data.Attributes.ApproximateNumberOfMessagesNotVisible
                );
            })
        }, config.intervalTimeout);
    }

    function destroy() {
        archOverview.destroy();

        if (metricsIntervalHandler !== null) {
            clearInterval(metricsIntervalHandler);
        }

        if (incomingMsgIntervalHandler !== null) {
            clearInterval(incomingMsgIntervalHandler);
        }

        if (outgoingMsgIntervalHandler !== null) {
            clearInterval(outgoingMsgIntervalHandler);
        }
    }
}
