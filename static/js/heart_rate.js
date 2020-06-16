//getWearableData();

comparedateApple = 0;
comparedate = 0;
comparedate_fitbit = 0;
finaldataAppleWatch = [];
finaldataOuraTemperature = [];
finaldata_fitbit = [];
comparateDayReportWearable = [];
symptom_data_heatmap = [];

function getdataFromSymptomReport(data) {
    heatmapdata = [], heatmapdate = [], heatmapday = [], heatmapmonth = [], heatmapyear = [];
    this.file = data.symptom_report.map(d => d);
    this.file.forEach(element => {
        //heatmapdata[cnt] = element.data.heart_rate;
        heatmapdate[cnt] = formatdate(parseTime(element.timestamp));
        heatmapday[cnt] = formatdateday(parseTime(element.timestamp));
        heatmapmonth[cnt] = formatdatemonth(parseTime(element.timestamp));
        heatmapyear[cnt] = formatyear(parseTime(element.timestamp));
        cnt++;
    });

    comparateDayReportWearable = controlDay(heatmapdate, heatmapday, heatmapmonth);
    symptom_data_heatmap = loadDataSymptom(data);
}

$.getJSON(url, function (data) {
    main_wearable_data(data)
})

function getWearableData() {
    $.getJSON(url, function (data) {
        //timestamp3 = data.symptom_report.map(d => d.timestamp);
        /* file_days3 =  data.symptom_report.map(d => formatdate(parseTime(d.timestamp)));
         days23 = data.symptom_report.map(d => formatdateday(parseTime(d.timestamp)))
         month3 = data.symptom_report.map(d => formatdatemonth(parseTime(d.timestamp)))
         days3 = controlDay(file_days3, days23, month3);
       */

        if (data.oura_sleep_summary == undefined) {
            showbuttonNoConnection("button-no-oura_sleep_summary", "message-no-oura_sleep_summary", "/import_data/authorize-oura/", "Connect Oura account")
        }
        else if (data.oura_sleep_summary != undefined)
            mainTemperature_oura_sleep_summary(data);

        if (data.apple_health_summary == undefined) {
            showbuttonNoConnection("button-no-apple", "message-no-apple", "https://apps.apple.com/us/app/oh-data-port/id1512384252", "Connect Apple Watch")
        }
        else if (data.apple_health_summary != undefined)
            mainAppleWatch(data);

        if (data.fitbit_summary == undefined) {
            showbuttonNoConnection("button-no-fitbit", "message-no-fitbit", "https://www.fitbit.com/oauth2/authorize?response_type=code&amp;client_id=&amp;scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight", "Connect Fitbit account")
        }
        else if (data.fitbit_summary != undefined)
            main_fitbit_summary_heartrate(data);
    })
}

/* Button no loading wearable data */
function showbuttonNoConnection(idbutton, idmessage, hrefbutton, buttonmessage) {
    let dct = document.getElementById(idbutton);
    let htmlContent = "<a class= 'btn btn-primary btn-lg' href=" + hrefbutton + ">"
        + buttonmessage +
        "</a>";
    dct.insertAdjacentHTML('afterend', htmlContent);

    var para = document.createElement("p");
    var node = document.createTextNode("Notes : You have not  connect these data sources to correlate them with reported illness. Please click on the button to change this setting. Thank you for sharing! 💖");
    para.appendChild(node);
    var element = document.getElementById(idmessage);
    element.appendChild(para);


    /*document.getElementById("myBar").style.width = scrolled + "%";*/
}

function main_wearable_data(data) {
    heightGraph = determineHeigth() / 2;
    symptom_report = getSymptomDatafromFile(0);
    month = determinenamemonth(this.completedDays);
    var revert = 0;
    createSvgContainer('wearable-graph', ((this.completedDays.length) * gridSize), 'wearable-legend', (heightGraph), 'wearable-title', (margin.top));
    createLegendAxeX(maingroup, this.days_axis);
    createLegendAxeY(legendgroup, "null", "");
    getreportedSickIncident(maingroup, symptom_report);
    createButtonAddTo(makeAchoice, data);
    showMonthsAxis(maingroup, month, (heightGraph - 5));
    tooltipChoice(data, revert);
    var winScroll = document.getElementById("heatmap").scrollLeft;
    document.getElementById("wearable-graph").scroll((winScroll), 0);

    document.getElementById("wearable-graph").onscroll = function () {
        var winScroll = document.getElementById("wearable-graph").scrollLeft;
        document.getElementById("heatmap").scroll((winScroll), 0);
    }
}
/* Get all the variable data needed */
function controlDatafromFitbit(data) {
    getHeartRateDatafromFitbit(data);
    /* Find the day */
    controlday_fitbit = controlDay(fitbitday, fitbitday, fitbitmonth);
    noMissingDay_fitbit = addorRemoveday(controlday_fitbit, getDays(), data);

    /* Get the difference between the day */
    comparedate_fitbit = compareDateReport(noMissingDay_fitbit);
    fitbit_date = completedLastDay(comparedate_fitbit, noMissingDay_fitbit);
    dayAxis_fitbit = getDayonAxis(fitbit_date);
    monthOnAxis_fitbit = determinenamemonth(fitbit_date);


    /* Udpate the data with the missing day / repeat day */
    finaldata_fitbit = dataControl(fitbitdata, fitbitday, fitbitday, fitbitmonth, comparedate_fitbit);
    symptomData_fitbit = getSymptomDatafromFile(0);

    fitbitAxis = getAxisLegend(finaldata_fitbit, 'dizaine');
}

function controlDatafromOura(data) {
    /* Recupérer les données dans le fichier*/
    getTemperatureDatafromFile(data);

    /*Find the day */
    controldayTemp = controlDay(tempday, day, monthtemp);
    noMissingDayTemp = addorRemoveday(controldayTemp, getDays(), data);
    comparedate = compareDateReport(noMissingDayTemp);
    oura_date = completedLastDay(comparedate, noMissingDayTemp);

    tempdayAxis = getDayonAxis(oura_date);
    month = determinenamemonth(oura_date);

    finaldataOuraTemperature = dataControl(tempdata, tempday, day, monthtemp, comparedate);

    axisTemperature_oura = getAxisLegend(finaldataOuraTemperature, 'decimal');
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(0);
}

function controlDatafromAppleWatch(data) {
    /* Recupérer les données dans le fichier*/
    getAppleDatafromFile(data);
    /*Find the day */
    controlday = controlDay(appleday, dayapp, monthapp);
    noMissingDay = addorRemoveday(controlday, getDays(), data);

    comparedateApple = compareDateReport(noMissingDay);
    apple_date = completedLastDay(comparedateApple, noMissingDay);

    appledayAxis = getDayonAxis(apple_date);
    applemonth = determinenamemonth(apple_date);
    finaldataAppleWatch = dataControl(appledata, appleday, dayapp, monthapp, comparedateApple);

    heartrateAxis = getAxisLegend(finaldataAppleWatch, 'dizaine');
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(0);
}

/* Main fonction of wearable data */
function main_fitbit_summary_heartrate(data) {
    heightGraph = determineHeigth() / 2;
    // fitbitAxis2 = ["50", "60", "70", "80", "90", "100", "110", "120"];
    fitbitdata = [], fitbitdate = [], fitbitday = [], fitbitmonth = [], fitbityear = [];
    symptomData_fitbit = [];

    getHeartRateDatafromFitbit(data);

    controlDatafromFitbit(data);

    /* Graphic element */
    createSvg('heart-rate-fitbit', (fitbit_date.length * gridSize), 'fitbit-legend', (heightGraph), 'fitbit-title', (margin.top));
    createChartePoint(maingroupapple, finaldata_fitbit, fitbitAxis, "circle-fitbit", "#67FFFF");
    getreportedSickIncident(maingroupapple, symptomData_fitbit);
    createTitle(titleapple, "Heart Rate evolution", 'fitbit-title');
    createLegendAxeY(legendapple, fitbitAxis, "HEART RATE [BMP]", 'fitbit-axisY');
    createLegendAxeX(maingroupapple, dayAxis_fitbit);
    showMonthsAxis(maingroupapple, monthOnAxis_fitbit, (heightGraph - 5));

    /* Display the data when mouse on it */
    tooltip("circle-fitbit", fitbit_date, "bmp");

    var winScroll = document.getElementById("heatmap").scrollLeft;
    document.getElementById("heart-rate-fitbit").scroll((winScroll), 0);

    document.getElementById("heart-rate-fitbit").onscroll = function () {
        var winScroll = document.getElementById("heart-rate-fitbit").scrollLeft;
        document.getElementById("heatmap").scroll((winScroll), 0);
    }
}

function mainTemperature_oura_sleep_summary(data) {
    //tempAxis = ["-1", "-0.5", "0", "0.5", "1", "1.5", "2", "2.5"];
    tempdata = [], tempday = [], tempyear = [], tempdayAxis = [], tempdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthtemp = [];
    heightGraph = determineHeigth() / 2;
    symptomData = [];

    controlDatafromOura(data);

    /* Element graphique */
    createSvg('temperature-oura_sleep_summary', ((oura_date.length) * gridSize), 'oura_sleep_summary-legend', (heightGraph), 'oura_sleep_summary-title', (margin.top));
    createChartePoint(maingroupapple, finaldataOuraTemperature, axisTemperature_oura, "circle-temperature", "#67FFFF");
    getreportedSickIncident(maingroupapple, symptomData);
    createTitle(titleapple, "Temperature evolution", 'oura-title');
    createLegendAxeY(legendapple, axisTemperature_oura, "BODY TEMPERATURE", 'oura-axisY');
    createLegendAxeX(maingroupapple, tempdayAxis);
    showMonthsAxis(maingroupapple, month, (heightGraph - 5));

    /* Afficher les données */
    tooltip("circle-temperature", oura_date, "");

    var winScroll = document.getElementById("heatmap").scrollLeft;
    document.getElementById("temperature-oura_sleep_summary").scroll((winScroll), 0);

    document.getElementById("temperature-oura_sleep_summary").onscroll = function () {
        var winScroll = document.getElementById("temperature-oura_sleep_summary").scrollLeft;
        document.getElementById("heatmap").scroll((winScroll), 0);
    }
}

function mainAppleWatch(data) {
    dayapp = [], monthapp = [], appledata = [], appleday = [], appleyear = [], symptomData = [];
    cnt = 0, appledate = [], repeat = [], noRepeatDataApple = [];
    heightGraph = determineHeigth() / 2;

    controlDatafromAppleWatch(data);

    /* Element graphique */
    createSvg('heartrate-apple', ((this.apple_date.length) * gridSize), 'apple-legend', (heightGraph), 'apple-title', (margin.top));
    createChartePoint(maingroupapple, finaldataAppleWatch, heartrateAxis, "circle-apple-watch", "#67FFFF")
    getreportedSickIncident(maingroupapple, symptomData)
    createTitle(titleapple, "Heart rate evolution", 'apple-title');
    createLegendAxeY(legendapple, heartrateAxis, "HEART RATE [BPM]", 'apple-axisY');
    createLegendAxeX(maingroupapple, axisdays);
    showMonthsAxis(maingroupapple, applemonth, (heightGraph - 5));

    /* Afficher les données */
    tooltip("circle-apple-watch", apple_date, "bmp");
    /* Controler le scroll  */
    var winScroll = document.getElementById("heatmap").scrollLeft;
    document.getElementById("heartrate-apple").scroll((winScroll), 0);

    document.getElementById("heartrate-apple").onscroll = function () {
        var winScroll = document.getElementById("heartrate-apple").scrollLeft;
        document.getElementById("heatmap").scroll((winScroll), 0);
    }
}

/* Function display for the main container */
function mainContainer_temperature_oura_sleep_summary(data, maingroupapple, legendapple, titleapple, revert) {
    tempdata = [], tempday = [], tempyear = [], tempdayAxis = [], tempdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthtemp = [];
    heightGraph = determineHeigth() / 2;
    if (revert == 1) {
        controlDatafromOura(data);
        createChartePoint(maingroupapple, finaldataOuraTemperature, axisTemperature_oura, "circle-temperature-ctn", "#9BFF1C", (gridSize/10));
        createTitle(titleapple, "Temperature evolution", 'oura-title-ctn');
        createLegendAxeY(legendapple, axisTemperature_oura, "BODY TEMPERATURE", 'oura-axisY-cnt');
        /* Afficher les données */
        tooltip("circle-temperature-ctn", oura_date, "");
    } else {
        removeDataSource('circle-temperature-ctn', 'oura-axisY-cnt', 'oura-title-ctn');
    }
}

function mainContainer_HeartRate_Apple_Watch(data, maingroupapple, legendapple, titleapple, revert) {
    dayapp = [], monthapp = [], appledata = [], appleday = [], appleyear = [], symptomData = [];
    cnt = 0, appledate = [], repeat = [], noRepeatDataApple = [];
    heightGraph = determineHeigth() / 2;
    if (revert == 1) {
        controlDatafromAppleWatch(data);
        /* Element graphique */
        createChartePoint(maingroupapple, finaldataAppleWatch, heartrateAxis, "circle-apple-watch-ctn", "#0041EA", (gridSize/10))
        createTitle(titleapple, "Heart rate evolution", 'apple-title-ctn');
        createLegendAxeY(legendapple, heartrateAxis, "HEART RATE [BPM]", 'apple-axisY-ctn');
        /* Afficher les données */
        tooltip("circle-apple-watch-ctn", apple_date, "bmp");
    } else {
        removeDataSource('circle-apple-watch-ctn', 'apple-axisY-ctn', 'apple-title-ctn');
    }
}

function mainContainer_fitbit_summary_heartrate(data, maingroupapple, legendapple, titleapple, revert) {
    heightGraph = determineHeigth() / 2;
    fitbitdata = [], fitbitdate = [], fitbitday = [], fitbitmonth = [], fitbityear = [];
    symptomData_fitbit = [];
    if (revert == 1) {
        controlDatafromFitbit(data);
        /* Element graphique */
        createChartePoint(maingroupapple, finaldata_fitbit, fitbitAxis, "circle-fitbit-cnt", "#FF8484", (gridSize/10));
        createTitle(titleapple, "Heart Rate evolution", 'fitbit-title-cnt');
        createLegendAxeY(legendapple, fitbitAxis, "HEART RATE [BMP]", 'fitbit-axisY-cnt');
        /* Afficher les données */
        tooltip("circle-fitbit-cnt", fitbit_date, "bmp");
    } else {
        removeDataSource('circle-fitbit-cnt', 'fitbit-axisY-cnt', 'fitbit-title-cnt');
    }
}

function removeDataSource(iddata, idtitle, idaxis) {
    d3.selectAll("#" + iddata).remove();
    d3.selectAll("#" + idtitle).remove();
    d3.selectAll("#" + idaxis).remove();
}
/* GET THE DATA FROM FILE .JSON */

function getHeartRateDatafromFitbit(data) {
    cnt = 0;
    this.file = data.fitbit_summary.map(d => d);
    this.file.forEach(element => {
        fitbitdata[cnt] = element.data.heart_rate;
        fitbitdate[cnt] = element.timestamp;
        fitbitday[cnt] = formatdateday(parseTimeTemp(element.timestamp));
        fitbitmonth[cnt] = formatdatemonth(parseTimeTemp(element.timestamp));
        fitbityear[cnt] = formatyear(parseTimeTemp(element.timestamp));
        cnt++;
    });
}

function getAppleDatafromFile(data) {
    cnt = 0;
    this.file = data.apple_health_summary.map(d => d);
    this.file.forEach(element => {
        appledata[cnt] = Math.round(element.data.heart_rate);
        appleday[cnt] = formatdate(parseTime(element.timestamp));
        appleyear[cnt] = formatyear(parseTime(element.timestamp));
        dayapp[cnt] = formatdateday(parseTime(element.timestamp));
        monthapp[cnt] = formatdatemonth(parseTime(element.timestamp));
        cnt++;
    });
}

function getTemperatureDatafromFile(data) {
    cnt = 0;
    this.file = data.oura_sleep_summary.map(d => d);
    this.file.forEach(element => {
        tempdata[cnt] = element.data.temperature_delta;
        tempday[cnt] = formatdate(parseTimeTemp(element.timestamp));
        day[cnt] = formatdateday(parseTimeTemp(element.timestamp));
        monthtemp[cnt] = formatdatemonth(parseTimeTemp(element.timestamp));
        tempyear[cnt] = formatyear(parseTimeTemp(element.timestamp));
        cnt++;
    });
}

function repeatdata(appleday, appledata, noRepeatDataApple) {
    data1 = appleday;
    var cnt = 0;
    for (let i = 0; i < appleday.length - 1; i++) {
        let calcul = data1[i + 1].split('/')[0] - data1[i].split('/')[0];
        if (calcul != 0) {
            noRepeatDataApple[cnt] = appledata[i];
            cnt++;
        }
    }
    noRepeatDataApple.push(appledata[appledata.length - 1]);
}

function compare(x, y) {
    return x - y;
}

function getSymptomDatafromFile(comparedateApple) {
    var cmpt = 0;
    var cnt = 0;
    var cal = [];
    var cal2 = [];

    var symptomData = [];
    for (let x = 0; x < symptom_data.length; x++) {
        for (let y = 0; y < symptom_data[0].length; y++) {
            if (symptom_data[x][y] > 0 && symptom_data[x][y] < 5) {
                symptomData[cmpt] = y + comparedateApple;
                cmpt++;

            }
        }
    }
    /* Ordre croissant */
    symptomData.sort(compare);

    for (let i = 0; i <= symptomData.length - 1; i++) {
        if (symptomData[i + 1] != symptomData[i]) {
            cal[cnt] = symptomData[i];
            cal2[cnt] = symptomData[i];
            cnt++;
        }
    }

    for (let i = 1; i <= cal.length - 1; i++) {
        if (cal[i] == (cal[i - 1] + 1) || cal[i] == (cal[i - 1] + 1) + '/1') {

            if (cal[i] == (cal[i + 1] - 1)) {
                cal[i + 1] += '/1';
            }

            if (cal[i] == (cal[i + 2] - 2)) {
                cal[i + 2] += '/1';
            }

            if (cal[i] == (cal[i + 3] - 3)) {
                cal[i + 3] += '/1';
            }

            cal[i] += '/0';
            cal[i - 1] += '/1';
        }
    }

    for (let i = 0; i < cal.length; i++) {
        if ((cal[i] != (cal2[i] + "/1")))
            cal2[i] += '/0';
        else
            cal2[i] = cal[i];
    }
    return cal2;
}

function getDayonAxis(data) {
    axisdays = [];
    var cnt = 0;
    for (let i = 0; i < data.length; i += 7) {
        axisdays[cnt] = data[i];
        cnt++;
    }
    return axisdays;
}

function getreportedSickIncident(maingroupapple, data) {
    for (let item of data) {
        showreportedSickIncident(maingroupapple, item);
    }
}

function tooltip(circleid, data, msg) {

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    d3.selectAll("#" + circleid)
        .on("click", function (d) {
            let coordXY = this.getAttribute('class').split('- ')[1];
            d3.select(this)
                .attr("r", gridSize / 5)
                .attr('stroke-width', 1)
                .attr("fill", "#015483");
            tooltip
                .style("visibility", "visible")
                .text(formatdateshow(data[coordXY], coordXY) + " " + d + " " + msg);
        })

        .on("mousemove", function () {
            tooltip
                .style("top", d3.event.pageY + 10 + "px")
                .style("left", d3.event.pageX - (gridSize * 3.5) + "px");
        })

        .on("mouseout", function () {
            d3.select(this).attr("r", gridSize / 10)
                .attr("fill", function (d) {
                    if (d == "NO DATA" || d == '-')
                        return '#EAEDED'
                    else
                        return "#A5DAEC"
                })
                .style("stroke", "#015483")
                .style("stroke-width", "0.5");

            tooltip.style("visibility", "hidden");
        });
}

function tooltipChoice(data, revert) {

    d3.selectAll("#circle-choice")
        .on("click", function (d) {
            let classButton = this.getAttribute('class');
            if (revert == 1) revert = 0;
            else revert = 1;

            if (revert == 1)
                d3.select(this)
                    .attr("width", ((gridSize / 2) - 10))
                    .attr("height", ((gridSize / 2) - 10))
                    .attr('stroke-width', 10)
                    .attr("stroke", "#e2e2e2");
            else
                d3.select(this)
                    .attr("width", ((gridSize / 2)))
                    .attr("height", ((gridSize / 2)))
                    .attr('stroke-width', 1)
                    ;

            if (classButton == 'oura')
                mainContainer_temperature_oura_sleep_summary(data, maingroup, legendgroup, titlegroup, revert);
            if (classButton == 'apple')
                mainContainer_HeartRate_Apple_Watch(data, maingroup, legendgroup, titlegroup, revert);
            if (classButton == 'fitbit')
                mainContainer_fitbit_summary_heartrate(data, maingroup, legendgroup, titlegroup, revert);
        })
}

/* Graphic Functions */
function createSvg(div1, widthdiv1, div2, heightdiv2, div3, heightdiv3) {
    maingroupapple = d3.select('#' + div1)
        .append("svg")
        .attr("class", "svg")
        .attr("width", widthdiv1) //(this.appledate.length + 1) * gridSize)
        .attr("height", heightdiv2)

    legendapple = d3.select('#' + div2)
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", heightdiv2)

    titleapple = d3.select('#' + div3)
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", heightdiv3) //margin.top)
}

function createSvgContainer(div1, widthdiv1, div2, heightdiv2, div3, heightdiv3) {
    maingroup = d3.select('#' + div1)
        .append("svg")
        .attr("class", "svg")
        .attr("width", widthdiv1) //(this.appledate.length + 1) * gridSize)
        .attr("height", heightdiv2)

    legendgroup = d3.select('#' + div2)
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", heightdiv2)

    titlegroup = d3.select('#' + div3)
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", heightdiv3) //margin.top)

    makeAchoice = d3.select('#wearable-choice')
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", heightdiv2) //margin.top)
}

function createChartePoint(maingroupapple, data, axe, id, color, size) {
    maingroupapple.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('id', id)
        .attr('class', function (d, i) { return "circle - " + i })
        .attr("cx", function (d, i) {
            return ((gridSize * 0.5)) + (i * gridSize);
        })
        .attr("cy", function (d) {
            var gap = {
                bottom: heightGraph - (margin.bottom * 1.25) - 5,
                top: (margin.top / 2.5) + 8,
                betweenTopAndBottom: axe[axe.length - 1] - axe[0],
                betweenValues: d - axe[0],
                test: ((heightGraph - margin.bottom * 1.25 - 5) - ((axe.length - 1) * ((heightGraph - margin.bottom * 1.25) / (axe.length)))),
                test2: ((heightGraph - margin.bottom * 1.25 - 5) - ((1) * ((heightGraph - margin.bottom * 1.25) / (axe.length)))),
            };
            var graphLenght = heightGraph - (margin.bottom * 1.25) - gap.top;

            if (d == 0)
                return ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom)));
            else if (d == "NO DATA" || d == "-" || d == "" || d == undefined) return (heightGraph)
            else
                return ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom)));
        })
        .attr("r", size)//gridSize / 10)
        .attr("fill", function (d) {
            if (d == 0)
                return color;
            if (d == "NO DATA" || d == "-" || d == "" || d == undefined) return 'white'
            else return color;//"#67FFFF"
        })
        .style("stroke", function (d) {
            if (d == 0)
                return "#015483"
            else if (d == "NO DATA" || d == "-" || d == "" || d == undefined) return 'white'
            else
                return "#015483"
        })
        .style("stroke-width", "0.5");

    maingroupapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 100 + "%")
        .attr("y1", margin.top / 2)
        .attr("x2", 100 + "%")
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "1");
}

function createTitle(titleapple, title, id) {
    titleapple.append("text")
        .attr('id', id)
        .attr("x", 50 + "%")
        .attr("y", 50 + "%")
        .attr("text-anchor", "middle")
        .style("fill", "#212529")
        .style("font-weight", "300")
        .style("font-size", 1.4 + "rem")
        .attr("class", "mg-chart-title")
        .text(title);
}

function createLegendAxeY(legendapple, heartrateAxis, title, id) {
    legendapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 100 + "%")
        .attr("y1", (margin.top / 2.5))
        .attr("x2", 100 + "%")
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "1");

    if (heartrateAxis != 'null')
        legendapple.selectAll(".daysLabel")
            .data(heartrateAxis)
            .enter().append("text")
            .attr('id', id)
            .text(function (d) { return d; })
            .style("fill", "#212529")
            .attr("x", 95 + "%")
            .attr("y", function (d, i) {
                if (this.min < 0)
                    return (heightGraph - margin.bottom * 1.25) - (i * 4 * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length * 4)))
                else
                    return (heightGraph - margin.bottom * 1.25) - (i * 4 * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length * 4)))
            })
            .style("text-anchor", "end")
            .attr("font-size", 0.7 + "rem");

    legendapple.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr('id', id)
        .attr("transform", "rotate(-90)")
        .style("fill", "#212529")
        .attr("x", -(heightGraph - margin.bottom) / 2)
        .attr("y", 25 + "%")
        .style("text-anchor", "middle")
        .style("font-weight", "300")
        .attr("font-size", 0.7 + "rem")
        .text(title);

    if (heartrateAxis != 'null')
        legendapple.selectAll(".tickSize")
            .data(heartrateAxis)
            .enter().append("line")
            .attr('id', id)
            .attr("x1", 95 + "%")
            .attr("y1", function (d, i) { return (heightGraph - margin.bottom * 1.25 - 5) - (i * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length))) })
            .attr("x2", 100 + "%")
            .attr("y2", function (d, i) { return (heightGraph - margin.bottom * 1.25 - 5) - (i * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length))) })
            .style("stroke", "#212529")
            .style("stroke-width", "0.5");


}

function createLegendAxeX(legendapple, axisdays) {

    legendapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 0)
        .attr("y1", heightGraph - margin.bottom)
        .attr("x2", 100 + "%")
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "0.5");

    legendapple.selectAll(".daysLabel")
        .data(axisdays)
        .enter().append("text")
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d, i) { return gridSize * 1 + (i * gridSize * 7) })
        .attr("y", heightGraph - (margin.bottom / 2))
        .style("text-anchor", "end")
        .attr("font-size", 0.7 + "rem");

    legendapple.selectAll(".tickSize")
        .data(axisdays)
        .enter().append("line")
        .attr("x1", function (d, i) { return gridSize * 1 + ((i * gridSize * 7) - (gridSize / 2)) })
        .attr("y1", heightGraph - margin.bottom)
        .attr("x2", function (d, i) { return gridSize * 1 + ((i * gridSize * 7) - (gridSize / 2)) })
        .attr("y2", heightGraph - (margin.bottom / 1.25))
        .style("stroke", "#212529")
        .style("stroke-width", "0.5");
}

function showreportedSickIncident(svgName, coord) {
    coordX = coord.split('/');
    let x = ((gridSize * 0.5)) + coordX[0] * gridSize;
    let y = (margin.top / 2);
    if (coordX[1] == 0) {
        text = "Reported sick incident";
    } else {
        text = "";
    }

    svgName.append("g")
        .append("text")
        .attr("transform", "rotate(0)")
        .style("fill", "#212529")
        .attr("x", x)
        .attr("y", y)
        .style("text-anchor", "middle")
        .style("fill", "#A7AAAA")
        .style("font-weight", "300")
        .attr("font-size", 0.7 + "rem")
        .text(text);

    svgName.append("line")
        .attr("x1", ((gridSize * 0.5) + coordX[0] * gridSize))
        .attr("y1", margin.top / 2)
        .attr("x2", ((gridSize * 0.5) + coordX[0] * gridSize))
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#A7AAAA")
        .style("stroke-dasharray", 5)
        .style("stroke-width", "1");
}

function controlWearableDatafromfile(data, type) {
    switch (type) {
        case 'fitbit':
            if (data.fitbit_summary == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.fitbit_summary.length; i++) {
                if (data.fitbit_summary[i].data.heart_rate != "" && data.fitbit_summary[i].data.heart_rate != '-')
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'apple':
            if (data.apple_health_summary == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.apple_health_summary.length; i++) {
                if (data.apple_health_summary[i].data.heart_rate != "" && data.apple_health_summary[i].data.heart_rate != "-")
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'oura':
            if (data.oura_sleep_summary == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.oura_sleep_summary.length; i++) {
                if (data.apple_health_summary[i].data.temperature_delta != "" && data.apple_health_summary[i].data.temperature_delta != "-")
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
    }
}

function createButtonAddTo(svgName, data) {
    let classname = [];
    let colorscale = [];
    let legendname = [];
    let cnt = 0;
    fitbit = controlWearableDatafromfile(data, 'fitbit');
    oura = controlWearableDatafromfile(data,'oura');
    apple = controlWearableDatafromfile(data, 'apple');

    if (oura == true) {
        classname[cnt] = 'oura';
        colorscale[cnt] = '#9BFF1C';
        legendname[cnt] = "Temperature [Oura]";
        cnt++;
    }

    if (apple == true) {
        classname[cnt] = 'apple';
        colorscale[cnt] = '#0041EA';
        legendname[cnt] = 'Heart rate [Apple]';
        cnt++;
    }

    if (fitbit== true) {
        classname[cnt] = 'fitbit';
        colorscale[cnt] = "#FF8484";
        legendname[cnt] = 'Heart rate [Fitbit]';
        cnt++;
    }

    if (fitbit == false && apple == false && oura == false)
        d3.select('#wearable-container').remove();

    console.log('oura: ' + oura);
    console.log('apple: ' + apple);
    console.log('fitbit: ' + fitbit);
    svgName.selectAll('circle-choice')
        .data(classname)
        .enter()
        .append("circle")
        .attr('id', 'circle-choice')
        .attr('class', function (d, i) { return classname[i] })
        .attr("cx", margin.bottom * 2)
        .attr("cy", function (d, i) {
            return margin.top + (i * gridSize * 2)
        })
        .attr("r", gridSize / 2)
        .attr("stroke", "#e2e2e2")
        .style("fill", function (d, i) {
            return colorscale[i]
        });

    svgName.selectAll(".daysLabel")
        .data(legendname)
        .enter().append("text")
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", margin.bottom * 2 + gridSize)
        .attr("y", function (d, i) { return margin.top + (i * gridSize * 2) })
        .style("text-anchor", "start")
        .style("font-weight", "300")
        .attr("font-size", 0.7 + "rem");

}
/* */
function compareDateReport(appledayAxis) {
    let compteday = 0;
    var dayinmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    datereport = completedDays[0].split('/');
    date = appledayAxis[0].split('/');

    for (let i = date[1]; i < datereport[1]; i++) {
        compteday += dayinmonth[i];
    }
    return compteday += (datereport[0] - date[0]);
}

function finrepeatday(appleday, appledate, repeat) {
    /* On vérifie que les jours sont pas en double */
    data1 = appleday;
    var cnt = 0;
    var cnt2 = 0;
    for (let i = 0; i < appleday.length - 1; i++) {
        let calcul = data1[i + 1].split('/')[0] - data1[i].split('/')[0];
        if (calcul == 0) {
            repeat[cnt] = (i);
            cnt++;
        } else {
            appledate[cnt2] = appleday[i];
            cnt2++;
        }
    }
    appledate.push(data1[appleday.length - 1]);
    /* Permet de retrouver les doublons dans les valeurs de l'apple watch */
    repeat.sort(compare);
}

function formatdateshow(data, id) {
    let months = ["Jan", "Fev", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < months.length; i++) {
        if (i <= 9 && "0" + i == data.split('/')[1])
            return months[i - 1] + " " + data.split('/')[0] + ", 2020" //+ appleyear[id];
        else if (i > 9 && i == data.split('/')[1])
            return months[i - 1] + " " + data.split('/')[0] + ", 2020" //+ appleyear[id];
    }
}

/* Deal with the scroll */

function syncronizationScrollReportApple(comparedateApple) {
    var winScroll = document.getElementById("heartrate-apple").scrollLeft;
    document.getElementById("heatmap").scroll((winScroll - comparedateApple), 0);
}

function syncronizationScrollReportOura(comparedateApple) {
    var winScroll = document.getElementById("temperature-oura_sleep_summary").scrollLeft;
    document.getElementById("heatmap").scroll((winScroll - comparedateApple), 0);
}

function syncronizationScrollReportFitbit(comparedateApple) {
    var winScroll = document.getElementById("heart-rate-fitbit").scrollLeft;
    document.getElementById("heatmap").scroll((winScroll - comparedateApple), 0);
}

function dayControlGraph(data, days2, month) {
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

function dataControl(data, tempdate, day, monthtemp, rapport) {
    dayscontrol = dayControlGraph(tempdate, day, monthtemp);
    const data2 = [];
    var cnt = 0;

    if (rapport < 0) {
        let count = -rapport;
        for (let i = 0; i < count; i++) {
            data2[i] = "";
        }
        for (var i = count; i < dayscontrol.length + count; i++) {
            data2[i + cnt] = data[i];
            // console.log(data);
            if (dayscontrol[i] != -1 && dayscontrol[i] != -30 && dayscontrol[i] != -31) {
                for (var t = 0; t < dayscontrol[i]; t++) {
                    cnt++;
                    data2[i + cnt] = "NO DATA";
                }
            }
            else if (dayscontrol[i] == -1) {
                cnt--;
            }
        }

    } else {
        for (var i = 0; i < dayscontrol.length; i++) {
            data2[i + cnt] = data[i];
            // console.log(data);
            if (dayscontrol[i] != -1 && dayscontrol[i] != -30 && dayscontrol[i] != -31) {
                for (var t = 0; t < dayscontrol[i]; t++) {
                    cnt++;
                    data2[i + cnt] = "NO DATA";
                }
            }
            else if (dayscontrol[i] == -1) {
                cnt--;
            }
        }
    }
    return data2;
}

function addorRemoveday(date, days, data) {
    var length = data.symptom_report.length - 1;
    test = formatdate(parseTime(data.symptom_report[length].timestamp));

    datedif = test.split('/')[0] - date[date.length - 1].split('/')[0];
    var cnt = datedif;
    var newListeDate = [];
    if (datedif < 0) {
        for (let i = 0; i < date.length + datedif; i++) {
            newListeDate[i] = date[i];
        }
    } else {
        for (let i = 0; i < date.length; i++) {
            newListeDate[i] = date[i];
        }
        for (let i = (date.length); i < ((date.length) + datedif); i++) {
            newListeDate.push(formatdate(parseTime(data.symptom_report[length - cnt + 1].timestamp)));
            cnt--;
        }
    }
    return newListeDate;
}

function completedLastDay(rapport, date) {
    var cnt = 0;
    let newdate = [];
    if (rapport < 0) {
        cnt = - rapport;
        for (let i = 0; i < cnt; i++) {
            newdate[i] = completedDays[i]
        }
    } else
        cnt = 0;
    for (let i = cnt; i < date.length + cnt; i++) {
        newdate[i] = date[i - cnt]
    }

    return newdate;
}

function getAxisLegend(symptomdata, dizaine) {
    var min = 200;
    var max = 0;
    var legende = [];
    for (let i = 0; i < symptomdata.length; i++) {
        if (symptomdata[i] < min && symptomdata[i] != '-' && symptomdata[i] != '')
            min = symptomdata[i];
        if (symptomdata[i] > max && symptomdata[i] != '-' && symptomdata[i] != '')
            max = symptomdata[i];
    }
    if (min == 200 && max == 0) {
        min = 0;
        max = 0;
    } else if (min != 200 && max != 0 && dizaine == 'dizaine') {
        min = (10 * Math.floor(min / 10));
        max = (10 * Math.floor(max / 10) + 10);
        var test = ((max - min) / 5);
        for (let i = 0; i < test + 1; i++) {
            legende[i] = min + (5 * i);
        }
    }
    else if (min != 200 && max != 0 && dizaine == 'decimal') {
        min = (Math.floor(10 * min) / 10);
        max = (Math.floor(10 * max) / 10) + (1 / 10);

        if (this.min < 0)
            var test = ((max + min) / 0.25);
        else
            var test = ((max - min) / 0.25);
        for (let i = 0; i < test + 1; i++) {
            legende[i] = precise(min + (0.25 * i));
        }
    }
    return legende;
}

function precise(x) {
    return Number.parseFloat(x).toPrecision(2);
}

parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f%Z");
parseTimeTemp = d3.timeParse("%Y-%m-%d");
formatyear = d3.timeFormat("%y");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");