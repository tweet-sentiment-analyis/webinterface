var sentimentalValues = [2, 3, 2, 1.2, 4, 3.5];


var getMean = function(values){
  var means = [];


  var size = values.length;

  for(var i = 0; i < size ; i ++){
    var mean = 0;
    for(var j = 0; j <= i ; j++){
      mean += values[j];
    }
    mean /= i + 1;
    means.push(mean);
  }

  return means;
};


$(function () {
    $('#highcharts_timeseries').highcharts({
        chart: {
            type: 'areaspline'
        },
        title: {
            text: 'Sentimental Analysis'
        },
        xAxis: {
            categories: ['1', '2', '3', '4', '5']
        },
        yAxis: {
            title: {
                text: 'Sentimental Value'
            }
        },
        series: [{
            name: "'kittens'",
            data: sentimentalValues
        }],
    });
});

$(function () {
    $('#highcharts_mean').highcharts({
        chart: {
            type: 'areaspline'
        },
        title: {
            text: 'Sentimental Mean'
        },
        xAxis: {
            categories: ['1', '2', '3', '4', '5']
        },
        yAxis: {
            title: {
                text: 'Mean Value'
            }
        },
        series: [{
            name: "'kittens'",
            data: getMean(sentimentalValues)
        }],
    });
});
