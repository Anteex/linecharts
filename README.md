# Linecharts
For Telegram contest:

**Goal:** Build 5 graphs based on the input data we provide. In addition to line charts developed in Stage 1, we are inviting developers to support 3 new chart types: line charts with 2 Y axes, bar charts and percentage stacked area charts.
Those who aim for the first prize will also have to support the zoom in / zoom out feature and pie charts. Zooming in allows to expand each data point into another graph with a more detailed X-axis. For example, each point on a 365-day daily graph can be zoomed into a 24-hour graph on a 168-hour timeline, as shown on one of the video demonstrations below.

Here are the 5 graphs expected in the contest:

1. A line chart with 2 lines.

*Bonus goal:* A line chart with 2 lines that zooms into another line chart with 2 lines.

2. A line chart with 2 lines and 2 Y axes. 

*Bonus goal:* A line chart with 2 Y axes that zooms into another line chart.

3. A stacked bar chart with 7 data types.

*Bonus goal:* A stacked bar chart with 7 data types which zooms into another stacked bar chart with 7 data types.

4. A daily bar chart with single data type.

*Bonus goal:* A daily bar chart with a single data type zooms into a line chart with 3 lines (the other two lines can represent values from 1 day and 1 week ago).

5. A percentage stacked area chart with 6 data types.

*Bonus goal:* A percentage stacked area chart with 6 data types that zooms into a pie chart with average values for the selected period.

Note that you are not expected to implement the zooming transitions exactly as shown in the video demonstrations. They may be replaced with any slick and fast transition of your choice.

The Y-scale on line graphs should start with the lowest visible value. A long tap on any data filter should uncheck all other filters. 

[Demo](https://anteex.github.io/linecharts/index.html)