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
  const secondToLastChild = dataDiv.children[dataDiv.children.length - 2];

  //look up the number of processes to give a number //TODO: reordering (drag?)
  const selectorIndicies = selector.split("_");
  const processN =
    charts[selectorIndicies[1]].chart.dataSources()[selectorIndicies[2]].process
      .length;
  charts[selectorIndicies[1]].chart.dataSources()[selectorIndicies[2]].process[
    processN
  ] = { name: "subset", minTime: "", maxTime: "" };
  // Create a new DOM element to be inserted
  const subsetControls = document.createElement("div");
  subsetControls.innerHTML = `<a>Subset</a>
                                    <a href="javascript:void(0)" onclick="subsetToggle(this)" id="menu-subset_${selector}_${processN}">^</a>
                                    <a href="javascript:void(0)" onclick="deleteProcess(this)" id="menu-subset_${selector}_${processN}">X</a>
  <div class="processDataOptions" style="max-height: 100px;" id="processMenu_${selector}_9">
    min time <input type="datetime-local" id="subset_min_${selector}_${processN}" onchange="subset_update('${selector}_${processN}')">
    max time <input type="datetime-local" id="subset_max_${selector}_${processN}" onchange="subset_update('${selector}_${processN}')">
  </div>
  `;

  // Insert the new element above the second to last child
  dataDiv.insertBefore(subsetControls, secondToLastChild);

  //Update the values
  if (parameters.length > 0) {
    document.getElementById(`subset_min_${selector}_${processN}`).value =
      parameters[0];
    document.getElementById(`subset_max_${selector}_${processN}`).value =
      parameters[1];
  }
};

function subsetToggle(element) {
  const processDataOptions = element.nextElementSibling.nextElementSibling;
  if (processDataOptions.style.maxHeight) {
    processDataOptions.style.maxHeight = null;
    element.innerHTML = "v";
  } else {
    processDataOptions.style.maxHeight = processDataOptions.scrollHeight + "px";
    element.innerHTML = "^";
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
}

function deleteProcess(element) {
  console.log("delete process for " + element.id);
}
