function ArchitectureDiagramChart(diagramChartSelector) {

    var chartElement = $(diagramChartSelector);
    var chartDiv = $(diagramChartSelector)[0];
    var renderer = null;

    var incomingQueueLabels = [];
    var incomingQueueElement = null;
    var incomingQueueArrow = null;

    var outgoingQueueLabels = [];
    var outgoingQueueElement = null;
    var outgoingQueue1Arrow = null;
    var outgoingQueue2Arrow = null;

    var currentAnalyzerWorkerElements = [];
    var currentProducerWorkerElements = [];

    renderer = new Highcharts.Renderer(chartDiv, chartElement.width(), 300);

    // queues
    var queueColor = 'orange';
    var queueLeftPadding = 5;
    var queueTopPadding = 5;
    var queueWidth = chartElement.width() / 7;
    var queueHeight = chartElement.height() / 7;

    // labels
    var labelHeight = 10;

    // worker nodes
    var workerNodeColor = 'blue';
    var workerNodeTopPadding = queueTopPadding;
    var workerNodeWidth = queueWidth;

    // arrows
    var arrowHeight = 5;
    var arrowHeadWidth = 10;
    var arrowLineWidth = queueWidth - arrowHeadWidth - 4 * queueLeftPadding;
    var arrowBeginY = queueTopPadding + (queueHeight / 2) - arrowHeight;
    var arrow1BeginX = queueLeftPadding + queueWidth;
    var arrow2BeginX = arrow1BeginX + arrowLineWidth + workerNodeWidth + arrowHeadWidth + queueLeftPadding;
    var arrow3BeginX = arrow2BeginX + arrowLineWidth + workerNodeWidth + arrowHeadWidth + queueLeftPadding * 2;


    return {
        create: create,
        updateAnalyzerWorkerNodes: updateAnalyzerWorkerNodes,
        updateProducerWorkerNodes: updateProducerWorkerNodes,
        updateIncomingQueueLabel: updateIncomingQueueLabel,
        updateOutgoingQueueLabel: updateOutgoingQueueLabel,
        destroy: destroy
    };

    function create() {
        // queue 1
        incomingQueueElement = renderer
            .rect(queueLeftPadding, queueTopPadding, queueWidth, queueHeight, 0)
            .attr({
                fill: queueColor
            })
            .add();

        // queue 1: arrow right
        incomingQueueArrow = renderer
            .path([
                // Line: -----
                // Move To (M), x, y
                'M', arrow1BeginX, arrowBeginY,
                // Line To (L), x, y
                'L', arrow1BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY,

                // Right arrow: >
                'M', arrow1BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY - arrowHeight,
                arrow1BeginX + arrowLineWidth, arrowBeginY,
                arrow1BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY + arrowHeight,
                // go back to the beginning
                'Z'
            ])
            .attr({
                fill: 'red',
                'stroke-width': 2,
                stroke: 'red',

                transform: 'translate(10, 10)'
            })
            .add();

        outgoingQueue1Arrow = renderer
            .path([
                // Line: -----
                // Move To (M), x, y
                'M', arrow2BeginX, arrowBeginY,
                // Line To (L), x, y
                'L', arrow2BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY,

                // Right arrow: >
                'M', arrow2BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY - arrowHeight,
                arrow2BeginX + arrowLineWidth, arrowBeginY,
                arrow2BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY + arrowHeight,
                // go back to the beginning
                'Z'
            ])
            .attr({
                fill: 'red',
                'stroke-width': 2,
                stroke: 'red',

                transform: 'translate(10, 10)'
            })
            .add();

        // queue 2
        outgoingQueueElement = renderer
            .rect(arrow2BeginX + arrowLineWidth + arrowHeadWidth + queueLeftPadding * 2, queueTopPadding, queueWidth, queueHeight, 0)
            .attr({
                fill: queueColor
            })
            .add();

        outgoingQueue2Arrow = renderer
            .path([
                // Line: -----
                // Move To (M), x, y
                'M', arrow3BeginX, arrowBeginY,
                // Line To (L), x, y
                'L', arrow3BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY,

                // Right arrow: >
                'M', arrow3BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY - arrowHeight,
                arrow3BeginX + arrowLineWidth, arrowBeginY,
                arrow3BeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY + arrowHeight,
                // go back to the beginning
                'Z'
            ])
            .attr({
                fill: 'red',
                'stroke-width': 2,
                stroke: 'red',

                transform: 'translate(10, 10)'
            })
            .add();
    }

    function updateIncomingQueueLabel(noTotalMessages, noMessagesDelayed, noMessagesNotVisible) {
        clearIncomingQueueLabelCache();

        var label1 = renderer
            .label("avlbl. msg: ~" + noTotalMessages, queueLeftPadding, (queueTopPadding * 5) + queueHeight, 'rect', null, null, false, true, '')
            .attr({
                'height': labelHeight + 'px'
            })
            .add();

        incomingQueueLabels.push(label1);

        var label2 = renderer
            .label("delayed msg: ~" + noMessagesDelayed, queueLeftPadding, (queueTopPadding * 6) + labelHeight + queueHeight, 'rect', null, null, false, true, '')
            .attr({
                'height': labelHeight + 'px'
            })
            .add();

        incomingQueueLabels.push(label2);

        var label3 = renderer
            .label("unvisible msg: ~" + noMessagesNotVisible, queueLeftPadding, (queueTopPadding * 7) + labelHeight * 2 + queueHeight, 'rect', null, null, false, true, '')
            .attr({
                'height': labelHeight + 'px'
            })
            .add();

        incomingQueueLabels.push(label3);
    }

    function updateOutgoingQueueLabel(noMessages, noMessagesDelayed, noMessagesNotVisible) {
        clearOutgoingQueueLabelCache();

        var label1 = renderer
            .label("avlbl. msg: ~" + noMessages, arrow2BeginX + arrowLineWidth + arrowHeadWidth + queueLeftPadding * 2, (queueTopPadding * 5) + queueHeight, 'rect', null, null, false, true, '')
            .add();

        outgoingQueueLabels.push(label1);

        var label2 = renderer
            .label("delayed msg: ~" + noMessagesDelayed, arrow2BeginX + arrowLineWidth + arrowHeadWidth + queueLeftPadding * 2, (queueTopPadding * 6) + labelHeight + queueHeight, 'rect', null, null, false, true, '')
            .add();

        outgoingQueueLabels.push(label2);

        var label3 = renderer
            .label("unvisible msg: ~" + noMessagesNotVisible, arrow2BeginX + arrowLineWidth + arrowHeadWidth + queueLeftPadding * 2, (queueTopPadding * 7) + labelHeight * 2 + queueHeight, 'rect', null, null, false, true, '')
            .add();

        outgoingQueueLabels.push(label3);
    }

    function updateAnalyzerWorkerNodes(noWorkerNodes) {
        clearAnalyzerWorkerNodeCache();

        // worker nodes

        var workerNodeHeight = (chartElement.height() - noWorkerNodes * workerNodeTopPadding) / noWorkerNodes;
        // set max height equal to queue
        workerNodeHeight = Math.min(workerNodeHeight, queueHeight);
        var workerLeftPosition = queueLeftPadding + queueWidth + queueLeftPadding + arrowLineWidth + arrowHeadWidth + queueLeftPadding;

        for (var i = 0; i < noWorkerNodes; i++) {
            var workerNodeElement = renderer
                .rect(workerLeftPosition, i * workerNodeHeight + (i + 1) * workerNodeTopPadding, workerNodeWidth, workerNodeHeight, 0)
                .attr({
                    fill: workerNodeColor
                })
                .add();

            currentAnalyzerWorkerElements.push(workerNodeElement);
        }
    }

    function updateProducerWorkerNodes(noWorkerNodes) {
        clearProducerWorkerNodeCache();

        // worker nodes
        var workerNodeHeight = (chartElement.height() - noWorkerNodes * workerNodeTopPadding) / noWorkerNodes;
        // set max height equal to queue
        workerNodeHeight = Math.min(workerNodeHeight, queueHeight);
        var workerLeftPosition = queueLeftPadding + queueWidth + queueLeftPadding + arrowLineWidth + arrowHeadWidth + workerNodeWidth + queueLeftPadding + arrowLineWidth + arrowHeadWidth + queueLeftPadding + queueWidth + queueLeftPadding + arrowLineWidth + arrowHeadWidth + queueLeftPadding;

        for (var i = 0; i < noWorkerNodes; i++) {
            var workerNodeElement = renderer
                .rect(workerLeftPosition, i * workerNodeHeight + (i + 1) * workerNodeTopPadding, workerNodeWidth, workerNodeHeight, 0)
                .attr({
                    fill: workerNodeColor
                })
                .add();

            currentProducerWorkerElements.push(workerNodeElement);
        }
    }

    function destroy() {
        clearAnalyzerWorkerNodeCache();
        clearProducerWorkerNodeCache
        clearIncomingQueueLabelCache();
        clearOutgoingQueueLabelCache();

        incomingQueueElement.destroy();
        outgoingQueueElement.destroy();
    }

    function clearAnalyzerWorkerNodeCache() {
        // remove all old drawn elements
        for (var key in currentAnalyzerWorkerElements) {
            currentAnalyzerWorkerElements[key].destroy();
        }

        currentAnalyzerWorkerElements = [];
    }

    function clearProducerWorkerNodeCache() {
        // remove all old drawn elements
        for (var key in currentProducerWorkerElements) {
            currentProducerWorkerElements[key].destroy();
        }

        currentProducerWorkerElements = [];
    }

    function clearIncomingQueueLabelCache() {
        // remove all old drawn elements
        for (var key in incomingQueueLabels) {
            incomingQueueLabels[key].destroy();
        }

        incomingQueueLabels = [];
    }

    function clearOutgoingQueueLabelCache() {
        // remove all old drawn elements
        for (var key in outgoingQueueLabels) {
            outgoingQueueLabels[key].destroy();
        }

        outgoingQueueLabels = [];
    }
}
