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
        <div class="col-md-4"></div>
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
<script src="js/architectural-overview.js"></script>
<script src="js/architectural-chart.js"></script>

<script type="application/javascript">
    $(document).ready(function () {
        const REGISTRAR_URL = '<?php echo getenv("REGISTRAR_URL"); ?>';

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
                url: REGISTRAR_URL + "/terms",
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

            $.ajax({
                type: "POST",
                url: REGISTRAR_URL + "/terms/stop"
            }).done(function (data) {
                console.log("unregistered term");
            }).fail(function (data) {
                console.error("could not unregister term");
            });
        });

        var architecturalChart = new ArchitecturalChart("#architectural-overview");
        architecturalChart.config.accessKeyId = "AKIAJK7MH5K6NML2YCJQ";
        architecturalChart.config.accessKeySecret = "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";
        architecturalChart.config.intervalTimeout = 360000;
        architecturalChart.create();

        window.archChart = architecturalChart;

    });
</script>

</body>
</html>
