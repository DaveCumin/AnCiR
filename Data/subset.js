// A function for preprocessing.
//The main function {FUNCTION} does the work.
//The {FUNCTION}_controls allows the handler to insert the requetive elemnts for the function.
// {FUNCTION} must match the id of the menu item in nprocessDataHandler.js

// allows for the data to be subsetted, given a min and max date
subset = function (dataIN, minIN, maxIN) {
  const filteredData = dataIN.filter((item) => {
    const dateTime = new Date(item.date);
    const minDateTimeObj = new Date(minIN);
    const maxDateTimeObj = new Date(maxIN);
    return dateTime >= minDateTimeObj && dateTime <= maxDateTimeObj;
  });

  return filteredData;
};

//controls for the subset (to go below the data, such that it acts on that dataset)
subset_controls = function (selector, ...parameters) {
  // Get the reference to the target div element
  const dataDiv = document.getElementById(selector);
  // Get the second to last child element (the one above the icon to add process)
  //TODO: this isn't quite right once there is another process.... to fix
  const secondToLastChild = dataDiv.children[dataDiv.children.length - 2];

  //look up the number of processes to give a number //TODO: reordering (drag?)
  const selectorIndicies = selector.split("_");

  var processN;
  if (parameters.length == 0) {
    //Add one if no parameters
    processN =
      charts[selectorIndicies[1]].chart.dataSources()[selectorIndicies[2]]
        .process.length;
    charts[selectorIndicies[1]].chart.dataSources()[
      selectorIndicies[2]
    ].process[processN] = { name: "subset", minTime: "", maxTime: "" };
  } else {
    processN = parameters[0];
  }
  // Create a new DOM element to be inserted
  const subsetControls = document.createElement("div");
  subsetControls.setAttribute("class", "process");
  //TODO: make the below prettier (along with much of the rest of the UI I've coded, rather than used W2UI)
  subsetControls.innerHTML = `<a>Subset</a>
                                    <a href="javascript:void(0)" onclick="subsetToggle(this)" id="menu-subsettoggle_${selector}_${processN}">&#x25B2;</a>
                                    <a href="javascript:void(0)" onclick="deleteProcess(this)" id="menu-subsetclose_${selector}_${processN}"><div class="menu-icon"><span class="w2ui-icon w2ui-icon-cross deleteDataCross"></span></div></a>
  <div id="menu-subsetItems_${selector}_${processN}" class="processDataOptions" style="max-height: 100px;" id="processMenu_${selector}_${processN}">
    <div>min time <input type="datetime-local" id="subset_min_${selector}_${processN}" onchange="subset_update('${selector}_${processN}')"></div>
    <div>max time <input type="datetime-local" id="subset_max_${selector}_${processN}" onchange="subset_update('${selector}_${processN}')"></div>
  </div>
  `;

  // Insert the new element above the second to last child
  dataDiv.insertBefore(subsetControls, secondToLastChild);

  //Update the values
  if (parameters.length > 0) {
    document.getElementById(`subset_min_${selector}_${processN}`).value =
      parameters[1];
    document.getElementById(`subset_max_${selector}_${processN}`).value =
      parameters[2];
  }

  //set the min and max values
  setMinMaxSubset(`${selector}_${processN}`);
};

function subsetToggle(element) {
  //NB this enforces the ID structure of '...toggle...' and '...Items...'
  const processDataOptions = document.getElementById(
    element.id.replace("toggle", "Items")
  );
  if (processDataOptions.style.maxHeight) {
    processDataOptions.style.maxHeight = null;
    element.innerHTML = "&#x25BC;";
  } else {
    processDataOptions.style.maxHeight = processDataOptions.scrollHeight + "px";
    element.innerHTML = "&#x25B2;";
  }
}

function subset_update(selectorProcess) {
  selectorProcessIDs = selectorProcess.split("_");
  charts[selectorProcessIDs[1]].chart.dataSources()[
    selectorProcessIDs[2]
  ].process[selectorProcessIDs[3]] = {
    name: "subset",
    minTime: document.getElementById(`subset_min_${selectorProcess}`).value,
    maxTime: document.getElementById(`subset_max_${selectorProcess}`).value,
  };

  // now set the min and max values
  setMinMaxSubset(selectorProcess);
}

function setMinMaxSubset(selectorProcess) {
  const currentMin = document.getElementById(
    `subset_min_${selectorProcess}`
  ).value;
  const currentMax = document.getElementById(
    `subset_max_${selectorProcess}`
  ).value;
  var chartMin = charts[selectorProcess.split("_")[1]].chart.startTime(); //TODO: get the min and max datetimes from the data
  chartMin = toISOLocal(chartMin);

  if (currentMin == "") {
    // if there is no value selected
    document.getElementById(`subset_min_${selectorProcess}`).value = chartMin;
    document.getElementById(`subset_min_${selectorProcess}`).min = chartMin;
    document.getElementById(`subset_max_${selectorProcess}`).min = chartMin;
  } else {
    document.getElementById(`subset_max_${selectorProcess}`).min = currentMin;
  }

  //TODO: limit the max time also
}

function deleteProcess(element) {
  element = element.id;
  element = element.split("_");
  charts[element[2]].chart
    .dataSources()
    [element[3]].process.splice(element[3], 1);
  charts[element[4]].chart.update();
}

//thanks to https://stackoverflow.com/a/49332027/1505631 for this function
function toISOLocal(d) {
  var z = (n) => ("0" + n).slice(-2);
  var zz = (n) => ("00" + n).slice(-3);
  var off = d.getTimezoneOffset();
  var sign = off > 0 ? "-" : "+";
  off = Math.abs(off);

  return (
    d.getFullYear() +
    "-" +
    z(d.getMonth() + 1) +
    "-" +
    z(d.getDate()) +
    "T" +
    z(d.getHours()) +
    ":" +
    z(d.getMinutes()) +
    ":" +
    z(d.getSeconds()) +
    "." +
    zz(d.getMilliseconds()) /* +
    sign +
    z((off / 60) | 0) +
    ":" +
    z(off % 60)*/
  );
}
