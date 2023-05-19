import { w2menu, query } from "../dependencies/w2ui-2.0.es6.min.js";

window.procesContextMenu = function (selection) {
  const items = [
    //list of the procesing options available; id must be the function name
    { id: "subset", text: "Subset on date range", icon: "w2ui-icon-columns" },
  ];

  w2menu.show({
    align: "left",
    position: "left",
    name: "Process data before plotting",
    items,
    hideOn: ["doc-click", "select"],
    anchor: query("#" + selection)[0],
    onSelect(event) {
      window[event.detail.item.id + "_controls"](event.owner.anchor.id);
    },
  });

  //hack to move it to the correct position
  setTimeout(function () {
    document.getElementById(
      "w2overlay-Process_data_before_plotting"
    ).style.left =
      parseInt(
        document.getElementById("w2overlay-Process_data_before_plotting").style
          .left
      ) +
      parseInt(
        document.getElementById("layout_plotlayout_panel_main").style.width
      ) -
      70 +
      "px";
  }, 100);
};
