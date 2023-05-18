// A function for preprocessing.
//The main function {FUNCTION} does the work.
//The {FUNCTION}_controls allows the handler to insert the requetive elemnts for the function.
// {FUNCTION} must match the id of the menu item in nprocessDataHandler.js

// allows for the data to be subsetted, given a min and max date
subset = function (dataIN, minIN, maxIN) {
  console.log("test subset here");
};

//controls for the subset (to go below the data, such that it acts on that dataset)
subset_controls = function (selector) {
  console.log("test subset_controls here");

  // Get the reference to the target div element
  const dataDiv = document.getElementById(selector);
  // Get the second to last child element
  const secondToLastChild = dataDiv.children[dataDiv.children.length - 2];

  // Create a new DOM element to be inserted
  const subsetControls = document.createElement("div");
  subsetControls.innerHTML = `<a>Subset</a>
                                    <a href="javascript:void(0)" onclick="subsetToggle(this)" id="menu-subset_${selector}_9">^</a>
                                    <a href="javascript:void(0)" onclick="deleteProcess(this)" id="menu-subset_${selector}_9">X</a>
  <div class="processDataOptions" style="max-height: 100px;" id="processMenu_${selector}_9">
    min time <input type="datetime-local" id="subset_min">
    max time <input type="datetime-local" id="subset_max">
  </div>
  `;

  // Insert the new element above the second to last child
  dataDiv.insertBefore(subsetControls, secondToLastChild);
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

function deleteProcess(element) {
  console.log("delete process for " + element.id);
}
