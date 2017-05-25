FROM matriphe/alpine-php:cli

ADD . ./

# URL to the registrar (aka. tweet fetcher) endpoint
ENV REGISTRAR_URL="localhost"
# AWS Access Key ID to a user with the permissions of at least AmazonSQSReadOnlyAccess, CloudWatchReadOnlyAccess
ENV AWS_ACCESS_KEY_ID="changeThisKeyId"
# AWS Access Key Secret to a user with the permissions of at least AmazonSQSReadOnlyAccess, CloudWatchReadOnlyAccess
ENV AWS_ACCESS_KEY_SECRET="changeThisSecret"
# The region in which the AWS autoscaling group instances are started
ENV AWS_EC2_REGION="us-west-2"
# The AWS autoscaling group name of the instances on which tweets get analyzed
ENV AWS_ANALYZER_AUTO_SCALING_GROUP_NAME="ASE_ASG_Analyzer"
# The AWS autoscaling group name of the instances on which the tweets are pushed to Elasticsearch
ENV AWS_PRODUCER_AUTO_SCALING_GROUP_NAME="ASE_ASG_ESProducer"
# The AWS SQS Queue name in which the fetched tweets are located
ENV AWS_FETCHED_TWEETS_SQS_QUEUE_NAME="fetched-tweets"
# The AWS SQS Queue name in which the analyzed tweets are located
ENV AWS_ANALYZED_TWEETS_SQS_QUEUE_NAME="analyised-tweets"

EXPOSE 8080
ENTRYPOINT [ "php", "-S", "0.0.0.0:8080" ]
