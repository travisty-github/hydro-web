var height = 800;
// var width = 800;
var width = parseInt(d3.select("#chart").attr);
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

// var color = d3.scale.category20c();
var colour = d3.scale.linear().domain([0, 30, 70]).range(["#FF0000", "#FF7D00", "#00FF00"]);

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

var node = null;

d3.json("/api/lakes/currentlevels", function(err, d) {
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

  node = div.datum(data).selectAll(".node")
    .data(treemap.nodes)
    .enter().append("div")
    .attr("class", "node")
    .on("mouseover", function(d) {
      var e = d3.select(this);
      var width = e.attr("enlarged-width");
      var height = e.attr("enlarged-height");
      e.style("width", width);
      e.style("height", height);
      e.classed("node-shadow", true);
      e.select(".lake-name").style("font-size", fontSize(width, height));
    })
    .on("mouseout", function(d) {
      var e = d3.select(this);
      var width = e.attr("original-width");
      var height = e.attr("original-height");
      e.style("width", width);
      e.style("height", height);
      e.classed("node-shadow", false);
      e.select(".lake-name").style("font-size", fontSize(width, height));
    })
    .call(position)
    .attr("original-width", function(d) {
      return d3.select(this).style("width");
    })
    .attr("original-height", function(d) {
      return d3.select(this).style("height");
    })
    .attr("enlarged-width", function(d) {
      var e = d3.select(this);
      var width = e.style("width").slice(0, -2);
      var enlargedWidth = width > 200 ? width * 1.1 : 200;
      return enlargedWidth + "px";
    })
    .attr("enlarged-height", function(d) {
      var e = d3.select(this);
      var height = e.style("height").slice(0, -2);
      var enlargedHeight = (height > 200) ? height * 1.1 : 200;
      return enlargedHeight + "px";
    });

  node.append("div")
    .attr("class", "lake-name")
    .html(function(d) {
      if (!d.hasOwnProperty("name")) return;
      var percentage = Math.round(d.currentLevel / d.capacity * 1000) / 10;
      return d.name + "<br/>" + percentage + "%<br/>" + Math.round(d.currentLevel) + "GWh";
      // return d.name;
    })
    .style("font-size", function(d) {return fontSize(d.dx + "px", d. dy + "px");}); // function(d) {
      // compute font size based on sqrt(area)
      // return Math.max(10, 0.1 * Math.sqrt(d.area)) + 'px';
    // });

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
};

var fontSize = function(width, height) {
      width = width.slice(0, -2);
      height = height.slice(0, -2);
      console.log("width: " + width + " height: " + height);

      return Math.max(10, 0.1 * Math.sqrt(width * height)) + 'px';
      // return Math.max(10, 0.1 * Math.sqrt(d.area)) + 'px';
};
// d3.select(window).on("resize", redraw());
