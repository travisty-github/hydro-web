var height = 500;
var width = 800;
var margin = {top: 20, right: 20, bottom: 30, left: 50};
var plotArea = {};
plotArea.xRange= [0, width - margin.left - margin.right];
plotArea.yRange= [height - margin.top - margin.bottom, 0];
// Load data
var data = [];
d3.json("/api/lakes/Lake%20St.%20Clair%20%2F%20Lake%20King%20William", function(err, jsonData) {
  if (err) console.log(err);
  data = jsonData.historicalLevels;

  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();

  xScale.range(plotArea.xRange);
  xScale.domain(d3.extent(data, function(d) {
    return d.date;
  }));
  yScale.range(plotArea.yRange);
  yScale.domain([0, jsonData.capacity]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

  var svg = d3.select("svg")
    .attr("height", height )
    .attr("width", width )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var area = d3.svg.area()
    .x(function(d) {
      return xScale(d.date);
    })
    .y0(plotArea.yRange[0])
    .y1(function(d) {
      return yScale(d.level);
    });

  svg.append("path")
    .datum(data)
    .attr("d", area)
    .attr("fill", "#2A93E8");

  svg.append("g")
    .attr("transform", "translate(0," + plotArea.yRange[0] + ")")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

});
