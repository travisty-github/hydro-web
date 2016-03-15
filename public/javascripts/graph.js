var height = 500;
var width = 500;
// Load data
var data = [];
d3.json("/api/lakes/levels/System", function(err, d) {
  if (err) console.log(err);
  data = d;

  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();

  xScale.range([0, 500]);
  xScale.domain(d3.extent(data, function(d) {
    return d.date;
  }));
  yScale.range([height, 0]);
  yScale.domain([0, d3.max(data, function(d) {
    return d.level;
  })]);


  var svg = d3.select("svg")
    .attr("height", height)
    .attr("width", width);

  var area = d3.svg.area()
    .x(function(d) {
      return xScale(d.date);
    })
    .y0(height)
    .y1(function(d) {
      return yScale(d.level);
    });

  svg.append("path")
    .datum(data)
    .attr("d", area)
    .attr("fill", "#2A8BE8");

});
