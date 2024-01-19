# Analysis of Circadian Rhythms (AnCir)

This is our 'AnCir' to the need for a simple-to-use (GUI; no coding) tool for analysis of circadian rhythms. Currently, the tool only allows for import of csv data and plotting of actigrams. However, many more features are planned.

This has been rewritten in Svelte to make it more extensible, faster, and fix a bunch of bugs. With help from @korur - thank you!.

## For users

AnCiR should start with some sample data already in the **Data** section on the left hand side. If you want to generate more sample data, just click on _Data_>_Create_ and a new Sample set should appear. Similarly, if you have your own .csv file, then you can import it and it should show up in the list.

Clicking on the name of the data table should display the contents in the bottom viewer, so you can see what the data look like

To create an actigram, click on _Plot_>_Actigram_. You can change the data that is used by using the dropdown lists under _Data for this plot_ on the right hand panel. You can add multiple data sources and change their colours. To see the post-processed data useed in the plot, click on the hyperlinked data for each source and see it appear in the data tabs below.

The other controls for the actigram should be self-explanatory.

The Periodogram plot is what it says it is, and raw is just a plot of the data - with similar controls to the actigram.

Have fun.

## For developers

Any advice or offers of support will be welcommed.
