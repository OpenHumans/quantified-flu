/** * @author Basile Morane
 * @description heatmap.js (javascript). Mai 2020
 * @fileOverview This file is useful for displaying on screen the heatmap of the symptom reports
 */ /** @type {Array} */$names = ["Cough", "Wet cough", "Anosmia", "Runny nose", "Sore throat", "Short breath", "Diarrhea", "Nausea", "Chills", "Fatigue", "Headache", "Body ache", "Fever", "", "Comments"];
/** @type {Array} */symptom_data = [];/** @type {Array} */ days_axis = []; /** @type {Array} */days = []; /** @type {Array} */year = []; /** @type {Array} */completedDays = [];
/** @type {Number} */gridSize = 30; /** @type {Number} */heightGraph = 14 * gridSize;
/** @type {Number} */width = 0.9 * Math.max(Math.min(window.innerWidth, 1000), 500)
/** @type {Array} */margin = {top: 30, right: -2, bottom: 27, left: 10};
createheatmap(url);
/** * @description Function to connect to the JSON file and call of function to display heatmap and graphics of wearable data. 
 * @param {*} url of the JSON file to get the data
 */ function createheatmap(url) {
  $.getJSON(url, function (data) {
    height = determineHeigth();
    innerwidth = determineInnerwidth();
    heightGraph = (height / 2);
    main_heatmap(data);
    main_wearable_data(data);
  })
} /** * @description	main function which allows you to display the graphics corresponding to the existing data. 
 * @param { Array } data of the JSON file
 */ function main_heatmap(data) {
  if (data.symptom_report.length > 0) {
    timestamp = data.symptom_report.map(d => d.timestamp);
    file_days = timestamp.map(d => formatdate(parseTime(d)));
    reportday = timestamp.map(d => formatdateday(parseTime(d)))
    month = timestamp.map(d => formatdatemonth(parseTime(d)))
    days = controlDay(file_days, reportday, month);
    moreday = getNoReportValues(data);
    moredayDataSource = getNoReportDataSource(data);
    completedDays = addDaynoReport(moreday, moredayDataSource, data);
    namesmonths = determinenamemonth(completedDays);
    symptom_data = loadDataSymptom(data);
    days_axis = showingDayOnTheMap(completedDays);
    comments = loadComments(data, days);

    createSvgReport("heatmap", (((completedDays.length) * gridSize) + 1), (height + margin.top + margin.bottom), "symptom", "heatmap-title", "legend", "legend-phone");
    showDaysAxis(maingroup, formatdateshow2(days_axis, ""));
    showTitleandSubtitle(titlegroup, "Heatmap of Symptom reports");
    showHeatmap(maingroup, symptom_data)
    showSymptomAxis(symptomgroup);
    showLegend(legendgroup);
    showLegendPhone(legendgroupphone);
    tooltip_heatmap();

    document.getElementById("heatmap").scroll(((moreday) * gridSize ), 0);
    document.getElementById("heatmap").onscroll = function () {
      progressScrollBar();
      var winScroll = document.getElementById("heatmap").scrollLeft;
      if (moredayDataSource != 'none') {
        document.getElementById("wearable-graph").scroll(winScroll, 0);
      }
    };
  }
} /** * @description	Display on screen the movment of the scrooling representing by a scrolling bar. 
*/ function progressScrollBar() {
  var winScroll = document.getElementById("heatmap").scrollLeft;
  var height = document.getElementById("heatmap").scrollWidth - document.getElementById("heatmap").clientWidth;
  var scrolled = (winScroll / height) * 71.1;
  document.getElementById("myBar").style.width = scrolled + "%";
} /** * @description	Get the existing data values from the symptom report 
 * @description timestamp / date / comments
 * @param { Array } data of the JSON file
 */ function getDatafromFile(data) {
  this.timestamp = data.symptom_report.map(d => d.timestamp);
  this.file_days = timestamp.map(d => formatdate(parseTime(d)));
  this.reportday = timestamp.map(d => formatdateday(parseTime(d)));
  this.month = timestamp.map(d => formatdatemonth(parseTime(d)));
  this.year = timestamp.map(d => formatdateyear(parseTime(d)))
  days = controlDay(file_days, reportday, month);

  this.comments = loadComments(data, days);
  this.height = determineHeigth();
  this.innerwidth = determineInnerwidth();
  this.namesmonths = determinenamemonth(days);
} /** * @description	Return a array of values for the none comments or existing comments
 * @description	5: User write a comments
 * @description	 -2:User did not write any comments 
 * @param { Array } data of the JSON file
 * @returns {values}
 */ function loadCommentsValues(data) {
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
}/** * @description	Return a array of the comments the user writed. 
 * @param { Array } data of the JSON file
 * @param { Array } days days in JSON file 
 */
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
/**
 * @description	Get the existing data values of the syptoms from the symptom report 
 * @description	Once we had read them, we "control the values with the "
 * @function dataControlSymptom to add or remove data from missing or repeat day
 * @param { Array } data of the JSON file
 * @returns {symptom_data}
 */
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
/**
 * @description Function to control the values of the symptom reported 
 * @description add values:  "", if values is undefined
 * @description add values:  "", if the day is missing
 * @description remove value if the day is repeating (Only keeping the last reported symptom of a day)
 * @param {*} data 
 * @returns {newdata}
 */
function dataControlSymptom(data) {
  dayscontrol = dayControl(file_days);

  for (i = 0; i < data.length; i++) {
    if (data[i] === undefined || data[i] === "")
      data[i] = 0;
    if ((data[i] >= 95 && data[i] < 99.5) || (data[i] >= 37 && data[i] < 37.5))
      data[i] = 0;
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
/**
 * * @description Function to get the missing or repeat day in an array of formated timestamp
 * @description Return a new array 
 * @param {Array} data - timestamp of the data source 
 * @returns {days_fixed}
 */
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
/**
 * @description Returns the writing name of an months with a formated date (dd/mm)
 * @param {*} data - array of formated timestamp
 * @returns {}
 */
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
/**
 * @description Returns only a day every seven days = one weeks
 * @description This array of data will be display on the heatmap
 * @param {*} data - completed days (with missing day and no repeat days) of the symptom reports 
 * @returns {day_break1}
 */
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
/**
 * @description Function to get the datasource (symptom report / Fitbit / Oura ...) with the old first day of data
 * @description Returns the number of different days 
 * @param {*} data - JSON file 
 * @returns {test}
 */
function getNoReportValues(data) {
  hour = fortmatHour(parseTime(data.symptom_report[0].timestamp));
  min = fortmatminutes(parseTime(data.symptom_report[0].timestamp));
  sec = fortmatsecondes(parseTime(data.symptom_report[0].timestamp));
  millisecondes = (hour * 3600000) + (min * 60000) + (sec * 1000);
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
  if (data.oura_sleep_summary != undefined)
    firstDay_oura_hr = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
  else
    firstDay_oura_hr = firstDay_report;
  if (data.garmin_heartrate != undefined)
    firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
  else
    firstDay_garmin = firstDay_report;
  if (data.googlefit_heartrate != undefined)
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

  if (test2 == '/google') {
    hour2 = fortmatHour(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    min2 = fortmatminutes(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    sec2 = fortmatsecondes(parseTimeGarmin(data.googlefit_heartrate[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if (test2 == '/oura') {
    hour2 = fortmatHour(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    min2 = fortmatminutes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    sec2 = fortmatsecondes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if (test2 == '/garmin') {
    hour2 = fortmatHour(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    min2 = fortmatminutes(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    sec2 = fortmatsecondes(parseTimeGarmin(data.garmin_heartrate[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if (test2 == '/fitbit') {
    hour2 = fortmatHour(parseTimeTemp(data.fitbit_summary[0].timestamp));
    min2 = fortmatminutes(parseTimeTemp(data.fitbit_summary[0].timestamp));
    sec2 = fortmatsecondes(parseTimeTemp(data.fitbit_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  if (test2 == '/apple') {
    hour2 = fortmatHour(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    min2 = fortmatminutes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    sec2 = fortmatsecondes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }

  if (test2 == '/ouraHR') {
    hour2 = fortmatHour(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    min2 = fortmatminutes(parseTimeTemp(data.oura_sleep_summary.timestamp));
    sec2 = fortmatsecondes(parseTimeTemp(data.oura_sleep_summary[0].timestamp));
    millisecondes2 = (hour2 * 3600000) + (min2 * 60000) + (sec2 * 1000);
    test = test - (millisecondes - millisecondes2);
  }
  return Math.round(test / (86400000));
}
/**
 * @description Function to get the datasource (symptom report / Fitbit / Oura ...) with the old first day of data
 * @description Returns name of the data source 
 * @param {*} data - JSON file 
 * @returns {data2}
 */
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
  if (data.oura_sleep_summary != undefined)
    firstDay_oura_hr = parseTimeTemp(data.oura_sleep_summary[0].timestamp).getTime();
  else
    firstDay_oura_hr = firstDay_report;
  if (data.garmin_heartrate != undefined)
    firstDay_garmin = parseTimeGarmin(data.garmin_heartrate[0].timestamp).getTime();
  else
    firstDay_garmin = firstDay_report;
  if (data.googlefit_heartrate != undefined)
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
    test = (firstDay_report - firstDay_fitbit);
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
/**
 * @description Adding the day missing before the first reported
 * @description return a new array of days
 * @param {*} numberdays - return of the function getNoReportValues()
 * @param {*} datasource - return of the function getNoReportDataSource
 * @param {*} data - JSON file 
 * @returns {daystoadd}
 */
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
  else if (datasource == 'ouraHR' && data.oura_sleep_summary != undefined) {
    for (let i = 0; i < numberdays; i++) {
      daystoadd[i] = formatdate(parseTimeTemp(data.oura_sleep_summary[i].timestamp));
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
/**
 * @description Returns the number of completed days (no missing and no repeat day) of reported symptoms
 * @returns {days}
 */
function getDays() {
  return this.days;
}
/**
 * @description Display on a new HTML element the data symptom values of the day we select by clicking on it 
 * @description Can show also the data of our wearable data source if we connect one
 */
function tooltip_heatmap() {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip-heatmap")
    .style("position", "absolute")
    .style("visibility", "hidden");

  d3.selectAll("#rect-heatmap") 
    .on("mouseover", function (d) {
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
      .style("top", d3.event.pageY + 10 + "px")
      .style("left", d3.event.pageX - (gridSize * 3.5) + "px");
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
/**
 * @description Instancy the svg variable with a HTML div (width, height...)
 * @param {*} heatmapDiv - maingroup - svg element 
 * @param {*} heatmpaSize - variable width of the heatmap 
 * @param {*} SVGheight - variable height of the heatmap 
 * @param {*} symptomDiv - symptomgroup - svg element 
 * @param {*} titleDiv - titlegroup - svg element 
 * @param {*} legendDiv - legendgroup - svg element 
 * @param {*} legendPhoneDiv - legendgroupphone - svg element 
 */
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
/**
 * @description Display on screen an new graphic svg element: heatmap 
 * @description Each case is depending of a value, a day and a symptom
 * @description THe color represents the value of the report
 * @param {*} maingroup - svg element
 * @param {*} symptom_data - data values of symptom report
 */
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
/**
 * @description Display on screen the axis X - showing on the heatmap the days
 * @description We show only a day per week 
 * @param {*} maingroup - svg element
 * @param {*} days_axis - data of symptom report (days)
 */
function showDaysAxis(maingroup, days_axis) {

  var dayLabel = maingroup.selectAll(".daysLabel")
    .data(days_axis)
    .enter().append("text")
    .attr('id', 'xAxis')
    .text(function (d) { return d; })
    .attr("x", function (d, i) { return  (i * gridSize * 7); })
    .attr("y", 0)
    .attr("transform", "translate(" + (gridSize * 0.5) + ",-" + (gridSize * 0.5) + ")")
    .style("text-anchor", "middle")
    .attr("font-weight", "200")
    .attr("font-size", ".7em");

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
    .style("stroke-width", ".5");
}
/**
 * @description Display on screen the title of the heatmap
 * @description Display on screen the subtitle of the heatmap
 * @param {Element} titleapple - svg element
 * @param {String} title - title text message
 */
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
    .text("Study on " + days.length + " days - start the " + formatdateshow(days[0], year[0]));

  var subtitle2 = maingroup.append("text")
    .attr("x", 50 + "%")
    .attr("y", 90 + "%")
    .style("text-anchor", "middle")
    .attr("font-size", 1 + "rem")
    .style("font-weight", "300")
    .text("Last update - " + formatdateshow(days[days.length - 1],  year[year.length - 1]));
}
/**
 * @description Display on the screen the caption of the symptoms 
 * @description This Caption is dependable of the variable $names 
 * @param {*} maingroup 
 */
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
/**
 * @description Display on screen the symptom we look at when we click on a case
 * @param {*} maingroup 
 * @param {*} num - indice of the symptom caption
 */
function selectSymptomOnclick(maingroup, num) {
  if (num < 13)
    maingroup.append("rect")
      .attr('class', "select-symptom")
      .attr("x", '25%')
      .attr("y", num * gridSize)
      .attr("width", '100%')
      .attr("height", gridSize)
      .style('fill', '#00CC99')
      .lower();
}
/**
 * @description Display on the screen the color scale of the symptom 
 * @description This Caption go at 0 to 4
 * @description This Caption is for an use on phone
 * @param {*} maingroup 
 */
function showLegendPhone(maingroup) {

  var countPoint = [-1, 0, 1, 2, 3, 4];
  var commentScale = ["No report", "No symptom", "Low", "Middle", "Strong", "Unbearable"];

  var title = maingroup.append("text")
    .attr("class", "title")
    .attr("font-size", 0.7 + "rem")
    .style("text-anchor", "start")
    .text("Legend")
    .style("font-weight", "200");

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
    .style("font-weight", "200");
}
/**
 * @description Display on the screen the color scale of the symptom 
 * @description This Caption go at 0 to 4
 * @description This Caption is for an use on computer
 * @param {*} maingroup 
 */
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
/**
 * @description Display on screen the values of the selected cases of the heatmap depending of the day. 
 * @param {*} data - values of the symptom (0 to 4)
 * @param {*} i - indice of the days
 * @param {*} y - indice of the comments
 */
function showAppendTitle(data, i, y) {
  var commentScale = ["No report", "No symptom", "Low symptom", "Middle symptom", "Strong symptom", "Unbearable symptom"];
  if (data == -2)
    return "Reports : no comments reported \n Date : " + formatdateshow(completedDays[i], "");

  if (data == -1)
    return "Reports : " + commentScale[data + 1]
      + " \n Date : " + formatdateshow(completedDays[i], "");

  if (data == 0)
    return "Reports : " + commentScale[data + 1]
      + " \n Date : " + formatdateshow(completedDays[i], "");

  if (data == 1 || data == 2 || data == 3 || data == 4) {
    var msg = "Reports :  " + commentScale[data + 1]
      + " \n Date : " + formatdateshow(completedDays[i], "")
      + " \n Symptom : " + $names[y]
      + " \n Values: " + data + "/4";

    if (finaldataAppleWatch[i] != undefined && finaldataAppleWatch[i] != '-' && finaldataAppleWatch[i] != 'NO DATA')
      msg += " \n Heart Rate (Apple Watch) : " + finaldataAppleWatch[i] + " bpm";

    if (finaldata_fitbit[i] != undefined && finaldata_fitbit[i] != '-' && finaldata_fitbit[i] != 'NO DATA')
      msg += " \n Heart Rate (Fitbit) : " + finaldata_fitbit[i] + " bpm";

    if (finaldataOura[i] != undefined && finaldataOura[i] != '-' && finaldataOura[i] != 'NO DATA')
      msg += " \n Heart Rate (Oura) : " + finaldataOura[i] + " bpm";

    if (finaldataGoogle[i] != undefined && finaldataGoogle[i] != '-' && finaldataGoogle[i] != 'NO DATA')
      msg += " \n Heart Rate (GoogleFit) : " + finaldataGoogle[i] + " bpm";

    if (finaldata_garmin[i] != undefined && finaldata_garmin[i] != '-' && finaldata_garmin[i] != 'NO DATA')
      msg += " \n Heart Rate (Garmin) : " + finaldata_garmin[i] + " bpm";

    if (finaldataOuraTemperature[i] != undefined && finaldataOuraTemperature[i] != '-' && finaldataOuraTemperature[i] != 'NO DATA')
      msg += " \n Body Temp. (Oura) : " + finaldataOuraTemperature[i];

    if (finaldataOuraRes[i] != undefined && finaldataOuraRes[i] != '-' && finaldataOuraRes[i] != 'NO DATA')
      msg += " \n Resp. Rate (Oura) : " + finaldataOuraRes[i];
    return msg;
  }
  if (data == 5) {
    return "Comments : " + comments[i] + " \n Date : " + formatdateshow(completedDays[i], "");
  }

}
/**
 * @description get a scale for the axis y (symptom)
 */
function yScale() {
  return d3.scaleBand()
    .domain($names)
    .rangeRound([0, symptom_data.length * gridSize]);
}
/**
 * @description Get the witdh of the heatmap display
 * @returns {height}
 */
function determineInnerwidth() {
  return gridSize * 5 + width;
}
/**
 * @description Get the height of the heatmap display
 * @returns {height}
 */
function determineHeigth() {
  return gridSize * $names.length;
}
/**
 * @description return a scale colors for the heatmap 
 * @description #fff", "#8a0886", "#cc2efa", "#e2a9f3", "#f5a9f2
 * @returns {ScaleColor}
 */
function scaleColor() {
  return d3.scaleLinear()
    .domain([0, 4])
    .range(["#fff", "#8a0886", "#cc2efa", "#e2a9f3", "#f5a9f2"]);
}
/**
 * @function formatdateshow
 * @description This function transform a single date with a format (dd/mm) in new format (Jan 01)
 * @description We display this format of date on the screen
 * @param { Array } data of the JSON file
 * @param { String} year - year of the sick incident 
 * @return { day  } - Array of the new formating date of the JSoN File to display
 */
function formatdateshow(data, year) {
  let months = ["Jan", "Fev", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 1; i < months.length + 1; i++) {
    if (i <= 9 && "0" + i == data.split('/')[1] && year == "")
      day = months[i - 1] + " " + data.split('/')[0]
    else if (i <= 9 && "0" + i == data.split('/')[1] && year != "")
      day = months[i - 1] + " " + data.split('/')[0] + ", " + year
    else if (i > 9 && i == data[x].split('/')[1] && year == "")
      day = months[i - 1] + " " + data.split('/')[0]
    else if (i > 9 && i == data[x].split('/')[1] && year != "")
      day = months[i - 1] + " " + data.split('/')[0] + ", " + year
  }
}
/**
 * @function formatdateshow2
 * @description This function transform an array of date with a format (dd/mm) in new format (Jan 01)
 * @description We display this format of date on the screen 
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
      else if (i <= 9 && "0" + i == data[x].split('/')[1] && year != "")
        day[x] = months[i - 1] + " " + data[x].split('/')[0] + ", " + year
      else if (i > 9 && i == data[x].split('/')[1] && year == "")
        day[x] = months[i - 1] + " " + data[x].split('/')[0]
      else if (i > 9 && i == data[x].split('/')[1] && year != "")
        day[x] = months[i - 1] + " " + data[x].split('/')[0] + ", " + year
    }
  }
  return day;
}
parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f+00:00");
parseTimeTemp = d3.timeParse("%Y-%m-%d");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");
formatdateyear = d3.timeFormat("%Y");
parseTimeOuraSleep = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
parseTimeGarmin = d3.timeParse("%Y-%m-%dT%H:%M:%S");
formatnewdate = d3.timeFormat("%Y-%m-%d%Z");
fortmatHour = d3.timeFormat("%H");
fortmatminutes = d3.timeFormat("%M");
fortmatsecondes = d3.timeFormat("%S");
