var height = 800;
var width = 800;
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
d3.json("/api/lakes/currentlevels", function(err, data) {
  if (err) console.log(err);

  data = data.filter(function(d) {
    return d.name !== 'System';
  });

  data = {
    children: data
  };

  var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) {
      return d.capacity;
    });

  var div = d3.select("#chart")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");



  var node = div.datum(data).selectAll(".node")
    .data(treemap.nodes)
    .enter().append("div")
    .attr("class", "node")
    .call(position);

  node.append("div")
    .attr("class", "lake-name")
    .text(function(d) {
      return d.name;
    })
    .style("font-size", function(d) {
      // compute font size based on sqrt(area)
      return Math.max(10, 0.1 * Math.sqrt(d.area)) + 'px';
    });

  node.append("div")
    .attr("class", "internal-graph")
    .style("height", function(d) {
      return d.dy * (d.currentLevel / d.capacity) + "px";
    })
    .style("margin-top", function(d) {
      return d.dy * (1 - (d.currentLevel / d.capacity)) + "px";
    });

  function position() {
    this.style("left", function(d) {
        return d.x + "px";
      })
      .style("top", function(d) {
        return d.y + "px";
      })
      .style("width", function(d) {
        return Math.max(0, d.dx - 1) + "px";
      })
      .style("height", function(d) {
        return Math.max(0, d.dy - 1) + "px";
      });
  }

});
