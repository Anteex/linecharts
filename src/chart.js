import Preview from './preview.js';
import Graph from './graph.js';
import Legend from './legend.js';

export default class Chart {

    constructor(nodeId, data, config = {}) {
        this.nodeId = nodeId;
        document.getElementById(nodeId).innerHTML = "";
        this.nodeIdLegend = nodeId + '-legend';
        this.data = data;
        this.config = config;
        this.theme = 'day';
        this.init();
    }

    init() {
        this.initSizes();

        this.initLines();

        this.preview = new Preview(this.previewPosition, this.nodeId, this.data, this.config);
        this.preview.setTheme(this.theme);

        this.graph = new Graph(this.graphPosition, this.nodeId, this.data, this.config);
        this.graph.setTheme(this.theme);

        this.preview.onFrameChange = this.graphSetFrame.bind(this);
        this.preview.draw(this.lines);

        this.legend = new Legend(this.nodeIdLegend, {names: this.data.names, colors: this.data.colors}, this.linesToggle.bind(this));
        this.legend.setTheme(this.theme);

        let initialFrame = {
            start: !!this.config.start ? this.config.start : Math.round((this.data.columns[0].length - 1) * 0.4),
            end: !!this.config.end ? this.config.end : Math.round((this.data.columns[0].length - 1) * 0.65)
        };
        this.preview.drawFrame(initialFrame);

        this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });

        window.addEventListener('resize', () => {
            this.refresh();
        });
    }

    setTheme(theme) {
        this.theme = theme;
        this.graph.setTheme(theme);
        this.graph.drawBackground();
        this.preview.setTheme(theme);
        this.preview.drawFrame(this.graph.getFrame());
        this.legend.setTheme(this.theme);
    }

    initSizes() {
        const previewRate = 0.10;

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
        this.graph.clearForeground();
        this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });
        this.graph.drawBackground();
    }

    linesToggle(lineKey) {
            if (this.lines.includes(lineKey)) {
                this.lines.splice(this.lines.indexOf(lineKey), 1);
            } else {
                this.lines.push(lineKey);
                this.lines.sort();
            }
            this.graph.clearForeground();
            this.graph.draw(this.lines, { colors: this.data.colors, names: this.data.names });
            this.graph.drawBackground();
            this.preview.draw(this.lines, { colors: this.data.colors, names: this.data.names });
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
