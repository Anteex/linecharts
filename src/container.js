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
        this.max = [];
        this.min = [];
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
        this.scaleY = [];
        requestAnimationFrame( () => {
            if (this.lineNames.length > 0) {
                let data = [];
                if (!this.data.y_scaled) {
                    this.yAxisCount = 1;
                    data[0] = [];
                    for (let i = 0; i < (this.data.columns.length-1); i++) {
                        if (lineNames.includes(this.data.columns[i+1][0])) {
                            data[0] = [...data[0], ...this.data.columns[i+1].slice(this.frame.start, this.frame.end)]
                        }
                    }
                } else {
                    this.yAxisCount = this.data.columns.length - 1;
                    for (let i = 1; i < this.data.columns.length; i++) {
                        data[i-1] = this.data.columns[i].slice(this.frame.start, this.frame.end);
                    }
                }
                for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                    realMax = undefined;
                    realMin = undefined;
                    for (let i = 0; i < data[yAxis].length; i++) {
                        if (realMax !== undefined) {
                            if (realMax < data[yAxis][i]) {
                                realMax = data[yAxis][i]
                            }
                        } else {
                            realMax = data[yAxis][i]
                        }
                        if (realMin !== undefined) {
                            if (realMin > data[yAxis][i]) {
                                realMin = data[yAxis][i]
                            }
                        } else {
                            realMin = data[yAxis][i]
                        }
                    }
                    let delta = Math.round((realMax - realMin)/50);
                    if (this.max[yAxis] !== undefined) {
                        this.max[yAxis] = Math.abs(realMax - this.max[yAxis]) < delta ? realMax : this.max[yAxis] + Math.round((realMax - this.max[yAxis])/2);
                    } else {
                        this.max[yAxis] = realMax;
                    }
                    if (this.min[yAxis] !== undefined) {
                        this.min[yAxis] = Math.abs(realMin - this.min[yAxis]) < delta ? realMin : this.min[yAxis] + Math.round((realMin - this.min[yAxis])/2);
                    } else {
                        this.min[yAxis] = realMin;
                    }
                    this.scaleY[yAxis] = (this.height - 2 * this.padding) / (this.max[yAxis] - this.min[yAxis]);
                    console.log(realMin + ":" + realMax + " = " + this.axis_numbers(realMin, realMax));
                }
            } else {
                this.max = [];
                this.min = [];
                this.scaleY[0] = 0;
            }
            this.drawLines(lineNames);
            if (this.max[this.yAxisCount-1] !== realMax || this.min[this.yAxisCount-1] !== realMin) {
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
                    this.context.lineTo(this.left + this.padding + Math.round(i * this.scaleX),  this.height - this.padding - (Math.round(this.data.columns[j][this.frame.start + i] - this.getMin(j-1)) * this.getScaleY(j-1)))
                }
                this.context.stroke();
            }
        }
    }

    getScaleY(i) {
        if (!!this.data.y_scaled) {
            return this.scaleY[i]
        } else {
            return this.scaleY[0]
        }
    }

    getMin(i) {
        if (!!this.data.y_scaled) {
            return this.min[i]
        } else {
            return this.min[0]
        }
    }

    getMax(i) {
        if (!!this.data.y_scaled) {
            return this.max[i]
        } else {
            return this.max[0]
        }
    }

    axis_numbers(a, b) {
        const least = 4;
        const maximum = 8;
        const deviders = [10, 5, 2, 1];

        const digits = (x) => {
            return x.toString().length
        };

        let minimal = 0;
        let index = 0;
        deviders.forEach((devider, i) => {
            let amount = Math.round((b - a) / (devider * Math.pow(10, (digits(b - a) - 2))));
            if (amount > least) {
                if (minimal > 0) {
                    if (amount < minimal) {
                        minimal = amount;
                        index = i;
                    }
                } else {
                    minimal = amount;
                    index = i;
                }
            }
        });

        let step = deviders[index] * Math.pow(10, (digits(b - a) - 2));

        let start = Math.ceil(a / step) * step;

        let result = [];

        for (let i = 0; i < minimal; i++) {
            result.push(start + i * step);
        }

        while (result.length > maximum) {
            for (let i = 0; i < result.length; i++) {
                result.splice(i + 1, 2);
            }
        }

        return result;
    }

}
