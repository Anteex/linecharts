import Container from './container.js'

export default class Preview extends Container {

    constructor(position, nodeId, data) {
        super(position, nodeId, data);

        this.mouseIsDown = false;

        this.initCanvasDraw();

        const getMouseX = (e) => {
            let x;
            if (!!e.touches && e.touches.length > 0) {
                x = e.touches[0].clientX
            } else {
                x = e.x
            }
            if (!!this.canvasDraw.getBoundingClientRect().x) {
                return x - this.canvasDraw.getBoundingClientRect().x
            }
        };

        const getMouseY = (e) => {
            let y;
            if (!!e.touches && e.touches.length > 0) {
                y = e.touches[0].clientY
            } else {
                y = e.y
            }
            if (!!this.canvasDraw.getBoundingClientRect().y) {
                return y - this.canvasDraw.getBoundingClientRect().y
            }
        };

        const downEvent = (e) => {
            let x = getMouseX(e);
            let y = getMouseY(e);

            if ( x > this.edges.left.left
                && x < this.edges.left.left + this.edges.left.width
                && y > this.edges.left.top
                && y < this.edges.left.top + this.edges.left.height) {
                this.dragLeftEdge = true;
            }

            if ( x > this.edges.right.left
                && x < this.edges.right.left + this.edges.right.width
                && y > this.edges.right.top
                && y < this.edges.right.top + this.edges.right.height) {
                this.dragRightEdge = true;
            }

            if ( x > this.edges.left.left + this.edges.left.width
                && x < this.edges.right.left
                && y > this.edges.left.top
                && y < this.edges.right.top + this.edges.right.height) {
                this.dragFrame = {
                    move: true,
                    offsetX: this.edges.right.left - x,
                    width: this.edges.right.value - this.edges.left.value
                };
            }

            this.mouseIsDown = true;
        };

        const upEvent = (e) => {
            this.clearFlags()
        };


        const moveEvent = (e) => {
            if (this.mouseIsDown) {
                let x = getMouseX(e);

                if (this.dragLeftEdge) {
                    if (Math.round(x / this.scaleX) > 0 && (this.edges.right.value - Math.round(x / this.scaleX)) > 5) {
                        this.drawFrame({
                            start: Math.round(x / this.scaleX),
                            end: this.edges.right.value
                        })
                    } else if (Math.round(x / this.scaleX) < 1) {
                        this.drawFrame({
                            start: 1,
                            end: this.edges.right.value
                        })
                    }
                }

                if (this.dragRightEdge) {
                    if (Math.round(x / this.scaleX) < this.frame.end && (Math.round(x / this.scaleX) - this.edges.left.value) > 5) {
                        this.drawFrame({
                            start: this.edges.left.value,
                            end: Math.round(x / this.scaleX)
                        })
                    } else if (Math.round(x / this.scaleX) >= this.frame.end) {
                        this.drawFrame({
                            start: this.edges.left.value,
                            end: this.frame.end
                        })
                    }
                }

                if (!!this.dragFrame && this.dragFrame.move) {
                    if ( (Math.round((x + this.dragFrame.offsetX) / this.scaleX) - this.dragFrame.width) >= this.frame.start
                        && Math.round((x + this.dragFrame.offsetX) / this.scaleX) <= this.frame.end )
                    {
                        this.drawFrame({
                            start:  Math.round((x + this.dragFrame.offsetX) / this.scaleX) - this.dragFrame.width,
                            end: Math.round((x + this.dragFrame.offsetX) / this.scaleX)
                        })
                    } else if ( (Math.round((x + this.dragFrame.offsetX) / this.scaleX) - this.dragFrame.width) < this.frame.start)
                    {
                        this.drawFrame({
                            start:  1,
                            end: this.dragFrame.width
                        })
                    } else if (Math.round((x + this.dragFrame.offsetX) / this.scaleX) > this.frame.end) {
                        this.drawFrame({
                            start:  this.frame.end - this.dragFrame.width,
                            end: this.frame.end
                        })
                    }
                }
            }
            return false;
        };

        this.canvasDraw.onmouseout = () => {
            this.clearFlags()
        };

        this.clearFlags = () => {
            this.mouseIsDown = false;
            this.dragLeftEdge = false;
            this.dragRightEdge = false;
            if (!!this.dragFrame) this.dragFrame.move = false;
        };

        this.canvasDraw.onmousedown = downEvent;
        this.canvasDraw.ontouchstart = downEvent;

        this.canvasDraw.onmousemove = moveEvent;
        this.canvasDraw.ontouchmove = moveEvent;

        this.canvasDraw.onmouseup = upEvent;
        this.canvasDraw.ontouchend = upEvent;
    }

    refresh(position) {
        super.refresh(position);

        this.canvasDraw.style.left = this.left + "px";
        this.canvasDraw.style.top = this.top + "px";
        this.canvasDraw.width  = this.width;
        this.canvasDraw.height = this.height;
    }

    initCanvasDraw() {
        this.canvasDraw = document.createElement('canvas');
        this.canvasDraw.style.left = this.left + "px";
        this.canvasDraw.style.top = this.top + "px";
        this.canvasDraw.width  = this.width;
        this.canvasDraw.height = this.height;
        this.canvasDraw.style.position = "absolute";
        this.canvasDraw.style.zIndex = 15;
        document.getElementById(this.nodeId).appendChild(this.canvasDraw);
        this.contextDraw = this.canvasDraw.getContext("2d");
    }

    drawBackground() {
        this.contextDraw.beginPath();
        this.contextDraw.lineWidth = "1";
        this.contextDraw.rect(1, 1, this.width - 1, this.height - 1);
        this.contextDraw.stroke();
    }

    drawFrame(frame) {
        requestAnimationFrame( () => {
            this.contextDraw.clearRect(0, 0, this.width, this.height);

            this.drawBackground();
            this.contextDraw.globalAlpha = 0.5;

            this.contextDraw.fillRect(0, 0, Math.round(frame.start * this.scaleX), this.height);
            this.contextDraw.fillRect(Math.round(frame.end * this.scaleX), 0, this.right - Math.round(frame.end * this.scaleX), this.height);

            this.contextDraw.globalAlpha = 0.8;

            this.edges = {
                left: {
                    top: 0,
                    left: Math.round(frame.start * this.scaleX),
                    width: 10,
                    height: this.height,
                    value: frame.start
                },
                right: {
                    top: 0,
                    left: Math.round(frame.end * this.scaleX) - 10,
                    width: 10,
                    height: this.height,
                    value: frame.end
                }
            }

            this.contextDraw.fillRect(this.edges.left.left, this.edges.left.top, this.edges.left.width, this.edges.left.height);
            this.contextDraw.fillRect(this.edges.right.left, this.edges.right.top, this.edges.right.width, this.edges.right.height);

            this.contextDraw.globalAlpha = 1.0;

            this.onFrameChange(frame);
        });

    }

}
