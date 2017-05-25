/**
 * @ngdoc controller
 * @name dashboard.controller:ControllerName
 * @description
 * A description of the controller, service or filter
 */
app.service("CanvasService", function () {
    this.canvas;
    this.context;

    this.initContext = function (id, colour) {
        this.canvas = document.getElementById(id)
        this.context = this.canvas.getContext("2d");

        this.context.fillStyle = colour;
        this.context.strokeStyle = "#000";

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        return this.context;
    };

    this.drawSVG = function (src, pos, dim, testObj) {
        var x = pos.x * this.canvas.width / 100,
            y = pos.y * this.canvas.height / 100;

        var w = dim.x * this.canvas.width / 100,
            h = dim.y * this.canvas.height / 100;

        var img = new Image();
        img.src = "data:image/svg+xml," + src;
        img.ctx = this.context;

        img.onload = function () {
            if(angular.equals(testObj, {})) return;

            this.ctx.drawImage(img, x, y, w, h);
        };
    };

    this.drawRect = function (pos, dim, fillStyle, strokeStyle = false, lineWidth = "1") {
        var x = pos.x * this.canvas.width / 100,
            y = pos.y * this.canvas.height / 100;

        var w = dim.x * this.canvas.width / 100,
            h = dim.y * this.canvas.height / 100;

        if (fillStyle) {
            this.context.fillStyle = fillStyle;

            this.context.fillRect(x, y, w, h);
        }

        if (strokeStyle) {
            this.context.strokeStyle = strokeStyle;
            this.context.lineWidth = lineWidth;

            this.context.strokeRect(x, y, w, h);
        }
    };

    this.getMousePos = function (evt) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
});