comparedateApple = 0;
comparedate = 0;
comparedate_fitbit = 0;
finaldataAppleWatch = [];
finaldataOuraTemperature = [];
finaldataOura = [];
finaldata_fitbit = [];
finaldata_garmin = [];
finaldataGoogle = [];
finaldataOuraRes = [];
comparateDayReportWearable = [];
symptom_data_heatmap = [];

function setrevert() {
    var revert = [0, 0, 0, 0];
    if (fitbit == true)
        revert[2] = 1;
    if (apple == true)
        revert[1] = 1;
    if (ouraHR == true)
        revert[3] = 1;
    if (fitbit != true && apple != true && ouraHR != true && oura == true)
        revert[0] = 1;
    return revert;
}

function main_wearable_data(data) {
    fitbit = controlWearableDatafromfile(data, 'fitbit');
    apple = controlWearableDatafromfile(data, 'apple');
    oura = controlWearableDatafromfile(data, 'oura');
    ouraHR = controlWearableDatafromfile(data, 'ouraHR');
    garmin = controlWearableDatafromfile(data, 'garmin');
    google = controlWearableDatafromfile(data, 'google');
    ourares = controlWearableDatafromfile(data, 'ourares');
    axis = [];
    //revert = setrevert ();
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
    if (fitbit == true || apple == true || oura == true || ouraHR == true || garmin == true || google == true || ourares== true) {
        symptom_report = getSymptomDatafromFile(0);
        month = determinenamemonth(completedDays);
        createWearableDataSvg('wearable-graph', ((completedDays.length) * gridSize), 'wearable-legend', (heightGraph * 1.1), 'wearable-title', (margin.top * 1.5), 'wearable-choice');
        createLegendAxeX(maingroup, this.days_axis);
        createLegendAxeY(legendgroup, "null", "");
        getreportedSickIncident(maingroup, symptom_report);
        getButtonChoice(makeAchoice, legendgroupphone);
        showMonthsAxis(maingroup, month, (heightGraph - 5));
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

/* Get all the variable data needed */

function controlDatafromGarmin(data) {
    getHeartRateDatafromGarmin(data);
    /* Find the day */
    controlday_garmin = controlDay(garminday, garminday, garminmonth);
    noMissingDay_garmin = addorRemoveday(controlday_garmin, getDays(), data);

    /* Get the difference between the day */
    comparedate_garmin = compareDateReport(noMissingDay_garmin);
    garmin_date = completedLastDay(comparedate_garmin, noMissingDay_garmin);
    dayAxis_garmin = getDayonAxis(garmin_date);
    monthOnAxis_garmin = determinenamemonth(garmin_date);

    /* Udpate the data with the missing day / repeat day */
    finaldata_garmin = dataControl(garmindata, garminday, garminday, garminmonth, comparedate_garmin);
    symptomData_garmin = getSymptomDatafromFile(0);
    garminAxis = getAxisLegend(finaldata_garmin, 'dizaine');
}

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

function controlDatarespiratory_ratefromOura(data) {
    /* Recupérer les données dans le fichier*/
    getRespiratory_rateDatafromFile(data);

    /*Find the day */
    controldayRes = controlDay(resday, day, monthres);
    noMissingDayRes = addorRemoveday(controldayRes, getDays(), data);
    comparedate = compareDateReport(noMissingDayRes);
    oura_dateRes = completedLastDay(comparedate, noMissingDayRes);

    ResdayAxis = getDayonAxis(oura_dateRes);
    monthRes = determinenamemonth(oura_dateRes);

    finaldataOuraRes = dataControl(resdata, resday, day, monthres, comparedate);
    axisRes_oura = getAxisLegend(finaldataOuraRes, 'dizaine');
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(0);
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

function controlDatafromOuraSleep(data) {
    /* Recupérer les données dans le fichier*/
    getHeartRatefromFileOura(data);

    /*Find the day */
    controlday = controlDay(ouradate, ouraday, ouramonth);
    noMissingDay = addorRemoveday(controlday, getDays(), data);
    ouracomparedate = compareDateReport(noMissingDay);
    oura_date = completedLastDay(ouracomparedate, noMissingDay);

    ouradayAxis = getDayonAxis(oura_date);
    ouramonth = determinenamemonth(oura_date);
    finaldataOura = dataControlOura(ouradata, ouradate, ouraday, ouramonth, ouracomparedate);
    ouraAxis = getAxisLegend(finaldataOura, 'dizaine');
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(0);
}

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

function loadDataFromOura_RespiratoryRate(data) {
    resdata = [], resday = [], resyear = [], resdayAxis = [], resdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthres = [];
    controlDatarespiratory_ratefromOura(data);
}
function mainContainer_RespiratoryRate_oura(data, maingroupapple, legendapple, titleapple, revert) {
    if (revert[6] == 1) {
        removeDataSource('circle-resp-ctn', 'oura-resp-axisY-cnt', 'oura-resp-title-ctn', 'oura-resp-sum', 'oura-resp-axisY-cnt-2', 'oura-resp-axisY-cnt');
        showSumdata(maingroupapple, prob, axisRes_oura, 'oura-sum');
        createChartePoint(maingroupapple, finaldataOuraRes, axisRes_oura, "circle-resp-ctn", "#97BC5F", (gridSize / 10));
        createTitle(titleapple, "Respiratory rate evolution", 'oura-resp-title-ctn', '50%');
        createLegendAxeY(legendapple, axisRes_oura, "RESPIRATORY RATE", 'oura-resp-axisY-cnt');
        /* Afficher les données */
        tooltip("circle-resp-ctn", oura_dateRes, "");
    } else {
        removeDataSource('circle-resp-ctn', 'oura-resp-axisY-cnt', 'oura-resp-title-ctn', 'oura-resp-sum', 'oura-resp-axisY-cnt-2', 'oura-resp-axisY-cnt');
    }
}
function loadDataFromOura_Temperature(data) {
    tempdata = [], tempday = [], tempyear = [], tempdayAxis = [], tempdate = [], repeat = [], noRepeatData = [];
    day = [];
    monthtemp = [];
    controlDatafromOura(data);
}
/* Function display for the main container */
function mainContainer_temperature_oura_sleep_summary(data, maingroupapple, legendapple, titleapple, revert) {
    if (revert[0] == 1) {
        removeDataSource('circle-temperature-ctn', 'oura-axisY-cnt', 'oura-title-ctn', 'oura-sum', 'oura-axisY-cnt-2', 'oura-axisY-cnt');
        showSumdata(maingroupapple, prob, axisTemperature_oura, 'oura-sum');
        createChartePoint(maingroupapple, finaldataOuraTemperature, axisTemperature_oura, "circle-temperature-ctn", "#beaed4", (gridSize / 10));
        createTitle(titleapple, "Temperature evolution", 'oura-title-ctn', '50%');
        createLegendAxeY(legendapple, axisTemperature_oura, "BODY TEMPERATURE", 'oura-axisY-cnt');
        /* Afficher les données */
        tooltip("circle-temperature-ctn", oura_date, "");
    } else {
        removeDataSource('circle-temperature-ctn', 'oura-axisY-cnt', 'oura-title-ctn', 'oura-sum', 'oura-axisY-cnt-2', 'oura-axisY-cnt');
    }
}
function loadDatafromGoogle(data) {
    googledata = [], googleday = [], googleyear = [], googledayAxis = [], googledate = [], repeat = [], noRepeatData = [];
    googleday = [];
    googlemonth = [];
    controlDatafromGoogleFit(data);
}
function mainContainer_heart_rate_google_fit(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[5] == 1) {
        removeDataSource('circle-google-heart-rate-ctn', 'google-heart-rate-title-ctn', 'google-heart-rate-axisY-cnt', 'google-heart-rate-sum');
        showSumdata(maingroupapple, prob, dataAxis, 'google-heart-rate-sum');
        createChartePoint(maingroupapple, finaldataGoogle, dataAxis, "circle-google-heart-rate-ctn", "#a6d854", (gridSize / 10));
        /* Afficher les données */
        tooltip("circle-google-heart-rate-ctn", google_date, "bpm");
    } else
        removeDataSource('circle-google-heart-rate-ctn', 'google-heart-rate-title-ctn', 'google-heart-rate-axisY-cnt', 'google-heart-rate-sum');
}
function loadDatafromOura(data) {
    ouradata = [], ouraday = [], ourayear = [], ouradayAxis = [], ouradate = [], repeat = [], noRepeatData = [];
    ouraday = [];
    ouramonth = [];
    controlDatafromOuraSleep(data);
}
function mainContainer_heart_rate_oura_sleep(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[3] == 1) {
        removeDataSource('circle-oura-heart-rate-ctn', 'oura-heart-rate-title-ctn', 'oura-heart-rate-axisY-cnt', 'oura-heart-rate-sum');
        showSumdata(maingroupapple, prob, dataAxis, 'oura-heart-rate-sum');
        createChartePoint(maingroupapple, finaldataOura, dataAxis, "circle-oura-heart-rate-ctn", "#8da0cb", (gridSize / 10));
        /* Afficher les données */
        tooltip("circle-oura-heart-rate-ctn", oura_date, "bpm");
    } else
        removeDataSource('circle-oura-heart-rate-ctn', 'oura-heart-rate-title-ctn', 'oura-heart-rate-axisY-cnt', 'oura-heart-rate-sum');
}

function loadDatafromAppleWatch(data) {
    dayapp = [], monthapp = [], appledata = [], appleday = [], appleyear = [], symptomData = [];
    cnt = 0, appledate = [], repeat = [], noRepeatDataApple = [];
    controlDatafromAppleWatch(data);
}
function mainContainer_HeartRate_Apple_Watch(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[1] == 1) {
        removeDataSource('circle-apple-watch-ctn', 'apple-axisY-ctn', 'apple-title-ctn', 'apple-sum', 'apple-axisY-ctn-2', 'apple-axisY-ctn');
        /* Element graphique */
        showSumdata(maingroupapple, prob, dataAxis, 'apple-sum');
        createChartePoint(maingroupapple, finaldataAppleWatch, dataAxis, "circle-apple-watch-ctn", "#66c2a5", (gridSize / 10))
        /* Afficher les données */
        tooltip("circle-apple-watch-ctn", apple_date, "bpm");
    } else {
        removeDataSource('circle-apple-watch-ctn', 'apple-axisY-ctn', 'apple-title-ctn', 'apple-sum', 'apple-axisY-ctn-2', 'apple-axisY-ctn');
    }
}

function loadDatafromFitbit(data) {
    fitbitdata = [], fitbitdate = [], fitbitday = [], fitbitmonth = [], fitbityear = [];
    symptomData_fitbit = [];
    controlDatafromFitbit(data);
}
function mainContainer_fitbit_summary_heartrate(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[2] == 1) {
        removeDataSource('circle-fitbit-cnt', 'fitbit-axisY-cnt', 'fitbit-title-cnt', 'fitbit-sum');
        /* Element graphique */
        showSumdata(maingroupapple, prob, dataAxis, 'fitbit-sum');
        createChartePoint(maingroupapple, finaldata_fitbit, dataAxis, "circle-fitbit-cnt", "#fc8d62", (gridSize / 10));
        /* Afficher les données */
        tooltip("circle-fitbit-cnt", fitbit_date, "bpm");
    } else {
        removeDataSource('circle-fitbit-cnt', 'fitbit-axisY-cnt', 'fitbit-title-cnt', 'fitbit-sum');
    }
}

function loadDatafromGarmin(data) {
    garmindata = [], garmindate = [], garminday = [], garminmonth = [], garminyear = [];
    symptomData_garmin = [];
    controlDatafromGarmin(data);
}
function mainContainer_garmin_heartrate(dataAxis, maingroupapple, legendapple, titleapple, revert, prob) {
    if (revert[4] == 1) {
        removeDataSource('circle-garmin-cnt', 'garmin-axisY-cnt', 'garmin-title-cnt', 'garmin-sum');
        /* Element graphique */
        showSumdata(maingroupapple, prob, dataAxis, 'garmin-sum');
        createChartePoint(maingroupapple, finaldata_garmin, dataAxis, "circle-garmin-cnt", "#e78ac3", (gridSize / 10));
        /* Afficher les données */
        tooltip("circle-garmin-cnt", garmin_date, "bpm");
    } else {
        removeDataSource('circle-garmin-cnt', 'garmin-axisY-cnt', 'garmin-title-cnt', 'garmin-sum');
    }
}

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
    if (sum > 1)
        sum = Math.round(sum / N);
    else
        sum = (sum / N);

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
function removeDataSource(iddata, idtitle, idaxis, idaxis2, idaxis3, idaxis4) {
    d3.selectAll("#" + iddata).remove();
    d3.selectAll("#" + idtitle).remove();
    d3.selectAll("#" + idaxis).remove();
    d3.selectAll("#" + idaxis2).remove();
    //d3.selectAll("#" + idaxis3).remove();
    //d3.selectAll("#" + idaxis4).remove();
}

/* GET THE DATA FROM FILE .JSON */
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

function getHeartRatefromFileOura(data) {
    cnt = 0;
    this.file = data.oura_sleep_5min.map(d => d);
    this.file.forEach(element => {
        ouradata[cnt] = element.data.heart_rate;
        ouradate[cnt] = formatdate(parseTimeOuraSleep(element.timestamp));
        ouraday[cnt] = formatdateday(parseTimeOuraSleep(element.timestamp));
        ouramonth[cnt] = formatdatemonth(parseTimeOuraSleep(element.timestamp));
        ourayear[cnt] = formatyear(parseTimeOuraSleep(element.timestamp));
        cnt++;
    });
}

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

function getCombineAxisY(revert) {
    var test = [];
    var cnt1 = 0;
    var cnt2 = 0;
    var cnt3 = 0;
    var cnt4 = 0;
    if (revert[1] == 1) {
        for (let i = 0; i < heartrateAxis.length; i++) {
            test[i] = heartrateAxis[i];
            cnt1++;
            cnt2++;
            cnt3++;
            cnt4++;
        }
    }
    if (revert[2] == 1) {
        for (let i = 0; i < fitbitAxis.length; i++) {
            test[i + cnt1] = fitbitAxis[i];
            cnt2++;
            cnt3++;
            cnt4++;
        }
    }
    if (revert[3] == 1) {
        for (let i = 0; i < ouraAxis.length; i++) {
            test[i + cnt2] = ouraAxis[i];
            cnt3++;
            cnt4++;
        }
    }
    if (revert[4] == 1) {
        for (let i = 0; i < garminAxis.length; i++) {
            test[i + cnt3] = garminAxis[i];
            cnt4++;
        }
    }
    if (revert[5] == 1) {
        for (let i = 0; i < googleAxis.length; i++) {
            test[i + cnt4] = googleAxis[i];
        }
    }
    test.sort();
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

function selectedCategories(classname, revert, stroke, max) {
    if (revert < max)
        d3.select('.' + classname).attr("width", ((gridSize / 2))).attr("height", ((gridSize / 2))).attr('stroke-width', 1);

    if (revert == max)
        d3.select('.' + classname).attr("width", ((gridSize / 2) - stroke)).attr("height", ((gridSize / 2) - stroke)).attr('stroke-width', stroke).attr("stroke", "#e2e2e2");
}

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
}

function controlGestionclick() {
    if ((classButton == 'oura' || classButton == 'Temperature') && revert[0] == 1) {
        revert[0] = 0;
        cntbttHr = 0;
        click = 0;
    }
    else if ((classButton == 'oura' || classButton == 'Temperature') && revert[0] == 0) {
        revert = [1, 0, 0, 0, 0, 0, 0];
        cntbttHr = 0;
        click = 0;
    }
    if ((classButton == 'ourares' || classButton == 'RespiratoryRate') && revert[6] == 1) {
        revert[6] = 0;
        cntbttHr = 0;
        click = 0;
    }
    else if ((classButton == 'ourares' || classButton == 'RespiratoryRate') && revert[6] == 0) {
        revert = [0, 0, 0, 0, 0, 0, 1];
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

    if (classButton == 'HeartRate' && click == 1) {
        if (cntbttHr == maxHr) {
            revert = [0, 0, 0, 0, 0, 0, 0];
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
        click = 1;
    }
}

function controlGestiondbclick() {

    if (classButton == 'apple') {
        revert = [0, 1, 0, 0, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    }
    else if (classButton == 'oura') {
        revert = [1, 0, 0, 0, 0, 0, 0];
        cntbttHr = 0;
        click = 0;
    } else if (classButton == 'fitbit') {
        revert = [0, 0, 1, 0, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    } else if (classButton == 'ouraHR') {
        revert = [0, 0, 0, 1, 0, 0, 0];
        cntbttHr = 1;
        click = 0;
    } else if (classButton == 'garmin') {
        revert = [0, 0, 0, 0, 1, 0, 0];
        cntbttHr = 1;
        click = 0;
    } else if (classButton == 'google') {
        revert = [0, 0, 0, 0, 0, 1, 0];
        cntbttHr = 1;
        click = 0;
    }
    else if (classButton == 'ourares') {
        revert = [0, 0, 0, 0, 0, 0, 1];
        cntbttHr = 1;
        click = 0;
    }
}

/* Graphic Functions */
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

function createChartePoint(maingroupapple, data, axe, id, color, size) {
    maingroupapple.selectAll("circle-test")
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

function createTitle(titleapple, title, id, coordX) {
    titleapple.append("text")
        .attr('id', id)
        .attr("x", coordX)
        .attr("y", 50 + "%")
        .attr("text-anchor", "middle")
        .style("fill", "#212529")
        .style("font-weight", "200")
        .style("font-size", 1.4 + "rem")
        .attr("class", "mg-chart-title")
        .text(title);
}

function createLegendAxeY(legendapple, heartrateAxis, title, id) {
    legendapple.append("line")
        .attr('id', id)
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
            .text(function (d) { return d; })
            .attr('id', id)
            .style("fill", "#212529")
            .style("font-weight", "200")
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
        .attr("y", 20 + "%")
        .style("text-anchor", "middle")
        .style("font-weight", "200")
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

function createSecondLegendAxeY(legendapple, heartrateAxis, title, id) {
    legendapple.append("line")
        .attr("x1", 0 + "%")
        .attr("y1", (margin.top / 2.5))
        .attr("x2", 0 + "%")
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
            .style("font-weight", "100")
            .attr("x", 5 + "%")
            .attr("y", function (d, i) {
                if (this.min < 0)
                    return (heightGraph - margin.bottom * 1.25) - (i * 4 * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length * 4)))
                else
                    return (heightGraph - margin.bottom * 1.25) - (i * 4 * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length * 4)))
            })
            .style("text-anchor", "start")
            .attr("font-size", 0.7 + "rem");

    legendapple.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr('id', id)
        .attr("transform", "rotate(-90)")
        .style("fill", "#212529")
        .attr("x", -(heightGraph - margin.bottom) / 2)
        .attr("y", 20 + "%")
        .style("text-anchor", "middle")
        .style("font-weight", "100")
        .attr("font-size", 0.7 + "rem")
        .text(title);

    if (heartrateAxis != 'null')
        legendapple.selectAll(".tickSize")
            .data(heartrateAxis)
            .enter().append("line")
            .attr('id', id)
            .attr("x1", 0 + "%")
            .attr("y1", function (d, i) { return (heightGraph - margin.bottom * 1.25 - 5) - (i * ((heightGraph - margin.bottom * 1.25) / (heartrateAxis.length))) })
            .attr("x2", 5 + "%")
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
        .style("font-weight", "200")
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

function showSumdata(svgName, data, axe, id) {
    var gap = {
        bottom: heightGraph - (margin.bottom * 1.25) - 5,
        top: (margin.top / 2.5) + 8,
        betweenTopAndBottom: axe[axe.length - 1] - axe[0],
        betweenValues: data[2] - axe[0],
        test2: ((heightGraph - margin.bottom * 1.25 - 5) - ((1) * ((heightGraph - margin.bottom * 1.25) / (axe.length)))),
    };

    svgName.append("rect")
        .attr('id', id)
        .attr("x", 0)
        .attr("y", ((gap.bottom) - ((data[3] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))))
        .attr("width", completedDays.length * gridSize)
        .attr("height", (((gap.bottom) - ((data[1] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))) - ((gap.bottom) - ((data[3] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom)))))
        .style("fill", "#ededed")
        .lower();

    svgName.append("rect")
        .attr('id', id)
        .attr("x", 0)
        .attr("y", ((gap.bottom) - ((data[4] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))))
        .attr("width", completedDays.length * gridSize)
        .attr("height", (((gap.bottom) - ((data[0] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom))) - ((gap.bottom) - ((data[4] - axe[0]) * (gap.test2 / gap.betweenTopAndBottom)))))
        .style("fill", "#f7f7f7")
        .lower();

    svgName.append("line")
        .attr('id', id)
        .attr("x1", 0)
        .attr("y1", ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom))))
        .attr("x2", completedDays.length * gridSize)
        .attr("y2", ((gap.bottom) - (gap.betweenValues * (gap.test2 / gap.betweenTopAndBottom))))
        .style("stroke", "#34495e")
        .style("stroke-dasharray", 5)
        .style("stroke-width", "1");

}
/* END of Graphics Functions */

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
                if (data.oura_sleep_summary[i].data.temperature_delta != "" && data.oura_sleep_summary[i].data.temperature_delta != "-")
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
        case 'ouraHR':
            if (data.oura_sleep_5min == undefined)
                return false;
            var cnt = 0;
            for (let i = 0; i < data.oura_sleep_5min.length; i++) {
                if (data.oura_sleep_5min[i].data.heart_rate != "" && data.oura_sleep_5min[i].data.heart_rate != "-")
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
                if (data.garmin_heartrate[i].data.heart_rate != "" && data.garmin_heartrate[i].data.heart_rate != "-")
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
                if (data.googlefit_heartrate[i].data.heart_rate != "" && data.googlefit_heartrate[i].data.heart_rate != "-")
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
                if (data.oura_sleep_summary[i].data.respiratory_rate != "" && data.oura_sleep_summary[i].data.respiratory_rate != "-")
                    cnt++;
            }
            if (cnt == 0)
                return false;
            else return true;
    }
}

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
    colorscaleRespirator= [];
    legendnameRespirator = [];
    cntRS = 0;
    setAttributButton();
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

    createButtonPhone(svgPhone, 1, classname, legendname, "", 0, (gridSize * .2));
    createButtonPhone(svgPhone, 2, classnameHeartRate, legendnameHeartRate, colorscaleHeartRate, (classname.length * gridSize * .8), ((classname.length - 1) * 25));
    createButtonPhone(svgPhone, 2, classnameTemperature, legendnameTemperature, colorscaleTemperature, (gridSize * .8), (0));

    svgName.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 0 + "%")
        .attr("y1", margin.top / 2)
        .attr("x2", 0 + "%")
        .attr("y2", heightGraph - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "1");
}

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
    if (ourares == true) {
        classname[cnt] = 'RespiratoryRate';
        colorscale[cnt] ='#97BC5F';
        legendname[cnt] = "Respiratory Rate";
        classnameRespirator[cntRS] = 'ourares';
        colorscaleRespirator[cntRS] = '#97BC5F';
        legendnameRespirator[cntRS] = "Oura";
        cnt++;
        cntRS++;
    }

    if (apple == true || fitbit == true || ouraHR == true || garmin == true || google == true) {
        classname[cnt] = 'HeartRate';
        colorscale[cnt] = '#9BFF1C';
        legendname[cnt] = "Heart Rate";
        cnt++;
    }

    if (apple == true) {
        classnameHeartRate[cntHR] = 'apple';
        colorscaleHeartRate[cntHR] = '#66c2a5';
        legendnameHeartRate[cntHR] = 'Apple Watch';
        cntHR++;
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

    if (google == true) {
        classnameHeartRate[cntHR] = 'google';
        colorscaleHeartRate[cntHR] = "#a6d854";
        legendnameHeartRate[cntHR] = 'Google fit';
        cntHR++;
    }
}

function createButton(svgName, type, dataclassname, datalegend, datacolor, marginTop1, marginTop2) {
    svgName.selectAll('circle-choice')
        .data(dataclassname)
        .enter()
        .append("circle")
        .attr('id', 'circle-choice-heartrate')
        .attr('class', function (d, i) { return dataclassname[i] })
        .attr("cx", gridSize * 1 * type)
        .attr("cy", function (d, i) {
            return (margin.top / 2 + marginTop1 / 1.2) + (i * gridSize * .8 * (3 - type))
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
            return (margin.top / 2 + marginTop1 / 1.2) + (i * gridSize * .8 * ((2 - type) + 1.01))
        })
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .attr("font-size", (1.2 - (type / 4)) + "rem");
}

function createButtonPhone(svgName, type, dataclassname, datalegend, datacolor, marginTop1, marginTop2) {
    svgName.selectAll('circle-choice')
        .data(dataclassname)
        .enter()
        .append("circle")
        .attr('id', 'circle-choice-heartrate')
        .attr('class', function (d, i) { return dataclassname[i] })
        .attr("cx", function (d, i) {
            if (type == 1)
                return (25 + (i * 50) + '%')
            else if (type == 2)
                return 25 + (marginTop2 * 2) + 5 + '%'
        })
        .attr("cy", function (d, i) {
            if (type == 1)
                return (margin.top / 2 + marginTop1)
            else if (type == 2)
                return (15) + ((i + 1) * 15) + '%'
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
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d, i) {
            if (type == 1)
                return (22 + (i * 50) + '%')
            else if (type == 2)
                return 25 + (marginTop2 * 2) + '%'
        })
        .attr("y", function (d, i) {
            if (type == 1)
                return (margin.top / 2 + marginTop1 + gridSize / 3)
            else if (type == 2)
                return (16) + ((i + 1) * 15) + '%'
        })
        .style("text-anchor", "start")
        .style("font-weight", "200")
        .attr("transform", "translate(" + gridSize / .9 + "," + 0 + ")")
        .attr("font-size", (1 - (type / 4)) + "rem");
}
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

function formatdateshow(data, id) {
    let months = ["Jan", "Fev", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < months.length; i++) {
        if (i <= 9 && "0" + i == data.split('/')[1])
            return months[i - 1] + " " + data.split('/')[0] + ", 2020" //+ appleyear[id];
        else if (i > 9 && i == data.split('/')[1])
            return months[i - 1] + " " + data.split('/')[0] + ", 2020" //+ appleyear[id];
    }
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

function addorRemoveday(date, days, data) {
    var length = data.symptom_report.length - 1;
    var length2 = completedDays.length - 1;
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
            newListeDate.push(completedDays[length2 - cnt + 1]);
            //newListeDate.push(formatdate(parseTime(data.symptom_report[length - cnt + 1].timestamp)));
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
        max = (10 * Math.floor(max / 10) + 5);
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
parseTimeOuraSleep = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
parseTimeTemp = d3.timeParse("%Y-%m-%d");
formatyear = d3.timeFormat("%y");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");
parseTimeGarmin = d3.timeParse("%Y-%m-%dT%H:%M:%S");
