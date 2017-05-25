/**
 * Allows to fetch different statistics from AWS.
 * Note, that the given keypair must have at least the following access permissions at AWS:
 * - AmazonSQSReadOnlyAccess
 * - CloudWatchReadOnlyAccess
 *
 * @returns {{create: create, getAnalyzerAutoScalingGroupMetrics: getAnalyzerAutoScalingGroupMetrics, getProducerAutoScalingGroupMetrics: getProducerAutoScalingGroupMetrics, getIncomingMessageCount: getIncomingMessageCount, getOutComingMessageCount: getOutComingMessageCount, getAnalyzerCpuLoadMetrics: getAnalyzerCpuLoadMetrics, getProducerCpuLoadMetrics: getProducerCpuLoadMetrics}}
 * @constructor
 */
function AwsCloudMetrics() {
    var config = {
        accessKeyId: null,
        secretAccessKey: null
    };

    var cloudWatch = null;
    var autoScaling = null;
    var sqs = null;

    return {
        create: create,
        getAnalyzerAutoScalingGroupMetrics: getAnalyzerAutoScalingGroupMetrics,
        getProducerAutoScalingGroupMetrics: getProducerAutoScalingGroupMetrics,
        getIncomingMessageCount: getIncomingMessageCount,
        getOutComingMessageCount: getOutComingMessageCount,
        getAnalyzerCpuLoadMetrics: getAnalyzerCpuLoadMetrics,
        getProducerCpuLoadMetrics: getProducerCpuLoadMetrics
    };

    /**
     * Initialize the connection to AWS.
     * Note, that the given keypair must have at least the following access permissions at AWS:
     * - AmazonSQSReadOnlyAccess
     * - CloudWatchReadOnlyAccess
     *
     * @param accessKeyId The access key id to AWS
     * @param secretAccessKey The access key secret to AWS
     */
    function create(accessKeyId, secretAccessKey) {
        config.accessKeyId = accessKeyId;
        config.secretAccessKey = secretAccessKey;

        AWS.config.update(config);
        AWS.config.region = window.AWS_EC2_REGION;
        AWS.config.apiVersions = {
            cloudwatch: '2010-08-01',
            sqs: '2012-11-05'
        };

        cloudWatch = new AWS.CloudWatch();
        autoScaling = new AWS.AutoScaling();
        sqs = new AWS.SQS();
    }

    function getAnalyzerCpuLoadMetrics(callbackFn) {
        getAnalyzerAutoScalingGroupMetrics(function (data) {
            if (data.AutoScalingGroups.length < 1) {
                console.error("No analyzer autoscaling group available for getting load metrics");
                return;
            }

            var period = 300; // seconds
            var startTime = moment().utc();
            startTime.subtract(period, 'seconds');

            var endTime = moment().utc();

            var responses = {};
            for (var key in data.AutoScalingGroups[0].Instances) {
                var instanceId = data.AutoScalingGroups[0].Instances[key].InstanceId;

                var params = {
                    StartTime: startTime.format(),
                    EndTime: endTime.format(),
                    Period: period, // multiple of 60 if smaller than 15 days
                    Namespace: "AWS/EC2",
                    MetricName: "CPUUtilization",
                    Dimensions: [{
                        Name: "InstanceId",
                        Value: instanceId
                    }],
                    Statistics: [
                        "Average",
                        "Minimum",
                        "Maximum"
                        /*  SampleCount| Average | Sum | Minimum | Maximum, */
                    ],
                    Unit: "Percent"
                };

                if (!(instanceId in responses)) {
                    responses[instanceId] = {};
                }

                // do not send the request yet but wait until callbacks are registered
                jQuery.extend(responses[instanceId], {
                    cpuMetric: cloudWatch.getMetricStatistics(params)
                });
            }

            callbackFn(responses);

        });
    }

    function getProducerCpuLoadMetrics(callbackFn) {
        getProducerAutoScalingGroupMetrics(function (data) {
            if (data.AutoScalingGroups.length < 1) {
                console.error("No analyzer autoscaling group available for getting load metrics");
                return;
            }

            var period = 300; // seconds
            var startTime = moment().utc();
            startTime.subtract(period, 'seconds');

            var endTime = moment().utc();

            var responses = {};
            for (var key in data.AutoScalingGroups[0].Instances) {
                var instanceId = data.AutoScalingGroups[0].Instances[key].InstanceId;

                var params = {
                    StartTime: startTime.format(),
                    EndTime: endTime.format(),
                    Period: period, // multiple of 60 if smaller than 15 days
                    Namespace: "AWS/EC2",
                    MetricName: "CPUUtilization",
                    Dimensions: [{
                        Name: "InstanceId",
                        Value: instanceId
                    }],
                    Statistics: [
                        "Average",
                        "Minimum",
                        "Maximum"
                        /*  SampleCount| Average | Sum | Minimum | Maximum, */
                    ],
                    Unit: "Percent"
                };

                if (!(instanceId in responses)) {
                    responses[instanceId] = {};
                }

                // do not send the request yet but wait until callbacks are registered
                jQuery.extend(responses[instanceId], {
                    cpuMetric: cloudWatch.getMetricStatistics(params)
                });
            }

            callbackFn(responses);

        });
    }

    function getAnalyzerAutoScalingGroupMetrics(callbackFn) {
        var params = {
            AutoScalingGroupNames: [
                window.AWS_ANALYZER_AUTO_SCALING_GROUP_NAME
            ]
        };

        autoScaling.describeAutoScalingGroups(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                callbackFn(data);
            }
        });
    }

    function getProducerAutoScalingGroupMetrics(callbackFn) {
        var params = {
            AutoScalingGroupNames: [
                window.AWS_PRODUCER_AUTO_SCALING_GROUP_NAME
            ]
        };

        autoScaling.describeAutoScalingGroups(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                callbackFn(data);
            }
        });
    }

    function getIncomingMessageCount(callbackFn) {
        getMessageCount(window.AWS_FETCHED_TWEETS_SQS_QUEUE_NAME, callbackFn);
    }

    function getOutComingMessageCount(callbackFn) {
        getMessageCount(window.AWS_ANALYZED_TWEETS_SQS_QUEUE_NAME, callbackFn);
    }

    function getMessageCount(queueNamePrefix, callbackFn) {
        var params = {
            QueueNamePrefix: queueNamePrefix
        };

        var queueAttrParams = {
            QueueUrl: null,
            AttributeNames: [
                "All"
                //All | Policy | VisibilityTimeout | MaximumMessageSize | MessageRetentionPeriod | ApproximateNumberOfMessages | ApproximateNumberOfMessagesNotVisible | CreatedTimestamp | LastModifiedTimestamp | QueueArn | ApproximateNumberOfMessagesDelayed | DelaySeconds | ReceiveMessageWaitTimeSeconds | RedrivePolicy | FifoQueue | ContentBasedDeduplication | KmsMasterKeyId | KmsDataKeyReusePeriodSeconds,
            ]
        };

        sqs.listQueues(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                if (data.QueueUrls.length > 0) {
                    queueAttrParams.QueueUrl = data.QueueUrls[0];
                    sqs.getQueueAttributes(queueAttrParams, function (err, data) {
                        if (err) {
                            console.log(err, err.stack);
                        } else {
                            callbackFn(data);
                        }
                    });
                } else {
                    console.error("Could not find queue with prefix: " + queueNamePrefix);
                }
            }
        });
    }
}
