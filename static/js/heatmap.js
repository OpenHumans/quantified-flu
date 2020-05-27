
$names = ["Fever", "Anosmia", "Body ache", "Chills", "Cough", "Diarrhea", "Ear ache", "Fatigue", "Headache", "Nausea", "Runny nose", "Short breath", "Sore throat", "Stomach ache", "", "Comments"];
sizedisplay = chooseDisplay(); 

switch(sizedisplay) {
  case 1: 
  width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500);
  createheatmap(url);
  break;
  case 2: 
  width = 0.9 * Math.max(Math.min(window.innerWidth, 800), 300);
  createheatmap800(url);
  break;
  case 3: 
  width = 0.9 * Math.max(Math.min(window.innerWidth, 340), 300);
  createheatmapPhone(url);
  break;
  case 4: 
  width = 0.9 * Math.max(Math.min(window.innerWidth, 650), 300);
  createheatmapPhone(url);
  break;
  case 5:
  width = 0.9 * Math.max(Math.min(window.innerWidth, 300), 300);
  createheatmapPhone(url);
  break;
}


function createheatmap800(url) {
  
  margin = {
    top: 0.3 * width,
    right:  -0.11 * width,
    bottom: 0.14 * width,
    left: 0.05 * width
  };
  gridSize = Math.floor(width / 18);
  brushHeight = width / 35;

  $.get(url, function (data) {  
    getDatafromFile(data);
    var maingroup = d3.select('#container')
      .append("svg")
      .attr("class", "svg")
      .attr("width", innerwidth + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    brushGroup800(maingroup);
    showDaysAxis800(maingroup);
    showTitleandSubtitlePhone(maingroup);
    showHeatmapPhone(maingroup)
    showSymptomAxis800(maingroup);
    showLegend800(maingroup);
  })
}

/* fonctions : */
function createheatmapPhone(url) {
  if (window.innerWidth < 600 && window.innerWidth > 400 )
  width = 0.9 * Math.max(Math.min(window.innerWidth, 340), 300);
  
  else if (window.innerWidth > 600 && window.innerWidth < 800 )
  width = 0.9 * Math.max(Math.min(window.innerWidth, 650), 300);
  else {
    width = 0.9 * Math.max(Math.min(window.innerWidth, 300), 300);
  }
  margin = {
    top: 0.5 * width,
    right:  -0.21 * width,
    bottom: 0.14 * width,
    left: 0.05 * width
  };
  gridSize = Math.floor(width / 10);
  brushHeight = width / 10;

  $.get(url, function (data) {
    getDatafromFile(data);
    var maingroup = d3.select('#container')
      .append("svg")
      .attr("class", "svg")
      .attr("width", innerwidth + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    brushGroupPhone(maingroup);
    showDaysAxisPhone(maingroup);
    showTitleandSubtitlePhone(maingroup);
    showHeatmapPhone(maingroup)
    showSymptomAxisPhone(maingroup);
    showLegendPhone(maingroup);
  })
}

function createheatmap(url) {
width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500);
  margin = {
    top: 0.1 * width,
    right: -0.06 * width,
    bottom: 0.14 * width,
    left: 0.05 * width
  };
  gridSize = Math.floor(width / 30);
  brushHeight = width / 100;
  $.get(url, function (data) {
    getDatafromFile(data);
    var maingroup = d3.select('#heatmap')
      .append("svg")
      .attr("class", "svg")
      .attr("width", innerwidth + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    git sbrushGroup(maingroup);
    showMonthsAxis(maingroup);
    showDaysAxis(maingroup);
    showTitleandSubtitle(maingroup);
    showHeatmap(maingroup)
    showSymptomAxis(maingroup);
    showLegend(maingroup);
  })
}

function getDatafromFile(data) {
  timestamp = data.symptom_report.map(d => d.timestamp);
  file_days = timestamp.map(d => formatdate(parseTime(d)));
  days = controlDay(file_days);
  days_axis = showingDayOnTheMap(days);
  symptom_data = loadDataSymptom(data);
  comments = loadComments(data, days);
  height = determineHeigth();
  innerwidth = determineInnerwidth();
  namesmonths = determinenamemonth(days);
}

function showHeatmapPhone(maingroup) {
  colorScale = scaleColor();
  y = yScale();

  maingroup.append("g")
    .attr('id', 'heatmape')
    .selectAll("g")
    .data(symptom_data)
    .enter().append("g")
    .attr("transform", (d, i) => `translate(${margin.left * 2.2},${y($names[i])})`)
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", (d, i) => i * (gridSize))
    .attr("width", gridSize)
    .attr("height", gridSize)
    .attr("stroke", "#e2e2e2")
    .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); })
    .append("title")
    .html(function (e, i) {
      var r = "<div> Information :  </div> <div>" + showAppendTitle(e, i) + "</div>";
      return r;
    });
}
mousePos = ({x:0.5, y:0.5});

console.log(mousePos);
function showHeatmap(maingroup) {
  colorScale = scaleColor();
  y = yScale();

  maingroup.append("g")
    .attr('id', 'heatmape')
    .selectAll("g")
    .data(symptom_data)
    .enter().append("g")
    .attr("transform", (d, i) => `translate(${margin.left * 1.75},${y($names[i])})`)
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", (d, i) => i * (gridSize))
    .attr("width", gridSize)
    .attr("height", gridSize)
    .attr("stroke", "#e2e2e2")
    .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); })
    .append("title")
    .html(function (e, i) {
      var r = "<div id = 'test' style= 'border: 50px solid yellow'> Information :  </div> <div>" + showAppendTitle(e, i) + "</div>";
      return r;
    });
}

function brushGroup800(maingroup) {
 
  let speedScrolling = (gridSize * days.length) / (18 * gridSize);

  var brushed = () => {
    const s = d3.event.selection || x2.range();
    d3.selectAll('#heatmape')
      .attr('transform', `translate(${-s[0] * speedScrolling}, 0)`)
    d3.selectAll('#xAxis')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.5)}, -10)`)
    d3.selectAll('#tickSize')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.5)}, -6)`)
  }

  if (days.length < 18) {
    var widthSlide = gridSize * days.length;
    var blockSlide = gridSize * days.length;
  } else {
    var widthSlide = (18 * gridSize) / (gridSize * days.length) * (18 * gridSize);
    var blockSlide = 18 * gridSize;
  }

  //Pour changer la valuer de "blockage, on change la valeur ici"
  var brush = d3.brushX()
    .extent([[0, brushHeight / 2], [blockSlide, brushHeight]])
    .on('brush end', brushed);

  var brushGroup = maingroup.append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${margin.left * 2.2}, ${height})`)
    .call(brush)
    .call(brush.move, [0, widthSlide]);

  brushGroup.selectAll('rect')
    .attr('height', brushHeight / 2);
}

function brushGroupPhone(maingroup) {
 
  let speedScrolling = (gridSize * days.length) / (10 * gridSize);

  var brushed = () => {
    const s = d3.event.selection || x2.range();
    d3.selectAll('#heatmape')
      .attr('transform', `translate(${-s[0] * speedScrolling}, 0)`)
    d3.selectAll('#xAxis')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.1)}, -6)`)
    d3.selectAll('#tickSize')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.1)}, -3)`)
  }

  if (days.length < 10) {
    var widthSlide = gridSize * days.length;
    var blockSlide = gridSize * days.length;
  } else {
    var widthSlide = (10 * gridSize) / (gridSize * days.length) * (10 * gridSize);
    var blockSlide = 10 * gridSize;
    console.log(gridSize * days.length);
    console.log(width);
  }

  //Pour changer la valuer de "blockage, on change la valeur ici"
  var brush = d3.brushX()
    .extent([[0, brushHeight / 2], [blockSlide, brushHeight]])
    .on('brush end', brushed);

  var brushGroup = maingroup.append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${margin.left * 2.2}, ${height})`)
    .call(brush)
    .call(brush.move, [0, widthSlide]);

  brushGroup.selectAll('rect')
    .attr('height', brushHeight / 2);
}

function brushGroup(maingroup) {
  x2 = scaleXaxis();

  let speedScrolling = (gridSize * days.length) / (26 * gridSize);

  var brushed = () => {
    const s = d3.event.selection || x2.range();
    d3.selectAll('#heatmape')
      .attr('transform', `translate(${-s[0] * speedScrolling}, 0)`)
    d3.selectAll('#xAxis')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.75)}, -16)`)
    d3.selectAll('#tickSize')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.75)}, -10)`)
    d3.selectAll('#xmonthAxis')
      .attr('transform', `translate(${-s[0] * speedScrolling + (margin.left + gridSize * 1.75)}, -26)`)
  }

  if (days.length < 26) {
    var widthSlide = gridSize * days.length;
    var blockSlide = gridSize * days.length;
  } else {
    var widthSlide = (26 * gridSize) / (gridSize * days.length) * (26 * gridSize);
    var blockSlide = 26 * gridSize;
    console.log(gridSize * days.length);
  }

  //Pour changer la valuer de "blockage, on change la valeur ici"
  var brush = d3.brushX()
    .extent([[0, brushHeight / 2], [blockSlide, brushHeight]])
    .on('brush end', brushed);

  var brushGroup = maingroup.append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${margin.left * 1.75}, ${height})`)
    .call(brush)
    .call(brush.move, [0, widthSlide]);

  brushGroup.selectAll('rect')
    .attr('height', brushHeight / 2);
}

function scaleXaxis() {
  return d3.scaleBand()
    .domain(days_axis)
    .range([margin.left, width - margin.right])
}

function yScale() {
  return d3.scaleBand()
    .domain($names)
    .rangeRound([0, symptom_data.length * gridSize]);
}

function determineInnerwidth() {
  return gridSize * 5 + width;
}

function determineHeigth() {
  return gridSize * symptom_data.length;
}

function scaleColor() {
  return d3.scaleLinear()
    .domain([0, 4])
    .range(["#fff", "#8a0886", "#cc2efa", "#e2a9f3", "#f5a9f2"]);
}

function showDaysAxis800(maingroup) {

  maingroup.selectAll(".daysLabel")
    .data(days_axis)
    .enter().append("text")
    .attr('id', 'xAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize * 7; })
    .attr("y", 0)
    .attr("transform", "translate(" + (margin.left + gridSize * 1.5) + ",-10)")
    .style("text-anchor", "middle")
    .attr("font-size", width/50);

  maingroup.selectAll(".tickSize")
    .data(days_axis)
    .enter().append("line")
    .attr('id', 'tickSize')
    .attr("transform", "translate(" + (margin.left + gridSize * 1.5) + ",-8)")
    .attr("x1", function (d, i) { return (i * gridSize * 7); })
    .attr("y1", 0)
    .attr("x2", function (d, i) { return (i * gridSize * 7); })
    .attr("y2", 10)
    .style("stroke", "black")
    .style("stroke-width", "0.75");
}

function showDaysAxisPhone(maingroup) {

  maingroup.selectAll(".daysLabel")
    .data(days_axis)
    .enter().append("text")
    .attr('id', 'xAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize * 7; })
    .attr("y", 0)
    .attr("transform", "translate(" + (margin.left + gridSize * 1.1) + ",-6)")
    .style("text-anchor", "middle")
    .attr("font-size", width/50);

  maingroup.selectAll(".tickSize")
    .data(days_axis)
    .enter().append("line")
    .attr('id', 'tickSize')
    .attr("transform", "translate(" + (margin.left + gridSize * 1.1) + ",-3)")
    .attr("x1", function (d, i) { return (i * gridSize * 7); })
    .attr("y1", 0)
    .attr("x2", function (d, i) { return (i * gridSize * 7); })
    .attr("y2", 10)
    .style("stroke", "black")
    .style("stroke-width", "0.5");
}

function showDaysAxis(maingroup) {

  maingroup.selectAll(".daysLabel")
    .data(days_axis)
    .enter().append("text")
    .attr('id', 'xAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize * 7; })
    .attr("y", 0)
    .attr("transform", "translate(" + (margin.left + gridSize * 1.75) + ",-16)")
    .style("text-anchor", "middle")
    .attr("font-size", 0.6 + "rem");

  maingroup.selectAll(".tickSize")
    .data(days_axis)
    .enter().append("line")
    .attr('id', 'tickSize')
    .attr("transform", "translate(" + (margin.left + gridSize * 1.75) + ",-10)")
    .attr("x1", function (d, i) { return (i * gridSize * 7); })
    .attr("y1", 0)
    .attr("x2", function (d, i) { return (i * gridSize * 7); })
    .attr("y2", 10)
    .style("stroke", "black")
    .style("stroke-width", "1");
}

function showMonthsAxis(maingroup) {
  maingroup.selectAll(".monthsLabel")
    .data(namesmonths)
    .enter().append("text")
    .attr('id', 'xmonthAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize; })
    .attr("y", 0)
    .attr("transform", "translate(" + (margin.left + gridSize * 1.75) + ",-26)")
    .attr("font-weight", 900)
    .style("text-anchor", "middle")
    .attr("font-family", "Saira")
    .attr("font-size", 0.6 + "rem");
}

function showTitleandSubtitlePhone(maingroup) {
  maingroup.append("text")
    .attr("class", "title")
    .attr("x", (width / 2) + margin.left + gridSize/2)
    .attr("y", -gridSize * 4.5)
    .style("text-anchor", "middle")
    .attr("font-size", width / 20)
    .text("Heatmap of Symptom reports");

  maingroup.append("text")
    .attr("class", "subtitle")
    .attr("x", (width / 2) + margin.left + gridSize/2)
    .attr("y", -gridSize * 4)
    .style("text-anchor", "middle")
    .attr("font-size", width / 30)
    .text("Study on " + days.length + " days - start the " + days[0]);

  maingroup.append("text")
    .attr("class", "subtitle")
    .attr("x", (width / 2) + margin.left + gridSize/2)
    .attr("y", -gridSize * 3.5)
    .style("text-anchor", "middle")
    .attr("font-size", width / 30)
    .text("Last update - " + days[days.length - 1]);
}

function showTitleandSubtitle(maingroup) {
  maingroup.append("text")
    .attr("class", "title")
    .attr("x", (width / 2) + margin.left)
    .attr("y", -70)
    .style("text-anchor", "middle")
    .attr("font-size", 1.5 + "rem")
    .text("Heatmap of Symptom reports");

  maingroup.append("text")
    .attr("class", "subtitle")
    .attr("x", width / 2 + margin.left)
    .attr("y", -50)
    .style("text-anchor", "middle")
    .text("Study on " + days.length + " days - start the " + days[0]);

  maingroup.append("text")
    .attr("class", "subtitle")
    .attr("x", width / 2 + margin.left)
    .attr("y", -30)
    .style("text-anchor", "middle")
    .text("Last update - " + days[days.length - 1]);
}

function showSymptomAxis800(maingroup) {
  maingroup.append("rect")
    .attr("class", "rect")
    .attr("dx", 0)
    .attr("x", -margin.left)
    .attr("y", -gridSize)
    .attr("width", margin.left + gridSize * 1.9)
    .attr("height", symptom_data.length * (gridSize + 4))
    .style("fill", "white");

  maingroup.selectAll(".symptomLabel")
    .data($names)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 40)
    .attr("y", function (d, i) { return i * gridSize; })
    .attr("transform", "translate(" + gridSize / 1.5 + "," + gridSize / 1.5 + ")")
    .style("text-anchor", "end")
    .attr("font-size", width/50);
}

function showSymptomAxisPhone(maingroup) {
  maingroup.append("rect")
    .attr("class", "rect")
    .attr("dx", 0)
    .attr("x", -margin.left)
    .attr("y", -gridSize)
    .attr("width", margin.left + gridSize)
    .attr("height", symptom_data.length * (gridSize + 4))
    .style("fill", "white");

  maingroup.selectAll(".symptomLabel")
    .data($names)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 10)
    .attr("y", function (d, i) { return i * gridSize; })
    .attr("transform", "translate(" + gridSize / 1.5 + "," + gridSize / 1.5 + ")")
    .style("text-anchor", "end")
    .attr("font-size", width/50);
}

function showSymptomAxis(maingroup) {
  maingroup.append("rect")
    .attr("class", "rect")
    .attr("dx", 0)
    .attr("x", -margin.left)
    .attr("y", -gridSize)
    .attr("width", margin.left + gridSize * 2)
    .attr("height", symptom_data.length * (gridSize + 3))
    .style("fill", "white");

  maingroup.selectAll(".symptomLabel")
    .data($names)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 30)
    .attr("y", function (d, i) { return i * gridSize; })
    .attr("transform", "translate(" + gridSize / 1.5 + "," + gridSize / 1.5 + ")")
    .style("text-anchor", "end")
    .attr("font-size", 0.6 + "rem");
}

function showLegend800(maingroup) {
  countPoint = [0, 1, 2, 3, 4, 5];
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];
  var color_hash = {
    0: ["no report", "#faf6f6"],
    1: ["no symptom", "#fff"],
    2: ["low", "#f5a9f2"],
    3: ["middle", "#e2b2f0"],
    4: ["strong", "#cc2efa"],
    5: ["Unbearable ", "#8a0886"],
  }

  maingroup.append("text")
    .attr("class", "title")
    .attr("x", margin.left * 3)
    .attr("y", - gridSize * 3)
    .attr("font-size", width / 30)
    .style("text-anchor", "middle")
    .text("Legend");

  maingroup.selectAll('rect-legend')
    .data(countPoint)
    .enter()
    .append("rect")
    .attr("x",function (d, i) { return (i * gridSize * 3) + margin.left * 3; })
    .attr("y", -gridSize * 2)
    .attr("height", gridSize / 1.5)
    .attr("width", gridSize / 1.5)
    .attr("stroke", "#e2e2e2")
    .attr("transform", "translate(" + 20 + "," + 0 + ")")
    .style("fill", function (d) {
      var color = color_hash[countPoint.indexOf(d)][1];
      return color;
    });

  maingroup.selectAll(".legende")
    .data(commentScale)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x",function (d, i) { return (i * gridSize * 2.9) + margin.left * 3; })
    .attr("y", -gridSize * 2)
    .attr("transform", "translate(" + 15 + "," + -10 + ")")
    .attr("font-size", width/50);
}

function showLegendPhone(maingroup) {
  countPoint = [0, 1, 2, 3, 4, 5];
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];
  var color_hash = {
    0: ["no report", "#faf6f6"],
    1: ["no symptom", "#fff"],
    2: ["low", "#f5a9f2"],
    3: ["middle", "#e2b2f0"],
    4: ["strong", "#cc2efa"],
    5: ["Unbearable ", "#8a0886"],
  }

  maingroup.append("rect")
    .attr("class", "rect")
    .attr("dx", 0)
    .attr("x", (11.13 * (gridSize)))
    .attr("y", - gridSize * 1.5)
    .attr("width", 1.7 * (gridSize))
    .attr("height", symptom_data.length * (gridSize * 1.1))
    .style("fill", "white");

  maingroup.append("text")
    .attr("class", "title")
    .attr("x", margin.left)
    .attr("y", - gridSize * 3)
    .attr("font-size", 12)
    .style("text-anchor", "middle")
    .text("Legend");

  maingroup.selectAll('rect-legend')
    .data(countPoint)
    .enter()
    .append("rect")
    .attr("x",function (d, i) { return (i * gridSize * 2); })
    .attr("y", -gridSize*2)
    .attr("height", gridSize / 1.5)
    .attr("width", gridSize / 1.5)
    .attr("stroke", "#e2e2e2")
    .attr("transform", "translate(" + 10 + "," + 0 + ")")
    .style("fill", function (d) {
      var color = color_hash[countPoint.indexOf(d)][1];
      return color;
    });

  maingroup.selectAll(".legende")
    .data(commentScale)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x",function (d, i) { return (i * gridSize * 1.9); })
    .attr("y", -gridSize * 2)
    .attr("transform", "translate(" + 5 + "," + -10 + ")")
    .attr("font-size", width/50);
}

function showLegend(maingroup) {
  countPoint = [0, 1, 2, 3, 4, 5];
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];
  var color_hash = {
    0: ["no report", "#faf6f6"],
    1: ["no symptom", "#fff"],
    2: ["low", "#f5a9f2"],
    3: ["middle", "#e2b2f0"],
    4: ["strong", "#cc2efa"],
    5: ["Unbearable ", "#8a0886"],
  }

  maingroup.append("rect")
    .attr("class", "rect")
    .attr("dx", 0)
    .attr("x", (26 * (gridSize) + (margin.left * 2) - (gridSize * 0.35)))
    .attr("y", - gridSize * 1.5)
    .attr("width", 5.5 * (gridSize))
    .attr("height", symptom_data.length * (gridSize * 1.1))
    .style("fill", "white");

  maingroup.append("text")
    .attr("class", "title")
    .attr("x", width)
    .attr("y", (height / 2 - gridSize * 3))
    .attr("font-size", 14)
    .style("text-anchor", "middle")
    .text("Legend");

  maingroup.selectAll('rect-legend')
    .data(countPoint)
    .enter()
    .append("rect")
    .attr("x", width - gridSize)
    .attr("y", function (d, i) { return i * (height / symptom_data.length); })
    .attr("height", gridSize / 1.5)
    .attr("width", gridSize / 1.5)
    .attr("stroke", "#e2e2e2")
    .attr("transform", "translate(" + 10 + "," + (height / 2 - gridSize * 2) + ")")
    .style("fill", function (d) {
      var color = color_hash[countPoint.indexOf(d)][1];
      return color;
    });

  maingroup.selectAll(".legende")
    .data(commentScale)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", width)
    .attr("y", function (d, i) { return i * (height / symptom_data.length); })
    .attr("transform", "translate(" + 10 + "," + (height / 2 - gridSize * 2 + 12) + ")")
    .attr("font-size", 9);
}

function showAppendTitle(data, i) {
  if (data == -2)
    return "no comments reported"

  if (data == -1)
    return "no report"

  if (data == 0)
    return "no symptom"

  if (data == 1)
    return "Low symptom"

  if (data == 2)
    return "Middle symptom"

  if (data == 3)
    return "Strong symptom"

  if (data == 4)
    return "Unbearable symptom"

  if (data == 5)
    return comments[i];


}

function loadCommentsValues(data) {
  const values = [];
  data1 = data.symptom_report.map(d => d.data.notes);

  dayscontrol = dayControl(file_days);

  const data2 = [];
  var cnt = 0;
  for (var i = 0; i < dayscontrol.length; i++) {
    data2[i + cnt] = data1[i];
    if (dayscontrol[i] != -1 && dayscontrol[i] != -30) {
      for (var t = 0; t < dayscontrol[i]; t++) {
        cnt++;
        data2[i + cnt] = "";
      }
    }
    else if (dayscontrol[i] == -1) {
      cnt--;
    }
  }

  for (var i = 0; i < days.length; i++) {
    if (data2[i] == "")
      values[i] = -2;
    else
      values[i] = 5;
  }
  return values;
}

function loadComments(data, days) {
  data1 = data.symptom_report.map(d => d.data.notes);
  dayscontrol = dayControl(file_days);
  const data2 = [];
  var cnt = 0;
  for (var i = 0; i < dayscontrol.length; i++) {
    data2[i + cnt] = data1[i];
    if (dayscontrol[i] != -1 && dayscontrol[i] != -30 && dayscontrol[i] != 31) {
      for (var t = 0; t < dayscontrol[i]; t++) {
        cnt++;
        data2[i + cnt] = "";
      }
    }
    else if (dayscontrol[i] == -1) {
      cnt--;
    }
  }

  const comments = [];
  for (var i = 0; i < days.length; i++) {
    comments[i] = data2[i];
  }
  return data2;
}

function loadDataSymptom(data) {
  chills = data.symptom_report.map(d => d.data.symptom_chills);
  ear_ache = data.symptom_report.map(d => d.data.symptom_ear_ache);
  headache = data.symptom_report.map(d => d.data.symptom_headache);
  nausea = data.symptom_report.map(d => d.data.symptom_nausea);
  diarrhea = data.symptom_report.map(d => d.data.symptom_diarrhea);
  runny_nose = data.symptom_report.map(d => d.data.symptom_runny_nose);
  short_breath = data.symptom_report.map(d => d.data.symptom_short_breath);
  body_ache = data.symptom_report.map(d => d.data.symptom_body_ache);
  fatigue = data.symptom_report.map(d => d.data.symptom_fatigue);
  sore_throat = data.symptom_report.map(d => d.data.symptom_sore_throat);
  stomach_ache = data.symptom_report.map(d => d.data.symptom_stomach_ache);
  cough = data.symptom_report.map(d => d.data.symptom_cough);
  anosmia = data.symptom_report.map(d => d.data.symptom_anosmia);
  fever = data.symptom_report.map(d => d.data.fever);
  console.log(fever);
  comments = loadCommentsValues(data);

  symptom_data = [];
  symptom_data[0] = dataControlSymptom(fever);
  symptom_data[1] = dataControlSymptom(anosmia);
  symptom_data[2] = dataControlSymptom(body_ache);
  symptom_data[3] = dataControlSymptom(chills);
  symptom_data[4] = dataControlSymptom(cough);
  symptom_data[5] = dataControlSymptom(diarrhea);
  symptom_data[6] = dataControlSymptom(ear_ache);
  symptom_data[7] = dataControlSymptom(fatigue);
  symptom_data[8] = dataControlSymptom(headache);
  symptom_data[9] = dataControlSymptom(nausea);
  symptom_data[10] = dataControlSymptom(runny_nose);
  symptom_data[11] = dataControlSymptom(short_breath);
  symptom_data[12] = dataControlSymptom(sore_throat);
  symptom_data[13] = dataControlSymptom(stomach_ache);
  symptom_data[14] = "";
  symptom_data[15] = comments;
  return symptom_data;
}

function dataControlSymptom(data) {
  dayscontrol = dayControl(file_days);

  for (i = 0; i < data.length; i++) {
    if (data[i] === undefined || data[i] === "")
      data[i] = 0;

    if (data[i] >= 95 && data[i] < 99.5)
      data[i] = 0;
    /* Managing of the entering data symptom of the fever */
    if (data[i] >= 99.5 && data[i] < 100.4)
      data[i] = 1;

    if (data[i] >= 100.4 && data[i] < 102.2)
      data[i] = 2;

    if (data[i] >= 102.2 && data[i] < 104)
      data[i] = 3;

    if (data[i] >= 104)
      data[i] = 4;
  }

  const data2 = [];
  var cnt = 0;
  for (var i = 0; i < dayscontrol.length; i++) {
    data2[i + cnt] = data[i];
    if (dayscontrol[i] != -1 && dayscontrol[i] != -30) {
      for (var t = 0; t < dayscontrol[i]; t++) {
        cnt++;
        data2[i + cnt] = - 1;
      }
    }
    else if (dayscontrol[i] == -1) {
      cnt--;
    }
  }
  /*
    for (var i = 0; i < days.length; i++) {
      data[i] = data2[i];
    }*/
  return data2;
}

function dayControl(data) {
  var days_fixed = [];
  var days4_fixed = [];
  for (var i = 0; i < data.length - 1; i++) {
    days4_fixed[i] = days2[i + 1] - days2[i] - 1;
  }
  days4_fixed.push(0);
  for (let i = 0; i < days4_fixed.length; i++) {
    if (days4_fixed[i] < -1) {
      if (month[i] == 1 || month[i] == 3 || month[i] == 5 || month[i] == 7 || month[i] == 8 || month[i] == 10 || month[i] == 12) {
        days_fixed[i] = days4_fixed[i] + 31;
      } else
        days_fixed[i] = days4_fixed[i] + 30;
    } else
      days_fixed[i] = days4_fixed[i];
  }
  return days_fixed;
}

function controlDay(data) {
  days2 = timestamp.map(d => formatdateday(parseTime(d)))
  month = timestamp.map(d => formatdatemonth(parseTime(d)))
  const days_fixed = [];
  const days2_fixed = [];
  const days3_fixed = [];
  const days4_fixed = [];
  var daybeug = [];
  var count = 0;
  console.log(days2);

  for (var i = 0; i < data.length - 1; i++) {
    days4_fixed[i] = days2[i + 1] - days2[i] - 1;

    if (days_fixed[i] > 0) {
      for (let y = 0; y < days_fixed[i]; y++) {
        daybeug[count] = i;
        count++;
      }
    }
  }
  /*
      if (days_fixed[i] == 1) {
        daybeug[count] = i;
        count++;
      }
      if (days_fixed[i] == 2) {
        daybeug[count] = i;
        daybeug[count + 1] = i + 1;
        count = +2;
      }
    }*/
  days4_fixed.push(0);
  console.log(daybeug);

  for (let i = 0; i < days4_fixed.length; i++) {
    if (days4_fixed[i] < -1) {
      if (month[i] == 1 || month[i] == 3 || month[i] == 5 || month[i] == 7 || month[i] == 8 || month[i] == 10 || month[i] == 12) {
        days_fixed[i] = days4_fixed[i] + 31;
      } else
        days_fixed[i] = days4_fixed[i] + 30;
    } else
      days_fixed[i] = days4_fixed[i];
  }

  var counter = 0;
  for (var i = 0; i < (data.length - 1); i++) {

    if (days_fixed[i] != -1 && days_fixed[i] != -30 && days_fixed[i] != -31) {

      for (var t = 0; t < days_fixed[i] + 1; t++) {

        if ((days2[i] - (-t)) < 10) {
          days2_fixed[i + counter] = "0" + (days2[i] - (-t)) + "/" + (month[i]);
          counter++;
        }
        else if (month[i] == 1 || month[i] == 3 || month[i] == 5 || month[i] == 7 || month[i] == 8 || month[i] == 10 || month[i] == 12) {
          if ((days2[i] - (-t)) > 31) {
            days2_fixed[i + counter] = "0" + ((days2[i] - (-t)) - 31) + "/" + (month[i + days_fixed[i] + 1]);
            counter++;
          } else {
            days2_fixed[i + counter] = (days2[i] - (-t)) + "/" + (month[i]);
            counter++;
          }
        } else {
          if ((days2[i] - (-t)) > 30) {
            days2_fixed[i + counter] = "0" + ((days2[i] - (-t)) - 30) + "/" + (month[i + days_fixed[i] + 1]);
          } else
            days2_fixed[i + counter] = (days2[i] - (-t)) + "/" + (month[i]);
          counter++;
        }
      }
    }
    else if (days_fixed[i] == -1) {
      counter--;
    }
    else {
      days2_fixed[i + counter] = data[i];
    }
  }
  var ii = 0;
  for (var i = 0; i < days2_fixed.length; i++) {
    if (days2_fixed[i] == null) i++;

    if (days2_fixed[i] == undefined) i++;

    days3_fixed[ii] = days2_fixed[i];
    ii++;
  }
  days3_fixed.push(data[data.length - 1]);
  return days3_fixed;
}

function determinenamemonth(data) {
  var idmonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
  var namemonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  var test = [];
  for (let i = 0; i < data.length; i++) {
    for (let y = 0; y < idmonths.length; y++) {
      if (data[i] == '01/' + idmonths[y]) {
        test[i] = namemonths[y];
        i++;
      }
    } test[i] = "";
  }
  return test;
}

function showingDayOnTheMap(data) {
  var day_break = [];
  var day_break1 = [];
  var breake = parseInt((data.length) / 7);
  for (var i = 0; i < breake + 1; i++) {
    const t = i * 7;
    day_break[i] = data[t];
  }

  var ii = 0;
  for (var i = 0; i < day_break.length; i++) {
    if (day_break[i] == undefined) i++;

    else {
      day_break1[ii] = day_break[i];
      ii++;
    }
  }
  return day_break1;
}

function chooseDisplay () {
  if (window.innerWidth > 1100) {
    return 1; 
  }else if (window.innerWidth > 900 && window.innerWidth < 1100 ) {
    return 2; 
  } else if (window.innerWidth < 600 && window.innerWidth > 400 )
  return 3; 
  else if (window.innerWidth > 600 && window.innerWidth < 800 )
  return 4; 
  else {
    return 5; 
  }
}

/* Format */
parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f+00:00");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");