
$names = ["Cough", "Wet cough", "Anosmia", "Runny nose", "Sore throat", "Short breath", "Diarrhea", "Nausea", "Chills", "Fatigue", "Headache", "Body ache", "Fever", "", "Comments"];
symptom_data = [];
days_axis = [];
days = [];
completedDays = [];

display();

function display() {
  sizedisplay = chooseDisplay();
  switch (sizedisplay) {
    case 1:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500);
      gridSize = Math.floor(width / 30);
      margin = {
        top: 0.05 * width,
        right: -0.05 * width,
        bottom: 0.04 * width,
        left: 0.005 * width
      };
      createheatmap(url);
      break;
    case 2:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500);
      gridSize = Math.floor(width / 30);
      margin = {
        top: 0.05 * width,
        right: -0.05 * width,
        bottom: 0.04 * width,
        left: 0.005 * width
      };
      createheatmap(url);
      break;
    case 3:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 340), 300);
      margin = {
        top: 0.1 * width,
        right: -0.01 * width,
        bottom: 0.14 * width,
        left: 0.03 * width
      };

      gridSize = Math.floor(width / 10);
      createheatmap(url);
      break;
    case 4:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 650), 300);
      margin = {
        top: 0.1 * width,
        right: -0.01 * width,
        bottom: 0.14 * width,
        left: 0.03 * width
      };

      gridSize = Math.floor(width / 12);
      createheatmap(url);
      break;
    case 5:
      width = 0.9 * Math.max(Math.min(window.innerWidth, 300), 300);
      margin = {
        top: 0.1 * width,
        right: -0.01 * width,
        bottom: 0.14 * width,
        left: 0.03 * width
      };
      gridSize = Math.floor(width / 10);
      createheatmap(url);
      break;
  }
}
/* Variable */

function createheatmap(url) {
  $.getJSON(url, function (data) {
    height = determineHeigth();
    innerwidth = determineInnerwidth();
    heightGraph = (height / 2);
    main_heatmap(data);
    main_wearable_data(data);
    console.log(data);
  })
}

function main_heatmap(data) {
  timestamp = data.symptom_report.map(d => d.timestamp);
  file_days = timestamp.map(d => formatdate(parseTime(d)));
  reportday = timestamp.map(d => formatdateday(parseTime(d)))
  month = timestamp.map(d => formatdatemonth(parseTime(d)))
  days = controlDay(file_days, reportday, month);
  moreday = getNoReportValues(data);
  moredayDataSource = getNoReportDataSource(data);
  console.log('Data with more source: ' + moredayDataSource);
  completedDays = addDaynoReport(moreday, moredayDataSource, data);
  namesmonths = determinenamemonth(completedDays);
  symptom_data = loadDataSymptom(data);
  days_axis = showingDayOnTheMap(completedDays);
  comments = loadComments(data, days);

  createSvgReport("heatmap", (((completedDays.length) * gridSize) + 1), (height + margin.top + margin.bottom), "symptom", "heatmap-title", "legend", "legend-phone");
  showMonthsAxis(maingroup, namesmonths, -6);
  showDaysAxis(maingroup, days_axis);
  showTitleandSubtitle(titlegroup, "Heatmap of Symptom reports");
  showHeatmap(maingroup, symptom_data)
  showSymptomAxis(symptomgroup);
  showLegend(legendgroup);
  showLegendPhone(legendgroupphone);
  tooltip_heatmap();

  document.getElementById("heatmap").scroll(((moreday) * gridSize), 0);

  document.getElementById("heatmap").onscroll = function () {
    progressScrollBar();
    var winScroll = document.getElementById("heatmap").scrollLeft;
    if (moredayDataSource != 'none') {
      document.getElementById("wearable-graph").scroll(winScroll, 0);
    }
  };
}

function tooltip_heatmap() {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

  d3.selectAll("#rect-heatmap")

    .on("mouseover", function (d) {
      /*d3.select(this)
      .style("fill", "yellow");
    })
*/
      // .on("click", function (d) {
      var coordXY = this.getAttribute('class').split('-');

      d3.select(this)
        .attr('stroke-width', 2)
        .attr("width", gridSize - 1)
        .attr("height", gridSize - 1)
        .style("fill", "#EE79FE")
        .attr("stroke", "black");

      tooltip
        .style("visibility", "visible")
        .text(`${showAppendTitle(d, coordXY[0], coordXY[1])}`);
          selectSymptomOnclick(symptomgroup, coordXY[1]);
    })

    .on("mousemove", function () {
      tooltip
        .style("top", d3.event.pageY)
        .style("left", d3.event.pageX)
        .style("margin-left", - (document.getElementsByClassName('svg-tooltip').width));
    })

    .on("mouseout", function () {
      d3.select(this).attr("stroke", "#e2e2e2")
        .attr('stroke-width', '1')
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); });
       
        d3.select('.select-symptom').remove();
      tooltip.style("visibility", "hidden");
    });
}

function progressScrollBar() {
  var winScroll = document.getElementById("heatmap").scrollLeft;
  var height = document.getElementById("heatmap").scrollWidth - document.getElementById("heatmap").clientWidth;
  var scrolled = (winScroll / height) * 71.1;
  document.getElementById("myBar").style.width = scrolled + "%";
}

function createSvgReport(heatmapDiv, heatmpaSize, SVGheight, symptomDiv, titleDiv, legendDiv, legendPhoneDiv) {
  maingroup = d3.select('#' + heatmapDiv)
    .append("svg")
    .attr("class", "svg")
    .attr("width", heatmpaSize)
    .attr("height", SVGheight)
    .append("g")
    .attr("transform", "translate(" + 0 + "," + margin.top + ")");

  symptomgroup = d3.select('#' + symptomDiv)
    .append("svg")
    .attr("class", "svg")
    .attr("height", SVGheight)
    .attr("width", 100 + "%")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  legendgroup = d3.select('#' + legendDiv)
    .append("svg")
    .attr("class", "svg")
    .attr("width", 100 + "%")
    .attr("height", SVGheight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  legendgroupphone = d3.select('#' + legendPhoneDiv)
    .append("svg")
    .attr("class", "svg")
    .attr("width", 100 + "%")
    .attr("height", gridSize * 3.5)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  titlegroup = d3.select('#' + titleDiv)
    .append("svg")
    .attr("class", "svg")
    .attr("width", 100 + "%")
    .attr("heigt", 100 + "%");
}

function getDatafromFile(data) {
  this.timestamp = data.symptom_report.map(d => d.timestamp);
  this.file_days = timestamp.map(d => formatdate(parseTime(d)));
  this.reportday = timestamp.map(d => formatdateday(parseTime(d)))
  this.month = timestamp.map(d => formatdatemonth(parseTime(d)))
  days = controlDay(file_days, reportday, month);

  this.comments = loadComments(data, days);
  this.height = determineHeigth();
  this.innerwidth = determineInnerwidth();
  this.namesmonths = determinenamemonth(days);
}

function showHeatmap(maingroup, symptom_data) {
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

function yScale() {
  return d3.scaleBand()
    .domain($names)
    .rangeRound([0, symptom_data.length * gridSize]);
}

function determineInnerwidth() {
  return gridSize * 5 + width;
}

function determineHeigth() {
  return gridSize * $names.length;
}

function scaleColor() {
  return d3.scaleLinear()
    .domain([0, 4])
    .range(["#fff", "#8a0886", "#cc2efa", "#e2a9f3", "#f5a9f2"]);
}

function showDaysAxis(maingroup, days_axis) {

  var dayLabel = maingroup.selectAll(".daysLabel")
    .data(days_axis)
    .enter().append("text")
    .attr('id', 'xAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return i * gridSize * 7; })
    .attr("y", 0)
    .attr("transform", "translate(" + (gridSize * 0.5) + ",-" + (gridSize * 0.5) + ")")
    .style("text-anchor", "middle")
    .style("font-weight", "300")
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
    .style("stroke", "#212529")
    .style("stroke-width", "1");
}

function showMonthsAxis(maingroup, namesmonths, y) {
  var months = maingroup.selectAll(".monthsLabel")
    .data(namesmonths)
    .enter().append("text")
    .attr('id', 'xmonthAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return (i * gridSize) + (gridSize * 2.5); })
    .attr("y", y)
    .style("text-anchor", "middle")
    .style("font-weight", "300")
    .style("fill", "#212529")
    .style("letter-spacing", "0.5rem")
    .attr("font-size", 1 + "rem");
}

function showTitleandSubtitle(maingroup, title) {
  var title = maingroup.append("text")
    .attr("x", 50 + "%")
    .attr("y", 50 + "%")
    .attr("font-size", 1.4 + "rem")
    .style("text-anchor", "middle")
    .style("font-weight", "300")
    .attr("class", "mg-chart-title")
    .text(title);

  var subtitle = maingroup.append("text")
    .attr("x", 50 + "%")
    .attr("y", 70 + "%")
    .style("text-anchor", "middle")
    .attr("font-size", 1 + "rem")
    .style("font-weight", "300")
    .text("Study on " + days.length + " days - start the " + formatdateshow(days[0], 0));

  var subtitle2 = maingroup.append("text")
    .attr("x", 50 + "%")
    .attr("y", 90 + "%")
    .style("text-anchor", "middle")
    .attr("font-size", 1 + "rem")
    .style("font-weight", "300")
    .text("Last update - " + formatdateshow(days[days.length - 1], days.length - 1));
}

function showSymptomAxis(maingroup) {

  var symptomLabel = maingroup.selectAll(".symptomLabel")
    .data($names)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", "80%")
    .attr("y", function (d, i) { return (i * gridSize * 1) })
    .attr("transform", "translate(" + 0 + "," + gridSize / 1.5 + ")")
    .style("text-anchor", "end")
    .style("font-weight", "300")
    .attr("font-size", 0.6 + "rem");

  maingroup.append("g")
    .attr("class", "y axis")
    .append("text")
    .style("fill", "#212529")
    .attr("transform", "rotate(-90)")
    .attr("x", - 3 * gridSize)
    .attr("y", '1%')
    .style("text-anchor", "middle")
    .attr("font-size", 0.5 + "rem")
    .text("RESPIRATORY");

  maingroup.append("line")
    .attr("x1", '10%')
    .attr("y1", 0.5 * gridSize)
    .attr("x2", '10%')
    .attr("y2", 5.5 * gridSize)
    .style("stroke", "#212529")
    .style("stroke-width", "0.5");

  maingroup.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .style("fill", "#212529")
    .attr("x", - 7 * gridSize)
    .attr("y", '1%')
    .style("text-anchor", "middle")
    .attr("font-size", 0.5 + "rem")
    .text("GASTROINTESTINAL");

  maingroup.append("line")
    .attr("x1", '10%')
    .attr("y1", 6.25 * gridSize)
    .attr("x2", '10%')
    .attr("y2", 7.75 * gridSize)
    .style("stroke", "#212529")
    .style("stroke-width", "0.5");

  maingroup.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .style("fill", "#212529")
    .attr("x", - 10 * gridSize)
    .attr("y", '1%')
    .style("text-anchor", "middle")
    .attr("font-size", 0.5 + "rem")
    .text("SYSTEMIC");

  maingroup.append("line")
    .attr("x1", '10%')
    .attr("y1", 8.5 * gridSize)
    .attr("x2", '10%')
    .attr("y2", 11.5 * gridSize)
    .style("stroke", "#212529")
    .style("stroke-width", "0.5");
}

function selectSymptomOnclick(maingroup, num) {
  if (num < 13)
  maingroup.append("rect")
    .attr('class', "select-symptom")
    .attr("x", '25%')
    .attr("y", num * gridSize )
    .attr("width", '100%')
    .attr("height", gridSize )
    .style('fill', '#00CC99')
    .lower();
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
    .attr("x", function (d, i) { return (margin.left + (i * 14) + "%"); })
    .attr("y", gridSize / 2)
    .attr("height", gridSize / 2)
    .attr("width", gridSize / 2)
    .attr("stroke", "#e2e2e2")
    .style("fill", function (d) { return ((d == -1) ? "#faf6f6" : (d == -2) ? "#fff" : (d == 5) ? "#90ee90" : colorScale(d)); });

  var legende = maingroup.selectAll(".legende")
    .data(commentScale)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return (margin.left + (i * 15) + "%"); })
    .attr("y", gridSize * 1.5)
    .style("text-anchor", "middle")
    .attr("font-size", 0.5 + "rem")
    .style("font-weight", "300");
}

function showLegend(maingroup) {
  var countPoint = [-1, 0, 1, 2, 3, 4];
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];

  var title = maingroup.append("text")
    .attr("class", "title")
    .attr("x", gridSize)
    .attr("y", (height / 2 - gridSize * 3))
    .attr("font-size", 1 + "rem")
    .style("font-weight", "300")
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
    .attr("font-size", 0.6 + "rem")
    .style("font-weight", "300");
}

function showAppendTitle(data, i, y) {
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];
  if (data == -2)
    return "Reports : no comments reported \n Date : " + formatdateshow(completedDays[i], i);

  if (data == -1)
    return "Reports : " + commentScale[data + 1]
      + " \n Date : " + formatdateshow(completedDays[i], i);

  if (data == 0)
    return "Reports : " + commentScale[data + 1]
      + " \n Date : " + formatdateshow(completedDays[i], i);

  if (data == 1 || data == 2 || data == 3 || data == 4) {
    var msg = "Reports :  " + commentScale[data + 1]
      + " \n Date : " + formatdateshow(completedDays[i], i)
      + " \n Symptom : " + $names[y]
      + " \n Values: " + data + "/4";

    if (finaldataAppleWatch[i] != undefined && finaldataAppleWatch[i] != '-' && finaldataAppleWatch[i] != 'NO DATA')
      msg += " \n Heart Rate (Apple Watch) : " + finaldataAppleWatch[i] + " bmp";

    if (finaldata_fitbit[i] != undefined && finaldata_fitbit[i] != '-' && finaldata_fitbit[i] != 'NO DATA')
      msg += " \n Heart Rate (Fitbit) : " + finaldata_fitbit[i] + " bmp";

    if (finaldataOura[i] != undefined && finaldataOura[i] != '-' && finaldataOura[i] != 'NO DATA')
      msg += " \n Heart Rate (Oura) : " + finaldataOura[i] + " bmp";
    
    if (finaldataGoogle[i] != undefined && finaldataGoogle[i] != '-' && finaldataGoogle[i] != 'NO DATA')
      msg += " \n Heart Rate (GoogleFit) : " + finaldataGoogle[i] + " bmp";
    
    if (finaldata_garmin[i] != undefined && finaldata_garmin[i] != '-' && finaldata_garmin[i] != 'NO DATA')
      msg += " \n Heart Rate (Garmin) : " + finaldata_garmin[i] + " bmp";
    
    if (finaldataOuraTemperature[i] != undefined && finaldataOuraTemperature[i] != '-' && finaldataOuraTemperature[i] != 'NO DATA')
      msg += " \n Body Temp. (Oura) : " + finaldataOuraTemperature[i];
    return msg;
  }
  if (data == 5) {
    return "Comments : " + comments[i] + " \n Date : " + formatdateshow(completedDays[i], i);
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
  for (var i = 0; i < moreday; i++) {
    values[i] = -1;
  }

  for (var i = moreday; i < days.length + moreday; i++) {
    if (data2[i - moreday] == "")
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
  for (var i = 0; i < moreday; i++) {
    comments[i] = "";
  }
  for (var i = moreday; i < data2.length + moreday; i++) {
    comments[i] = data2[i - moreday];
  }
  return comments;
}

function loadDataSymptom(data) {
  cnt = 0;
  cough = [], wet_cought = [], anosmia = [], runny_nose = [], short_breath = [], diarrhea = [], nausea = [], chills = [], fatigue = [], headache = [], body_ache = [], sore_throat = [], fever = [];
  this.file = data.symptom_report.map(d => d);
  this.file.forEach(element => {
    cough[cnt] = element.data.symptom_cough;
    wet_cought[cnt] = element.data.symptom_wet_cough;
    anosmia[cnt] = element.data.symptom_anosmia;
    runny_nose[cnt] = element.data.symptom_runny_nose;
    short_breath[cnt] = element.data.symptom_short_breath;
    diarrhea[cnt] = element.data.symptom_diarrhea;
    nausea[cnt] = element.data.symptom_nausea;
    chills[cnt] = element.data.symptom_chills;
    fatigue[cnt] = element.data.symptom_fatigue;
    headache[cnt] = element.data.symptom_headache;
    body_ache[cnt] = element.data.symptom_body_ache;
    sore_throat[cnt] = element.data.symptom_sore_throat;
    fever[cnt] = element.data.fever;
    cnt++;
  });

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

    if ((data[i] >= 95 && data[i] < 99.5) || (data[i] >= 37 && data[i] < 37.5))
      data[i] = 0;
    /* Managing of the entering data symptom of the fever */
    if ((data[i] >= 99.5 && data[i] < 100.4) || (data[i] >= 37.5 && data[i] < 38))
      data[i] = 1;

    if ((data[i] >= 100.4 && data[i] < 102.2) || (data[i] >= 38 && data[i] < 39))
      data[i] = 2;

    if ((data[i] >= 102.2 && data[i] < 104) || (data[i] >= 39 && data[i] < 40))
      data[i] = 3;

    if (data[i] >= 104 || data[i] >= 40)
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
  newdata = [];
  for (let x = 0; x < (data2.length + moreday); x++) {
    if (x < moreday)
      newdata[x] = (-1);
    else
      newdata[x] = data2[x - moreday];
  }
  newdata.push(data2[data2.length - 1])
  return newdata;
}

function dayControl(data) {
  var days_fixed = [];
  var days4_fixed = [];
  for (var i = 0; i < data.length - 1; i++) {
    days4_fixed[i] = reportday[i + 1] - reportday[i] - 1;
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

function controlDay(data, days2, month) {
  // days2 = timestamp.map(d => formatdateday(parseTime(d)))
  // month = timestamp.map(d => formatdatemonth(parseTime(d)))
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
  // console.log()
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

function getNoReportValues(data) {
  hour = fortmatHour(parseTime(data.symptom_report[0].timestamp));
  min = fortmatminutes(parseTime(data.symptom_report[0].timestamp));
  sec = fortmatsecondes(parseTime(data.symptom_report[0].timestamp));
  millisecondes = (hour * 3600000) + (min* 60000) + (sec * 1000);
  firstDay_report = parseTime(data.symptom_report[0].timestamp).getTime();

  if (data.fitbit_summary != undefined)
    firstDay_fitbit = parseTimeTemp(data.fitbit_summary[0].timestamp).getTime();
  else
    firstDay_fitbit = firstDay_report;
  if (data.apple_health_summary != undefined)
    firstDay_apple = parseTime(data.apple_health_summary[0].timestamp).getTime();
  else
    firstDay_apple = firstDay_report;
  if (data.oura_sleep_summary != undefined)
    firstDay_oura = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
  else
    firstDay_oura = firstDay_report;
  if (data.oura_sleep_5min != undefined)
    firstDay_oura_hr = parseTimeOuraSleep(data.oura_sleep_5min[0].timestamp).getTime();
  else
    firstDay_oura_hr = firstDay_report;
  if (data.garmin_heartrate != undefined)
    firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
  else
    firstDay_garmin = firstDay_report;
  if (data.googlefit_heartrate!= undefined)
    firstDay_google = parseTimeGarmin(data.googlefit_heartrate[0].timestamp).getTime();
  else
    firstDay_google = firstDay_report;
  test = 0;
  test2 = "";

  if ((firstDay_report - firstDay_apple) > test && firstDay_apple != undefined) {
    test = (firstDay_report - firstDay_apple);
    test2 = '/apple';
  }
  if (firstDay_report - firstDay_oura > test && firstDay_oura != undefined) {
    test = firstDay_report - firstDay_oura;
    test2 = '/oura';
  }
  if ((firstDay_report - firstDay_fitbit) > test && firstDay_fitbit != undefined) {
    test = (firstDay_report - firstDay_fitbit);
    test2 = '/fitbit';
  }
  if ((firstDay_report - firstDay_oura_hr) > test && firstDay_oura_hr != undefined) {
    test = (firstDay_report - firstDay_oura_hr);
    test2 = '/ouraHR';
  }
  if ((firstDay_report - firstDay_garmin) > test && data.garmin_heartrate != undefined) {
    test = (firstDay_report - firstDay_garmin);
    test2 = '/garmin';
  }
  if ((firstDay_report - firstDay_google) > test && data.googlefit_heartrate != undefined) {
    test = (firstDay_report - firstDay_google);
    test2 = '/google';
  }

  if ( test2 == '/google') {
    hour2 =  fortmatHour(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    min2 =  fortmatminutes(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    sec2 =  fortmatsecondes(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
 if ( test2 == '/oura') {
    hour2 =  fortmatHour(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    min2 =  fortmatminutes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    sec2 =  fortmatsecondes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if ( test2 == '/garmin') {
    hour2 =  fortmatHour(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    min2 =  fortmatminutes(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    sec2 =  fortmatsecondes(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if ( test2 == '/fitbit') {
    hour2 =  fortmatHour(parseTimeTemp(data.fitbit_summary[0].timestamp));
    min2 =  fortmatminutes(parseTimeTemp(data.fitbit_summary[0].timestamp));
    sec2 =  fortmatsecondes(parseTimeTemp(data.fitbit_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if ( test2 == '/apple') {
    hour2 =  fortmatHour(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    min2 =  fortmatminutes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    sec2 =  fortmatsecondes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }

  if ( test2 == '/ouraHR') {
    hour2 =  fortmatHour(parseTimeOuraSleep(data.oura_sleep_5min[0].timestamp));
    min2 =  fortmatminutes(parseTimeOuraSleep(data.oura_sleep_5min[0].timestamp));
    sec2 =  fortmatsecondes(parseTimeOuraSleep(data.oura_sleep_5min[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
 return Math.round(test/(86400000)); 
}

function getNoReportDataSource(data) {

  firstDay_report = parseTime(data.symptom_report[0].timestamp).getTime();

  if (data.fitbit_summary != undefined)
    firstDay_fitbit = parseTimeTemp(data.fitbit_summary[0].timestamp).getTime();
  else
    firstDay_fitbit = firstDay_report;
  if (data.apple_health_summary != undefined)
    firstDay_apple = parseTime(data.apple_health_summary[0].timestamp).getTime();
  else
    firstDay_apple = firstDay_report;
  if (data.oura_sleep_summary != undefined)
    firstDay_oura = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
  else
    firstDay_oura = firstDay_report;
  if (data.oura_sleep_5min != undefined)
    firstDay_oura_hr = parseTimeOuraSleep(data.oura_sleep_5min[0].timestamp).getTime();
  else
    firstDay_oura_hr = firstDay_report;
  if (data.garmin_heartrate != undefined)
    firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
  else
    firstDay_garmin = firstDay_report;
  if (data.googlefit_heartrate!= undefined)
    firstDay_google = parseTimeGarmin(data.googlefit_heartrate[0].timestamp).getTime();
    else
    firstDay_google = firstDay_report;

  test = 0;
  test2 = "none";

  if ((firstDay_report - firstDay_apple) > test) {
    test = (firstDay_report - firstDay_apple);
    test2 = 'apple';
  }
  if (firstDay_report - firstDay_oura > test) {
    test = firstDay_report - firstDay_oura;
    test2 = 'oura';
  }
  if ((firstDay_report - firstDay_fitbit) > test) {
    test = (firstDay_report- firstDay_fitbit);
    test2 = 'fitbit';
  }
  if ((firstDay_report - firstDay_oura_hr) > test) {
    test = (firstDay_report - firstDay_oura_hr);
    test2 = 'ouraHR';
  }
  if (firstDay_report - firstDay_garmin > test) {
    test = (firstDay_report - firstDay_garmin);
    test2 = 'garmin';
  }
  if ((firstDay_report - firstDay_google) > test) {
    test = (firstDay_report - firstDay_google);
    test2 = 'google';
  }
  return test2;
}

function addDaynoReport(numberdays, datasource, data) {
  var daystoadd = [];

  if (datasource == 'oura' && data.oura_sleep_summary != undefined) {
    for (let i = 0; i < numberdays; i++) {
      daystoadd[i] = formatdate(parseTimeTemp(data.oura_sleep_summary[i].timestamp));
    }
  }
  else if (datasource == 'fitbit' && data.fitbit_summary != undefined) {
    for (let i = 0; i < numberdays; i++) {
      daystoadd[i] = formatdate(parseTimeTemp(data.fitbit_summary[i].timestamp));
    }
  }
  else if (datasource == 'apple' && data.apple_health_summary != undefined) {
    for (let i = 0; i < numberdays; i++) {
      daystoadd[i] = formatdate(parseTime(data.apple_health_summary[i].timestamp));
    }
  }
  else if (datasource == 'ouraHR' && data.oura_sleep_5min != undefined) {
    for (let i = 0; i < numberdays; i++) {
      daystoadd[i] = formatdate(parseTimeOuraSleep(data.oura_sleep_5min[i].timestamp));
    }
  }
  else if (datasource == 'garmin' && data.garmin_heartrate != undefined) {
    for (let i = 0; i < numberdays; i++) {
      daystoadd[i] = formatdate(parseTimeGarmin(data.garmin_heartrate[i].timestamp));
    }
  }
  else if (datasource == 'google' && data.googlefit_heartrate != undefined) {
    for (let i = 0; i < numberdays; i++) {
     daystoadd[i] = formatdate(parseTimeGarmin(data.googlefit_heartrate[i].timestamp));
    }
  }
  else numberdays = 0;

  for (let i = numberdays; i < days.length + numberdays; i++) {
    daystoadd[i] = days[i - numberdays];
  }
  return daystoadd;
}

function getDays() {
  return this.days;
}
/* Format */
parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f+00:00");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");
parseTimeOuraSleep = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
parseTimeGarmin = d3.timeParse("%Y-%m-%dT%H:%M:%S");
formatnewdate = d3.timeFormat("%Y-%m-%d%Z");
fortmatHour = d3.timeFormat("%H");
fortmatminutes = d3.timeFormat("%M");
fortmatsecondes = d3.timeFormat("%S");
