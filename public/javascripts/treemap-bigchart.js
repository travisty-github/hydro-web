var BigChart = (function() {
  'use strict';
    function BigChart(rootElement, name, capacity) {
        this.rootElement = rootElement;
        this.name = name;
        this.capacity = capacity;
        this.data = [];
    }

    BigChart.prototype.loadData = function(callbackReady, callbackClose) {
        var self = this;
        this.callbackClose = callbackClose;
        // Get lake levels
        d3.json('/api/lakes/levels/' + encodeURIComponent(this.name), function(err, data) {
            self.data = data;
            self.createChart();
            callbackReady();
        });
    };

    BigChart.prototype.createChart = function() {
        var self = this;
        var width = this.rootElement.style('width');
        var height = this.rootElement.style('height');

        // // Hide all nodes in the treemap chart
        // this.rootElement.selectAll('.node')
        //     .style('display', 'none');

        // Show the line chart for selected lake
        this.rootElement.append('div')
            .attr('id', 'bigchart')
            .style('width', width)
            .style('height', height);

        var margin = 50;
        var chartWidth = parseInt(width) - 2 * margin;
        var chartHeight = parseInt(height) - 2 * margin;

        var xScale = d3.time.scale()
            .range([0, parseInt(chartWidth)])
            .domain(d3.extent(this.data, function(d) {
                return new Date(d.date);
            }));

        var yScale = d3.scale.linear()
            .range([parseInt(chartHeight), 0])
            .domain([0, 100]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        var svg = d3.select('#bigchart')
            .append('svg')
            .attr('width', parseInt(width))
            .attr('height', parseInt(height))
            .append('g')
            .attr('transform', 'translate(' + margin + ', ' + margin + ')');

        var gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'blueGradient')
            .attr('x1', '0')
            .attr('x2', '0')
            .attr('y1', '0')
            .attr('y2', '1');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgba(147, 206, 222, 1)');

        gradient.append('stop')
            .attr('offset', '41%')
            .attr('stop-color', 'rgba(117, 189, 209, 1)');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgba(73, 165, 191, 1)');

        var area = d3.svg.area()
            .x(function(d) {
                return xScale(new Date(d.date));
            })
            .y0(parseInt(chartHeight))
            .y1(function(d) {
                return yScale(d.level / self.capacity * 100);
            });

        svg.append('path')
            .datum(this.data)
            .attr('class', 'lake-levels-area')
            .attr('d', area);

        svg.append('g')
            .call(xAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0, ' + chartHeight + ')');

        svg.append('g')
            .attr('class', 'axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 10)
            .attr('dy', '0.7em')
            .style('text-anchor', 'end')
            .text('Dam level (%)');

        svg.append('text')
            .attr('transform', 'translate(' + chartWidth / 2 + ', 0)')
            .style('text-anchor', 'middle')
            .attr('font-size', '1.5em')
            .text(this.name);

        svg.append('text')
            .attr('transform', 'translate(' + (chartWidth - 50) + ', 0)')
            .style('text-anchor', 'right')
            .style('cursor', 'pointer')
            .text('Close')
            .on('click', function(d) {
                // self.rootElement.selectAll('.node')
                //     .style('display', 'inline');
                self.rootElement.select('#bigchart')
                    .remove();
                self.callbackClose();
            });

    };

    BigChart.prototype.removeChart = function() {
        this.rootElement.select('#bigchart')
            .remove();
    };

    return BigChart;

}());
