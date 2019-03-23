export default class Container {

    constructor(position, nodeId, data) {
        Object.assign(this, position);
        this.padding = 10;
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
        this.nodeId = nodeId;
        this.initCanvas();
        this.data = data;
        this.setFrame({
            start: 1,
            end: this.data.columns[0].length
        });
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.left = this.left + "px";
        this.canvas.style.top = this.top + "px";
        this.canvas.width  = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = "absolute";
        this.canvas.style.zIndex = 10;
        this.canvas.classList.add("noInvertColor");
        document.getElementById(this.nodeId).appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
    }

    refresh(position) {
        Object.assign(this, position);
        this.canvas.style.left = this.left + "px";
        this.canvas.style.top = this.top + "px";
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
        this.canvas.width  = this.width;
        this.canvas.height = this.height;
        this.scaleX = (this.width - 2 * this.padding) / (this.frame.end - this.frame.start - 1);
    }

    setFrame(frame) {
        this.frame = frame;
        this.scaleX = (this.width - 2 * this.padding) / (this.frame.end - this.frame.start - 1);
    }

    draw(lineNames) {
        this.lineNames = lineNames;

        let realMax, realMin;

        if (this.lineNames.length > 0) {
            let data = [];
            for (let i = 1; i < this.data.columns.length; i++) {
                if (lineNames.includes(this.data.columns[i][0])) {
                    data = [...data, ...this.data.columns[i].slice(this.frame.start, this.frame.end)]
                }
            }

            for (let i = 0; i < data.length; i++) {
                if (realMax !== undefined) {
                    if (realMax < data[i]) {
                        realMax = data[i]
                    }
                } else {
                    realMax = data[i]
                }
                if (realMin !== undefined) {
                    if (realMin > data[i]) {
                        realMin = data[i]
                    }
                } else {
                    realMin = data[i]
                }
            }
            let delta = Math.round((realMax - realMin)/50);
            if (this.max !== undefined) {
                this.max = Math.abs(realMax - this.max) < delta ? realMax : this.max + Math.round((realMax - this.max)/2);
            } else {
                this.max = realMax;
            }
            if (this.min !== undefined) {
                this.min = Math.abs(realMin - this.min) < delta ? realMin : this.min + Math.round((realMin - this.min)/2);
            } else {
                this.min = realMin;
            }
            this.scaleY = (this.height - 2 * this.padding) / (this.max - this.min);
        } else {
            this.max = undefined;
            this.min = undefined;
            this.scaleY = 0;
        }

        requestAnimationFrame( () => {
            this.drawLines(lineNames);
            if (this.max !== realMax || this.min !== realMin) {
                this.draw(lineNames);
                this.drawBackground();
            }
        });
    }

    drawLines(lineNames) {
        this.context.clearRect(0, 0, this.width, this.height);
        for (let j = 1; j < this.data.columns.length; j++) {
            if (lineNames.includes(this.data.columns[j][0])) {
                this.context.beginPath();
                this.context.lineWidth = "2";
                this.context.strokeStyle = this.data.colors[this.data.columns[j][0]];
                let append = Math.ceil((this.frame.end - this.frame.start) / this.width);
                for (let i = 0; i < (this.frame.end - this.frame.start); i = i + append) {
                    this.context.lineTo(this.left + this.padding + Math.round(i * this.scaleX),  this.height - this.padding - (Math.round(this.data.columns[j][this.frame.start + i] - this.min) * this.scaleY))
                }
                this.context.stroke();
            }
        }
    }




}
