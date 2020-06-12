getWearableData();

comparedateApple = 0;
comparedate = 0;
comparedate_fitbit = 0;
finaldataAppleWatch = [];
finaldataOuraTemperature = [];
finaldata_fitbit = [];

function getWearableData() {
    $.getJSON(url, function (data) {
        timestamp3 = data.symptom_report.map(d => d.timestamp);
        file_days3 =  data.symptom_report.map(d => formatdate(parseTime(d.timestamp)));
        days23 = timestamp3.map(d => formatdateday(parseTime(d)))
        month3 = timestamp3.map(d => formatdatemonth(parseTime(d)))
        days3 = controlDay(file_days3, days23, month3);
        days_axis3 = showingDayOnTheMap(days3);

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

/* Main fonction of wearable data */
function main_fitbit_summary_heartrate(data) {
    heightGraph = determineHeigth() / 2;
    fitbitAxis = ["50", "60", "70", "80", "90", "100", "110", "120"];
    fitbitdata = [], fitbitdate = [], fitbitday = [], fitbitmonth = [], fitbityear = [];
    symptomData_fitbit = [];

    getHeartRateDatafromFitbit(data);

    /* Find the day */
    controlday_fitbit = controlDay(fitbitday, fitbitday, fitbitmonth);
    noMissingDay_fitbit = addorRemoveday(controlday_fitbit, days3);
    dayAxis_fitbit = getDayonAxis(noMissingDay_fitbit);
    monthOnAxis_fitbit = determinenamemonth(noMissingDay_fitbit);

    /* Udpate the data with the missing day / repeat day */
    finaldata_fitbit = dataControl(fitbitdata, fitbitday, fitbitday, fitbitmonth);

    /* Get the difference between the day */
    comparedate_fitbit = compareDateReport(dayAxis_fitbit);
    symptomData_fitbit = getSymptomDatafromFile(comparedate_fitbit);

    /* Graphic element */
    createSvg('heart-rate-fitbit', (noMissingDay_fitbit.length * gridSize), 'fitbit-legend', (heightGraph), 'fitbit-title', (margin.top));
    createChartePoint(maingroupapple, finaldata_fitbit, fitbitAxis, "circle-fitbit")
    getreportedSickIncident(maingroupapple, symptomData_fitbit)
    createTitle(titleapple, "Heart Rate evolution");
    createLegendAxeY(legendapple, fitbitAxis, "HEART RATE [BMP]");
    createLegendAxeX(maingroupapple, dayAxis_fitbit);
    showMonthsAxis(maingroupapple, monthOnAxis_fitbit, (heightGraph - 5));

    /* Display the data when mouse on it */
    tooltip("circle-fitbit", noMissingDay_fitbit, "bmp");

    document.getElementById("heart-rate-fitbit").scroll(((comparedate_fitbit) * gridSize), 0);

    document.getElementById("heart-rate-fitbit").onscroll = function () {
        syncronizationScrollReportFitbit(((comparedate_fitbit) * gridSize));
    }
}

function mainTemperature_oura_sleep_summary(data) {
    tempAxis = ["-1", "-0.5", "0", "0.5", "1", "1.5", "2", "2.5"];
    tempdata = [], tempday = [], tempyear = [], tempdayAxis = [], tempdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthtemp = [];
    heightGraph = determineHeigth() / 2;
    let symptomData = [];

    /* Recupérer les données dans le fichier*/
    getTemperatureDatafromFile(data);
    finrepeatday(tempday, tempdate, repeat);
    repeatdata(tempday, tempdata, noRepeatData);

    /*Find the day */
    controldayTemp = controlDay(tempday, day, monthtemp);
    noMissingDayTemp = addorRemoveday(controldayTemp, days3);
    tempdayAxis = getDayonAxis(noMissingDayTemp);
    month = determinenamemonth(noMissingDayTemp);

    finaldataOuraTemperature = dataControl(tempdata, tempday, day, monthtemp);
    //let comparedate = 0;
    comparedate = compareDateReport(tempdayAxis);
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(comparedate);

    /* Element graphique */
    createSvg('temperature-oura_sleep_summary', ((this.noMissingDayTemp.length) * gridSize), 'oura_sleep_summary-legend', (heightGraph), 'oura_sleep_summary-title', (margin.top));
    createChartePoint(maingroupapple, finaldataOuraTemperature, tempAxis, "circle-temperature")
    getreportedSickIncident(maingroupapple, symptomData)
    createTitle(titleapple, "Temperature evolution");
    createLegendAxeY(legendapple, tempAxis, "BODY TEMPERATURE");
    createLegendAxeX(maingroupapple, tempdayAxis);
    showMonthsAxis(maingroupapple, month, (heightGraph - 5));

    /* Afficher les données */
    tooltip("circle-temperature", noMissingDayTemp, "");

    document.getElementById("temperature-oura_sleep_summary").scroll(((comparedate) * gridSize), 0);

    document.getElementById("temperature-oura_sleep_summary").onscroll = function () {
        syncronizationScrollReportOura(((comparedate) * gridSize));
    }
}

function mainAppleWatch(data) {
    heartrateAxis = ["50", "60", "70", "80", "90", "100", "110", "120"];
    dayapp = [], monthapp = [], appledata = [], appleday = [], appleyear = [], symptomData = [];
    cnt = 0, appledate = [], repeat = [], noRepeatDataApple = [];
    heightGraph = determineHeigth() / 2;

    /* Recupérer les données dans le fichier*/
    getAppleDatafromFile(data);
   // finrepeatday(appleday.reverse(), appledate, repeat);
   // repeatdata(appleday.reverse(), appledata, noRepeatDataApple);
    //console.log(dayapp);
    
    /*Find the day */
    controlday = controlDay(appleday, dayapp, monthapp);
    noMissingDay = addorRemoveday(controlday, days3);
    appledayAxis = getDayonAxis(noMissingDay);
    applemonth = determinenamemonth(noMissingDay);
    
    finaldataAppleWatch = dataControl(appledata, appleday, dayapp, monthapp);
    //let comparedateApple = 0;
    comparedateApple = compareDateReport(appledayAxis);

    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(comparedateApple);

    /* Element graphique */
    createSvg('heartrate-apple', ((this.noMissingDay.length) * gridSize), 'apple-legend', (heightGraph), 'apple-title', (margin.top));
    createChartePoint(maingroupapple, finaldataAppleWatch.reverse(), heartrateAxis, "circle-apple-watch")
    getreportedSickIncident(maingroupapple, symptomData)
    createTitle(titleapple, "Heart rate evolution");
    createLegendAxeY(legendapple, heartrateAxis, "HEART RATE [BPM]");
    createLegendAxeX(maingroupapple, axisdays);

    showMonthsAxis(maingroupapple, applemonth, (heightGraph - 5));

    /* Afficher les données */
    tooltip("circle-apple-watch", noMissingDay, "bmp");
    /* Controler le scroll  */
    document.getElementById("heartrate-apple").scroll(((comparedateApple) * gridSize), 0);

    document.getElementById("heartrate-apple").onscroll = function () {
        syncronizationScrollReportApple(((comparedateApple) * gridSize));
    }
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
    console.log(symptom_data);
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
        if (cal[i] == (cal[i - 1] + 1) || cal[i] == (cal[i - 1] + 1) + '/1')  {
           
            if (cal[i] == (cal[i + 1] - 1)) {
            cal[i+1] += '/1';
            }
            
            if (cal[i] == (cal[i + 2] - 2)) {
                cal[i+2] += '/1';
            }

            if (cal[i] == (cal[i + 3] - 3)) {
                cal[i+3] += '/1';
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

function createChartePoint(maingroupapple, data, axe, id) {
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
            if (d == "NO DATA" || d == "-") return (heightGraph - margin.bottom)
            else
                return (heightGraph - margin.bottom) - ((d - axe[0]) * ((heightGraph - margin.bottom - 1) / (axe[axe.length - 1] - axe[0] + 1)));
        })
        .attr("r", gridSize / 10)
        .attr("fill", function (d) {
            if (d == "NO DATA" || d == "-") return '#EAEDED'
            else return "#67FFFF"
        })
        .style("stroke", "#015483")
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

function createTitle(titleapple, title) {
    titleapple.append("text")
        .attr("x", 50 + "%")
        .attr("y", 50 + "%")
        .attr("text-anchor", "middle")
        .style("fill", "#212529")
        .style("font-weight", "300")
        .style("font-size", 1.4 + "rem")
        .attr("class", "mg-chart-title")
        .text(title);
}

function createLegendAxeY(legendapple, heartrateAxis, title) {
    legendapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 100 + "%")
        .attr("y1", margin.top / 2.5)
        .attr("x2", 100 + "%")
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "1");

    legendapple.selectAll(".daysLabel")
        .data(heartrateAxis)
        .enter().append("text")
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", 95 + "%")
        .attr("y", function (d, i) { return (heightGraph - margin.bottom - 1) - (i * ((heightGraph - margin.bottom) / (heartrateAxis.length))) })
        .style("text-anchor", "end")
        .attr("font-size", 0.7 + "rem");

    legendapple.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .style("fill", "#212529")
        .attr("x", -(heightGraph - margin.bottom) / 2)
        .attr("y", 5 + "%")
        .style("text-anchor", "middle")
        .style("font-weight", "300")
        .attr("font-size", 0.7 + "rem")
        .text(title);

    legendapple.selectAll(".tickSize")
        .data(heartrateAxis)
        .enter().append("line")
        .attr("x1", 95 + "%")
        .attr("y1", function (d, i) { return (heightGraph - margin.bottom - 5) - (i * ((heightGraph - margin.bottom) / 8)) })
        .attr("x2", 100 + "%")
        .attr("y2", function (d, i) { return (heightGraph - margin.bottom - 5) - (i * ((heightGraph - margin.bottom) / 8)) })
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

function compareDateReport(appledayAxis) {
    let compteday = 0;
    var dayinmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    datereport = days_axis3[0].split('/');
    date = appledayAxis[0].split('/');;

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
    /* var cnt = 0; 
     for (let i = 0; i < days.length; i++) {
         if (data2[i+ comparedateApple] != days[i])
             data2[i+ comparedateApple + cnt] = days[i]
     }
     console.log(data2.reverse());
     console.log(repeat);
   */
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

function dataControl(data, tempdate, day, monthtemp) {
    dayscontrol = dayControlGraph(tempdate, day, monthtemp);
    const data2 = [];
    var cnt = 0;
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
    return data2;
}

function addorRemoveday(date, days) {
    
    datedif = days[days.length - 1].split('/')[0] - date[date.length - 1].split('/')[0];
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
            newListeDate.push(days[(days.length - cnt)]);
            cnt--;
        }
    }
    return newListeDate;
}

parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f%Z");
parseTimeTemp = d3.timeParse("%Y-%m-%d");
formatyear = d3.timeFormat("%y");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");