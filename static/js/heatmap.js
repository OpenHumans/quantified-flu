//$names = ["Fever", "Anosmia", "Body ache", "Chills", "Cough", "Wet cough", "Diarrhea", "Fatigue", "Headache", "Nausea", "Runny nose", "Short breath", "Sore throat", "", "Comments"];
$names = ["Cough", "Wet cough", "Anosmia", "Runny nose", "Sore throat", "Short breath", "Diarrhea", "Nausea", "Chills", "Fatigue", "Headache", "Body ache", "Fever", "", "Comments"];
//"Stomach ache", "Ear ache"
display ();

function display () {
  sizedisplay = chooseDisplay();
  switch (sizedisplay) {
    case 1:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500);
      createheatmap(url);
      break;
    case 2:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500);
      createheatmap(url);
      break;
    case 3:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 340), 300);
      gridSize = Math.floor(width / 10);
      createheatmapPhone(url);
      break;
    case 4:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 650), 300);
      gridSize = Math.floor(width / 12);
      createheatmapPhone(url);
      break;
    case 5:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 300), 300);
      gridSize = Math.floor(width / 10);
      createheatmapPhone(url);
      break;
  }
}

/*window.addEventListener("orientationchange", function () {
  this.location.reload();
});*/

/* fonctions : */
function createheatmapPhone(url) {
  margin = {
    top: 0.1 * width,
    right: -0.01 * width,
    bottom: 0.14 * width,
    left: 0.03 * width
  };
  $.get(url, function (data) {
    getDatafromFile(data);
    screen(0);
    showDaysAxis(maingroup);
    showTitleandSubtitle(titlegroup);
    showHeatmap(maingroup)
    showSymptomAxis(symptomgroup);
    showLegendPhone(legendgroup);
    tooltip();
    document.getElementById("heatmap").onscroll = function () { progressScrollBar() };
  })
}
function createheatmap(url) {
  margin = {
    top: 0.05 * width,
    right: -0.05 * width,
    bottom: 0.04 * width,
    left: 0.005 * width
  };
  gridSize = Math.floor(width / 30);

  $.get(url, function (data) {
    getDatafromFile(data);
    screen(1);
    console.log(data);
    showMonthsAxis(maingroup);
    showDaysAxis(maingroup);
    showTitleandSubtitle(titlegroup);
    showHeatmap(maingroup)
    showSymptomAxis(symptomgroup);
    showLegend(legendgroup);
    tooltip();
    document.getElementById("heatmap").onscroll = function () { progressScrollBar() };
  })
}


function tooltip() {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

  d3.selectAll("#rect-heatmap")
    .on("click", function (d) {
      var coordXY = this.getAttribute('class').split('-');

      d3.select(this)
        .attr('stroke-width', 2)
        .attr("stroke", "black");
      tooltip
        .style("visibility", "visible")
        .text(`${showAppendTitle(d, coordXY[0], coordXY[1])}`);
    })

    .on("mousemove", function () {
      tooltip
        .style("top", d3.event.pageY + 10 + "px")
        .style("left", d3.event.pageX - (gridSize * 3.5) + "px");
    })

    .on("mouseout", function () {
      d3.select(this).attr("stroke", "#e2e2e2")
        .attr('stroke-width', '1');
      tooltip.style("visibility", "hidden");;
    });
}

function progressScrollBar() {
  var winScroll = document.getElementById("heatmap").scrollLeft;
  var height = document.getElementById("heatmap").scrollWidth - document.getElementById("heatmap").clientWidth;
  var scrolled = (winScroll / height) * 70.1;
  document.getElementById("myBar").style.width = scrolled + "%";
}


function screen(sizescreen) {
  maingroup = d3.select('#heatmap')
    .append("svg")
    .attr("class", "svg")
    .attr("width", (this.days.length + 1) * gridSize)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + 0 + "," + margin.top + ")");

  symptomgroup = d3.select('#symptom')
    .append("svg")
    .attr("class", "svg")
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  if (sizescreen == 1) {
    var divlegend = "legend";
    var heigtlegend = height + margin.top + margin.bottom;
    var widthlegend = 100 + "%";
  } else {
    var divlegend = "legend-phone";
    var heigtlegend = gridSize * 3;
    var widthlegend = width;
  }
  legendgroup = d3.select('#' + divlegend)
    .append("svg")
    .attr("class", "svg")
    .attr("width", widthlegend)
    .attr("height", heigtlegend)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  titlegroup = d3.select('#heatmap-title')
    .append("svg")
    .attr("class", "svg")
    .attr("width", 100 + "%")
    .attr("heigt", 100 + "%");
}

function getDatafromFile(data) {
  this.timestamp = data.symptom_report.map(d => d.timestamp);
  this.file_days = timestamp.map(d => formatdate(parseTime(d)));
  this.days = controlDay(file_days);

  this.days_axis = showingDayOnTheMap(days);
  this.symptom_data = loadDataSymptom(data);
  this.comments = loadComments(data, days);
  this.height = determineHeigth();
  this.innerwidth = determineInnerwidth();
  this.namesmonths = determinenamemonth(days);
}

function showHeatmap(maingroup) {
  colorScale = scaleColor();
  y = yScale();
  let cnt = -1;

  var heatmap = maingroup.append("g")
    .attr('id', 'heatmape')
    .selectAll("g")
    .data(symptom_data)
    .enter().append("g")
    .attr("transform", (d, i) => `translate(0, ${y($names[i])})`)
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr('id', 'rect-heatmap')
    .attr("x", (d, i) => i * (gridSize))
    .attr('class', function (d, i) {
      if (i == 0) cnt++;
      if (i == 0 && cnt == 14) cnt++;
      return i + "-" + cnt
    })
    .attr("width", gridSize)
    .attr("height", gridSize)
    .attr("stroke", "#e2e2e2")
    .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); });
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

function showDaysAxis(maingroup) {

  var dayLabel = maingroup.selectAll(".daysLabel")
    .data(days_axis)
    .enter().append("text")
    .attr('id', 'xAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize * 7; })
    .attr("y", 0)
    .attr("transform", "translate(" + (gridSize * 0.5) + ",-" + (gridSize * 0.5) + ")")
    .style("text-anchor", "middle")
    .attr("font-size", 0.7 + "rem");

  var ticksize = maingroup.selectAll(".tickSize")
    .data(days_axis)
    .enter().append("line")
    .attr('id', 'tickSize')
    .attr("transform", "translate(" + (gridSize * 0.5) + ",-" + (gridSize * 0.3) + ")")
    .attr("x1", function (d, i) { return (i * gridSize * 7); })
    .attr("y1", 0)
    .attr("x2", function (d, i) { return (i * gridSize * 7); })
    .attr("y2", 10)
    .style("stroke", "black")
    .style("stroke-width", "1");
}

function showMonthsAxis(maingroup) {
  var months = maingroup.selectAll(".monthsLabel")
    .data(namesmonths)
    .enter().append("text")
    .attr('id', 'xmonthAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize; })
    .attr("y", 0)
    .attr("transform", "translate(" + (gridSize * 1.75) + ",-26)")
    .attr("font-weight", 900)
    .style("text-anchor", "middle")
    .attr("font-family", "Saira")
    .attr("font-size", 0.7 + "rem");
}



function showTitleandSubtitle(maingroup) {
  var title = maingroup.append("text")
    .attr("class", "title")
    .attr("x", 50 + "%")
    .attr("y", 50 + "%")
    .attr("font-size", 1.4 + "rem")
    .style("text-anchor", "middle")
    .text("Heatmap of Symptom reports");

  var subtitle = maingroup.append("text")
    .attr("class", "subtitle")
    .attr("x", 50 + "%")
    .attr("y", 70 + "%")
    .style("text-anchor", "middle")
    .attr("font-size", 1 + "rem")
    .text("Study on " + days.length + " days - start the " + days[0]);

  var subtitle2 = maingroup.append("text")
    .attr("class", "subtitle")
    .attr("x", 50 + "%")
    .attr("y", 90 + "%")
    .style("text-anchor", "middle")
    .attr("font-size", 1 + "rem")
    .text("Last update - " + days[days.length - 1]);
}

function showSymptomAxis(maingroup) {

  var symptomLabel = maingroup.selectAll(".symptomLabel")
    .data($names)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("y", function (d, i) { return i * gridSize; })
    .attr("transform", "translate(" + 0 + "," + gridSize / 1.5 + ")")
    .style("text-anchor", "start")
    .attr("font-size", 0.6 + "rem");
}


function showLegendPhone(maingroup) {
  var countPoint = [-1, 0, 1, 2, 3, 4];
  var commentScale = ["No report", "No symptom", "Low", "Middle", "Strong", "Unbearable"];
  
  var title = maingroup.append("text")
    .attr("class", "title")
    .attr("font-size", 0.7 + "rem")
    .style("text-anchor", "start")
    .text("Legend");

  var rect = maingroup.selectAll('rect-legend')
    .data(countPoint)
    .enter()
    .append("rect")
    .attr("x", function (d, i) { return (i * gridSize * 1.6); })
    .attr("y", gridSize)
    .attr("height", gridSize / 2)
    .attr("width", gridSize / 2)
    .attr("stroke", "#e2e2e2")
    .attr("transform", "translate(" + margin.left + "," + -10 + ")")
    .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); });

  var legende = maingroup.selectAll(".legende")
    .data(commentScale)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return (i * gridSize * 1.6); })
    .attr("y", gridSize * 1.5)
    .attr("transform", "translate(" + margin.left + "," + 0 + ")")
    .attr("font-size", 0.5 + "rem");
}

function showLegend(maingroup) {
  var countPoint = [-1, 0, 1, 2, 3, 4];
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];
  
  var title = maingroup.append("text")
    .attr("class", "title")
    .attr("x", gridSize)
    .attr("y", (height / 2 - gridSize * 3))
    .attr("font-size", 1 + "rem")
    .text("Legend");

  var rect = maingroup.selectAll('rect-legend')
    .data(countPoint)
    .enter()
    .append("rect")
    .attr("x", gridSize)
    .attr("y", function (d, i) { return i * (height / symptom_data.length); })
    .attr("height", gridSize / 1.5)
    .attr("width", gridSize / 1.5)
    .attr("stroke", "#e2e2e2")
    .attr("transform", "translate(" + 0 + "," + (height / 2 - gridSize * 2) + ")")
    .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); });


  var legende = maingroup.selectAll(".legende")
    .data(commentScale)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", gridSize)
    .attr("y", function (d, i) { return i * (height / symptom_data.length); })
    .attr("transform", "translate(" + gridSize + "," + (height / 2 - gridSize * 2 + 12) + ")")
    .attr("font-size", 0.6 + "rem");
}

function showAppendTitle(data, i, y) {
  if (data == -2)
    return "Reports : no comments reported \n Date : " + days[i];
  if (data == -1)
    return "Reports : no report \n Date : " + days[i];
  if (data == 0)
    return "Reports : no symptom \n Date : " + days[i];
  if (data == 1)
    return "Reports : Low symptom \n Date : " + days[i] + " \n Symptom : " + $names[y] + " \n Values: " + data;
  if (data == 2)
    return "Reports : Middle symptom \n Date : " + days[i] + " \n Symptom : " + $names[y] + " \n Values: " + data;
  if (data == 3)
    return "Reports : Strong symptom\n Date : " + days[i] + " \n Symptom : " + $names[y] + " \n Values: " + data;
  if (data == 4)
    return "Reports : Unbearable symptom \n Date : " + days[i] + " \n Symptom : " + $names[y] + " \n Values: " + data;
  if (data == 5) {
    return "Comments : " + comments[i] + " \n Date : " + days[i];
  }

}

function loadCommentsValues(data) {
  const values = [];
  var data1 = data.symptom_report.map(d => d.data.notes);

  var dayscontrol = dayControl(file_days);

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
  var data1 = data.symptom_report.map(d => d.data.notes);
  var dayscontrol = dayControl(file_days);
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
  var cough = data.symptom_report.map(d => d.data.symptom_cough);
  var wet_cought = data.symptom_report.map(d => d.data.symptom_wet_cough);
  var anosmia = data.symptom_report.map(d => d.data.symptom_anosmia);
  var runny_nose = data.symptom_report.map(d => d.data.symptom_runny_nose);
  var short_breath = data.symptom_report.map(d => d.data.symptom_short_breath);
  var diarrhea = data.symptom_report.map(d => d.data.symptom_diarrhea);
  var nausea = data.symptom_report.map(d => d.data.symptom_nausea);
  var chills = data.symptom_report.map(d => d.data.symptom_chills);
  var fatigue = data.symptom_report.map(d => d.data.symptom_fatigue);
  var headache = data.symptom_report.map(d => d.data.symptom_headache);
  var body_ache = data.symptom_report.map(d => d.data.symptom_body_ache);
  var sore_throat = data.symptom_report.map(d => d.data.symptom_sore_throat);
  //var stomach_ache = data.symptom_report.map(d => d.data.symptom_stomach_ache);
  //var ear_ache = data.symptom_report.map(d => d.data.symptom_ear_ache);
  var fever = data.symptom_report.map(d => d.data.fever);
  var comments = loadCommentsValues(data);
  
  var symptom_data = [];
  symptom_data[0] = dataControlSymptom(cough);
  symptom_data[1] = dataControlSymptom(wet_cought);
  symptom_data[2] = dataControlSymptom(anosmia);
  symptom_data[3] = dataControlSymptom(runny_nose);
  symptom_data[4] = dataControlSymptom(sore_throat);
  symptom_data[5] = dataControlSymptom(short_breath);
  symptom_data[6] = dataControlSymptom(diarrhea);
  symptom_data[7] = dataControlSymptom(nausea);
  symptom_data[8] = dataControlSymptom(chills);
  symptom_data[9] = dataControlSymptom(fatigue);
  symptom_data[10] = dataControlSymptom(headache);
  symptom_data[11] = dataControlSymptom(body_ache);
  symptom_data[12] = dataControlSymptom(fever);
  symptom_data[13] = "";
  symptom_data[14] = comments;
  return symptom_data;
}


function dataControlSymptom(data) {
  dayscontrol = dayControl(file_days);

  for (i = 0; i < data.length; i++) {
    if (data[i] === undefined || data[i] === "")
      data[i] = 0;

    if ((data[i] >= 95 && data[i] < 99.5) || (data[i] >= 37 && data[i] < 37.5) )
      data[i] = 0;
    /* Managing of the entering data symptom of the fever */
    if ((data[i] >= 99.5 && data[i] < 100.4) || (data[i] >= 37.5 && data[i] < 38))
      data[i] = 1;

    if ((data[i] >= 100.4 && data[i] < 102.2) || (data[i] >= 38 && data[i] < 39))
      data[i] = 2;

    if ((data[i] >= 102.2 && data[i] < 104) || (data[i] >= 39 && data[i] < 40))
      data[i] = 3;

    if (data[i] >= 104 || data[i] >= 40 )
      data[i] = 4;
  }

  const data2 = [];
  var cnt = 0;
  for (var i = 0; i < dayscontrol.length; i++) {
    data2[i + cnt] = data[i];
    if (dayscontrol[i] != -1 && dayscontrol[i] != -30 && dayscontrol[i] != -31) {
      for (var t = 0; t < dayscontrol[i]; t++) {
        cnt++;
        data2[i + cnt] = - 1;
      }
    }
    else if (dayscontrol[i] == -1) {
      cnt--;
    }
  }
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

  for (var i = 0; i < data.length - 1; i++) {
    days4_fixed[i] = days2[i + 1] - days2[i] - 1;

    if (days_fixed[i] > 0) {
      for (let y = 0; y < days_fixed[i]; y++) {
        daybeug[count] = i;
        count++;
      }
    }
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
            if (month[i] > 9) {
              days2_fixed[i + counter] = "0" + ((days2[i] - (-t)) - 31) + "/" + (month[i] - (-1));
              counter++;
            }
            else {
              days2_fixed[i + counter] = "0" + ((days2[i] - (-t)) - 31) + "/" + "0" + (month[i] - (-1));
              counter++;
            }
          } else {
            days2_fixed[i + counter] = (days2[i] - (-t)) + "/" + (month[i]);
            counter++;
          }
        } else {
          if ((days2[i] - (-t)) > 30) {
            if (month[i] > 9) {
              days2_fixed[i + counter] = "0" + ((days2[i] - (-t)) - 30) + "/" + (month[i] - (-1));
              counter++;
            } else {
              days2_fixed[i + counter] = "0" + ((days2[i] - (-t)) - 30) + "/" + "0" + (month[i] - (-1));
              counter++;
            }
          } else {
            days2_fixed[i + counter] = (days2[i] - (-t)) + "/" + (month[i]);
            counter++;
          }
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

function chooseDisplay() {
  if (window.innerWidth > 1100) {
    return 1;
  } else if (window.innerWidth > 800 && window.innerWidth < 1100) {
    return 2;
  } else if (window.innerWidth < 640 && window.innerWidth > 200)
    return 3;
  else if (window.innerWidth > 640 && window.innerWidth < 800)
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