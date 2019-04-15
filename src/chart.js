import Preview from './preview.js';
import Graph from './graph.js';
import Legend from './legend.js';
import loadJSON from './loadjson.js';
import { dayBeginStamp, dayEndStamp } from './helper.js'

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

        if (!!this.config.zoomed) {
            let headText = document.getElementById(this.nodeId + '-header');
            this.config.headText = headText.innerHTML;
            headText.innerHTML = '<span class="helper"></span><span><img src="zoomout.png"/>&nbsp;Zoom Out</a>';
            headText.onclick = this.zoomOut.bind(this);
            headText.classList.add('zoomout');
        } else if (!!this.config.headText) {
            let headText = document.getElementById(this.nodeId + '-header');
            headText.innerHTML = this.config.headText;
            headText.onclick = undefined;
            headText.classList.remove('zoomout');
        }


        this.preview = new Preview(this.previewPosition, this.nodeId, this.data, this.config);
        this.preview.setTheme(this.theme);

        this.graph = new Graph(this.graphPosition, this.nodeId, this.data, this.config, this.onPopupClick.bind(this));
        this.graph.setTheme(this.theme);
        this.graph.drawForeground(0, 0);

        this.preview.onFrameChange = this.graphSetFrame.bind(this);
        this.preview.draw(this.lines);

        this.legend = new Legend(this.nodeIdLegend, this.data, this.linesToggle.bind(this), this.lines, this.theme);
        this.legend.setTheme(this.theme);

        let initialFrame;
        if (!!this.config.initialFrame) {
            initialFrame = {
                start: Math.ceil((this.data.columns[0].length - 1) * this.config.initialFrame.start),
                end: Math.floor((this.data.columns[0].length - 1) * this.config.initialFrame.end)
            }
        } else {
            initialFrame = {
                start: Math.round((this.data.columns[0].length - 1) * 0.4),
                end: Math.round((this.data.columns[0].length - 1) * 0.65)
            }
        }

        this.preview.drawFrame(initialFrame);

        window.addEventListener('resize', () => {
            this.refresh();
        });
    }

    onPopupClick(data) {
        return () => {
            if (!!this.config.dataPath) {
                let dt = new Date(data);
                let month = dt.getMonth() + 1;
                month = month.toString().length < 2 ? '0' + month : month;
                let day = dt.getDate();
                day = day.toString().length < 2 ? '0' + day : day;
                let year = dt.getFullYear();
                loadJSON(this.config.dataPath + year + '-' + month + '/' + day + '.json')
                    .then((result) => {
                        const zoom_data = JSON.parse(result);
                        this.zoomIn(zoom_data, data);
                    })
                    .catch((error) => {
                        console.error("Error loading JSON data: " + error);
                    })
            } else {
                this.graph.animateIn(() => {
                    this.config.pie = true;
                    this.zoomIn(this.data);
                });
            }
        }
    }

    zoomOut() {
        this.config.initialFrame = {
            start: this.graph.getFrame().start / this.data.columns[0].length,
            end: this.graph.getFrame().end / this.data.columns[0].length
        };
        if (!this.config.pie) {
            this.config.targetFrame = this.config.frame;
            this.config.frame = undefined;
        } else {
            this.config.targetFrame = undefined;
        }
        this.data = this.config.data;
        this.config.zoomed = undefined;
        this.config.pie = undefined;
        this.clearNode();
        this.init();
        this.config.frame = undefined;
        this.config.lines = undefined;
    }

    zoomIn(data, day) {
        this.config.initialFrame = {
            start: this.graph.getFrame().start / this.data.columns[0].length,
            end: this.graph.getFrame().end / this.data.columns[0].length
        };
        this.config.frame = this.graph.getFrame();
        this.config.data = this.data;
        this.config.lines = this.lines;
        this.data = data;
        if (!this.config.pie) {
            let dayBegin = dayBeginStamp(day);
            let dayEnd = dayEndStamp(day);
            let start = 1;
            let end = data.columns[0].length - 1;
            for (let i = 1; i < data.columns[0].length-1; i++) {
                if (data.columns[0][i] < dayBegin) {
                    start = i + 1;
                }
                if (data.columns[0][i - 1] < dayEnd ) {
                    end = i - 1;
                }
            }
            this.config.targetFrame = { start, end };
            console.log(this.config.targetFrame);
            console.log(data.columns[0][this.config.targetFrame.start], data.columns[0][this.config.targetFrame.end])
            console.log(data.columns[1][this.config.targetFrame.start], data.columns[1][this.config.targetFrame.end])

        } else {
            this.config.targetFrame = undefined;
        }
        this.clearNode();
        this.config.zoomed = true;
        this.init();
    }

    clearNode() {
        let nodeId = document.getElementById(this.nodeId);
        while (nodeId.firstChild) {
            nodeId.removeChild(nodeId.firstChild);
        }
        nodeId = document.getElementById(this.nodeId + '-legend');
        while (nodeId.firstChild) {
            nodeId.removeChild(nodeId.firstChild);
        }
    }

    setTheme(theme) {
        this.theme = theme;
        this.graph.setTheme(theme);
        this.graph.drawBackground();
        this.graph.drawForeground(0, 0);
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
        if (!!this.config.lines) {
            this.lines = this.config.lines;
        } else {
            this.lines = [];
            for (let i = 1; i < this.data.columns.length; i++) this.lines.push(this.data.columns[i][0])
        }
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
