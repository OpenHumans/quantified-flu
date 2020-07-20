/**
 * @author Basile Morane
 * @description event.js (javascript). Juillet 2020
 * @fileOverview This file is useful for displaying on screen the graphics of a sick incident
 */
/** @type {number} */gridSize = 29;
/** @type {number} */heightGraph = 14 * gridSize;
/** @type {number} */margin = {top: 2,right: -2,bottom: 27,left: 2};
creategraphics(url); 
/** * @description	Acces to the JSON file 
 * @param { String } url of the JSON file
 */ function creategraphics(url) {
    $.getJSON(url, function (data) {
        main(data);
    })
} /** * @description	Allows you to know which graph will be displayed first 
 * @description	order - (heart rate - temperature - respiration rate)
 */ function setrevert () {
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
} /** * @description	main function which allows you to display the graphics corresponding to the existing data. 
 * @param { Array } data of the JSON file
 */ function main(data) {
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
} /** * @function sickness_event
 * @description	function to get the difference of days between the first and the sick incident day
 * @param { Array } data of the JSON file
 * @param { String} datecompare - date of the sick incident 
 * @return { incident } number of day between the first day and the date of the sick incident 
 */ function sickness_event(data, datecompare) {
    var date_incidentInfile = data.sickness_event[0].timestamp.split('-');
    var date_incident = date_incidentInfile[2] + '/' + date_incidentInfile[1];
    var incident = 0;
    for (let i = 0; i < datecompare.length; i++) {
        if (datecompare[i] == date_incident)
            incident = i;
    }
    return incident;
} /** * @function tooltipChoice
 * @description	function to control the display of the graphics with an inteface of multiple buttons (click / double click)
 * @param { Array } data of the JSON file
 */ function tooltipChoice(data) {
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
} /** * @function graphicsGroup
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
    if (revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0) {
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
} /** * @function loadGroupDataSource
 * @description	function to load all the data from the data source existing in the file JSON and put it in local variable
 * @param { Array } data of the JSON file
 */
function loadGroupDataSource(data) {
    if (fitbit == true) {
        loadDataFromFitbit(data);
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
        createSumdata(maingroup, propcombined, dataAxis, 'apple-sum', numberdaysongraph);
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
function loadDataFromFitbit(data) {
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
        createSumdata(maingroup, propcombined, dataAxis, 'fitbit-sum',numberdaysongraph);
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
        createSumdata(maingroup, propcombined, dataAxis, 'oura-sum',numberdaysongraph);
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
        createSumdata(maingroup, propcombined, dataAxis, 'google-sum',numberdaysongraph);
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
        createSumdata(maingroup, propcombined, dataAxis, 'garmin-sum',numberdaysongraph);
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
        createSumdata(maingroup, ouratemp_sum, TemperatureOuraAxis, 'oura-temp-sum',numberdaysongraph);
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
        createSumdata(maingroup, ouraresp_sum, axisRes_oura, 'oura-resp-sum',numberdaysongraph);
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
            cnt1++;cnt2++;cnt3++;cnt4++;cnt5++;
        }
    }
    if (revert[2] == 1 && revert[0] == 0) {
        for (let i = 0; i < newdataFitbit.length; i++) {
            data[i + cnt1] = newdataFitbit[i]; 
            cnt2++;cnt3++;cnt4++;cnt5++;
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
    setAttributButton(0);
    createButton(svgName, 1, classname, legendname, colorscale, 0, (gridSize * .2));
    createButton(svgName, 2, classnameHeartRate, legendnameHeartRate, colorscaleHeartRate, (classname.length), (classname.length * gridSize * 1.55));
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
