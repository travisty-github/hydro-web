var width = window.innerWidth - 200;
var height = window.innerHeight * 0.8;
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
  height = window.innerHeight * 0.8;

  d3.select('#chart')
    .style('width', width + 'px')
    .style('height', height + 'px');

  treemap.size([width, height]);

  nodes = d3.selectAll('.node')
    .data(treemap.nodes)
    .call(position)
    .select('.lake-name')
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

      e.select('.lake-name').style('font-size', function(d) {
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
      e.select('.lake-name').style('font-size', function(d) {
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
    .call(position);

  node.append('div')
    .attr('class', 'lake-name')
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
  return Math.max(10, 0.12 * Math.sqrt(width * height)) + 'px';
};

function internalGraph() {
  this.style('height', function(d) {
      return d.dy * (d.percentFull) + 'px';
    })
    .style('margin-top', function(d) {
      return d.dy * (1 - (d.percentFull)) + 'px';
    });
}

window.onresize = redraw;
