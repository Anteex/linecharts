import Preview from './preview.js';
import Graph from './graph.js';
import Legend from './legend.js';

export default class Chart {

    constructor(nodeId, nodeIdLegend, data) {
        this.nodeId = nodeId;
        document.getElementById(nodeId).innerHTML = "";
        this.nodeIdLegend = nodeIdLegend;
        this.data = data;
        this.init();
    }

    init() {
        this.initSizes();

        this.initLines();

        this.preview = new Preview(this.previewPosition, this.nodeId, this.data);

        this.graph = new Graph(this.graphPosition, this.nodeId, this.data);

        this.preview.onFrameChange = this.graphSetFrame.bind(this);
        this.preview.draw(this.lines);

        this.legend = new Legend(this.nodeIdLegend, {names: this.data.names, colors: this.data.colors}, this.linesToggle.bind(this));

        let initialFrame = {
            start: Math.round((this.data.columns[0].length - 1) * 0.5),
            end: Math.round((this.data.columns[0].length - 1) * 0.75)
        };
        this.preview.drawFrame(initialFrame);

        this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });

        window.addEventListener('resize', () => {
            this.refresh();
        });
    }

    initSizes() {
        const previewRate = 0.20;

        this.width  = document.getElementById(this.nodeId).clientWidth;
        this.height = document.getElementById(this.nodeId).clientHeight;

        this.previewPosition = {
            top: Math.round(this.height * (1 - previewRate)),
            left: 0,
            bottom: this.height,
            right: this.width
        };
        this.graphPosition = {
            top: 0,
            left: 0,
            bottom: Math.round(this.height * (1 - previewRate)),
            right: this.width
        };
    }

    initLines() {
        this.lines = [];
        for (let i = 1; i < this.data.columns.length; i++) this.lines.push(this.data.columns[i][0])
    }

    graphSetFrame(frame) {
        this.graph.setFrame(frame);
        this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });
        this.graph.drawBackground();
    }

    linesToggle(lineKey) {
        return () => {
            if (this.lines.includes(lineKey)) {
                this.lines.splice(this.lines.indexOf(lineKey), 1);
            } else {
                this.lines.push(lineKey);
            }
            this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });
            this.graph.drawBackground();
            this.preview.draw(this.lines, { colors: this.data.colors, names: this.data.names });
        }
    }

    refresh() {
        this.initSizes();
        this.graph.refresh(this.graphPosition);
        this.preview.refresh(this.previewPosition);
        this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });
        this.graph.drawBackground();
        this.preview.draw(this.lines, { colors: this.data.colors, names: this.data.names });
        this.preview.drawFrame(this.graph.getFrame());
    }

}
