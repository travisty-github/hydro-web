window.onresize = (function() {
    'use strict';

    var width = window.innerWidth - 200;
    var headerHeight = parseInt(d3.select('#header').style('height'));
    var padding = parseInt(d3.select('#background').style('padding-top'));
    padding += parseInt(d3.select('#background').style('padding-bottom'));
    var height = window.innerHeight - headerHeight - padding;

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function(d) {
            return d.capacity;
        });

    var div = d3.select('#chart')
        .style('width', width + 'px')
        .style('height', height + 'px');

    var node = null;

    // Load data
    var data = [];
    d3.json('/api/lakes/currentlevels', function(err, d) {
        if (err) console.log(err);

        // Do not need overall sytem storage level
        data = d.filter(function(d) {
            return d.name !== 'System';
        });

        data = {
            children: data
        };

        draw();

    });


    function redraw() {
        width = window.innerWidth - 200;
        headerHeight = parseInt(d3.select('#header').style('height'));
        padding = parseInt(d3.select('#background').style('padding-top'));
        padding += parseInt(d3.select('#background').style('padding-bottom'));
        height = window.innerHeight - headerHeight - padding;

        d3.select('#chart')
            .style('width', width + 'px')
            .style('height', height + 'px');

        treemap.size([width, height]);

        var nodes = d3.selectAll('.node')
            .data(treemap.nodes)
            .call(position)
            .select('.lake-text')
            .style('font-size', function(d) {
                return fontSize(d.dx, d.dy);
            });

        d3.selectAll('.node')
            .data(treemap.nodes)
            .select('.internal-graph')
            .call(internalGraph);
    }

    function draw() {
        treemap.size([width, height]);

        node = div.datum(data).selectAll('.node')
            .data(treemap.nodes)
            .enter().append('div')
            .attr('class', function(d) {
                /*** Add in additional data properties. ***/
                d.percentFull = d.currentLevel / d.capacity;
                /***/
                return 'node';
            })
            .on('mouseover', function(d) {
                var e = d3.select(this);
                e.style('width', function(d) {
                    return d.dxLarge + 'px';
                });
                e.style('left', function(d) {
                    return (d.x - (d.dxLarge - d.dx) / 2) + 'px';
                });
                e.style('height', function(d) {
                    return d.dyLarge + 'px';
                });
                e.style('top', function(d) {
                    return (d.y - (d.dyLarge - d.dy) / 2) + 'px';
                });

                e.classed('node-shadow', true);

                e.select('.lake-text').style('font-size', function(d) {
                    return fontSize(d.dxLarge, d.dyLarge);
                });

                e.select('.internal-graph')
                    .style('height', function(d) {
                        return d.dyLarge * (d.percentFull) + 'px';
                    })
                    .style('margin-top', function(d) {
                        return d.dyLarge * (1 - (d.percentFull)) + 1 + 'px';
                    });
            })
            .on('mouseout', function(d) {
                var e = d3.select(this);
                e.call(position);
                e.classed('node-shadow', false);
                e.select('.lake-text').style('font-size', function(d) {
                    return fontSize(d.dx, d.dy);
                });
                e.select('.internal-graph')
                    .style('height', function(d) {
                        return d.dy * (d.percentFull) + 'px';
                    })
                    .style('margin-top', function(d) {
                        return d.dy * (1 - (d.percentFull)) + 1 + 'px';
                    });
            })
            .on('click', function(d) {
                var bigChart = new BigChart(div, d.name, d.capacity);
                bigChart.loadData(
                    // Graph ready callback
                    function() {
                        // Hide all nodes in the treemap chart
                        div.selectAll('.node')
                            .style('display', 'none');
                    },
                    // Close callback
                    function() {
                        div.selectAll('.node')
                            .style('display', 'inline');
                    });
            })
            .call(position);

        node.append('div')
            .attr('class', 'lake-name')
            .append('span')
            .attr('class', 'lake-text')
            .html(function(d) {
                if (!d.hasOwnProperty('name')) return;
                return d.name + '<br/>' + Math.round(d.percentFull * 1000) / 10 + '%<br/>' + Math.round(d.currentLevel) + 'GWh';
            })
            .style('font-size', function(d) {
                return fontSize(d.dx, d.dy);
            });

        node.append('div')
            .attr('class', 'internal-graph')
            .call(internalGraph);
    }

    function position() {
        /*jshint -W040*/
        this.style('left', function(d) {
                return d.x + 'px';
            })
            .style('top', function(d) {
                return d.y + 'px';
            })
            .style('width', function(d) {
                // dxLarge is the zoomed height
                d.dxLarge = d.dx * 1.1 > 200 ? d.dx * 1.1 : 200;
                return Math.max(0, d.dx - 1) + 'px';
            })
            .style('height', function(d) {
                // dyLarge is the zoomed width
                d.dyLarge = d.dy * 1.1 > 200 ? d.dy * 1.1 : 200;
                return Math.max(0, d.dy - 1) + 'px';
            });
    }
    var fontSize = function(width, height) {
        return Math.max(10, 0.1 * Math.sqrt(width * height)) + 'px';
    };

    function internalGraph() {
        /*jshint -W040*/
        this.style('height', function(d) {
                return d.dy * (d.percentFull) + 'px';
            })
            .style('margin-top', function(d) {
                return d.dy * (1 - (d.percentFull)) + 'px';
            });
    }

    return redraw;

}());
