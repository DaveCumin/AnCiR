import { w2popup } from "/dependencies/w2ui-2.0.es6.min.js";


window.makePlot = function() {
  

    //Popup with the default options
    w2popup.open({
        title: "Make plot",
        body: `
                <div id="makePlotPopup" class="w2ui-centered" style="line-height: 1.8">
                        <div>
                        Text 1: <input id="one" class="w2ui-input" style="margin-bottom: 5px"><br>
                        Text 2: <input id="two" class="w2ui-input" style="margin-bottom: 5px"><br>
                        Text 3: <input id="three" class="w2ui-input" style="margin-bottom: 5px"><br>
                        </div>
                    </div>`,
        actions: {
            custom: {
                text: "OK",
                onClick(event) {
                    const makePlotPopup = document.getElementById('makePlotPopup');

                    // get all the input elements inside the makePlotPopup element
                    const inputElements = makePlotPopup.querySelectorAll('.w2ui-input');

                    // loop through the input elements and get their values
                    const inputValues = [];
                    inputElements.forEach(input => {
                    inputValues.push(input.value);
                    });

                    console.log(inputValues); 
                    w2popup.close()
                }
            },
            Cancel(event) {
                w2popup.close()
            }
        }
    });
}



window.exportSVG = function(){
    const id = getCurrentPlotTab();
    
    console.log("exportID: " + id);
    console.log(id);

    const svgString = document.getElementById("thePlot"+id).innerHTML;
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = tabs.get(tabs.active).text+'.svg';
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(svgUrl);
  }

  window.getCurrentPlotTab = function(){
    const activeTab = tabs.get(tabs.active);
    
    return tabs.tabs.findIndex(obj => obj.id===activeTab.id)
  }