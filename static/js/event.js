/**
 * @author Basile Morane
 * @description event.js (javascript). Juillet 2020
 * @fileOverview This file is useful for displaying on screen the graphics of a sick incident
 */

/** @type {number} */
gridSize = 29;
/** @type {number} */
heightGraph = 14 * gridSize;
/** @type {number} */
margin = {top: 2,right: -2,bottom: 27,left: 2};
creategraphics(url);
/**
 * @description	Acces to the JSON file 
 * @param { String } url of the JSON file
 */
function creategraphics(url) {
    $.getJSON(url, function (data) {
        main(data);
    })
}
/**
 * @description	Allows you to know which graph will be displayed first 
 * @description	order - (heart rate - temperature - respiration rate)
 */
function setrevert () {
    if (apple == true) {
        revert[1] = 1;
        maxHr++;
    }
    if (fitbit == true) {
        revert[2] = 1;
        maxHr++;
    }
    if (ouraHR == true) {
        revert[3] = 1;
        maxHr++;
    }
    if (google == true) {
        revert[5] = 1;
        maxHr++;
    }
    if (garmin == true) {
        revert[4] = 1;
        maxHr++;
    }
    if (oura == true && apple == false && fitbit == false && ouraHR == false && google == false && garmin == false) {
        revert[0] = 1; 
    }
    if (ourares == true && apple == false && fitbit == false && ouraHR == false && google == false && garmin == false && oura == false) {
        revert[6] = 1; 
    }
}
/**
 * @description	main function which allows you to display the graphics corresponding to the existing data. 
 * @param { Array } data of the JSON file
 */
function main(data) {
    fitbit = controlWearableDatafromfile(data, 'fitbit');
    apple = controlWearableDatafromfile(data, 'apple');
    oura = controlWearableDatafromfile(data, 'oura');
    ouraHR = controlWearableDatafromfile(data, 'ouraHR');
    garmin = controlWearableDatafromfile(data, 'garmin');
    google = controlWearableDatafromfile(data, 'google');
    ourares = controlWearableDatafromfile(data, 'ourares');
    fitbitintraday = false;//controlWearableDatafromfile(data, 'fitbitintraday');
    maxHr = 0; axiscombined = []; propcombined = []; revert = [0, 0, 0, 0, 0, 0, 0, 0];
    databasename = getDataSourceonDay(data);
    databasenameFirstdayname = getFirstDataSourceonDay(data);
    databasenameLastdayname = getLastDataSourceonDay(data);
    numberdaysongraph = getnumberday(data, databasenameFirstdayname, databasenameLastdayname);
    setrevert ();
    cntbttHr = maxHr;
    if (fitbit == true || apple == true || oura == true || ouraHR == true || garmin == true || google == true || ourares == true || fitbitintraday == true) {
        createWearableDataSvg('wearable-graph', ((numberdaysongraph + 1) * gridSize), 'wearable-legend', (heightGraph), 'wearable-title', heightGraph / 4, 'wearable-choice');
        getButtonChoice(makeAchoice);
        tooltipChoice(data);
    }
}
/**
 * @function sickness_event
 * @description	function to get the difference of days between the first and the sick incident day
 * @param { Array } data of the JSON file
 * @param { String} datecompare - date of the sick incident 
 * @return { incident } number of day between the first day and the date of the sick incident 
 */
function sickness_event(data, datecompare) {
    var date_incidentInfile = data.sickness_event[0].timestamp.split('-');
    var date_incident = date_incidentInfile[2] + '/' + date_incidentInfile[1];
    var incident = 0;
    for (let i = 0; i < datecompare.length; i++) {
        if (datecompare[i] == date_incident)
            incident = i;
    }
    return incident;
}
/**
 * @function tooltipChoice
 * @description	function to control the display of the graphics with an inteface of multiple buttons (click / double click)
 * @param { Array } data of the JSON file
 */
function tooltipChoice(data) {
    click = 1;
    loadGroupDataSource(data);
    selectedGroupButton();
    axiscombined = getCombineAxisY(revert);
    propcombined = getSum(revert);
    graphicsGroup();
    d3.selectAll("#circle-choice-heartrate")
        .on("click", function (d) {
            classButton = this.getAttribute('class');
            controlGestionclick();
            axiscombined = getCombineAxisY(revert);
            propcombined = getSum(revert);
            graphicsGroup();
            selectedGroupButton();
        })
    d3.selectAll("#circle-choice-heartrate").on("dblclick", function (d) {
        classButton = this.getAttribute('class');
        controlGestiondbclick();
        axiscombined = getCombineAxisY(revert);
        propcombined = getSum(revert);
        graphicsGroup();
        selectedGroupButton();
    })
}
/**
* @function graphicsGroup
* @description	function to group and display all the differente data source
* @description	Control display of the X-axis / Y-axis / Title graphics
*/
function graphicsGroup() {
    if (revert[1] == 1 || revert[2] == 1 || revert[3] == 1 || revert[4] == 1 || revert[5] == 1 || revert[7] == 1) {
        d3.select('#heart-rate-title-ctn').remove();
        d3.selectAll('#heart-rate-axisY-cnt').remove();
        d3.selectAll('#heart-rate-axisX-cnt').remove();
        createTitle(titlegroup, "Heart rate evolution", 'heart-rate-title-ctn', '50%');
        createLegendAxeY(legendgroup, axiscombined, "HEART RATE [BPM]", 'heart-rate-axisY-cnt');
        loadAxisX(databasename);
    }
    else if (revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0 && revert[7] == 0) {
        d3.select('#heart-rate-title-ctn').remove();
        d3.selectAll('#heart-rate-axisY-cnt').remove();
        d3.selectAll('#heart-rate-axisX-cnt').remove();
    }
    mainContainerFitbitdata(axiscombined, maingroup, legendgroup, titlegroup, revert, "");
    mainContainerOuraTempdata("", maingroup, legendgroup, titlegroup, revert, "");
    mainContainer_heart_rate_oura_sleep(axiscombined, maingroup, legendgroup, titlegroup, revert, "");
    mainContainer_RespiratoryRate_oura("", maingroup, legendgroup, titlegroup, revert, "");
    mainContainerAppleWatchdata(axiscombined, maingroup, legendgroup, titlegroup, revert, "");
    mainContainer_heart_rate_google_fit(axiscombined, maingroup, legendgroup, titlegroup, revert, "");
    mainContainer_garmin_heartrate(axiscombined, maingroup, legendgroup, titlegroup, revert, "");
}

/**
 * @function loadGroupDataSource
 * @description	function to load all the data from the data source existing in the file JSON and put it in local variable
 * @param { Array } data of the JSON file
 */
function loadGroupDataSource(data) {
    if (fitbit == true) {
        loadDataFromFitbitSummary(data);
    }
    if (oura == true) {
        loadDataFromOura_Temperature(data);
    }
    if (ourares == true) {
        loadDataFromOura_RespiratoryRate(data);
    }
    if (ouraHR == true) {
        loadDatafromOura(data);
    }
    if (apple == true) {
        loadDatafromAppleWatch(data);
    }
    if (google == true)
        loadDatafromGoogle(data);

    if (garmin == true)
        loadDatafromGarmin(data);
}

/**
 * @function loadAxisX
 * @description	Display the axis X on screen of the data source with the more day in its reports
 * @param { String } databasename - the name of the data source with the more day in its reports
 */
function loadAxisX(databasename) {
    if (databasename == 'fitbit')
        createLegendAxeX(maingroup, formatdateshow2(dayAxis_fitbit, ""), '20' + fitbityear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'apple')
        createLegendAxeX(maingroup, formatdateshow2(appledayAxis, ""), '20' + appleyear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'ouraHR')
        createLegendAxeX(maingroup, formatdateshow2(ouradayAxis, ""), '20' + ourayear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'garmin')
        createLegendAxeX(maingroup, formatdateshow2(dayAxis_garmin, ""), '20' + garminyear[0], "heart-rate-axisX-cnt");
    else if (databasename == 'google')
        createLegendAxeX(maingroup, formatdateshow2(googledayAxis, ""), '20' + googleyear[0], "heart-rate-axisX-cnt");
}
/** 
 * @description	Group and control button choice of displaying graphics
 * @function selectedCategories
 * @function selectedButton
 */
function selectedGroupButton() {
    selectedCategories('Temperature', revert[0], 6, 1);
    selectedCategories('RespiratoryRate', revert[6], 6, 1);
    selectedCategories('HeartRate', cntbttHr, 6, maxHr);
    selectedButton('oura', revert[0], 4);
    selectedButton('apple', revert[1], 4);
    selectedButton('fitbit', revert[2], 4);
    selectedButton('ouraHR', revert[3], 4);
    selectedButton('garmin', revert[4], 4);
    selectedButton('google', revert[5], 4);
    selectedButton('ourares', revert[6], 4);
    selectedButton('fitbiintraday', revert[7], 4);
}
/**
 * @description Select or deselect the button we click on it by changing the stroke of the button
 * @param { String } classname - class name of the button 
 * @param { Array } revert - array controling the gestion of the mouse click
 * @param { int } stroke - width stroke of the button selected
 */
function selectedButton(classname, revert, stroke) {
    switch (revert) {
        case 0:
            d3.select('.' + classname).attr("width", ((gridSize / 2))).attr("height", ((gridSize / 2))).attr('stroke-width', 1);
            break;
        case 1:
            d3.select('.' + classname).attr("width", ((gridSize / 2) - stroke)).attr("height", ((gridSize / 2) - stroke)).attr('stroke-width', stroke).attr("stroke", "#e2e2e2");
            break;
    }
}
/**
 * @description Select or deselect the categories button which we click on
 * @description or if we select or deselect all the button depending on it
 * @param { String } classname - class name of the button 
 * @param { Array } revert - array controling the gestion of the mouse click
 * @param { int } stroke - width stroke of the button selected
 * * @param { int } max - max number of button depending of this categories buttons
 */
function selectedCategories(classname, revert, stroke, max) {
    if (revert < max)
        d3.select('.' + classname).attr("width", ((gridSize / 2))).attr("height", ((gridSize / 2))).attr('stroke-width', 1);

    if (revert == max)
        d3.select('.' + classname).attr("width", ((gridSize / 2) - stroke)).attr("height", ((gridSize / 2) - stroke)).attr('stroke-width', stroke).attr("stroke", "#e2e2e2");
}
/**
 * @description function to control the gestion of mouse click on the button choice
 * @description changes the values of the variable revert
 */
function controlGestionclick() {
    if ((classButton == 'oura' || classButton == 'Temperature') && revert[0] == 1) {
        revert[0] = 0;
        cntbttHr = 0;
        click = 0;
    }
    else if ((classButton == 'oura' || classButton == 'Temperature') && revert[0] == 0) {
        revert = [1, 0, 0, 0, 0, 0, 0, 0];
        cntbttHr = 0;
        click = 0;
    }
    if ((classButton == 'ourares' || classButton == 'RespiratoryRate') && revert[6] == 1) {
        revert[6] = 0;
        cntbttHr = 0;
        click = 0;
    }
    else if ((classButton == 'ourares' || classButton == 'RespiratoryRate') && revert[6] == 0) {
        revert = [0, 0, 0, 0, 0, 0, 1, 0];
        cntbttHr = 0;
        click = 0;
    }
    if (classButton == 'apple' && revert[1] == 1) {
        revert[1] = 0;
        cntbttHr--;
        click = 0;
    }
    else if (classButton == 'apple' && revert[1] == 0) {
        revert[0] = 0;
        revert[6] = 0;
        revert[1] = 1;
        cntbttHr++;
        if (cntbttHr == maxHr)
            click = 1;
        else
            click = 0;
    }
    if (classButton == 'fitbit' && revert[2] == 1) {
        revert[2] = 0;
        cntbttHr--;
        click = 0;
    }
    else if (classButton == 'fitbit' && revert[2] == 0) {
        revert[0] = 0;
        revert[6] = 0;
        revert[2] = 1;
        cntbttHr++;
        if (cntbttHr == maxHr)
            click = 1;
        else
            click = 0;
    }
    if (classButton == 'ouraHR' && revert[3] == 1) {
        revert[3] = 0;
        cntbttHr--;
        click = 0;
    }
    else if (classButton == 'ouraHR' && revert[3] == 0) {
        revert[0] = 0;
        revert[6] = 0;
        revert[3] = 1;
        cntbttHr++;
        if (cntbttHr == maxHr)
            click = 1;
        else
            click = 0;
    }
    if (classButton == 'garmin' && revert[4] == 1) {
        revert[4] = 0;
        cntbttHr--;
        click = 0;
    }
    else if (classButton == 'garmin' && revert[4] == 0) {
        revert[0] = 0;
        revert[6] = 0;
        revert[4] = 1;
        cntbttHr++;
        if (cntbttHr == maxHr)
            click = 1;
        else
            click = 0;
    }
    if (classButton == 'google' && revert[5] == 1) {
        revert[5] = 0;
        cntbttHr--;
        click = 0;
    }
    else if (classButton == 'google' && revert[5] == 0) {
        revert[0] = 0;
        revert[6] = 0;
        revert[5] = 1;
        cntbttHr++;
        if (cntbttHr == maxHr)
            click = 1;
        else
            click = 0;
    }
    if (classButton == 'fitbiintraday' && revert[7] == 1) {
        revert[7] = 0;
        cntbttHr--;
        click = 0;
    }
    else if (classButton == 'fitbiintraday' && revert[7] == 0) {
        revert[0] = 0;
        revert[6] = 0;
        revert[7] = 1;
        cntbttHr++;
        if (cntbttHr == maxHr)
            click = 1;
        else
            click = 0;
    }

    if (classButton == 'HeartRate' && click == 1) {
        if (cntbttHr == maxHr) {
            revert = [0, 0, 0, 0, 0, 0, 0, 0];
            cntbttHr = 0;
        }
        click = 0;
    }
    else if (classButton == 'HeartRate' && click == 0) {
        revert[0] = 0;
        revert[6] = 0;
        if (apple == true) {
            revert[1] = 1;
            cntbttHr = maxHr;
        }
        if (fitbit == true) {
            revert[2] = 1;
            cntbttHr = maxHr;
        }
        if (ouraHR == true) {
            revert[3] = 1;
            cntbttHr = maxHr;
        }
        if (garmin == true) {
            revert[4] = 1;
            cntbttHr = maxHr;
        }
        if (google == true) {
            revert[5] = 1;
            cntbttHr = maxHr;
        }
        if (fitbitintraday == true) {
            revert[7] = 1;
            cntbttHr = maxHr;
        }
        click = 1;
    }
}
/**
 * @description function to control the gestion of mouse double click on the button choice
 * @description  put revert at 0 or put revert at 1
 */
function controlGestiondbclick() {

    if (classButton == 'apple') {
        revert = [0, 1, 0, 0, 0, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    }
    else if (classButton == 'oura') {
        revert = [1, 0, 0, 0, 0, 0, 0, 0];
        cntbttHr = 0;
        click = 0;
    } else if (classButton == 'fitbit') {
        revert = [0, 0, 1, 0, 0, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    } else if (classButton == 'ouraHR') {
        revert = [0, 0, 0, 1, 0, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    } else if (classButton == 'garmin') {
        revert = [0, 0, 0, 0, 1, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    } else if (classButton == 'google') {
        revert = [0, 0, 0, 0, 0, 1, 0, 0];
        cntbttHr = 1;
        click = 0;
    }
    else if (classButton == 'ourares') {
        revert = [0, 0, 0, 0, 0, 0, 1, 0];
        cntbttHr = 1;
        click = 0;
    }
}

/**
 * @description APPLE WATCH - Heart Rate 
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromAppleWatch
 * @function calculatSum
 * @function sickness_event
 */
function loadDatafromAppleWatch(data) {
    dayapp = [], monthapp = [], appledata = [], appleday = [], appleyear = [], symptomData = [];
    cnt = 0, appledate = [], repeat = [], noRepeatDataApple = [];
    controlDatafromAppleWatch(data);
    apple_sum = calculatSum(appledata);
    applereportedIncident = sickness_event(data, controlday);
}
/**
 * @description APPLE WATCH - Heart Rate 
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getAppleDatafromFile
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function getAxisLegend
 * @function addDayonGraphic
 */
function controlDatafromAppleWatch(data) {
    getAppleDatafromFile(data);
    controlday = controlDay(appleday, dayapp, monthapp);
    appledayAxis = getDayonAxis(controlday);
    finaldataAppleWatch = dataControl(appledata, appleday, dayapp, monthapp, 0);
    heartrateAxis = getAxisLegend(finaldataAppleWatch, 'dizaine');
    applecompare = addDayonGraphic(data, getDataSourceonDay(data), 'apple');
}
/**
 * @description APPLE WATCH - Heart Rate 
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
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
/**
 * @description APPLE WATCH - Heart Rate 
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 */
function mainContainerAppleWatchdata(dataAxis) {
    if (revert[1] == 1) {
        removeGroup('circle-apple-heart-rate-ctn', 'apple-heart-rate-title-ctn', 'apple-heart-rate-axisY-cnt', 'apple-sum', 'apple-heart-rate-axisX-cnt');
        createChartePoint(maingroup, finaldataAppleWatch, dataAxis, "circle-apple-heart-rate-ctn", "#66c2a5", (gridSize / 10), applecompare);
        tooltipdata("circle-apple-heart-rate-ctn", formatdateshow2(controlday, '20' + appleyear[0]), "bpm", "#66c2a5");
        createSumdata(maingroup, propcombined, dataAxis, 'apple-sum');
        showreportedSickIncident(maingroup, (applereportedIncident + applecompare) + '/0', "apple-incident");
    } else {
        removeGroup('circle-apple-heart-rate-ctn', 'apple-incident', 'apple-heart-rate-axisY-cnt', 'apple-sum', 'apple-heart-rate-axisX-cnt');
    }
}
/**
 * @description FITBIT - Heart Rate 
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromFitbit
  * @function calculatSum
 * @function sickness_event
 */
function loadDataFromFitbitSummary(data) {
    fitbitdata = [], fitbitdate = [], fitbitday = [], fitbitmonth = [], fitbityear = [];
    symptomData_fitbit = [];
    controlDatafromFitbit(data);
    fitbit_sum = calculatSum(fitbitdata);
    fitbitreportedIncident = sickness_event(data, newfitbitdate);
}
/**
 * @description FITBIT - Heart Rate 
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getFitbitSummaryFromFile
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function getAxisLegend
 * @function addDayonGraphic
 */
function controlDatafromFitbit(data) {
    getFitbitSummaryFromFile(data);
    newfitbitdate = controlDay(fitbitdate, fitbitday, fitbitmonth);
    dayAxis_fitbit = getDayonAxis(newfitbitdate);
    fitbitAxis = getAxisLegend(fitbitdata, 'dizaine');
    newdataFitbit = dataControl(fitbitdata, fitbitdate, fitbitday, fitbitmonth, 0);
    fitbitcompare = addDayonGraphic(data, getDataSourceonDay(data), 'fitbit');
}
/**
 * @description FITBIT - Heart Rate 
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
function getFitbitSummaryFromFile(data) {
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
/**
 * @description FITBIT - Heart Rate 
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 * @param {*} prob - non utilised variable 
 */
function mainContainerFitbitdata(dataAxis) {
    if (revert[2] == 1) {
        removeGroup('fitbit-heart-rate-axisY-cnt', 'circle-fitbit-heart-rate-ctn', 'fitbit-sum', 'fitbit-heart-rate-axisX-cnt', 'fitbit-heart-rate-title-ctn', "fitbit-incident");
        createChartePoint(maingroup, newdataFitbit, dataAxis, "circle-fitbit-heart-rate-ctn", "#fc8d62", (gridSize / 10), fitbitcompare);
        tooltipdata("circle-fitbit-heart-rate-ctn", formatdateshow2(newfitbitdate, '20' + fitbityear[0]), "bpm", "#fc8d62");
        createSumdata(maingroup, propcombined, dataAxis, 'fitbit-sum');
        showreportedSickIncident(maingroup, (fitbitreportedIncident + fitbitcompare) + '/0', "fitbit-incident");
    } else {
        removeGroup('fitbit-heart-rate-axisY-cnt', 'circle-fitbit-heart-rate-ctn', 'fitbit-sum', 'fitbit-heart-rate-axisX-cnt', 'fitbit-heart-rate-title-ctn', "fitbit-incident");
    }
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromOuraSleep
 * @function calculatSum
 * @function sickness_event
 */
function loadDatafromOura(data) {
    ouradata = [], ouraday = [], ourayear = [], ouradayAxis = [], ouradate = [], repeat = [], noRepeatData = [];
    ouraday = [];
    ouramonth = [];
    controlDatafromOuraSleep(data);
    ourasum = calculatSum(ouradata);
    ourareportedIncident = sickness_event(data, ouracontrolday);
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getHeartRatefromFileOura
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function getAxisLegend
 * @function addDayonGraphic
 */
function controlDatafromOuraSleep(data) {
    getHeartRatefromFileOura(data);
    ouracontrolday = controlDay(ouradate, ouraday, ouramonth);
    ouradayAxis = getDayonAxis(ouracontrolday);
    finaldataOura = dataControl(ouradata, ouradate, ouraday, ouramonth, 0);
    ouracompare = addDayonGraphic(data, getDataSourceonDay(data), "oura");
    ouraAxis = getAxisLegend(ouradata, 'dizaine');
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
function getHeartRatefromFileOura(data) {
    cnt = 0;

    this.file = data.oura_sleep_summary.map(d => d);
    this.file.forEach(element => {
        ouradata[cnt] = element.data.heart_rate;
        ouradate[cnt] = formatdate(parseTimeTemp(element.timestamp));
        ouraday[cnt] = formatdateday(parseTimeTemp(element.timestamp));
        ouramonth[cnt] = formatdatemonth(parseTimeTemp(element.timestamp));
        ourayear[cnt] = formatyear(parseTimeTemp(element.timestamp));

        cnt++;
    });
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 * @param {*} prob - non utilised variable 
 */
function mainContainer_heart_rate_oura_sleep(dataAxis, maingroup, legendgroup, titlegroup, revert, prob) {
    if (revert[3] == 1) {
        removeGroup('oura-intraday-incident', 'oura-heart-rate-axisX-cnt', 'oura-heart-rate-axisY-cnt', 'circle-oura-heart-rate-ctn', 'oura-sum');
        createChartePoint(maingroup, finaldataOura, dataAxis, "circle-oura-heart-rate-ctn", "#8da0cb", (gridSize / 10), ouracompare);
        createSumdata(maingroup, propcombined, dataAxis, 'oura-sum');
        showreportedSickIncident(maingroup, (ourareportedIncident + ouracompare) + '/0', "oura-intraday-incident");
        tooltipdata("circle-oura-heart-rate-ctn", formatdateshow2(ouracontrolday, '20' + ourayear[0]), "bpm", "#8da0cb");
    } else {
        removeGroup('oura-intraday-incident', 'oura-heart-rate-axisX-cnt', 'oura-heart-rate-axisY-cnt', 'circle-oura-heart-rate-ctn', 'oura-sum');
    }
}
/**
 * @description Google fit -  Heart Rate
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromGoogleFit
 * @function calculatSum
 * @function sickness_event
 */
function loadDatafromGoogle(data) {
    googledata = [], googleday = [], googleyear = [], googledayAxis = [], googledate = [], repeat = [], noRepeatData = [];
    googleday = [];
    googlemonth = [];
    controlDatafromGoogleFit(data);
    googlesum = calculatSum(googledata);
    googlereportedIncident = sickness_event(data, googlecontrolday);
}
/**
 * @description Google fit -  Heart Rate
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getHeartRatefromFileGoogle
 * @function controlDay
 * @function getDayonAxis
 * @function dataControlOura
 * @function addDayonGraphic
 * @function getAxisLegend
 */
function controlDatafromGoogleFit(data) {
    getHeartRatefromFileGoogle(data);
    googlecontrolday = controlDay(googledate, googleday, googlemonth);
    googledayAxis = getDayonAxis(googlecontrolday);
    finaldataGoogle = dataControlOura(googledata, googledate, googleday, googlemonth, 1);
    googlecompare = addDayonGraphic(data, getDataSourceonDay(data), "google");
    googleAxis = getAxisLegend(finaldataGoogle, 'dizaine');
}
/**
 * @description Google fit -  Heart Rate
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
function getHeartRatefromFileGoogle(data) {
    cnt = 0;
    this.file = data.googlefit_heartrate.map(d => d);
    this.file.forEach(element => {
        googledata[cnt] = element.data.heart_rate;
        googledate[cnt] = formatdate(parseTimeGarmin(element.timestamp));
        googleday[cnt] = formatdateday(parseTimeGarmin(element.timestamp));
        googlemonth[cnt] = formatdatemonth(parseTimeGarmin(element.timestamp));
        googleyear[cnt] = formatyear(parseTimeGarmin(element.timestamp));
        cnt++;
    });
}
/**
 * @description Google fit -  Heart Rate
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 * @param {*} prob - non utilised variable 
 */
function mainContainer_heart_rate_google_fit(dataAxis, maingroup, legendgroup, titlegroup, revert, prob) {
    if (revert[5] == 1) {
        removeGroup('google-intraday-incident', 'google-heart-rate-axisX-cnt', 'google-heart-rate-axisY-cnt', 'circle-google-heart-rate-ctn', 'google-sum');
        createChartePoint(maingroup, finaldataGoogle, dataAxis, "circle-google-heart-rate-ctn", "#a6d854", (gridSize / 10), googlecompare);
        createSumdata(maingroup, propcombined, dataAxis, 'google-sum');
        showreportedSickIncident(maingroup, (googlereportedIncident + googlecompare) + '/0', "google-intraday-incident");
        tooltipdata("circle-google-heart-rate-ctn", formatdateshow2(googlecontrolday, '20' + googleyear[0]), "bpm", "#a6d854");
    } else {
        removeGroup('google-intraday-incident', 'google-heart-rate-axisX-cnt', 'google-heart-rate-axisY-cnt', 'circle-google-heart-rate-ctn', 'google-sum');
    }
}
/**
 * @description Garmin -  Heart Rate
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromGarmin
 * @function calculatSum
 * @function sickness_event
 */
function loadDatafromGarmin(data) {
    garmindata = [], garmindate = [], garminday = [], garminmonth = [], garminyear = [];
    symptomData_garmin = [];
    controlDatafromGarmin(data);
    garminsum = calculatSum(garmindata);
    garminreportedIncident = sickness_event(data, controlday_garmin);
}
/**
 * @description  Garmin -  Heart Rate
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getHeartRateDatafromGarmin
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function getAxisLegend
 * @function addDayonGraphic
 */
function controlDatafromGarmin(data) {
    getHeartRateDatafromGarmin(data);
    controlday_garmin = controlDay(garmindate, garminday, garminmonth);
    dayAxis_garmin = getDayonAxis(controlday_garmin);
    finaldata_garmin = dataControl(garmindata, garminday, garminday, garminmonth, 0);
    garminAxis = getAxisLegend(finaldata_garmin, 'dizaine');
    garmincompare = addDayonGraphic(data, getDataSourceonDay(data), "garmin");
}
/**
 * @description  Garmin -  Heart Rate
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
function getHeartRateDatafromGarmin(data) {
    cnt = 0;
    this.file = data.garmin_heartrate.map(d => d);
    this.file.forEach(element => {
        garmindata[cnt] = element.data.heart_rate;
        garmindate[cnt] = element.timestamp;
        garminday[cnt] = formatdateday(parseTimeGarmin(element.timestamp));
        garminmonth[cnt] = formatdatemonth(parseTimeGarmin(element.timestamp));
        garminyear[cnt] = formatyear(parseTimeGarmin(element.timestamp));
        cnt++;
    });
}
/**
 * @description Garmin -  Heart Rate
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 * @param {*} prob - non utilised variable 
 */
function mainContainer_garmin_heartrate(dataAxis, maingroup, legendgroup, titlegroup, revert, prob) {
    if (revert[4] == 1) {
        removeGroup('circle-garmin-heart-rate-ctn', 'garmin-axisY-cnt', 'garmin-sum', "garmin-intraday-incident");
        createChartePoint(maingroup, finaldata_garmin, dataAxis, "circle-garmin-heart-rate-ctn", "#e78ac3", (gridSize / 10), garmincompare);
        createSumdata(maingroup, propcombined, dataAxis, 'garmin-sum');
        showreportedSickIncident(maingroup, (garminreportedIncident + garmincompare) + '/0', "garmin-intraday-incident");
        tooltipdata("circle-garmin-heart-rate-ctn", formatdateshow2(controlday_garmin, '20' + garminyear[0]), "bpm", "#e78ac3");
    } else {
        removeGroup('circle-garmin-heart-rate-ctn', 'garmin-axisY-cnt', 'garmin-sum', "garmin-intraday-incident");
    }
}
/**
 * @description OURA - Temperature
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromOura
 * @function calculatSum
 * @function sickness_event
 */
function loadDataFromOura_Temperature(data) {
    tempdata = [], tempday = [], tempyear = [], tempdayAxis = [], tempdate = [], repeat = [], noRepeatData = [];
    day = []; monthtemp = [];
    controlDatafromOura(data);
    ouratemp_sum = calculatSum(tempdata);
    ouratempreportedIncident = sickness_event(data, ouratempday);
}
/**
 * @description OURA - Temperature
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getOuraTemperatureDatafromFile
 * @function controlDay
 * @function getDayonAxis
 * @function getAxisLegend
 * @function dataControl
 */
function controlDatafromOura(data) {
    getOuraTemperatureDatafromFile(data);
    ouratempday = controlDay(tempday, day, monthtemp);
    dayAxis_oura_temp = getDayonAxis(ouratempday);
    TemperatureOuraAxis = getAxisLegend(tempdata, 'decimal');
    finaldataOuraTemp = dataControl(tempdata, tempday, day, monthtemp, 1);
}
/**
 * @description OURA - Temperature
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
function getOuraTemperatureDatafromFile(data) {
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
/**
 * @description OURA - Temperature
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dayAxis_oura_temp- values of the axis X 
 * @param {*} maingroupapple - svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendapple - svg element to display the caption of the Y axis 
 * @param {*} titleapple - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 */
function mainContainerOuraTempdata() {
    if (revert[0] == 1) {
        createLegendAxeX(maingroup, formatdateshow2(dayAxis_oura_temp, ""), '20' + tempyear[0], "Temperature-axisX-cnt");
        createLegendAxeY(legendgroup, TemperatureOuraAxis, "TEMPERATURE BODY", 'Temperature-axisY-cnt');
        createTitle(titlegroup, "Temperature evolution", 'Temperature-title-ctn', '50%');
        createChartePoint(maingroup, finaldataOuraTemp, TemperatureOuraAxis, "circle-oura-temperature-ctn", "#beaed4", (gridSize / 10), 0);
        tooltipdata("circle-oura-temperature-ctn", formatdateshow2(ouratempday, '20' + tempyear[0]), "", "#beaed4");
        createSumdata(maingroup, ouratemp_sum, TemperatureOuraAxis, 'oura-temp-sum');
        showreportedSickIncident(maingroup, (ouratempreportedIncident) + '/0', "oura-temperature-incident");
    } else {
        removeGroup('Temperature-title-ctn', 'Temperature-axisX-cnt', 'Temperature-axisY-cnt', 'circle-oura-temperature-ctn', 'oura-temp-sum', 'oura-temperature-incident')
    }
}
/**
 * @description OURA - Oura Respiratory Rate
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatarespiratory_ratefromOura
 * @function calculatSum
 * @function sickness_event
 */
function loadDataFromOura_RespiratoryRate(data) {
    resdata = [], resday = [], resyear = [], resdayAxis = [], resdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthres = [];
    controlDatarespiratory_ratefromOura(data);
    ouraresp_sum = calculatSum(resdata);
    ourarespreportedIncident = sickness_event(data, controldayRes);
}
/**
 * @description OURA - Oura Respiratory Rate
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getRespiratory_rateDatafromFile
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function getAxisLegend
 */
function controlDatarespiratory_ratefromOura(data) {
    getRespiratory_rateDatafromFile(data);
    controldayRes = controlDay(resday, day, monthres);
    ResdayAxis = getDayonAxis(controldayRes);
    finaldataOuraRes = dataControl(resdata, resday, day, monthres, 1);
    axisRes_oura = getAxisLegend(finaldataOuraRes, 'dizaine');
}
/**
 * @description OURA - Oura Respiratory Rate
 * @description Read all the data available from the JSON file for this data source 
 * @description Get element data / formated element timestamp (day/month - day - month -year)
 * @param {Array} data - variable JSON file data
 */
function getRespiratory_rateDatafromFile(data) {
    cnt = 0;
    this.file = data.oura_sleep_summary.map(d => d);
    this.file.forEach(element => {
        resdata[cnt] = element.data.respiratory_rate;
        resday[cnt] = formatdate(parseTimeTemp(element.timestamp));
        day[cnt] = formatdateday(parseTimeTemp(element.timestamp));
        monthres[cnt] = formatdatemonth(parseTimeTemp(element.timestamp));
        resyear[cnt] = formatyear(parseTimeTemp(element.timestamp));
        cnt++;
    });
}
/**
 * @description OURA - Oura Respiratory Rate
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} data - values of the axis X 
 * @param {*} maingroupapple - svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendapple - svg element to display the caption of the Y axis 
 * @param {*} titleapple - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 */
function mainContainer_RespiratoryRate_oura(data, maingroupapple, legendapple, titleapple, revert) {
    if (revert[6] == 1) {
        createLegendAxeX(maingroup, formatdateshow2(ResdayAxis, ""), '20' + resyear[0], "oura-resp-axisX-cnt");
        createLegendAxeY(legendapple, axisRes_oura, "RESPIRATORY RATE", 'oura-resp-axisY-cnt');
        createTitle(titleapple, "Respiratory rate evolution", 'oura-resp-title-ctn', '50%');
        createChartePoint(maingroupapple, finaldataOuraRes, axisRes_oura, "circle-oura-resp-ctn", "#97BC5F", (gridSize / 10), 0);
        tooltipdata("circle-oura-resp-ctn", formatdateshow2(controldayRes, '20' + resyear[0]), "", "#97BC5F");
        createSumdata(maingroup, ouraresp_sum, axisRes_oura, 'oura-resp-sum');
        showreportedSickIncident(maingroup, (ourarespreportedIncident) + '/0', "oura-resp-incident");
    } else {
        removeGroup('oura-resp-title-ctn', 'oura-resp-axisX-cnt', 'oura-resp-axisY-cnt', 'circle-oura-resp-ctn', 'oura-resp-sum', 'oura-resp-incident')
    }
}
/**
 * @description Display on a new HTML element the data values of the day we select by clicking on it 
 * @param {*} circleid - id of the select circle 
 * @param {Array} data - day of the displaying graphics 
 * @param {*} msg - msg to display 
 * @param {*} color - color of the graphics point displayng on screen and selected 
 */
function tooltipdata(circleid, data, msg, color) {
    tooltip = d3.select("#wearable-title").append("div").attr("class", "svg-tooltip").style("position", "absolute").style("visibility", "hidden");
    d3.selectAll("#" + circleid)
        .on("mouseover", function (d) {
            let coordXY = this.getAttribute('class').split('- ')[1];
            d3.select(this).attr("r", gridSize / 5).attr('stroke-width', 1);
            legendCircle.append("circle").attr("id", "rect-legend").attr("class", "rect-legend").attr("cx", 65 + "%").attr("cy", 50 + "%").attr("r", gridSize / 5).attr("fill", color);
            legendCircle.append("text").attr("id", "text-legend").attr("class", "text-legend").text(data[coordXY] + " " + d + " " + msg).attr("x", 69 + "%").attr("y", 60 + "%").attr("fill", "black").style("font-weight", "200");
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", gridSize / 10).style("stroke", "#015483").style("stroke-width", "0.5");
            d3.selectAll("#rect-legend").style("visibility", "hidden");
            d3.selectAll("#text-legend").style("visibility", "hidden");
        });
}
/* Functions - Graphic element visualisation */
/**
 * @description Instancy the svg variable with a HTML div (width, height...)
 * @param {*} div1 - maingroup - dislay of the graphics and X-axis
 * @param {*} widthdiv1 - width of the size depending of the number of days
 * @param {*} div2 legendgroup - display of the Y-axis
 * @param {*} heightdiv2 
 * @param {*} div3 ) titlegroup - display of the title graphics
 * @param {*} heightdiv3 
 * @param {*} divChoice - makeAchoice
 */
function createWearableDataSvg(div1, widthdiv1, div2, heightdiv2, div3, heightdiv3, divChoice) {
    maingroup = d3.select('#'+div1).append("svg").attr("class","svg").attr("width", widthdiv1).attr("height", heightdiv2);
    legendgroup = d3.select('#'+div2).append("svg").attr("class","svg").attr("width",100+"%").attr("height", heightdiv2);
    titlegroup = d3.select('#'+div3).append("svg").attr("class","svg").attr("width",100+"%").attr("height", heightdiv3/2);
    makeAchoice = d3.select('#'+divChoice).append("svg").attr("class","svg").attr("width",100+"%").attr("height", heightdiv3*1.7);
    legendCircle = d3.select('#wearable-legend-circle').append("svg").attr("class","svg").attr("width",100+"%").attr("height",heightdiv3/2);
}
/**
 * @description Display on screen the title of the graphic
 * @param {Element} titleapple - svg element
 * @param {String} title - title text message
 * @param {Number} id - id of the text message 
 * @param {Number} coordX - positon X of the text message 
 */
function createTitle(titleapple, title, id, coordX) {
    titleapple.append("text").attr('id', id).attr("x", coordX).attr("y", 50 + "%").attr("text-anchor", "middle").style("fill", "#212529").style("font-weight", "200").style("font-size", 1.4 + "rem").attr("class", "mg-chart-title").text(title);
}
/**
 * @description Display on screen the legend X of the graphic - day
 * @param {Element} legendapple - svg element
 * @param {Array} axisdays - data to display
 * @param {String} year - data year
 * @param {Number} id - id of element
 */
function createLegendAxeX(legendapple, axisdays, year, id) {
    legendapple.append("line").attr("x1", 0).attr("y1", heightGraph - margin.bottom).attr("x2", 100 + "%").attr("y2", heightGraph - margin.bottom).style("stroke", "#778899").style("stroke-width", "0.5");
    legendapple.selectAll(".daysLabel").data(axisdays).enter().append("text").attr('id', id).text(function (d) { return d; }).style("fill", "#212529").attr("x", function (d, i) { return gridSize * 5 + (i * gridSize * 7) }).attr("y", heightGraph - (margin.bottom / 4.5)).style("text-anchor", "end").attr("font-weight", "200").attr("font-size", "1em");
    legendapple.append("text").attr('id', id).text(year).attr("x", gridSize * 3).attr("y", heightGraph).style("text-anchor", "end").attr("font-weight", "200").attr("font-size", ".7em");
    legendapple.selectAll(".tickSize").attr('id', id).data(axisdays).enter().append("line").attr("x1", function (d, i) { return gridSize * 5 + ((i * gridSize * 7) - (gridSize / 2)) }).attr("y1", heightGraph - margin.bottom).attr("x2", function (d, i) { return gridSize * 5 + ((i * gridSize * 7) - (gridSize / 2)) }).attr("y2", heightGraph - (margin.bottom / 1.25)).style("stroke", "#212529").style("stroke-width", "0.5");
}
/**
 * @description Display on screen the legend Y of the graphics - data caption 
 * @param {Element} legendapple - svg element
 * @param {Array} heartrateAxis - data to display
 * @param {String} title - text descriptif
 * @param {Number} id - id of element
 */
function createLegendAxeY(legendapple, heartrateAxis, title, id) {
    legendapple.append("line").attr("x1",100+"%").attr("y1",(margin.top/2.5)).attr("x2",100+"%").attr("y2",heightGraph - margin.bottom).style("stroke","#778899").style("stroke-width","1");
    if (heartrateAxis != 'null')
        legendapple.selectAll(".daysLabel").data(heartrateAxis).enter().append("text").text(function (d) {return d; }).attr('id', id).attr('class',"legendnameAxisY").style("fill","#212529").style("font-weight","200").attr("x",90+"%")
            .attr("y", function (d, i) {
                if (this.min < 0)return (heightGraph - margin.bottom * 2) - (i * 4 * ((heightGraph - margin.bottom * 2) / (heartrateAxis.length * 4)))
                else return (heightGraph - margin.bottom * 2) - (i * 4 * ((heightGraph - margin.bottom * 2) / (heartrateAxis.length * 4)))
            }).style("text-anchor", "end").attr("font-weight", 200);
    legendapple.append("g").attr("class","y axis").append("text").attr('id',id).attr("transform","rotate(-90)").style("fill","#212529").attr("x",-(heightGraph / 2) + margin.bottom).attr("y","2%").style("text-anchor","middle").style("font-weight","200").attr("font-size",.7+"rem").attr('class',"titlenameAxisY").text(title);
    if (heartrateAxis != 'null')
        legendapple.selectAll(".tickSize").data(heartrateAxis).enter().append("line").attr('id', id).style("stroke", "#212529").style("stroke-width", "0.5")
            .attr("x1", 95 + "%").attr("y1", function (d, i) { return (heightGraph - margin.bottom * 2 - 5) - (i * ((heightGraph - margin.bottom * 2) / (heartrateAxis.length))) })
            .attr("x2", 100 + "%").attr("y2", function (d, i) { return (heightGraph - margin.bottom * 2 - 5) - (i * ((heightGraph - margin.bottom * 2) / (heartrateAxis.length))) });
}
/**
 * @description Display on screen the svg element - pie chart 
 * @param {Element} maingroupapple - svg element
 * @param {Array} data - data to display 
 * @param {Array} axe - values of Y axis to have the position of the point
 * @param {String} id - id of the point
 * @param {Array} color - color of the chart
 * @param {Number} size - size of the point 
 * @param {Number} compare - number of different day between the first day of all data source and this one  
 */
function createChartePoint(maingroupapple, data, axe, id, color, size, compare) {
    maingroupapple.selectAll("circle-test")
        .data(data)
        .enter()
        .append("circle")
        .attr('id', id)
        .attr('class', function (d, i) { return "circle - " + i })
        .attr("cx", function (d, i) {
            return ((gridSize * (compare + .5))) + (i * gridSize);
        })
        .attr("cy", function (d) {
            var gap = {
                bottom: heightGraph - (margin.bottom * 2) - 5,
                top: (margin.top / 2.5) + 8,
                betweenTopAndBottom: axe[axe.length - 1] - axe[0],
                betweenValues: d - axe[0],
                test: ((heightGraph - (margin.bottom * 2) - 5) - ((axe.length - 1) * ((heightGraph - margin.bottom * 2) / (axe.length)))),
                test2: ((heightGraph - (margin.bottom * 2) - 5) - (((heightGraph - margin.bottom * 2) / (axe.length)))),
            };

            if (d == 0)
                return ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom)));
            else if (d == "NO DATA" || d == "-" || d == "" || d == undefined) return (heightGraph * 1.1)
            else
                return ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom)));
        })
        .attr("r", size)
        .attr("fill", function (d) {
            if (d == 0)
                return color;
            if (d == "NO DATA" || d == "-" || d == "" || d == undefined) return 'white'
            else return color;
        })
        .style("stroke", function (d) {
            if (d == 0)
                return "#015483"
            else if (d == "NO DATA" || d == "-" || d == "" || d == undefined) return 'white'
            else
                return "#015483"
        })
        .style("stroke-width", "0.5");
}
/**
 * @description Display on screen rect to show the sum of the value with a double standart deviation 
 * @param {Element} svgName - svg element
 * @param {Array} data - data to display 
 * @param {Array} axe - values of Y axis to have the position of the point
 * @param {String} id - id of the element
 */
function createSumdata(svgName, data, axe, id) {
    var gap = { bottom: heightGraph - (margin.bottom * 2) - 5,op: (margin.top / 2.5) + 8,betweenTopAndBottom: axe[axe.length - 1] - axe[0],betweenValues: data[2] - axe[0],test2: ((heightGraph - margin.bottom * 2 - 5) - (((heightGraph - margin.bottom * 2) / (axe.length))))};
    svgName.append("rect").attr('id', id).attr("x", 0).attr("y", ((gap.bottom) - ((data[3] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom)))).attr("width", (numberdaysongraph + 1) * gridSize).attr("height", (((gap.bottom) - ((data[1] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))) - ((gap.bottom) - ((data[3] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))))).style("fill", "#ededed").lower();
    svgName.append("rect").attr('id', id).attr("x", 0).attr("y", ((gap.bottom) - ((data[4] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom)))).attr("width", (numberdaysongraph + 1) * gridSize).attr("height", (((gap.bottom) - ((data[0] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))) - ((gap.bottom) - ((data[4] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))))).style("fill", "#f7f7f7").lower();
    svgName.append("line").attr('id', id).attr("x1", 0).attr("y1", ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom)))).attr("x2", (numberdaysongraph + 1) * gridSize).attr("y2", ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom)))).style("stroke", "#34495e").style("stroke-dasharray", 5).style("stroke-width", "1");
}
/**
 * @description Display on screen the day the sick incident was reported
 * @param {*} svgName - svg element 
 * @param {*} coord - position of the day sick incident in comparaison of the first day 
 * @param {*} id - id of the element 
 */
function showreportedSickIncident(svgName, coord, id) {
    coordX = coord.split('/');
    let x=((gridSize*.5))+coordX[0]*gridSize;
    let y=(gridSize/2);
    if (coordX[1] == 0){text="Reported sick incident";} 
    else {text = "";}
    svgName.append("g").attr("id",id).append("text").attr("transform", "rotate(0)").style("fill","#212529").attr("x",x).attr("y",y).style("text-anchor","middle").style("fill","#A7AAAA").style("font-weight", "200").attr("font-size",.7+"rem").text(text);
    svgName.append("line").attr("id",id).attr("x1",((gridSize*.5)+coordX[0]*gridSize)).attr("y1",y).attr("x2",((gridSize*.5)+coordX[0]*gridSize)).attr("y2",heightGraph - margin.bottom).style("stroke", "#A7AAAA").style("stroke-dasharray",5).style("stroke-width","1");
}
/* Functions - Get element variable display */
/**
 * @description function to get the day to display on the graphics - one day every seven - one week 
 * @param { Array } data - of the JSON file 
 * @returns { axisdays }
 */
function getDayonAxis(data) {
    axisdays = [];
    var cnt = 0;
    for (let i = 4; i < data.length; i += 7) {
        axisdays[cnt] = data[i];
        cnt++;
    }
    return axisdays;
}
/**
 * @description Get, analyse and return a array to create a Y-axis caption with the min and max values of the data receive in params 
 * @param { Array } symptomdata 
 * @param { String } dizaine 
 * @returns { legende }
 */
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
        max = (10 * Math.floor(max / 10) + 5);
        var test = ((max - min) / 5);
        for (let i = 0; i < test + 2; i++) {
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
/**
 * @description Get, calculate and return the combining sum and standart deviation of the data we want to display 
 * @param { Array } revert 
 * @returns {prop}
 */
function getSum(revert) {
    var data = [];
    var cnt1 = 0;
    var cnt2 = 0;
    var cnt3 = 0;
    var cnt4 = 0;
    var cnt5 = 0;
    var prop = [0, 0, 0, 0, 0, 0];

    if (revert[0] == 1 && revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0 && revert[6] == 0 && revert[7] == 0) {
        for (let i = 0; i < finaldataOuraTemp.length; i++) {
            data[i] = finaldataOuraTemp[i];
        }
    }
    if (revert[6] == 1 && revert[0] == 0 && revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0 && revert[6] == 0 && revert[7] == 0) {
        for (let i = 0; i < finaldataOuraRes.length; i++) {
            data[i] = finaldataOuraRes[i];
        }
    }
    if (revert[1] == 1 && revert[0] == 0) {
        for (let i = 0; i < finaldataAppleWatch.length; i++) {
            data[i] = finaldataAppleWatch[i];
            cnt1++;
            cnt2++;
            cnt3++;
            cnt4++;
            cnt5++;

        }
    }
    if (revert[2] == 1 && revert[0] == 0) {
        for (let i = 0; i < newdataFitbit.length; i++) {
            data[i + cnt1] = newdataFitbit[i];
            cnt2++;
            cnt3++;
            cnt4++;
            cnt5++;
        }
    }
    if (revert[3] == 1 && revert[0] == 0) {
        for (let i = 0; i < ouradata.length; i++) {
            data[i + cnt2] = ouradata[i];
            cnt3++;
            cnt4++;
            cnt5++;
        }
    }

    if (revert[4] == 1 && revert[0] == 0) {
        for (let i = 0; i < finaldata_garmin.length; i++) {
            data[i + cnt3] = finaldata_garmin[i];
            cnt4++;
            cnt5++;
        }
    }

    if (revert[5] == 1 && revert[0] == 0) {
        for (let i = 0; i < finaldataGoogle.length; i++) {
            data[i + cnt4] = finaldataGoogle[i];
            cnt5++;
        }
    }

    if (revert[7] == 1 && revert[0] == 0) {
        for (let i = 0; i < fitbitintradaydata.length; i++) {
            data[i + cnt5] = fitbitintradaydata[i];
        }
    }
    if (revert[0] == 0 && revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0 && revert[6] == 0 && revert[7] == 0) {
        prop = [0, 0, 0, 0, 0, 0];
    } else
        prop = calculatSum(data);
    return prop;
}
/**
 * @description Calculate the sum and stadart deviation of the data we have in parameters
 * @param { Array } data values of a data source
 * @returns {prop}  
 */
function calculatSum(data) {
    var sum = 0;
    var N = 0;
    var variance = 0;
    var stddeviation = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i] != '-' && data[i] != undefined && data[i] != "NO DATA" && data[i] != "") {
            sum += data[i];
            N++;
        }
    }
    if (sum > 10) {
        sum = Math.round(sum / N);
    }
    else {
        sum = (sum / N);
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i] != '-' && data[i] != undefined && data[i] != "NO DATA" && data[i] != "") {
            variance += (1 / N) * ((data[i] - sum) * (data[i] - sum));
        }
    }
    stddeviation = Math.sqrt(variance);

    var prop = [];
    if (sum > stddeviation)
        prop[0] = Math.round(sum - (stddeviation * 2));
    else
        prop[0] = (sum - (stddeviation * 2));
    if (sum > stddeviation)
        prop[1] = Math.round(sum - stddeviation);
    else
        prop[1] = (sum - stddeviation);
    if (sum > 1)
        prop[2] = Math.round(sum);
    else
        prop[2] = (sum);
    if (sum > stddeviation)
        prop[3] = Math.round(sum + (stddeviation));
    else
        prop[3] = (sum + (stddeviation));
    if (sum > stddeviation)
        prop[4] = Math.round(sum + (stddeviation * 2));
    else
        prop[4] = (sum + (stddeviation * 2));

    return (prop);
}
/**
 * @description Combine all the chart point data displayed on the screen to obtain a Y-axis legend suitable for every chart point selected. 
 * @param {Array} revert - user gestion mouse click 
 */
function getCombineAxisY(revert) {
    var test = [];
    var cnt1 = 0;
    var cnt2 = 0;
    var cnt3 = 0;
    var cnt4 = 0;
    var cnt5 = 0;

    if (revert[1] == 1) {
        for (let i = 0; i < heartrateAxis.length; i++) {
            test[i] = heartrateAxis[i];
            cnt1++;
            cnt2++;
            cnt3++;
            cnt4++;
            cnt5++;
        }
    }
    if (revert[2] == 1) {
        for (let i = 0; i < fitbitAxis.length; i++) {
            test[i + cnt1] = fitbitAxis[i];
            cnt2++;
            cnt3++;
            cnt4++;
            cnt5++;
        }
    }
    if (revert[3] == 1) {
        for (let i = 0; i < ouraAxis.length; i++) {
            test[i + cnt2] = ouraAxis[i];
            cnt3++;
            cnt4++;
            cnt5++;
        }
    }
    if (revert[4] == 1) {
        for (let i = 0; i < garminAxis.length; i++) {
            test[i + cnt3] = garminAxis[i];
            cnt4++;
            cnt5++;
        }
    }
    if (revert[5] == 1) {
        for (let i = 0; i < googleAxis.length; i++) {
            test[i + cnt4] = googleAxis[i];
            cnt5++;
        }
    }
    if (revert[7] == 1) {
        for (let i = 0; i < fitbitintradayAxis.length; i++) {
            test[i + cnt5] = fitbitintradayAxis[i];
        }
    }
    test.sort((a, b) => a - b);
    var axis = Array.from(new Set(test));
    var newAxis = [];
    var cnt = 0;
    if (axis.length > 8) {
        for (let i = 0; i < axis.length; i += 2) {
            newAxis[cnt] = axis[i];
            cnt++;
        }
    } else
        newAxis = axis;
    return newAxis;
}
/**
 * @description Return true if they are data for this data source, else return false
 * @description This function allow us to display the button to display the chart point 
 * @param {*} data - JSON file data
 * @param {*} type - name of the data source we want to know the availability of their data
 * @returns {boolean} 
 */
function controlWearableDatafromfile(data, type) {
    switch (type) {
        case 'fitbit':
            if (data.fitbit_summary == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.fitbit_summary.length; i++) {
                if (data.fitbit_summary[i].data.heart_rate != "" && data.fitbit_summary[i].data.heart_rate != '-' && data.fitbit_summary[i].data.heart_rate != undefined)
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
                if (data.apple_health_summary[i].data.heart_rate != "" && data.apple_health_summary[i].data.heart_rate != "-" && data.apple_health_summary[i].data.heart_rate != undefined)
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
                if (data.oura_sleep_summary[i].data.temperature_delta != "" && data.oura_sleep_summary[i].data.temperature_delta != "-" && data.oura_sleep_summary[i].data.temperature_delta != undefined)
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'ouraHR':
            if (data.oura_sleep_summary == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.oura_sleep_summary.length; i++) {
                if (data.oura_sleep_summary[i].data.heart_rate != "" && data.oura_sleep_summary[i].data.heart_rate != "-" && data.oura_sleep_summary[i].data.heart_rate != undefined)
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'garmin':
            if (data.garmin_heartrate == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.garmin_heartrate.length; i++) {
                if (data.garmin_heartrate[i].data.heart_rate != "" && data.garmin_heartrate[i].data.heart_rate != "-" && data.garmin_heartrate[i].data.heart_rate != undefined)
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'google':
            if (data.googlefit_heartrate == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.googlefit_heartrate.length; i++) {
                if (data.googlefit_heartrate[i].data.heart_rate != "" && data.googlefit_heartrate[i].data.heart_rate != "-" && data.googlefit_heartrate[i].data.heart_rate != undefined)
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'ourares':
            if (data.oura_sleep_summary == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.oura_sleep_summary.length; i++) {
                if (data.oura_sleep_summary[i].data.respiratory_rate != "" && data.oura_sleep_summary[i].data.respiratory_rate != "-" && data.oura_sleep_summary[i].data.respiratory_rate != undefined)
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'fitbitintraday':
            if (data.fitbit_intraday == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.fitbit_intraday.length; i++) {
                if (data.fitbit_intraday[i].data.heart_rate != "" && data.fitbit_intraday[i].data.rheart_rate != "-" && data.fitbit_intraday[i].data.heart_rate != undefined)
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
    }
}
/**
 * @description Display on screen the button which allow us to display or not all the available data source 
 * @param {Element} svgName - svg element name  
 * @function createButton
 * @function setAttributButton
 */
function getButtonChoice(svgName) {
    classname = [];
    colorscale = [];
    legendname = [];
    cnt = 0;
    classnameHeartRate = [];
    colorscaleHeartRate = [];
    legendnameHeartRate = [];
    cntHR = 0;
    classnameTemperature = [];
    colorscaleTemperature = [];
    legendnameTemperature = [];
    cntTP = 0;
    classnameRespirator = [];
    colorscaleRespirator = [];
    legendnameRespirator = [];
    cntRS = 0;
    setAttributButton();
    createButton(svgName, 1, classname, legendname, colorscale, 0, (gridSize * .2));
    createButton(svgName, 2, classnameHeartRate, legendnameHeartRate, colorscaleHeartRate, (classname.length), (classname.length * gridSize * 1.55));
}
/**
 * @description Function to get all the available data source we have in the JSON file
 * @description And fill all the different kind of the different buttons 
 * @description color - caption - text - size - class
 */
function setAttributButton() {
    if (oura == true) {
        classname[cnt] = 'Temperature';
        colorscale[cnt] = '#beaed4';
        legendname[cnt] = "Temperature";
        classnameTemperature[cntTP] = 'oura';
        colorscaleTemperature[cntTP] = '#beaed4';
        legendnameTemperature[cntTP] = "Oura";
        cnt++;
        cntTP++;
    }

    if (apple == true || fitbit == true || ouraHR == true || garmin == true || google == true || fitbitintraday == true) {
        classname[cnt] = 'HeartRate';
        colorscale[cnt] = '#9BFF1C';
        legendname[cnt] = "Heart Rate";
        cnt++;
    }

    if (fitbit == true) {
        classnameHeartRate[cntHR] = 'fitbit';
        colorscaleHeartRate[cntHR] = "#fc8d62";
        legendnameHeartRate[cntHR] = 'Fitbit';
        cntHR++;
    }

    if (ouraHR == true) {
        classnameHeartRate[cntHR] = 'ouraHR';
        colorscaleHeartRate[cntHR] = "#8da0cb";
        legendnameHeartRate[cntHR] = 'Oura';
        cntHR++;
    }

    if (garmin == true) {
        classnameHeartRate[cntHR] = 'garmin';
        colorscaleHeartRate[cntHR] = "#e78ac3";
        legendnameHeartRate[cntHR] = 'Garmin';
        cntHR++;
    }

    if (apple == true) {
        classnameHeartRate[cntHR] = 'apple';
        colorscaleHeartRate[cntHR] = '#66c2a5';
        legendnameHeartRate[cntHR] = 'Apple Watch';
        cntHR++;
    }

    if (google == true) {
        classnameHeartRate[cntHR] = 'google';
        colorscaleHeartRate[cntHR] = "#a6d854";
        legendnameHeartRate[cntHR] = 'Google fit';
        cntHR++;
    }
    if (fitbitintraday == true) {
        classnameHeartRate[cntHR] = 'fitbiintraday';
        colorscaleHeartRate[cntHR] = "#A8B88F";
        legendnameHeartRate[cntHR] = 'Fitbit intraday';
        cntHR++;
    }

    if (ourares == true) {
        classname[cnt] = 'RespiratoryRate';
        colorscale[cnt] = '#97BC5F';
        legendname[cnt] = "Respiratory Rate";
        classnameRespirator[cntRS] = 'ourares';
        colorscaleRespirator[cntRS] = '#97BC5F';
        legendnameRespirator[cntRS] = "Oura";
        cnt++;
        cntRS++;
    }
}
/**
 * @description Display on screen an button element svg with it own id and classname 
 * @param {*} svgName - element svg
 * @param {*} type - 1: categories / 2; data source
 * @param {*} dataclassname specific button class 
 * @param {*} datalegend - specific button text
 * @param {*} datacolor - specific button color
 * @param {*} marginTop1 - x position 
 * @param {*} marginTop2 - y position 
 */
function createButton(svgName, type, dataclassname, datalegend, datacolor, marginTop1, marginTop2) {
    if (marginTop1 == 1) {
        margintest = .5
    } else
        margintest = 1;

    svgName.selectAll('circle-choice')
        .data(dataclassname)
        .enter()
        .append("circle")
        .attr('id', 'circle-choice-heartrate')
        .attr('class', function (d, i) { return dataclassname[i] })
        .attr("cx", function (d, i) {
            if (type == 1)
                return (5 + (i * 35) + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (45 * margintest) + '%'
            else if (type == 2 && i > 3)
                return (65 * margintest) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (25 * margintest) + '%'
        })
        .attr("cy", function (d, i) {
            if (type == 1)
                return (10 + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (15) + ((i - 1) * 15) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (15) + ((i + 1) * 15) + '%'
            else if (type == 2 && i > 3)
                return (15) + ((i - 3) * 15) + '%'
        })
        .attr("r", gridSize / (2 * type))
        .attr("stroke", "#e2e2e2")
        .style("fill", function (d, i) {
            if (type == 1 && d == 'Temperature') {
                createLinearGradient(svgName, colorscaleTemperature, d);
                return "url(#" + d + ")"
            } else if (type == 1 && d == 'HeartRate') {
                createLinearGradient(svgName, colorscaleHeartRate, d);
                return "url(#" + d + ")"
            }
            else
                return datacolor[i];
        });
    svgName.selectAll(".daysLabel")
        .data(datalegend)
        .enter().append("text")
        .attr("class", function (d, i) {
            if (type == 1)
                return "textbuttonprincipal"
            else return "textbutton"
        })
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d, i) {
            if (type == 1)
                return (7 + (i * 35) + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (2 + 45 * margintest) + '%'
            else if (type == 2 && i > 3)
                return (2 + 65 * margintest) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (2 + 25 * margintest) + '%'
        })
        .attr("y", function (d, i) {
            if (type == 1)
                return (13 + '%')
            else if (type == 2 && i > 1 && i <= 3)
                return (17) + ((i - 1) * 15) + '%'
            else if (type == 2 && i >= 0 && i <= 1)
                return (17) + ((i + 1) * 15) + '%'
            else if (type == 2 && i > 3)
                return (17) + ((i - 3) * 15) + '%'
        })
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .attr("font-size", (.75 - (type / 8)) + "rem");
}
/**
 * @description Create un linear gradient color for the heart rate button by combining each color of all the data source available
 * @param {*} svgName  - element svg
 * @param {Array} color 
 * @param {*} id - id of the element 
 */
function createLinearGradient(svgName, color, id) {
    linearGradient = svgName.append("defs")
        .append("linearGradient")
        .attr("id", id);
    for (let i = 0; i < color.length; i++) {
        linearGradient.append("stop")
            .attr("offset", (i + .5) * (100 / (color.length)) + "%")
            .attr("stop-color", color[i]);
    }
    return linearGradient;
}
/**
 * @description Get the name of the data source which have the first day of data
 * @description only with the heart rate data source 
 * @param {*} data - JSON file
 * @returns {test2} String 
 */
function getDataSourceonDay(data) {
    firstDay_fitbit = 0;
    firstDay_apple = 0;
    firstDay_oura = 0;
    firstDay_oura_hr = 0;
    firstDay_garmin = 0;
    firstDay_google = 0;
    if (data.fitbit_summary != undefined) {
        firstDay_fitbit = parseTimeTemp(data.fitbit_summary[0].timestamp).getTime();
    }
    if (data.apple_health_summary != undefined) {
        firstDay_apple = parseTime(data.apple_health_summary[0].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_oura = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_oura_hr = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
    }
    if (data.garmin_heartrate != undefined) {
        firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
    }
    if (data.googlefit_heartrate != undefined) {
        firstDay_google = parseTimeGarmin(data.googlefit_heartrate[0].timestamp).getTime();
    }
    test = 10000000000000;
    test2 = "none";

    if (firstDay_apple < test && data.apple_health_summary != undefined) {
        test = firstDay_apple;
        test2 = 'apple';
    }
    if (firstDay_fitbit < test && data.fitbit_summary != undefined) {
        test = (firstDay_fitbit);
        test2 = 'fitbit';
    }
    if (firstDay_oura_hr < test && data.oura_sleep_summary != undefined) {
        test = (firstDay_oura_hr);
        test2 = 'ouraHR';
    }
    if (firstDay_garmin < test && data.garmin_heartrate != undefined) {
        test = (firstDay_garmin);
        test2 = 'garmin';
    }
    if (firstDay_google < test && data.googlefit_heartrate != undefined) {
        test = (firstDay_google);
        test2 = 'google';
    }
    return test2;
}
/**
 * @description Get the name of the data source which have the last day of data
 * @param {*} data - JSON file
 * @returns {test2} String 
*/
function getLastDataSourceonDay(data) {
    firstDay_fitbit = 0;
    firstDay_apple = 0;
    firstDay_oura = 0;
    firstDay_oura_hr = 0;
    firstDay_garmin = 0;
    firstDay_google = 0;
    firstDay_temperature = 0;
    firstDay_respiratory = 0;

    if (data.fitbit_summary != undefined) {
        firstDay_fitbit = parseTimeTemp(data.fitbit_summary[data.fitbit_summary.length - 1].timestamp).getTime();
    }
    if (data.apple_health_summary != undefined) {
        firstDay_apple = parseTime(data.apple_health_summary[data.apple_health_summary.length - 1].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_oura = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_oura_hr = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
    }
    if (data.garmin_heartrate != undefined) {
        firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[data.garmin_heartrate.length - 1].timestamp).getTime();
    }
    if (data.googlefit_heartrate != undefined) {
        firstDay_google = parseTimeGarmin(data.googlefit_heartrate[data.googlefit_heartrate.length - 1].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_temperature = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_respiratory = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
    }


    test = 0;
    test2 = "none";

    if (firstDay_apple > test && data.apple_health_summary != undefined) {
        test = firstDay_apple;
        test2 = 'apple';
    }
    if (firstDay_fitbit > test && data.fitbit_summary != undefined) {
        test = (firstDay_fitbit);
        test2 = 'fitbit';
    }

    if (firstDay_oura_hr > test && data.oura_sleep_summary != undefined) {
        test = (firstDay_oura_hr);
        test2 = 'ouraHR';
    }
    if (firstDay_garmin > test && data.garmin_heartrate != undefined) {
        test = (firstDay_garmin);
        test2 = 'garmin';
    }
    if (firstDay_google > test && data.googlefit_heartrate != undefined) {
        test = (firstDay_google);
        test2 = 'google';
    }
    if (firstDay_temperature > test && data.oura_sleep_summary != undefined) {
        test = (firstDay_temperature);
        test2 = 'oura';
    }
    if (firstDay_respiratory > test && data.oura_sleep_summary != undefined) {
        test = (firstDay_respiratory);
        test2 = 'ourares';
    }

    return test2;
}
/**
 * @description Get the name of the data source which have the first day of data
 * @description  with all the data source 
 * @param {*} data - JSON file
 * @returns {test2} String 
 */
function getFirstDataSourceonDay(data) {
    firstDay_fitbit = 0;
    firstDay_apple = 0;
    firstDay_oura = 0;
    firstDay_oura_hr = 0;
    firstDay_garmin = 0;
    firstDay_google = 0;
    firstDay_temperature = 0;
    firstDay_respiratory = 0;

    if (data.fitbit_summary != undefined) {
        firstDay_fitbit = parseTimeTemp(data.fitbit_summary[0].timestamp).getTime();
    }
    if (data.apple_health_summary != undefined) {
        firstDay_apple = parseTime(data.apple_health_summary[0].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_oura = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
    }

    if (data.oura_sleep_summary != undefined) {
        firstDay_oura_hr = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
    }
    if (data.garmin_heartrate != undefined) {
        firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
    }
    if (data.googlefit_heartrate != undefined) {
        firstDay_google = parseTimeGarmin(data.googlefit_heartrate[0].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_temperature = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
    }
    if (data.oura_sleep_summary != undefined) {
        firstDay_respiratory = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
    }


    test = 10000000000000;
    test2 = "none";

    if (firstDay_apple < test && data.apple_health_summary != undefined) {
        test = firstDay_apple;
        test2 = 'apple';
    }
    if (firstDay_fitbit < test && data.fitbit_summary != undefined) {
        test = (firstDay_fitbit);
        test2 = 'fitbit';
    }
    if (firstDay_oura_hr < test && data.oura_sleep_summary != undefined) {
        test = (firstDay_oura_hr);
        test2 = 'ouraHR';
    }
    if (firstDay_garmin < test && data.garmin_heartrate != undefined) {
        test = (firstDay_garmin);
        test2 = 'garmin';
    }
    if (firstDay_google < test && data.googlefit_heartrate != undefined) {
        test = (firstDay_google);
        test2 = 'google';
    }
    if (firstDay_temperature < test && data.oura_sleep_summary != undefined) {
        test = (firstDay_temperature);
        test2 = 'oura';
    }
    if (firstDay_respiratory < test && data.oura_sleep_summary != undefined) {
        test = (firstDay_respiratory);
        test2 = 'ourares';
    }

    return test2;
}
/**
 * @description Get the maximum number of day to create the width of the chart point
 * @param {*} data - JSON file
 * @param {String} sourceFirstday - name of the data source whiwh have the first day of data 
 * @param {String} sourceLastday - name of the data source whiwh have the last day of data 
 * @returns {difference} Number 
 */
function getnumberday(data, sourceFirstday, sourceLastday) {
    if (sourceFirstday != 'none' && sourceLastday != 'none') {
        firstday = 0;
        lastday = 0;
        if (sourceFirstday == 'fitbit') {
            firstday = parseTimeTemp(data.fitbit_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'ouraHR') {
            firstday = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'google') {
            firstday = parseTimeGarmin(data.googlefit_heartrate[0].timestamp).getTime();
        }
        if (sourceFirstday == 'garmin') {
            firstday = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
        }
        if (sourceFirstday == 'apple') {
            firstday = parseTime(data.apple_health_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'oura') {
            firstday = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
        }
        if (sourceFirstday == 'ourares') {
            firstday = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
        }


        if (sourceLastday == 'fitbit') {
            lastday = parseTimeTemp(data.fitbit_summary[data.fitbit_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'ouraHR') {
            lastday = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'google') {
            lastday = parseTimeGarmin(data.googlefit_heartrate[data.googlefit_heartrate.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'apple') {
            lastday = parseTime(data.apple_health_summary[data.apple_health_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'garmin') {
            lastday = parseTimeGarmin(data.garmin_heartrate[data.garmin_heartrate.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'oura') {
            lastday = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
        }
        if (sourceLastday == 'ourares') {
            lastday = parseTimeTemp(data.oura_sleep_summary[data.oura_sleep_summary.length - 1].timestamp).getTime();
        }
       var difference = Math.round((lastday - firstday) / (86400000));
    } else
        var difference = 0;
        return difference;
}
/**
 * @description get the number of diffences between 2 days 
 * @description This number will be useful to display the graphics with a offset
 * @param {*} data - JSON file
 * @param {*} source - data source name which have the most day in 
 * @param {*} type - class name of the data source selected
 * @function getDataSourceonDay
 * @example applecompare = addDayonGraphic(data, getDataSourceonDay(data), 'apple');
 * @returns {compare}
 */
function addDayonGraphic(data, source, type) {
    var datasource = getDataSourceonDay(data);

    if (datasource == source && source == 'ouraHR') {
        var daycompare = formatdateday(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    }
    if (datasource == source && source == 'apple') {
        var daycompare = formatdateday(parseTime(data.apple_health_summary[0].timestamp));
    }
    if (datasource == source && source == 'fitbit') {
        var daycompare = formatdateday(parseTimeTemp(data.fitbit_summary[0].timestamp));
    }
    if (datasource == source && source == 'google') {
        var daycompare = formatdateday(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    }
    if (datasource == source && source == 'garmin') {
        var daycompare = formatdateday(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    }

    if (type == 'oura') {
        var day = formatdateday(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
        var compare = day - daycompare;
    }
    else if (type == 'apple') {
        var day = formatdateday(parseTime(data.apple_health_summary[0].timestamp));
        var compare = day - daycompare;
    }
    else if (type == 'fitbit') {
        var day = formatdateday(parseTimeTemp(data.fitbit_summary[0].timestamp));
        var compare = day - daycompare;
    } else if (type == 'google') {
        var day = formatdateday(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
        var compare = day - daycompare;
    } else if (type == 'garmin') {
        var day = formatdateday(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
        var compare = day - daycompare;
    }
    return compare;
}
/**
 * @description Function to add or remove the missing or repeat day
 * @description Return a new array of date for the data source
 * @param {Array} data - timestamp of the data source 
 * @param {*} days2 -  Map of days of the data source 
 * @param {*} month - Map of month of the data source 
 * @example controlday = controlDay(appleday, dayapp, monthapp);
 * @returns {days3_fixed}
 */
function controlDay(data, days2, month) {
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
            } else if (month[i] == 2)
                days_fixed[i] = days4_fixed[i] + 28;
            else
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
    days3_fixed.push(days2[data.length - 1] + "/" + month[data.length - 1]);
    //data[data.length - 1]);
    return days3_fixed;
}
/**
 * @description This function add data values ("NO DATA") for the missing day 
 * @description This function keep only the last data values for repeat day 
 * @param {*} data - values element data of the data source 
 * @param {*} tempdate - timestamp of the data source 
 * @param {*} day -  Map of days of the data source 
 * @param {*} monthtemp - Map of month of the data source 
 * @param {*} rapport - values of call function dayControlGraph()
 * @returns {data2}
 */
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
            data2[i + cnt] = data[i - count];
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
/**
 * @description This fonction is use when the data source send several data values per day
 * @description This function keep the lowest data values for the day 
 * @description This function add data values ("NO DATA") for the missing day 
 * @param {*} data - values element data of the data source 
 * @param {*} tempdate - timestamp of the data source 
 * @param {*} day -  Map of days of the data source 
 * @param {*} monthtemp - Map of month of the data source 
 * @param {*} rapport - values of call function dayControlGraph() 
 * @returns {data2}
 */
function dataControlOura(data, tempdate, day, monthtemp, rapport) {
    dayscontrol = dayControlGraph(tempdate, day, monthtemp);
    const data2 = [];
    var cnt = 0;
    if (rapport < 0) {
        let count = - rapport;
        for (let i = 0; i < count; i++) {
            data2[i] = "";
        }
        for (var i = count; i < dayscontrol.length + count; i++) {
            data2[i + cnt] = Math.round(data[i - count]);
            if (dayscontrol[i] != -1 && dayscontrol[i] != -30 && dayscontrol[i] != -31) {
                for (var t = 0; t < dayscontrol[i]; t++) {
                    cnt++;
                    data2[i + cnt] = "NO DATA";
                }
            }
            else if (dayscontrol[i] == -1) {
                if (data2[i + cnt] > data[i - 1]) {
                    cnt--;
                }
                else if (data2[i + cnt - 1] != "") {
                    cnt--;
                    data2[i + cnt] = Math.round(data[i - 1]);
                }
            }
        }

    } else {
        for (var i = 0; i < dayscontrol.length; i++) {
            data2[i + cnt] = Math.round(data[i]);
            if (dayscontrol[i] != -1 && dayscontrol[i] != -30 && dayscontrol[i] != -31) {
                for (var t = 0; t < dayscontrol[i]; t++) {
                    cnt++;
                    data2[i + cnt] = "NO DATA";
                }
            }
            else if (dayscontrol[i] == -1) {
                if (data2[i + cnt] > data[i - 1]) {
                    cnt--;
                }
                else if (data2[i + cnt - 1] != "") {
                    cnt--;
                    data2[i + cnt] = Math.round(data[i - 1]);
                }
            }
        }
    }
    return data2;
}
/**
 * @description Function to get the missing or repeat day in an array of formated timestamp
 * @description Return a new array 
 * @description 0: the day isn't repat or missing 
 * * @description < 0: missing day 
 * * @description -1: repeat day
 * @param {Array} data - timestamp of the data source 
 * @param {*} days2 -  Map of days of the data source 
 * @param {*} month - Map of month of the data source 
 * @example dayscontrol = dayControlGraph(tempdate, day, monthtemp);
 * @returns {days_fixed}
 */
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
            } else if (month[i] == 2)
                days_fixed[i] = days4_fixed[i] + 28;
            else
                days_fixed[i] = days4_fixed[i] + 30;
        } else
            days_fixed[i] = days4_fixed[i];
    }
    return days_fixed;
}
/**
 * @description Function to remove from the screen the SVG and HTML element
 * @function remove
 * @description We identified the graphic elements with their id 
 * @param {*} title - id of the title svg element 
 * @param {*} axisX - id of the axis X svg element 
 * @param {*} axisY - id of the axis Y svg element 
 * @param {*} circle - id of the chart point svg element 
 * @param {*} sum - id of the sum svg element 
 * @param {*} incident - id of the sick incident  svg element 
 */
function removeGroup(title, axisX, axisY, circle, sum, incident) {
    d3.selectAll('#' + title).remove();
    d3.selectAll('#' + axisX).remove();
    d3.selectAll('#' + axisY).remove();
    d3.selectAll('#' + circle).remove();
    d3.selectAll('#' + sum).remove();
    d3.selectAll('#' + incident).remove();
}

/**
 * @function formatdateshow
 * This function transform a single date with a format (dd/mm) in new format (Jan 01)
 * We display this format of date on the screen
 * @param { Array } data of the JSON file
 * @param { String} year - year of the sick incident 
 * @return { day  } - Array of the new formating date of the JSoN File to display
 */
function formatdateshow(data, year) {
    let day = [];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let x = 0; x < data.length; x++) {
        for (let i = 1; i < months.length + 1; i++) {
            if (i <= 9 && "0" + i == data[x].split('-')[1] && year == "")
                day[x] = months[i - 1] + " " + data[x].split('-')[2]
            else if (i <= 9 && "0" + i == data[x].split('-')[1] && year != "")
                day[x] = months[i - 1] + " " + data[x].split('-')[2] + ", " + year
            else if (i > 9 && i == data[x].split('-')[1] && year == "")
                day[x] = months[i - 1] + " " + data[x].split('-')[2]
            else if (i > 9 && i == data[x].split('-')[1] && year != "")
                day[x] = months[i - 1] + " " + data[x].split('-')[2] + ", " + year
        }
    }
    return day;
}
/**
 * @function formatdateshow2
 * This function transform an array of date with a format (dd/mm) in new format (Jan 01)
 * We display this format of date on the screen 
 * @param { Array } data of the JSON file
 * @param { String} year - year of the sick incident 
 * @return { day  } - Array of the new formating date of the JSoN File to display
 */
function formatdateshow2(data, year) {
    let day = [];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let x = 0; x < data.length; x++) {
        for (let i = 1; i < months.length + 1; i++) {
            if (i <= 9 && "0" + i == data[x].split('/')[1] && year == "")
                day[x] = months[i - 1] + " " + data[x].split('/')[0]
            if (i <= 9 && "0" + i == data[x].split('/')[1] && year != "")
                day[x] = months[i - 1] + " " + data[x].split('/')[0] + ", " + year
            if (i > 9 && i == data[x].split('/')[1] && year == "")
                day[x] = months[i - 1] + " " + data[x].split('/')[0]
            if (i > 9 && i == data[x].split('/')[1] && year != "")
                day[x] = months[i - 1] + " " + data[x].split('/')[0] + ", " + year
        }
    }
    return day;
}
parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f%Z");
parseTimeFitbitintrday = d3.timeParse("%Y-%m-%d %H:%M:%S +00:00");
parseTimeOuraSleep = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
parseTimeTemp = d3.timeParse("%Y-%m-%d");
formatyear = d3.timeFormat("%y");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");
parseTimeGarmin = d3.timeParse("%Y-%m-%dT%H:%M:%S");

/**
 * @function precise
 * This function give a number with a precision of two decimal 
 * @param {*} x 
 * @returns {number}
 */
function precise(x) {
    return Number.parseFloat(x).toPrecision(2);
}
