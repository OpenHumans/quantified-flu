getAppleData();

function getAppleData() {
    $.getJSON(url, function (data) {
        if (data.apple_health_summary == undefined) {
            console.log("test");
            showbutton();
        }
        else
            main(data);
    })
}
function showbutton() {
    let dct = document.getElementById("button-no-apple");
    let htmlContent = "<a href='https://apps.apple.com/us/app/oh-data-port/id1512384252' class= 'btn btn-primary btn-lg' >"
        + " Connect Apple Watch" +
        "</a>";
    dct.insertAdjacentHTML('afterend', htmlContent);

    var para = document.createElement("p");
    var node = document.createTextNode("Notes : You have not activated the data synchronization of your apple watch. Please click on the button to change this setting. Thank you for sharing! 💖");
    para.appendChild(node);
    var element = document.getElementById("message-no-apple");
    element.appendChild(para);


    /*document.getElementById("myBar").style.width = scrolled + "%";*/
}

function main(data) {
    appledata = [];
    appleday = [];
    appleyear = [];
    symptomData = [];
    cnt = 0;
    appledate = [];
    repeat = [];
    noRepeatDataApple = [];

    /* Recupérer les données dans le fichier*/
    getAppleDatafromFile(data);
    finrepeatday();
    repeatdata();
    appledayAxis = getDayonAxis(appledate);

    let comparedateApple = 0;
    comparedateApple = compareDateReport();
    /* Trouver les jours ou il y ades reports :) */
    symptomData = getSymptomDatafromFile(comparedateApple);

    applemonth = determinenamemonth(appledate);

    /* Element graphique */
    createSvg();
    createChartePoint(maingroupapple)
    getreportedSickIncident(maingroupapple, symptomData)
    createTitle(titleapple, "Heart rate evolution");
    createLegendAxeY(legendapple);
    createLegendAxeX(maingroupapple);

    showMonthsAxis(maingroupapple, applemonth, (height - 5));

    /* Afficher les données */
    appletooltip();
    /* Controler le scroll  */
    document.getElementById("heartrate-apple").scroll(((comparedateApple) * gridSize), 0);
    document.getElementById("heatmap").onscroll = function () {
        syncronizationScrollAppleReport((comparedateApple * gridSize))
    };
    document.getElementById("heartrate-apple").onscroll = function () {
        syncronizationScrollReportApple((comparedateApple * gridSize))
    };
}

function getAppleDatafromFile(data) {
    this.file = data.apple_health_summary.map(d => d);
    this.file.forEach(element => {
        appledata[cnt] = Math.round(element.data.heart_rate);
        appleday[cnt] = formatdate(parseTime(element.timestamp));
        appleyear[cnt] = formatyear(parseTime(element.timestamp));
        cnt++;
    });
}

function repeatdata() {
    data1 = appleday.reverse();
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
        if ((cal[i] > (cal[i + 1] - 5)) && (cal[i] < (cal[i - 1] + 5))) {
            cal[i - 1] += '/1';
            cal[i + 1] += '/1';
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

function appletooltip() {

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    d3.selectAll("circle")
        .on("click", function (d) {
            let coordXY = this.getAttribute('id').split('- ')[1];
            d3.select(this)
                .attr("r", gridSize / 5)
                .attr('stroke-width', 1)
                .attr("fill", "#015483");

            tooltip
                .style("visibility", "visible")
                .text(formatdateshow(appledate[coordXY], coordXY) + " " + d + " bpm");
        })

        .on("mousemove", function () {
            tooltip
                .style("top", d3.event.pageY + 10 + "px")
                .style("left", d3.event.pageX - (gridSize * 3.5) + "px");
        })

        .on("mouseout", function () {
            d3.select(this).attr("r", gridSize / 10)
                .attr("fill", "#A5DAEC")
                .style("stroke", "#015483")
                .style("stroke-width", "0.5");

            tooltip.style("visibility", "hidden");
        });
}

/* Graphic Functions */
function createSvg() {
    maingroupapple = d3.select('#heartrate-apple')
        .append("svg")
        .attr("class", "svg")
        .attr("width", (this.appledate.length + 1) * gridSize)
        .attr("height", height)

    legendapple = d3.select('#apple-legend')
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", height)

    titleapple = d3.select('#apple-title')
        .append("svg")
        .attr("class", "svg")
        .attr("width", 100 + "%")
        .attr("height", margin.top)
}

function createChartePoint(maingroupapple) {
    maingroupapple.selectAll("circle")
        .data(noRepeatDataApple.reverse())
        .enter()
        .append("circle")
        .attr('id', function (d, i) { return "circle - " + i })
        .attr("cx", function (d, i) {
            return ((gridSize * 0.5)) + (i * gridSize);
        })
        .attr("cy", function (d) {
            return (height - margin.bottom) - ((d - 50) * ((height - margin.bottom - 1) / (120 - 50 + 1)));
        })
        .attr("r", gridSize / 10)
        .attr("fill", "#A5DAEC")
        .style("stroke", "#015483")
        .style("stroke-width", "0.5");

    maingroupapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 100 + "%")
        .attr("y1", margin.top)
        .attr("x2", 100 + "%")
        .attr("y2", height - margin.bottom)
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

function createLegendAxeY(legendapple) {
    legendapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 100 + "%")
        .attr("y1", margin.top)
        .attr("x2", 100 + "%")
        .attr("y2", height - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "1");

    heartrateAxis = ["50", "60", "70", "80", "90", "100", "110", "120"]

    legendapple.selectAll(".daysLabel")
        .data(heartrateAxis)
        .enter().append("text")
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", 95 + "%")
        .attr("y", function (d, i) { return (height - margin.bottom - 1) - (i * ((height - margin.bottom) / 8)) })
        .style("text-anchor", "end")
        .attr("font-size", 0.7 + "rem");

    legendapple.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .style("fill", "#212529")
        .attr("x", -(height - margin.bottom) / 2)
        .attr("y", 5 + "%")
        .style("text-anchor", "middle")
        .style("font-weight", "300")
        .attr("font-size", 0.7 + "rem")
        .text("HEART RATE [BPM]");

    legendapple.selectAll(".tickSize")
        .data(heartrateAxis)
        .enter().append("line")
        .attr("x1", 95 + "%")
        .attr("y1", function (d, i) { return (height - margin.bottom - 5) - (i * ((height - margin.bottom) / 8)) })
        .attr("x2", 100 + "%")
        .attr("y2", function (d, i) { return (height - margin.bottom - 5) - (i * ((height - margin.bottom) / 8)) })
        .style("stroke", "#212529")
        .style("stroke-width", "0.5");
}

function createLegendAxeX(legendapple) {

    legendapple.append("line")
        .attr('id', 'tickSize')
        .attr("x1", 0)
        .attr("y1", height - margin.bottom)
        .attr("x2", 100 + "%")
        .attr("y2", height - margin.bottom)
        .style("stroke", "#778899")
        .style("stroke-width", "0.5");

    legendapple.selectAll(".daysLabel")
        .data(axisdays)
        .enter().append("text")
        .text(function (d) { return d; })
        .style("fill", "#212529")
        .attr("x", function (d, i) { return gridSize * 1 + (i * gridSize * 7) })
        .attr("y", height - (margin.bottom / 2))
        .style("text-anchor", "end")
        .attr("font-size", 0.7 + "rem");

    legendapple.selectAll(".tickSize")
        .data(axisdays)
        .enter().append("line")
        .attr("x1", function (d, i) { return gridSize * 1 + ((i * gridSize * 7) - (gridSize / 2)) })
        .attr("y1", height - margin.bottom)
        .attr("x2", function (d, i) { return gridSize * 1 + ((i * gridSize * 7) - (gridSize / 2)) })
        .attr("y2", height - (margin.bottom / 1.25))
        .style("stroke", "#212529")
        .style("stroke-width", "0.5");
}

function showreportedSickIncident(svgName, coord) {
    coordX = coord.split('/');
    let x = ((gridSize * 0.5)) + coordX[0] * gridSize;
    let y = margin.top;
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
        .attr("x1", ((gridSize *  0.5) + coordX[0] * gridSize))
        .attr("y1", margin.top * 1.1)
        .attr("x2", ((gridSize * 0.5) + coordX[0] * gridSize))
        .attr("y2", height - margin.bottom)
        .style("stroke", "#A7AAAA")
        .style("stroke-dasharray", 5)
        .style("stroke-width", "1");
}

function compareDateReport() {
    let compteday = 0;
    var dayinmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    datereport = days_axis[0].split('/');
    dateapple = appledayAxis[0].split('/');;

    for (let i = dateapple[1]; i < datereport[1]; i++) {
        compteday += dayinmonth[i];
    }
    return compteday += (datereport[0] - dateapple[0]);
}

function finrepeatday() {
    /* On vérifie que les jours sont pas en double */
    data1 = appleday.reverse();
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

function syncronizationScrollAppleReport(comparedateApple) {
    var winScroll = document.getElementById("heatmap").scrollLeft;
    document.getElementById("heartrate-apple").scroll((winScroll + comparedateApple), 0);
}
function syncronizationScrollReportApple(comparedateApple) {
    var winScroll = document.getElementById("heartrate-apple").scrollLeft;
    document.getElementById("heatmap").scroll((winScroll - comparedateApple), 0);
}

parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%f%Z");
formatyear = d3.timeFormat("%y");
formatdate = d3.timeFormat("%d/%m");
formatdateday = d3.timeFormat("%d");
formatdatemonth = d3.timeFormat("%m");