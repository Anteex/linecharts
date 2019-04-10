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
        this.scaleY = [];

        requestAnimationFrame( () => {
            let realMax, realMin;
            if (this.lineNames.length > 0) {
                let data = [];
                if (!!this.data.y_scaled) {
                    this.yAxisCount = this.data.columns.length - 1;
                    for (let i = 1; i < this.data.columns.length; i++) {
                        data[i-1] = this.data.columns[i].slice(this.frame.start, this.frame.end);
                    }
                } else if (!!this.data.stacked) {
                    this.yAxisCount = 1;
                    let sum;
                    data[0] = [];
                    for (let j = this.frame.start; j < this.frame.end; j++) {
                        sum = 0;
                        for (let i = 1; i < this.data.columns.length; i++) {
                            let name = this.data.columns[i][0];
                            if (this.lineNames.includes(name)) {
                                sum += this.data.columns[i][j];
                            }
                        }
                        data[0].push(sum);
                    }
                } else {
                    this.yAxisCount = 1;
                    data[0] = [];
                    for (let i = 0; i < (this.data.columns.length-1); i++) {
                        if (lineNames.includes(this.data.columns[i+1][0])) {
                            data[0] = [...data[0], ...this.data.columns[i+1].slice(this.frame.start, this.frame.end)]
                        }
                    }
                }

                realMax = [];
                realMin = [];
                for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                    for (let i = 0; i < data[yAxis].length; i++) {
                        if (realMax[yAxis] !== undefined) {
                            if (realMax[yAxis] < data[yAxis][i]) {
                                realMax[yAxis] = data[yAxis][i]
                            }
                        } else {
                            realMax[yAxis] = data[yAxis][i]
                        }
                        if (realMin[yAxis] !== undefined) {
                            if (realMin[yAxis] > data[yAxis][i]) {
                                realMin[yAxis] = data[yAxis][i]
                            }
                        } else {
                            realMin[yAxis] = data[yAxis][i]
                        }
                    }
                    if (!!this.data.stacked || this.data.types.y0 === 'bar' || !!this.data.percentage) realMin[yAxis] = 0;
                    if (!!this.data.percentage) realMax[yAxis] = 100;
                }

                if (lineNames.length > 1 && this.yAxisCount > 1) {

                    let axisScale = [];
                    let maxLength = 0;

                    for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                        axisScale[yAxis] = this.axis_numbers(realMin[yAxis], realMax[yAxis]);
                        if (axisScale[yAxis].length > maxLength) maxLength = axisScale[yAxis].length
                    }

                    const step = (array) => {
                        if (array.length > 2) {
                            return array[1] - array[0]
                        } else {
                            return 0
                        }
                    };

                    for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                        for (let i=axisScale[yAxis].length; i < maxLength; i++) {
                            axisScale[yAxis].push(axisScale[yAxis][i-1] + step(axisScale[yAxis]))
                        }
                    }

                    for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                        realMin[yAxis] = axisScale[yAxis][0] - step(axisScale[yAxis]);
                        realMax[yAxis] = axisScale[yAxis][maxLength-1] + step(axisScale[yAxis]);
                    }
                }

                for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                    let delta = Math.round((realMax[yAxis] - realMin[yAxis])/50);
                    if (this.max[yAxis] !== undefined) {
                        this.max[yAxis] = Math.abs(realMax[yAxis] - this.max[yAxis]) < delta ? realMax[yAxis] : this.max[yAxis] + Math.round((realMax[yAxis] - this.max[yAxis])/2);
                    } else {
                        this.max[yAxis] = realMax[yAxis];
                    }
                    if (this.min[yAxis] !== undefined) {
                        this.min[yAxis] = Math.abs(realMin[yAxis] - this.min[yAxis]) < delta ? realMin[yAxis] : this.min[yAxis] + Math.round((realMin[yAxis] - this.min[yAxis])/2);
                    } else {
                        this.min[yAxis] = realMin[yAxis];
                    }
                    this.scaleY[yAxis] = (this.height - 2 * this.padding) / (this.max[yAxis] - this.min[yAxis]);
                }

            } else {
                this.max = [];
                this.min = [];
                this.scaleY[0] = 0;
            }
            this.drawLines(lineNames);
            let redraw = false;
            for (let yAxis = 0; yAxis < this.yAxisCount; yAxis++) {
                if (!!realMax && !!realMin) {
                    if (this.max[yAxis] !== realMax[yAxis] || this.min[yAxis] !== realMin[yAxis]) {
                        redraw = true;
                        break
                    }
                }
            }
            if (redraw) {
                this.draw(lineNames);
                this.drawBackground();
            }
        });
    }

    drawLines(lineNames) {
        this.context.clearRect(0, 0, this.width, this.height);
        let base = [];
        let newBase = [];
        for (let j = this.data.columns.length - 1; j >= 0; j--) {
            let name = this.data.columns[j][0];
            if (lineNames.includes(name)) {
                if (this.data.types[name] === 'line') {
                    this.context.beginPath();
                    this.context.lineWidth = "2";
                    this.context.strokeStyle = this.data.colors[this.data.columns[j][0]];
                    let append = Math.ceil((this.frame.end - this.frame.start) / this.width);
                    for (let i = 0; i < (this.frame.end - this.frame.start); i = i + append) {
                        this.context.lineTo(this.left + this.padding + Math.round(i * this.scaleX),  this.height - this.padding - (Math.round(this.data.columns[j][this.frame.start + i] - this.getMin(j-1)) * this.getScaleY(j-1)))
                    }
                    this.context.stroke();
                } else if (this.data.types[name] === 'bar') {
                    this.context.globalAlpha = 1;
                    this.context.fillStyle = this.data.colors[this.data.columns[j][0]];
                    let append = Math.ceil(15 * (this.frame.end - this.frame.start) / this.width);
                    let prevX = 0;
                    const offset = (i) => i - (this.frame.start + (append - this.frame.start % append));
                    for (let i = -1 * offset(0); i < this.frame.end + 2*append; i = i + append) {
                        let x = this.left + this.padding + Math.floor(offset(i) * this.scaleX) - Math.floor(this.frame.start % append * this.scaleX);
                        if (x > prevX && prevX !== 0) x = prevX;
                        base[offset(i)] = base[offset(i)] === undefined ? (this.height - this.padding) : base[offset(i)];
                        let y =  base[offset(i)] - this.data.columns[j][i] * this.getScaleY(j-1);
                        let w = Math.floor(this.scaleX * append);
                        if (x < this.left + this.padding) {
                            w = w - (this.left + this.padding - x);
                            x = this.left + this.padding;
                        }
                        if (x + w > this.width - this.padding) {
                            w = this.width - this.padding - x;
                        }
                        prevX = x + w;
                        let h = this.data.columns[j][i] * this.getScaleY(j-1);
                        base[offset(i)] = y;
                        this.context.fillRect(x, y, w, h)
                    }
                    this.context.globalAlpha = 1;
                } else if (this.data.types[name] === 'area') {
                    this.context.fillStyle = this.data.colors[this.data.columns[j][0]];
                    this.context.beginPath();
                    let append = Math.ceil((this.frame.end - this.frame.start) / this.width);

                    const sum = (k) => {
                        let result = 0;
                        for (let i = 1; i < this.data.columns.length; i++) {
                            if (lineNames.includes(this.data.columns[i][0])) result += this.data.columns[i][k]
                        }
                        return result
                    };

                    let i;
                    for (i = 0; i < (this.frame.end - this.frame.start); i = i + append) {
                        base[i] = base[i] === undefined ? (this.height - this.padding) : base[i];
                        newBase[i] = newBase[i] === undefined ? (this.height - this.padding) : newBase[i];
                        let x = this.left + this.padding + Math.round(i * this.scaleX);
                        let y;
                        if (lineNames[0] !== name) {
                            y = base[i] - (Math.round(this.data.columns[j][this.frame.start + i]*100/sum(this.frame.start + i)) * this.getScaleY(j-1));
                        } else {
                            y = this.padding;
                        }
                        newBase[i] = y;
                        this.context.lineTo(x, y)
                    }
                    this.context.lineTo(this.left + this.padding + Math.round((i-append) * this.scaleX), base[(i-append)]);
                    for (let m = i - append; m >= 0; m = m - append) {
                        let x = this.left + this.padding + Math.round(m * this.scaleX);
                        let y = Math.ceil(base[m]);
                        base[m] = newBase[m];
                        this.context.lineTo(x, y);
                    }
                    this.context.closePath();
                    this.context.fill();
                }
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
