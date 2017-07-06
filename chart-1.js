// PUT YOUR NAME HERE
// PUT THE DATE HERE
// PUT THE DESCRIPTION OF WHAT THIS FILE IS DOING HERE
(function() {
  var margin = { top: 30, left: 30, right: 30, bottom: 30},
    height = 400 - margin.top - margin.bottom,
    width = 1000 - margin.left - margin.right;


  var svg = d3.select("#chart-1")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.top + "," + margin.left + ")");

  // Create any scales you might need
  var xPositionScale = d3.scaleLinear().domain([2012,2017]).range([200, width-200]);
  var yPositionScale = d3.scaleLinear().domain([0,20]).range([0, height-15]);
  //var colorScale = d3.scaleOrdinal(d3.schemeCategory20c);
  //var colorScale = d3.scaleOrdinal().domain(["mortgage", "credit-card", "credit-reporting", "student-loan"]).range(["#1ABC9C", "#F39C12", "#F1C40F", "#3498DB"])
  var colorScale = d3.scaleOrdinal()
    .domain(["BANK OF AMERICA, NATIONAL ASSOCIATION", "WELLS FARGO BANK, NATIONAL ASSOCIATION", "JPMORGAN CHASE & CO.", "CITIBANK, N.A.", "CAPITAL ONE FINANCIAL CORPORATION", "OCWEN LOAN SERVICING LLC", "U.S. BANCORP", "SYNCHRONY BANK", "PNC Bank N.A.", "HSBC NORTH AMERICA HOLDINGS INC.", "Navient Solutions, LLC.", "SUNTRUST BANKS, INC.", "NATIONSTAR MORTGAGE", "AMERICAN EXPRESS CENTURION BANK", "DISCOVER BANK", "Ditech Financial LLC", "EXPERIAN DELAWARE GP", "EQUIFAX, INC.", "TRANSUNION INTERMEDIATE HOLDINGS, INC.", "ENCORE CAPITAL GROUP INC."])
    .range(["#1ABC9C", "#1ABC9C", "#1ABC9C", "#808080", "#808080", "#808080", "#808080", "#808080", "#808080", "#808080", "#3498DB", "#808080", "#808080", "#808080", "#808080", "#808080", "#F1C40F", "#F1C40F", "#F1C40F", "#808080"])

  var line = d3.line()
    .x(function(d) {
      return xPositionScale(d.year)
    })
    .y(function(d) {
      return yPositionScale(d.rank)
    })

  d3.queue()
    .defer(d3.csv, "rank.csv")
    .await(ready);

  function ready(error, datapoints) {
    // Create and style your elements
    var nested = d3.nest()
      .key( function(d) {
        return d.company;
      })
      .entries(datapoints);

    console.log(nested);

    svg.selectAll("circle")
      .data(datapoints)
      .enter().append("circle")
      .attr("r", 2)
      .style("opacity", 0.5)
      .attr("fill", function(d) {
        return colorScale(d.company)
      })
      .attr("cx", function(d) {
        return xPositionScale(d.year);
      })
      .attr("cy", function(d) {
        return yPositionScale(d.rank);
      });

    svg.selectAll("path")
      .data(nested)
      .enter().append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return colorScale(d.key);
      })
      .attr("d", function(d) {
        return line(d.values);
      })
      .style("opacity", 0.5)

    svg.selectAll(".textlast")
      .data(nested)
      .enter().append("text")
      .attr("class", "textlast")

      .attr("y", function(d) {
        var lastDataPoint = d.values[d.values.length-1];
        return yPositionScale(lastDataPoint.rank)
      })
      .attr("x", width-200)
      .text(function(d) {
        return (d.values[d.values.length-1].rank + " " +d.key);
      })
      .attr("dy", 5)
      .attr("dx", 4)
      .attr("fill", function(d) {
        return colorScale(d.key);
      })
      .attr("font-size", 9)

    svg.selectAll(".textfirst")
      .data(nested)
      .enter().append("text")
      .attr("class", "textfirst")
      .attr("y", function(d) {
        var firstDataPoint = d.values[d.values.length-6];
        return yPositionScale(firstDataPoint.rank)
      })
      .attr("x", 190)
      .text(function(d) {
        return (d.key + " " + d.values[d.values.length-6].rank);
      })
      .attr("dy", 5)
      .attr("dx", 4)
      .attr("fill", function(d) {
        return colorScale(d.key);
      })
      .attr("font-size", 9)
      .style("text-anchor","end")

      var xAxis = d3.axisBottom(xPositionScale)
      svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis.ticks(6).tickFormat(d3.format("d")));



  }

})();
