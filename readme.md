# Analysis of Circadian Rhythms (AnCir)

This is our 'AnCir' to the need for a simple-to-use (GUI; no coding) tool for analysis of circadian rhythms. Currently, the tool only allows for import of csv data and plotting of actigrams. However, many more features are planned.

The UI is built with the [W2UI v2.0](https://w2ui.com/web/) package.
Figures are drawn using [D3 v7](https://d3js.org/)
Data is imported using the [Papaparse](https://www.papaparse.com/) tools

## For users

AnCiR should start with some sample data already in the **Data** section on the left hand side. If you want to generate more sample data, just click on _Data_>_Create_ and a new Sample set should appear. Similarly, if you have your own .csv file, then you can import it and it should show up in the list.

Clicking on the name of the data table should display the contents in the bottom viewer, so you can see what the data look like

To create an actigram, click on _Plot_>_Actigram_. You can change the data that is used by using the dropdown lists under _Data for this plot_ on the right hand panel. You can add multiple data sources and change their colours. To see the post-processed data useed in the plot, click on the hyperlinked data for each source and see it appear in the data tabs below.

The other controls for the actigram should be self-explanatory. Have fun.

## For developers

Any advice or offers of support will be welcommed. I am increasingly thinking about rewriting this all in Svelte... open to ideas.
