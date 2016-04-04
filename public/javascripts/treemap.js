var width = window.innerWidth - 200;
var headerHeight = parseInt(d3.select('#header').style('height'));
var padding = parseInt(d3.select('#background').style('padding-top'));
padding += parseInt(d3.select('#background').style('padding-bottom'));
var height = window.innerHeight - headerHeight - padding;
// Load data
var data = [];

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

d3.json('/api/lakes/currentlevels', function(err, d) {
  if (err) console.log(err);

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

  nodes = d3.selectAll('.node')
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
      var width = div.style('width');
      var height = div.style('height');
      var capacity = d.capacity;

      // Hide all nodes in the treemap chart
      div.selectAll('.node')
        .style('display', 'none');

      // Show the line chart for selected lake
      div.append('div')
        .attr('id', 'bigchart')
        .style('width', width)
        .style('height', height);

      d3.json('/api/lakes/levels/' + encodeURIComponent(d.name), function(err, data) {
        var margin = 50;
        var chartWidth = parseInt(width) - 2 * margin;
        var chartHeight = parseInt(height) - 2 * margin;

        var xScale = d3.time.scale()
          .range([0, parseInt(chartWidth)])
          .domain(d3.extent(data, function(d) {
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
          .attr('transform', 'translate('+ margin + ', ' + margin + ')');

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
            return yScale(d.level / capacity * 100);
          });

        svg.append('path')
          .datum(data)
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
          .text(d.name);

        svg.append('text')
          .attr('transform', 'translate(' + (chartWidth - 50) + ', 0)')
          .style('text-anchor', 'right')
          .text('Close')
          .on('click', function(d) {
            div.selectAll('.node')
              .style('display', 'inline');
            div.select('#bigchart')
            .remove();
          });

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
  this.style('height', function(d) {
      return d.dy * (d.percentFull) + 'px';
    })
    .style('margin-top', function(d) {
      return d.dy * (1 - (d.percentFull)) + 'px';
    });
}

function lineChart(element) {

}

window.onresize = redraw;
