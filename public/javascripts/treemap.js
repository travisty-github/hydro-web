var height = 800;
// var width = 800;
var width = parseInt(d3.select('#chart').attr);
var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
};
var plotArea = {};
plotArea.xRange = [0, width - margin.left - margin.right];
plotArea.yRange = [height - margin.top - margin.bottom, 0];
// Load data
var data = [];

var treemap = d3.layout.treemap()
  .size([width, height])
  .sticky(true)
  .value(function(d) {
    return d.capacity;
  });

var div = d3.select('#chart')
  .style('position', 'relative')
  .style('width', (width + margin.left + margin.right) + 'px')
  .style('height', (height + margin.top + margin.bottom) + 'px')
  .style('left', margin.left + 'px')
  .style('top', margin.top + 'px');

var node = null;

d3.json('/api/lakes/currentlevels', function(err, d) {
  if (err) console.log(err);

  data = d.filter(function(d) {
    return d.name !== 'System';
  });

  data = {
    children: data
  };

  redraw();

});

var redraw = function() {
  width = window.innerWidth * 0.8;

  treemap.size([width, height]);

  node = div.datum(data).selectAll('.node')
    .data(treemap.nodes)
    .enter().append('div')
    .attr('class', function(d) {
      /*** Add in additional data properties here. ***/
      d.percentFull = d.currentLevel / d.capacity;
      d.dxLarge = d.dx * 1.1 > 200 ? d.dx * 1.1 : 200;
      d.dyLarge = d.dy * 1.1 > 200 ? d.dy * 1.1 : 200;
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
      e.style('width', function(d) {
        return d.dx + 'px';
      });
      e.style('left', function(d) {
        return d.x + 'px';
      });
      e.style('height', function(d) {
        return d.dy + 'px';
      });
      e.style('top', function(d) {
        return d.y + 'px';
      });
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
    .style('height', function(d) {
      return d.dy * (d.percentFull) + 'px';
    })
    .style('margin-top', function(d) {
      return d.dy * (1 - (d.percentFull)) + 'px';
    });


  function position() {
    this.style('left', function(d) {
        return d.x + 'px';
      })
      .style('top', function(d) {
        return d.y + 'px';
      })
      .style('width', function(d) {
        return Math.max(0, d.dx - 1) + 'px';
      })
      .style('height', function(d) {
        return Math.max(0, d.dy - 1) + 'px';
      });
  }
};

var fontSize = function(width, height) {
  return Math.max(10, 0.12 * Math.sqrt(width * height)) + 'px';
};
