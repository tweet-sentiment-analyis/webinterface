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
        getAutoScalingGroupMetrics: getAutoScalingGroupMetrics,
        getGroupTotalInstances: getGroupTotalInstances,
        getGroupPendingInstances: getGroupPendingInstances,
        getIncomingMessageCount: getIncomingMessageCount,
        getOutComingMessageCount: getOutComingMessageCount
    };

    function create(accessKeyId, secretAccessKey) {
        config.accessKeyId = accessKeyId;
        config.secretAccessKey = secretAccessKey;

        AWS.config.update(config);
        AWS.config.region = 'us-west-2'; // TODO: make configurable
        AWS.config.apiVersions = {
            cloudwatch: '2010-08-01',
            sqs: '2012-11-05'
        };

        cloudWatch = new AWS.CloudWatch();
        autoScaling = new AWS.AutoScaling();
        sqs = new AWS.SQS();
    }

    function getAutoScalingGroupMetrics(callbackFn) {
        var params = {
            AutoScalingGroupNames: [
                "ASE_ASG_Analyzer"
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
        getMessageCount('fetched-tweets', callbackFn);
    }

    function getOutComingMessageCount(callbackFn) {
        getMessageCount('analyised-tweets', callbackFn);
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

    function getGroupTotalInstances(startTime, endTime, callbackFn) {
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#getMetricStatistics-property
        var params = {
            StartTime: startTime.format(),
            EndTime: endTime.format(),
            Period: 60, // multiple of 60 if smaller than 15 days

            Dimensions: [
                {
                    Name: 'AutoScalingGroupName',
                    Value: 'ASE_ASG_Analyzer'
                }
            ],
            Statistics: [
                "SampleCount"
                /*  SampleCount| Average | Sum | Minimum | Maximum, */
            ],
            Unit: "None"
        };

        var params = {
            Dimensions: [
                {
                    Name: 'AutoScalingGroupName',
                    Value: 'ASE_ASG_Analyzer'
                }
            ],
            Namespace: 'AWS/AutoScaling',
            MetricName: 'GroupTotalInstances',
            NextToken: 'STRING_VALUE'
        };

        cloudWatch.getMetricStatistics(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                callbackFn(data.Datapoints);
            }
        });
    }

    function getGroupPendingInstances(startTime, endTime, callbackFn) {
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#getMetricStatistics-property
        var params = {
            StartTime: startTime.format(),
            EndTime: endTime.format(),
            Period: 60, // multiple of 60 if smaller than 15 days
            Namespace: 'AWS/AutoScaling',
            MetricName: 'GroupPendingInstances',
            Dimensions: [
                {
                    Name: 'AutoScalingGroupName',
                    Value: 'ASE_ASG_Analyzer'
                }
            ],
            Statistics: [
                "SampleCount"
                /*  SampleCount| Average | Sum | Minimum | Maximum, */
            ],
            Unit: "None"
        };

        cloudWatch.getMetricStatistics(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                callbackFn(data.Datapoints);
            }
        });
    }
}
