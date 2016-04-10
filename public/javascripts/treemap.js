var TreeMap = (function() {
    'use strict';

    function TreeMap() {
      this.bigChart = null;

        this.width = window.innerWidth - 200;
        this.headerHeight = parseInt(d3.select('#header').style('height'));
        this.padding = parseInt(d3.select('#background').style('padding-top'));
        this.padding += parseInt(d3.select('#background').style('padding-bottom'));
        this.height = window.innerHeight - this.headerHeight - this.padding;

        this.treemap = d3.layout.treemap()
            .size([this.width, this.height])
            .sticky(true)
            .value(function(d) {
                return d.capacity;
            });

        this.div = d3.select('#chart')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px');

        this.node = null;

        var self = this;
        d3.select(window).on('resize', function() {
            self.redraw.apply(self);
        });
    }

    TreeMap.prototype.load = function(path) {
        // Load data
        this.data = [];
        var self = this;
        d3.json(path, function(err, d) {
            if (err) console.log(err);

            // Do not need overall sytem storage level
            self.data = d.filter(function(d) {
                return d.name !== 'System';
            });

            self.data = {
                children: self.data
            };

            self._draw();

        });
    };


    TreeMap.prototype.redraw = function() {
        this.width = window.innerWidth - 200;
        this.headerHeight = parseInt(d3.select('#header').style('height'));
        this.padding = parseInt(d3.select('#background').style('padding-top'));
        this.padding += parseInt(d3.select('#background').style('padding-bottom'));
        this.height = window.innerHeight - this.headerHeight - this.padding;

        d3.select('#chart')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px');

        this.treemap.size([this.width, this.height]);

        var nodes = d3.selectAll('.node')
            .data(this.treemap.nodes)
            .call(position)
            .select('.lake-text')
            .style('font-size', function(d) {
                return fontSize(d.dx, d.dy);
            });

        d3.selectAll('.node')
            .data(this.treemap.nodes)
            .select('.internal-graph')
            .call(internalGraph);

        if (this.bigChart) this.bigChart.redraw(this.width, this.height);
    };

    TreeMap.prototype._draw = function() {
        var self = this;
        this.treemap.size([this.width, this.height]);

        this.node = this.div.datum(this.data).selectAll('.node')
            .data(this.treemap.nodes)
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
                // Disable clicking any other nodes
                self.div.selectAll('.node')
                  .style('pointer-events', 'none');

                self.bigChart = new BigChart(self.div, d.name, d.capacity);
                self.bigChart.loadData(
                    // Graph ready callback
                    function() {
                        // Hide all nodes in the treemap chart
                        self.div.selectAll('.node')
                          .classed('visible', false)
                          .classed('hidden', true);
                    },
                    // Close callback
                    function() {
                        self.div.selectAll('.node')
                          .classed('hidden', false)
                          .classed('visible', true)
                          .style('pointer-events', 'auto');
                        self.bigChart = null;
                    });
            })
            .call(position);

        this.node.append('div')
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

        this.node.append('div')
            .attr('class', 'internal-graph')
            .call(internalGraph);
    };

    var position = function() {
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
    };

    var fontSize = function(width, height) {
        return Math.max(14, 0.06 * Math.sqrt(width * height)) + 'px';
    };

    var internalGraph = function() {
        /*jshint -W040*/
        this.style('height', function(d) {
                return d.dy * (d.percentFull) + 'px';
            })
            .style('margin-top', function(d) {
                return d.dy * (1 - (d.percentFull)) + 'px';
            });
    };


    return TreeMap;

}());
