/**
 * @author Basile Morane
 * @description heart_rate.js (javascript). Juin 2020
 * @fileOverview This file is useful for displaying on screen the graphics of the data source connected with our account
 */
/** @type {number} */comparedateApple = 0;
/** @type {number} */comparedate = 0;
/** @type {number} */comparedate_fitbit = 0;
/** @type {Array} */finaldataAppleWatch = [];
/** @type {Array} */finaldataOuraTemperature = [];
/** @type {Array} */finaldataOura = [];
/** @type {Array} */finaldata_fitbit = [];
/** @type {Array} */finaldata_garmin = [];
/** @type {Array} */finaldataGoogle = [];
/** @type {Array} */finaldataOuraRes = [];
/** @type {Array} */comparateDayReportWearable = [];
/** @type {Array} */symptom_data_heatmap = [];
/**
 * @description	main function which allows you to display the graphics corresponding to the existing data. 
 * @param { Array } data of the JSON file
 */
function main_wearable_data(data) {
    fitbit = controlWearableDatafromfile(data, 'fitbit');
    apple = controlWearableDatafromfile(data, 'apple');
    oura = controlWearableDatafromfile(data, 'oura');
    ouraHR = controlWearableDatafromfile(data, 'ouraHR');
    garmin = controlWearableDatafromfile(data, 'garmin');
    google = controlWearableDatafromfile(data, 'google');
    ourares = controlWearableDatafromfile(data, 'ourares');
    axis = [];
    maxHr = 0;
    revert = [0, 0, 0, 0, 0, 0, 0];
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
    if (garmin == true) {
        revert[4] = 1;
        maxHr++;
    }
    if (google == true) {
        revert[5] = 1;
        maxHr++;
    }
    if (fitbit != true && apple != true && ouraHR != true && oura != true && garmin != true && google != true && ourares != true)
        revert[0] = 1;
    if (fitbit != true && apple != true && ouraHR != true && oura != true && garmin != true && google != true && oura != true)
        revert[6] = 1;
    cntbttHr = maxHr;
    if (fitbit == true || apple == true || oura == true || ouraHR == true || garmin == true || google == true || ourares == true) {
        symptom_report = getSymptomDatafromFile(0);
        daysAxis = getDayonAxis(completedDays);
        createWearableDataSvg('wearable-graph', ((completedDays.length) * gridSize), 'wearable-legend', (heightGraph * 1.1), 'wearable-title', (margin.top * 1.5), 'wearable-choice');
        createLegendAxeX(maingroup, formatdateshow2(daysAxis, ""));
        createLegendAxeY(legendgroup, "null", "");
        getreportedSickIncident(maingroup, symptom_report);
        getButtonChoice(makeAchoice, legendgroupphone);
        tooltipChoice(data);
        tooltipInformation('circle-information');
        var winScroll = document.getElementById("heatmap").scrollLeft;
        document.getElementById("wearable-graph").scroll((winScroll), 0);

        document.getElementById("wearable-graph").onscroll = function () {
            var winScroll = document.getElementById("wearable-graph").scrollLeft;
            document.getElementById("heatmap").scroll((winScroll), 0);
        }
    } else d3.select('#wearable-container').remove();
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
 * @function addorRemoveday
 * @function getSymptomDatafromFile
 * @function compareDateReport
 */
function controlDatafromGarmin(data) {
    getHeartRateDatafromGarmin(data);
    controlday_garmin = controlDay(garminday, garminday, garminmonth);
    noMissingDay_garmin = addorRemoveday(controlday_garmin, getDays(), data);
    comparedate_garmin = compareDateReport(noMissingDay_garmin);
    garmin_date = completedLastDay(comparedate_garmin, noMissingDay_garmin);
    dayAxis_garmin = getDayonAxis(garmin_date);
    monthOnAxis_garmin = determinenamemonth(garmin_date);
    finaldata_garmin = dataControl(garmindata, garminday, garminday, garminmonth, comparedate_garmin);
    symptomData_garmin = getSymptomDatafromFile(0);
    garminAxis = getAxisLegend(finaldata_garmin, 'dizaine');
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
function mainContainer_garmin_heartrate(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[4] == 1) {
        removeGroup('circle-garmin-cnt', 'garmin-axisY-cnt', 'garmin-title-cnt', 'garmin-sum');
        createSumdata(maingroupapple, prob, dataAxis, 'garmin-sum', completedDays.length);
        createChartePoint(maingroupapple, finaldata_garmin, dataAxis, "circle-garmin-cnt", "#e78ac3", (gridSize / 10),0);
        tooltip("circle-garmin-cnt", garmin_date, "bpm");
    } else {
        removeGroup('circle-garmin-cnt', 'garmin-axisY-cnt', 'garmin-title-cnt', 'garmin-sum');
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
function loadDatafromFitbit(data) {
    fitbitdata = [], fitbitdate = [], fitbitday = [], fitbitmonth = [], fitbityear = [];
    symptomData_fitbit = [];
    controlDatafromFitbit(data);
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
 * @function addorRemoveday
 * @function getSymptomDatafromFile
 * @function compareDateReport
 */
function controlDatafromFitbit(data) {
    getFitbitSummaryFromFile(data);
    controlday_fitbit = controlDay(fitbitday, fitbitday, fitbitmonth);
    noMissingDay_fitbit = addorRemoveday(controlday_fitbit, getDays(), data);
    comparedate_fitbit = compareDateReport(noMissingDay_fitbit);
    fitbit_date = completedLastDay(comparedate_fitbit, noMissingDay_fitbit);
    dayAxis_fitbit = getDayonAxis(fitbit_date);
    monthOnAxis_fitbit = determinenamemonth(fitbit_date);
    finaldata_fitbit = dataControl(fitbitdata, fitbitday, fitbitday, fitbitmonth, comparedate_fitbit);
    symptomData_fitbit = getSymptomDatafromFile(0);
    fitbitAxis = getAxisLegend(finaldata_fitbit, 'dizaine');
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
function mainContainer_fitbit_summary_heartrate(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[2] == 1) {
        removeGroup('circle-fitbit-cnt', 'fitbit-axisY-cnt', 'fitbit-title-cnt', 'fitbit-sum');
        createSumdata(maingroupapple, prob, dataAxis, 'fitbit-sum', completedDays.length);
        createChartePoint(maingroupapple, finaldata_fitbit, dataAxis, "circle-fitbit-cnt", "#fc8d62", (gridSize / 10), 0);
        tooltip("circle-fitbit-cnt", fitbit_date, "bpm");
    } else {
        removeGroup('circle-fitbit-cnt', 'fitbit-axisY-cnt', 'fitbit-title-cnt', 'fitbit-sum');
    }
}
/**
 * @description APPLE WATCH - Heart Rate 
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromAppleWatch
 */
function loadDatafromAppleWatch(data) {
    dayapp = [], monthapp = [], appledata = [], appleday = [], appleyear = [], symptomData = [];
    cnt = 0, appledate = [], repeat = [], noRepeatDataApple = [];
    controlDatafromAppleWatch(data);
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
 * @function addorRemoveday
 * @function getSymptomDatafromFile
 * @function compareDateReport
 */
function controlDatafromAppleWatch(data) {
    getAppleDatafromFile(data);
    controlday = controlDay(appleday, dayapp, monthapp);
    noMissingDay = addorRemoveday(controlday, getDays(), data);
    comparedateApple = compareDateReport(noMissingDay);
    apple_date = completedLastDay(comparedateApple, noMissingDay);
    appledayAxis = getDayonAxis(apple_date);
    applemonth = determinenamemonth(apple_date);
    finaldataAppleWatch = dataControl(appledata, appleday, dayapp, monthapp, comparedateApple);
    heartrateAxis = getAxisLegend(finaldataAppleWatch, 'dizaine');
    symptomData = getSymptomDatafromFile(0);
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
function mainContainer_HeartRate_Apple_Watch(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[1] == 1) {
        removeGroup('circle-apple-watch-ctn', 'apple-axisY-ctn', 'apple-title-ctn', 'apple-sum', 'apple-axisY-ctn-2', 'apple-axisY-ctn');
        createSumdata(maingroupapple, prob, dataAxis, 'apple-sum', completedDays.length);
        createChartePoint(maingroupapple, finaldataAppleWatch, dataAxis, "circle-apple-watch-ctn", "#66c2a5", (gridSize / 10), 0)
        tooltip("circle-apple-watch-ctn", apple_date, "bpm");
    } else {
        removeGroup('circle-apple-watch-ctn', 'apple-axisY-ctn', 'apple-title-ctn', 'apple-sum', 'apple-axisY-ctn-2', 'apple-axisY-ctn');
    }
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @function loadDatafromOura
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromOuraSleep
 */
function loadDatafromOura(data) {
    ouradata = [], ouraday = [], ourayear = [], ouradayAxis = [], ouradate = [], repeat = [], noRepeatData = [];
    ouraday = [];
    ouramonth = [];
    controlDatafromOuraSleep(data);
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @function controlDatafromOuraSleep
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getHeartRatefromFileOura
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function getAxisLegend
 * @function addorRemoveday
 * @function getSymptomDatafromFile
 * @function compareDateReport
 */
function controlDatafromOuraSleep(data) {
    getHeartRatefromFileOura(data);
    controlday = controlDay(ouradate, ouraday, ouramonth);
    noMissingDay = addorRemoveday(controlday, getDays(), data);
    ouracomparedate = compareDateReport(noMissingDay);
    oura_date = completedLastDay(ouracomparedate, noMissingDay);
    ouradayAxis = getDayonAxis(oura_date);
    ouramonth = determinenamemonth(oura_date);
    finaldataOura = dataControl(ouradata, ouradate, ouraday, ouramonth, ouracomparedate);
    ouraAxis = getAxisLegend(finaldataOura, 'dizaine');
    symptomData = getSymptomDatafromFile(0);
}
/**
 * @description OURA SUMMARRY -  Heart Rate
 * @function mainContainer_heart_rate_oura_sleep
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 * @param {*} prob - non utilised variable 
 */
function mainContainer_heart_rate_oura_sleep(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[3] == 1) {
        removeGroup('circle-oura-heart-rate-ctn', 'oura-heart-rate-title-ctn', 'oura-heart-rate-axisY-cnt', 'oura-heart-rate-sum');
        createSumdata(maingroupapple, prob, dataAxis, 'oura-heart-rate-sum',completedDays.length);
        createChartePoint(maingroupapple, finaldataOura, dataAxis, "circle-oura-heart-rate-ctn", "#8da0cb", (gridSize / 10),0);
        tooltip("circle-oura-heart-rate-ctn", oura_date, "bpm");
    } else
        removeGroup('circle-oura-heart-rate-ctn', 'oura-heart-rate-title-ctn', 'oura-heart-rate-axisY-cnt', 'oura-heart-rate-sum');
}
/**
 * @description Google fit -  Heart Rate
 * @function loadDatafromGoogle
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromGoogleFit
 */
function loadDatafromGoogle(data) {
    googledata = [], googleday = [], googleyear = [], googledayAxis = [], googledate = [], repeat = [], noRepeatData = [];
    googleday = [];
    googlemonth = [];
    controlDatafromGoogleFit(data);
}
/**
 * @description Google fit -  Heart Rate
 * @function controlDatafromGoogleFit
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get compare / axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getHeartRatefromFileGoogle
 * @function controlDay
 * @function getDayonAxis
 * @function dataControlOura
 * @function addDayonGraphic
 * @function addorRemoveday
 * @function getSymptomDatafromFile
 * @function compareDateReport
 */
function controlDatafromGoogleFit(data) {
    /* Recupérer les données dans le fichier*/
    getHeartRatefromFileGoogle(data);

    /*Find the day */
    controlday = controlDay(googledate, googleday, googlemonth);
    noMissingDay = addorRemoveday(controlday, getDays(), data);
    googlecomparedate = compareDateReport(noMissingDay);
    google_date = completedLastDay(googlecomparedate, noMissingDay);

    googledayAxis = getDayonAxis(google_date);
    googlemonth = determinenamemonth(google_date);
    finaldataGoogle = dataControlOura(googledata, googledate, googleday, googlemonth, 1);
    googleAxis = getAxisLegend(finaldataGoogle, 'dizaine');
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(0);
}
/**
 * @description Google fit -  Heart Rate
 * @function mainContainer_heart_rate_google_fit
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} dataAxis- values of the axis X 
 * @param {*} maingroup- svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendgroup - svg element to display the caption of the Y axis 
 * @param {*} titlegroup - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 * @param {*} prob - non utilised variable 
 */
function mainContainer_heart_rate_google_fit(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[5] == 1) {
        removeGroup('circle-google-heart-rate-ctn', 'google-heart-rate-title-ctn', 'google-heart-rate-axisY-cnt', 'google-heart-rate-sum');
        createSumdata(maingroupapple, prob, dataAxis, 'google-heart-rate-sum', completedDays.length);
        createChartePoint(maingroupapple, finaldataGoogle, dataAxis, "circle-google-heart-rate-ctn", "#a6d854", (gridSize / 10),0);
        tooltip("circle-google-heart-rate-ctn", google_date, "bpm");
    } else
        removeGroup('circle-google-heart-rate-ctn', 'google-heart-rate-title-ctn', 'google-heart-rate-axisY-cnt', 'google-heart-rate-sum');
}
/**
 * @description OURA - Oura Respiratory Rate
 * @function loadDataFromOura_RespiratoryRate
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatarespiratory_ratefromOura
 */
function loadDataFromOura_RespiratoryRate(data) {
    resdata = [], resday = [], resyear = [], resdayAxis = [], resdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthres = [];
    controlDatarespiratory_ratefromOura(data);
}
/**
 * @description OURA - Oura Respiratory Rate
 * @function controlDatarespiratory_ratefromOura
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getRespiratory_rateDatafromFile
 * @function controlDay
 * @function getDayonAxis
 * @function dataControl
 * @function addorRemoveday
 * @function getSymptomDatafromFile
 * @function compareDateReport
 */
function controlDatarespiratory_ratefromOura(data) {
    getRespiratory_rateDatafromFile(data);
    controldayRes = controlDay(resday, day, monthres);
    noMissingDayRes = addorRemoveday(controldayRes, getDays(), data);
    comparedate = compareDateReport(noMissingDayRes);
    oura_dateRes = completedLastDay(comparedate, noMissingDayRes);
    ResdayAxis = getDayonAxis(oura_dateRes);
    monthRes = determinenamemonth(oura_dateRes);
    finaldataOuraRes = dataControl(resdata, resday, day, monthres, comparedate);
    axisRes_oura = getAxisLegend(finaldataOuraRes, 'dizaine');
    symptomData = getSymptomDatafromFile(0);
}
/**
 * @description OURA - Oura Respiratory Rate
 * @function mainContainer_RespiratoryRate_oura
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
        removeGroup('circle-resp-ctn', 'oura-resp-axisY-cnt', 'oura-resp-title-ctn', 'oura-resp-sum', 'oura-resp-axisY-cnt-2', 'oura-resp-axisY-cnt');
        createSumdata(maingroupapple, prob, axisRes_oura, 'oura-sum', completedDays.length);
        createChartePoint(maingroupapple, finaldataOuraRes, axisRes_oura, "circle-resp-ctn", "#97BC5F", (gridSize / 10),0);
        createTitle(titleapple, "Respiratory rate evolution", 'oura-resp-title-ctn', '50%');
        createLegendAxeY(legendapple, axisRes_oura, "RESPIRATORY RATE", 'oura-resp-axisY-cnt');
        tooltip("circle-resp-ctn", oura_dateRes, "");
    } else {
        removeGroup('circle-resp-ctn', 'oura-resp-axisY-cnt', 'oura-resp-title-ctn', 'oura-resp-sum', 'oura-resp-axisY-cnt-2', 'oura-resp-axisY-cnt');
    }
}
/**
 * @description OURA - Temperature
 * @function loadDataFromOura_Temperature
 * @description Load the variable needed to display the svg element - chart pie 
 * @description Get the sum & standart deviation / axis X day / Axis Y values / data point / reported sick incdent 
 * @param {Array} data - variable JSON file data
 * @function controlDatafromOura
 */
function loadDataFromOura_Temperature(data) {
    tempdata = [], tempday = [], tempyear = [], tempdayAxis = [], tempdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthtemp = [];
    controlDatafromOura(data);
}
/**
 * @description OURA - Temperature
 * @function controlDatafromOura
 * @description Get and control all the element we need to display the graphics of this data source 
 * @description Get axis Y values element / data values / axis X element - days 
 * @param {Array} data - variable JSON file data
 * @function getOuraTemperatureDatafromFile
 * @function controlDay
 * @function getDayonAxis
 * @function getAxisLegend
 * @function completedLastDay
 * @function ompareDateReport
 * @function determinenamemonth
 * @function getSymptomDatafromFile
 */
function controlDatafromOura(data) {
    getOuraTemperatureDatafromFile(data);
    controldayTemp = controlDay(tempday, day, monthtemp);
    noMissingDayTemp = addorRemoveday(controldayTemp, getDays(), data);
    comparedate = compareDateReport(noMissingDayTemp);
    oura_date = completedLastDay(comparedate, noMissingDayTemp);
    tempdayAxis = getDayonAxis(oura_date);
    month = determinenamemonth(oura_date);
    finaldataOuraTemperature = dataControl(tempdata, tempday, day, monthtemp, comparedate);
    axisTemperature_oura = getAxisLegend(finaldataOuraTemperature, 'decimal');
    symptomData = getSymptomDatafromFile(0);
}
/**
 * @description OURA - Temperature
 * @description Display on screen (if data source selected) all svg element depending from this data source 
 * @description Chart point - Axis X - Axis Y - Sum & standart deviation - reported incident - data on tooltip 
 * @param {*} data - null
 * @param {*} maingroupapple - svg element to display the chart point, the caption of the X axis and visualiton of the data of the selected circle
 * @param {*} legendapple - svg element to display the caption of the Y axis 
 * @param {*} titleapple - svg element to display the title
 * @param {*} revert - variable of click mouse gestion 
 */
function mainContainer_temperature_oura_sleep_summary(data, maingroupapple, legendapple, titleapple, revert) {
    if (revert[0] == 1) {
        removeGroup('circle-temperature-ctn', 'oura-axisY-cnt', 'oura-title-ctn', 'oura-sum', 'oura-axisY-cnt-2', 'oura-axisY-cnt');
        createSumdata(maingroupapple, prob, axisTemperature_oura, 'oura-sum', completedDays.length);
        createChartePoint(maingroupapple, finaldataOuraTemperature, axisTemperature_oura, "circle-temperature-ctn", "#beaed4", (gridSize / 10),0);
        createTitle(titleapple, "Temperature evolution", 'oura-title-ctn', '50%');
        createLegendAxeY(legendapple, axisTemperature_oura, "BODY TEMPERATURE", 'oura-axisY-cnt');
        tooltip("circle-temperature-ctn", oura_date, "");
    } else {
        removeGroup('circle-temperature-ctn', 'oura-axisY-cnt', 'oura-title-ctn', 'oura-sum', 'oura-axisY-cnt-2', 'oura-axisY-cnt');
    }
}
/**
 * @description Function to remove from the screen the SVG and HTML element
 * @function remove
 * @description We identified the graphic elements with their id 
 * @param {*} iddata id of the chart point svg element
 * @param {*} idtitle - id of the title svg element 
 * @param {*} idaxis id of the axis X svg element 
 * @param {*} idaxis2 id of the axis Y svg element 
 * @param {*} idaxis3 id of the sum svg element 
 * @param {*} idaxis4 id of the sick incident  svg element 
 */
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
                .style("stroke", "#015483")
                .style("stroke-width", "0.5");
            tooltip.style("visibility", "hidden");
        });
}
/**
 * @description This function display on the screen an information message to user
 * @param {*} circleid - id of the circle 
 */
function tooltipInformation(circleid) {
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "svg-tooltip-information")
        .style("position", "absolute")
        .style("visibility", "hidden");
    d3.selectAll("#" + circleid)
        .on("mouseover", function (d) {
            d3.select(this)
                .attr("r", gridSize / 4)
                .attr('stroke-width', 2)
            tooltip
                .style("visibility", "visible")
                .text(
                    "Use a single click to activate/deactivate a data source. \n Double click to hide all but the clicked data source."
                );
        })
        .on("mousemove", function () {
            tooltip
                .style("top", d3.event.pageY - (gridSize * 2) + "px")
                .style("left", d3.event.pageX - (gridSize * 8) + "px");
        })

        .on("mouseout", function () {
            d3.select(this).attr("r", gridSize / 5)
                .style("stroke", "#DEDEDE")
                .style("stroke-width", "1");

            tooltip.style("visibility", "hidden");
        });
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
    axis = getCombineAxisY(revert);
    prob = getSum(revert);
    groupGraphic(data);
    d3.selectAll("#circle-choice-heartrate")
        .on("click", function (d) {
            classButton = this.getAttribute('class');
            controlGestionclick();
            prob = getSum(revert);
            axis = getCombineAxisY(revert);
            groupGraphic();
            selectedGroupButton();
        })

    d3.selectAll("#circle-choice-heartrate").on("dblclick", function (d) {
        classButton = this.getAttribute('class');
        controlGestiondbclick();
        prob = getSum(revert);
        axis = getCombineAxisY(revert);
        groupGraphic();
        selectedGroupButton();
    })
}
/**
 * @function loadGroupDataSource
 * @description Function to load all the data from the data source existing in the file JSON and put it in local variable
 * @param { Array } data of the JSON file
 */
function loadGroupDataSource(data) {
    if (apple == true) {
        loadDatafromAppleWatch(data);
    }
    if (fitbit == true) {
        loadDatafromFitbit(data);
    }
    if (ouraHR == true) {
        loadDatafromOura(data);
    }
    if (oura == true) {
        loadDataFromOura_Temperature(data);
    }
    if (garmin == true) {
        loadDatafromGarmin(data);
    }
    if (google == true) {
        loadDatafromGoogle(data);
    }
    if (ourares == true)
        loadDataFromOura_RespiratoryRate(data);
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
        if ((cal[i] != (cal2[i] + "/1"))) cal2[i] += '/0';
        else cal2[i] = cal[i];
    }
    return cal2;
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

    if (revert[0] == 1 && revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0) {
        for (let i = 0; i < finaldataOuraTemperature.length; i++) {
            data[i] = finaldataOuraTemperature[i];
        }
    }
    if (revert[6] == 1 && revert[0] == 0 && revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0) {
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
        for (let i = 0; i < finaldata_fitbit.length; i++) {
            data[i + cnt1] = finaldata_fitbit[i];
            cnt2++;
            cnt3++;
            cnt4++;
            cnt5++;
        }
    }
    if (revert[3] == 1 && revert[0] == 0) {
        for (let i = 0; i < finaldataOura.length; i++) {
            data[i + cnt2] = finaldataOura[i];
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
        }
    }
    if (revert[0] == 0 && revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0 && revert[6] == 0)
        prop = [0, 0, 0, 0, 0, 0];
    else
        prop = calculatSum(data);
    return prop;
}
/* Functions - Get element variable display */
/**
 * @description Instancy the svg variable with a HTML div (width, height...)
 * @param {*} div1 - maingroup - dislay of the graphics and X-axis
 * @param {*} widthdiv1 - width of the size depending of the number of days
 * @param {*} div2 legendgroup - display of the Y-axis
 * @param {*} heightdiv2 
 * @param {*} div3 ) titlegroup - display of the title graphics
 * @param {*} heightdiv3 
 * @param {*} divChoice - div with id "makeAchoice"
 */
function createWearableDataSvg(div1, widthdiv1, div2, heightdiv2, div3, heightdiv3, divChoice) {
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

    makeAchoice = d3.select('#' + divChoice)
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", heightdiv2)

    legendgroupphone = d3.select('#wearable-legend-phone')
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", gridSize * 5.5);
}
/**
 * @description Display on screen the button which allow us to display or not all the available data source 
 * @param {Element} svgName - svg element name  
 * @function createButton
 * @function setAttributButton
 */
function getButtonChoice(svgName, svgPhone) {
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
    setAttributButton(1);
    svgName.append("circle")
        .attr('id', 'circle-information')
        .attr('class', 'mg-chart-description')
        .attr("cx", 70 + "%")
        .attr("cy", '2.5%')
        .attr("r", (gridSize / 5))
        .style("fill", "#DEDEDE")
        .style("stroke", "#DEDEDE")
        .style("stroke-width", "1");

    svgName.append("text")
        .attr('id', 'circle-information-text')
        .attr('class', 'mg-chart-description')
        .text("?")
        .attr("x", 69 + "%")
        .attr("y", '3.5%')
        .style("font-size", (gridSize / 3))
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .style("fill", "grey");

    createButton(svgName, 1, classname, legendname, colorscale, 0, (gridSize * .2));
    createButton(svgName, 2, classnameHeartRate, legendnameHeartRate, colorscaleHeartRate, (classname.length * gridSize * 1.5), (classname.length * gridSize * 1.55));
    createButton(svgName, 2, classnameTemperature, legendnameTemperature, colorscaleTemperature, (gridSize * .8), (gridSize * .9));
    createButton(svgName, 2, classnameRespirator, legendnameRespirator, colorscaleRespirator, (gridSize * 2.8), (gridSize * .9));

    createButtonPhone(svgPhone, 1, classname, legendname, colorscale, 0, (gridSize * .2));
    createButtonPhone(svgPhone, 2, classnameTemperature, legendnameTemperature, colorscaleTemperature, (gridSize * .8), (0));
    createButtonPhone(svgPhone, 2, classnameRespirator, legendnameRespirator, colorscaleRespirator, (gridSize * 1.8), ((classname.length - 1) * 12.5));
    createButtonPhone(svgPhone, 2, classnameHeartRate, legendnameHeartRate, colorscaleHeartRate, (classname.length * gridSize * .8), ((classname.length - 1) * 25));

    svgName.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 0 + "%")
        .attr("y1", margin.top / 2)
        .attr("x2", 0 + "%")
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "1");
}
/**
 * @description Display on screen an button element svg with it own id and classname 
 * @description Available on computer
 * @param {*} svgName - element svg
 * @param {*} type - 1: categories / 2; data source
 * @param {*} dataclassname specific button class 
 * @param {*} datalegend - specific button text
 * @param {*} datacolor - specific button color
 * @param {*} marginTop1 - x position 
 * @param {*} marginTop2 - y position 
 */
function createButton(svgName, type, dataclassname, datalegend, datacolor, marginTop1, marginTop2) {
    svgName.selectAll('circle-choice')
        .data(dataclassname)
        .enter()
        .append("circle")
        .attr('id', 'circle-choice-heartrate')
        .attr('class', function (d, i) { return dataclassname[i] })
        .attr("cx", gridSize * 1 * type)
        .attr("cy", function (d, i) {
            return (margin.top / 1.5 + marginTop1 / 1.2) + (i * gridSize * .8 * (3 - type))
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
        .attr('class', 'legend-graph-text')
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d) {
            if (type == 1)
                return (gridSize * 1.7)
            else if (type == 2)
                return (gridSize * 2.4)
        })
        .attr("y", function (d, i) {
            return (margin.top / 1.5 + marginTop1 / 1.2) + (i * gridSize * .8 * ((2 - type) + 1.01))
        })
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .attr("font-size", (1.2 - (type / 4)) + "rem");
}
/**
 * @description Display on screen an button element svg with it own id and classname 
 * @description Available on phone 
 * @param {*} svgName - element svg
 * @param {*} type - 1: categories / 2; data source
 * @param {*} dataclassname specific button class 
 * @param {*} datalegend - specific button text
 * @param {*} datacolor - specific button color
 * @param {*} marginTop1 - x position 
 * @param {*} marginTop2 - y position 
 */
function createButtonPhone(svgName, type, dataclassname, datalegend, datacolor, marginTop1, marginTop2) {
    svgName.selectAll('circle-choice').data(dataclassname).enter().append("circle").attr('id', 'circle-choice-heartrate').attr('class', function (d, i) { return dataclassname[i] })
        .attr("cx", function (d, i) {
            if ((type == 1 && i == 0) || (type == 1 && i == 2))
                return ((i * 25) + 5 + '%')
            else if (type == 1 && i == 1)
                return (5 + '%')
            else if (dataclassname == classnameRespirator)
                return (5 + '%')
            else if (type == 2) return 5 + (marginTop2) + '%'
        })
        .attr("cy", function (d, i) {
            if ((type == 1 && i == 0) || (type == 1 && i == 2))
                return (margin.top / 2 + marginTop1)
            else if (type == 1 && i == 1)
                return (gridSize * 2.75)
            else if (dataclassname == classnameRespirator)
                return ((gridSize * 3.75))
            else if (type == 2) return (15) + ((i + 1) * 15) + '%'
        }).attr("r", gridSize / (2 * type)).attr("stroke", "#e2e2e2")
        .style("fill", function (d, i) {
            if (type == 1 && d == 'Temperature') {
                createLinearGradient(svgName, colorscaleTemperature, d);
                return "url(#" + d + ")"
            } else if (type == 1 && d == 'HeartRate') {
                createLinearGradient(svgName, colorscaleHeartRate, d);
                return "url(#" + d + ")"
            }
            else return datacolor[i];
        });

    svgName.selectAll(".daysLabel")
        .data(datalegend)
        .enter().append("text")
        .attr("class", function (d, i) {
            if (type == 1) return 'class-button-choice';
            else return 'data-source-button-choice';
        })
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d, i) {
            if ((type == 1 && i == 0) || (type == 1 && i == 2))
                return ((i * 25) + 3 + '%')
            else if (type == 1 && i == 1)
                return (3 + '%')
            else if (dataclassname == classnameRespirator)
                return (3 + '%')
            else if (type == 2)
                return 3 + (marginTop2) + '%'
        })
        .attr("y", function (d, i) {
            if ((type == 1 && i == 0) || (type == 1 && i == 2))
                return (margin.top / 2 + marginTop1 + gridSize / 4)
            else if (type == 1 && i == 1)
                return (gridSize * 3)
            else if (dataclassname == classnameRespirator)
                return (gridSize * 3.95)
            else if (type == 2)
                return (17) + ((i + 1) * 15) + '%'
        })
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .attr("transform", "translate(" + gridSize / .9 + "," + 0 + ")");
}

/**
 * @function groupGraphic
 * @description function to group and display all the differente data source
 * @description Control display of the X-axis / Y-axis / Title graphic
 * @param {*} data - JSON file
*/
function groupGraphic(data) {
    if (revert[1] == 1 || revert[2] == 1 || revert[3] == 1 || revert[4] == 1 || revert[5] == 1) {
        d3.select('#heart-rate-title-ctn').remove();
        d3.selectAll('#heart-rate-axisY-cnt').remove();
        createTitle(titlegroup, "Heart rate evolution", 'heart-rate-title-ctn', '50%');
        createLegendAxeY(legendgroup, axis, "HEART RATE [BPM]", 'heart-rate-axisY-cnt');
    }
    else if (revert[1] == 0 && revert[2] == 0 && revert[3] == 0 && revert[4] == 0 && revert[5] == 0) {
        d3.select('#heart-rate-title-ctn').remove();
        d3.selectAll('#heart-rate-axisY-cnt').remove();
    }

    mainContainer_heart_rate_google_fit(axis, maingroup, legendgroup, titlegroup, revert, prob);
    mainContainer_garmin_heartrate(axis, maingroup, legendgroup, titlegroup, revert, prob);
    mainContainer_temperature_oura_sleep_summary(data, maingroup, legendgroup, titlegroup, revert);
    mainContainer_HeartRate_Apple_Watch(axis, maingroup, legendgroup, titlegroup, revert, prob);
    mainContainer_fitbit_summary_heartrate(axis, maingroup, legendgroup, titlegroup, revert, prob);
    mainContainer_heart_rate_oura_sleep(axis, maingroup, legendgroup, titlegroup, revert, prob);
    mainContainer_RespiratoryRate_oura(axis, maingroup, legendgroup, titlegroup, revert, prob);

}


