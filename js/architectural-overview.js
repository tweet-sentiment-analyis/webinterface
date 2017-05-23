function ArchitecturalOverview(chartSelector) {

    var chartElement = $(chartSelector);
    var chartDiv = $(chartSelector)[0];
    var renderer = null;

    var incomingQueueLabels = [];
    var incomingQueueElement = null;
    var incomingQueueArrow = null;

    var outgoingQueueLabels = [];
    var outgoingQueueElement = null;
    var outgoingQueueArrow = null;

    var currentWorkerElements = [];

    renderer = new Highcharts.Renderer(chartDiv, chartElement.width(), 300);

    // queues
    var queueColor = 'orange';
    var queueLeftPadding = 5;
    var queueTopPadding = 5;
    var queueWidth = chartElement.width() / 5;
    var queueHeight = chartElement.height() / 5;

    // labels
    var labelHeight = 10;

    return {
        create: create,
        updateWorkerNodes: updateWorkerNodes,
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

        var arrowHeight = 5;
        var arrowHeadWidth = 10;
        var arrowLineWidth = queueWidth - arrowHeadWidth - 4 * queueLeftPadding;
        var arrowBeginX = queueLeftPadding + queueWidth;
        var arrowBeginY = queueTopPadding + (queueHeight / 2) - arrowHeight;

        incomingQueueArrow = renderer
            .path([
                // Line: -----
                // Move To (M), x, y
                'M', arrowBeginX, arrowBeginY,
                // Line To (L), x, y
                'L', arrowBeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY,

                // Right arrow: >
                'M', arrowBeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY - arrowHeight,
                arrowBeginX + arrowLineWidth, arrowBeginY,
                arrowBeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY + arrowHeight,
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
            .rect(chartElement.width() - queueWidth - queueLeftPadding, queueTopPadding, queueWidth, queueHeight, 0)
            .attr({
                fill: queueColor
            })
            .add();

        arrowBeginX = chartElement.width() - queueWidth - queueLeftPadding * 3 - arrowHeadWidth - arrowLineWidth;

        outgoingQueueArrow = renderer
            .path([
                // Line: -----
                // Move To (M), x, y
                'M', arrowBeginX, arrowBeginY,
                // Line To (L), x, y
                'L', arrowBeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY,

                // Right arrow: >
                'M', arrowBeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY - arrowHeight,
                arrowBeginX + arrowLineWidth, arrowBeginY,
                arrowBeginX + arrowLineWidth - arrowHeadWidth, arrowBeginY + arrowHeight,
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
            .label("avlbl. msg: ~" + noMessages, chartElement.width() - queueWidth - queueLeftPadding, (queueTopPadding * 5) + queueHeight, 'rect', null, null, false, true, '')
            .add();

        outgoingQueueLabels.push(label1);

        var label2 = renderer
            .label("delayed msg: ~" + noMessagesDelayed, chartElement.width() - queueWidth - queueLeftPadding, (queueTopPadding * 6) + labelHeight + queueHeight, 'rect', null, null, false, true, '')
            .add();

        outgoingQueueLabels.push(label2);

        var label3 = renderer
            .label("unvisible msg: ~" + noMessagesNotVisible, chartElement.width() - queueWidth - queueLeftPadding, (queueTopPadding * 7) + labelHeight * 2 + queueHeight, 'rect', null, null, false, true, '')
            .add();

        outgoingQueueLabels.push(label3);
    }

    function updateWorkerNodes(noWorkerNodes) {
        clearWorkerNodeCache();

        // worker nodes
        var workerNodeColor = 'blue';
        var workerNodeTopPadding = queueTopPadding;
        var workerNodeWidth = queueWidth;
        var workerNodeHeight = (chartElement.height() - noWorkerNodes * workerNodeTopPadding) / noWorkerNodes;
        // set max height equal to queue
        workerNodeHeight = Math.min(workerNodeHeight, queueHeight);
        var workerLeftPosition = (chartElement.width() / 2) - (workerNodeWidth / 2);

        for (var i = 0; i < noWorkerNodes; i++) {
            var workerNodeElement = renderer
                .rect(workerLeftPosition, i * workerNodeHeight + (i + 1) * workerNodeTopPadding, workerNodeWidth, workerNodeHeight, 0)
                .attr({
                    fill: workerNodeColor
                })
                .add();

            currentWorkerElements.push(workerNodeElement);
        }
    }

    function destroy() {
        clearWorkerNodeCache();
        clearIncomingQueueLabelCache();
        clearOutgoingQueueLabelCache();

        incomingQueueElement.destroy();
        outgoingQueueElement.destroy();
    }

    function clearWorkerNodeCache() {
        // remove all old drawn elements
        for (var key in currentWorkerElements) {
            currentWorkerElements[key].destroy();
        }

        currentWorkerElements = [];
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
