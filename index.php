<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Twitter Sentiment Analysis</title>

    <script src="bower_components/jquery/dist/jquery.min.js"></script>

    <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/stylesheet.css">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    <script type="application/javascript">
        // configure these values globally...
        window.REGISTRAR_URL = '<?php echo getenv("REGISTRAR_URL"); ?>';
        window.ELASTICSEARCH_URL = '<?php echo getenv("ELASTICSEARCH_URL"); ?>';
        window.AWS_ACCESS_KEY_ID = '<?php echo getenv("AWS_ACCESS_KEY_ID"); ?>';
        window.AWS_ACCESS_KEY_SECRET = '<?php echo getenv("AWS_ACCESS_KEY_SECRET"); ?>';
        window.AWS_EC2_REGION = '<?php echo getenv("AWS_EC2_REGION"); ?>';
        window.AWS_ANALYZER_AUTO_SCALING_GROUP_NAME = '<?php echo getenv("AWS_ANALYZER_AUTO_SCALING_GROUP_NAME"); ?>';
        window.AWS_PRODUCER_AUTO_SCALING_GROUP_NAME = '<?php echo getenv("AWS_PRODUCER_AUTO_SCALING_GROUP_NAME"); ?>';
        window.AWS_FETCHED_TWEETS_SQS_QUEUE_NAME = '<?php echo getenv("AWS_FETCHED_TWEETS_SQS_QUEUE_NAME"); ?>';
        window.AWS_ANALYZED_TWEETS_SQS_QUEUE_NAME = '<?php echo getenv("AWS_ANALYZED_TWEETS_SQS_QUEUE_NAME"); ?>';
        window.REQUEST_INTERVAL = 2500;

        // prepend protocol if mistakenly omitted...
        if (-1 === window.REGISTRAR_URL.indexOf("http://") && -1 === window.REGISTRAR_URL.indexOf("https://")) {
            window.REGISTRAR_URL = "http://" + window.REGISTRAR_URL;
        }

        console.log('Using registrar endpoint: "' + window.REGISTRAR_URL + '"');
        console.log('Using elasticsearch endpoint: "' + window.ELASTICSEARCH_URL + '"');
        console.log('Using aws access key id: "' + window.AWS_ACCESS_KEY_ID + '"');
        console.log('Using aws access key secret: "' + window.AWS_ACCESS_KEY_SECRET + '"');
        console.log('Using aws ec2 region: "' + window.AWS_EC2_REGION + '"');
        console.log('Using aws analyzer auto scaling group name: "' + window.AWS_ANALYZER_AUTO_SCALING_GROUP_NAME + '"');
        console.log('Using aws producer auto scaling group name: "' + window.AWS_PRODUCER_AUTO_SCALING_GROUP_NAME + '"');
        console.log('Using aws fetched tweets SQS queue name: "' + window.AWS_FETCHED_TWEETS_SQS_QUEUE_NAME + '"');
        console.log('Using aws analyzed tweets SQS queue name: "' + window.AWS_ANALYZED_TWEETS_SQS_QUEUE_NAME + '"');
        console.log('Using statistic request interval: "' + window.REQUEST_INTERVAL + '"');
    </script>
</head>
<body>

<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>Twitter Sentiment Analysis</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-md-8">

        </div>
        <div class="col-md-4">

        </div>
    </div>
    <div class="row">
        <div class="col-md-8">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Current Architectural Overview</h3>
                </div>
                <div id="architectural-overview" class="panel-body">

                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Worker Nodes Performance</h3>
                </div>
                <div class="panel-body">
                    <table class="table table-striped table-condensed">
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Type</th>
                            <th>CPU Usage</th>
                        </tr>
                        </thead>
                        <tbody id="workernodes-performance"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Register Term</h3>
                </div>
                <div class="panel-body">
                    <div class="input-group">
                        <input id="search-term" class="form-control" type="text" name="search" placeholder="Register e.g. 'kittens'">
                        <span class="input-group-btn">
                            <button id="search-btn" class="btn btn-primary" type="button">Go!</button>
                            <button id="stop-btn" class="btn btn-default" type="button">Stop</button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-8">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Sentiment Value Series</h3>
                </div>
                <div class="panel-body">
                    <div id="highcharts_timeseries"></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">Aggregated Statistics</h3>
                </div>
                <div class="panel-body">
                    <b id="sentiment-avg">0.00</b> mean
                    <hr>
                    <p><span><strong id="doc-count">0</strong></span> documents</p>
                    <p><span><strong id="sentiment-min">0</strong></span> minimum</p>
                    <p><span><strong id="sentiment-max">0</strong></span> maximum</p>
                    <p><span><strong id="sentiment-variance">0</strong></span> variance</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!--    <script src="http://code.highcharts.com/highcharts.js"></script>-->
<script src="bower_components/highcharts/highcharts.js"></script>
<script src="bower_components/aws-sdk/dist/aws-sdk.js"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="bower_components/elasticsearch/elasticsearch.js"></script>
<script src="bower_components/moment/min/moment-with-locales.js"></script>
<script src="js/timeseries-chart.js"></script>
<script src="js/stats-chart.js"></script>
<script src="js/elasticsearch-client.js"></script>
<script src="js/aws-cloud-metrics.js"></script>
<script src="js/architecture-diagram-chart.js"></script>
<script src="js/architectural-chart.js"></script>

<script type="application/javascript">
    $(document).ready(function () {
        var timeSeriesChart = null;
        var statsChart = null;

        $('#search-btn').click(function (event) {
            event.preventDefault();

            var searchTerm = $("#search-term").val();

            $.ajax({
                beforeSend: function (xhrObj) {
                    xhrObj.setRequestHeader("Content-Type", "application/json");
                    xhrObj.setRequestHeader("Accept", "application/json");
                },
                type: "POST",
                url: window.REGISTRAR_URL + "/terms",
                dataType: "json",
                data: JSON.stringify({
                    "identifier": searchTerm
                })
            }).done(function (data) {
                console.log("registered term " + searchTerm);

                timeSeriesChart = new TimeseriesChart(highcharts_timeseries);
                timeSeriesChart.create(searchTerm);

                statsChart = new StatsChart(
                    "#sentiment-avg",
                    "#doc-count",
                    "#sentiment-min",
                    "#sentiment-max",
                    "#sentiment-variance"
                );
                statsChart.create(searchTerm);

            }).fail(function (data) {
                console.error("Got an error while registering a search term: " + data);
            });
        });

        $('#stop-btn').click(function (event) {
            event.preventDefault();

            timeSeriesChart.destroy();
            statsChart.destroy();

            var searchTerm = $("#search-term").val();

            $.ajax({
                beforeSend: function (xhrObj) {
                    xhrObj.setRequestHeader("Content-Type", "application/json");
                    xhrObj.setRequestHeader("Accept", "application/json");
                },
                type: "POST",
                url: window.REGISTRAR_URL + "/terms/stop",
                dataType: "json",
                data: JSON.stringify({
                    "identifier": searchTerm
                })
            }).done(function (data) {
                console.log("unregistered term");
            }).fail(function (data) {
                console.error("Could not unregister term");
            });
        });

        var architecturalChart = new ArchitecturalChart("#architectural-overview", "#workernodes-performance");
        architecturalChart.config.accessKeyId = window.AWS_ACCESS_KEY_ID;
        architecturalChart.config.accessKeySecret = window.AWS_ACCESS_KEY_SECRET;
        architecturalChart.config.intervalTimeout = window.REQUEST_INTERVAL;
        architecturalChart.create();
    });
</script>

</body>
</html>
