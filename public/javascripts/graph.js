// Load data
var data = [];
d3.json("/api/lakes/levels/System", function(err, d) {
  if (err) console.log(err);
  data = d.map(function(e) {
    return e.level;
  });

  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear();

  xScale.range([0, 500]);
  xScale.domain([0, data.length]);
  yScale.range([500, 0]);
  yScale.domain(d3.extent(data));

  var svg = d3.select("svg");

  var circle = svg.selectAll("circle")
    .data(data);

  var circleEnter = circle.enter().append("circle");

  circleEnter.attr("r", 3);
  circleEnter.attr("cx", function(d, i) {
    return xScale(i);
  });
  circleEnter.attr("cy", function(d) {
    return yScale(d);
  });

});
