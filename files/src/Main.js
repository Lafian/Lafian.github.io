console.error = (function (orgFunc) {
    return function () {
        var argArr = Array.prototype.slice.apply(arguments);
        error(argArr.join('\n'), true);
        orgFunc.apply(console, argArr);
    };
})(console.error);

window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

window.onerror = function (msg, url, line, col, err) {
    error('file: ' + url + '\nlocation: #' + line + ', ' + col + '\n' + msg + '\n' + err.stack, true);
};

var live2DMgr;

var gl = null;
var canvas = null;

var dragMgr = null;
var viewMatrix = null;
var projMatrix = null;
var deviceToScreen = null;

var drag = false;

function main() {
    live2DMgr = new LAppLive2DManager();

    initL2dCanvas('gl-canvas');
    initListener();
    init();

    setTimeout(function () {
        if (!window.wallpaperPropertyListener.hasBeenCalled) {
            window.wallpaperPropertyListener.applyGeneralProperties({language: navigator.language.toLowerCase()});
            ajax('project.json', false, function (buf) {
                window.wallpaperPropertyListener.applyUserProperties(JSON.parse(buf).general.properties);
            });
        }
    }, 500);
}


function initL2dCanvas(canvasId) {
    canvas = document.getElementById(canvasId);
}

function initListener() {
    $(document).on('mousedown mouseup mouseout', mouseEvent);

}

function init() {
    $('#console').css({
        left: innerWidth - screen.availWidth,
        bottom: innerHeight - screen.availHeight
    });

    var ultraWide = innerWidth / innerHeight > 2;

    var l2dViewToCanvasScale = 1.1;

    MyTools.canvasLastHeight = MyTools.canvasBaseHeight = ultraWide ? innerHeight * 1.5 : innerHeight;
    MyTools.canvasLastWidth = MyTools.canvasBaseWidth = l2dViewToCanvasScale * innerWidth;
    var ratio = MyTools.canvasBaseHeight / MyTools.canvasBaseWidth;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    dragMgr = new L2DTargetPoint();

    var left = LAppDefine.VIEW_LOGICAL_LEFT;
    var right = LAppDefine.VIEW_LOGICAL_RIGHT;
    var bottom = -ratio;
    var top = ratio;

    viewMatrix = new L2DViewMatrix();
    viewMatrix.setScreenRect(left, right, bottom, top);
    viewMatrix.setMaxScreenRect(
        LAppDefine.VIEW_LOGICAL_MAX_LEFT,
        LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
        LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
        LAppDefine.VIEW_LOGICAL_MAX_TOP);

    viewMatrix.setMaxScale(/*LAppDefine.VIEW_MAX_SCALE*/2);
    viewMatrix.setMinScale(/*LAppDefine.VIEW_MIN_SCALE*/0.01);

    projMatrix = new L2DMatrix44();

    var offsetY = ultraWide ? 0.8 * l2dViewToCanvasScale : 0;
    projMatrix.translate(-l2dViewToCanvasScale * l2dViewToCanvasScale, offsetY);
    projMatrix.scale(l2dViewToCanvasScale, l2dViewToCanvasScale * (canvas.width / canvas.height));

    var horPixelsToLogical = right * 2 / (innerWidth - MyTools.canvasBaseWidth / 2);
    var verPixelsToLogical = bottom * 2 / MyTools.canvasBaseHeight;

    deviceToScreen = new L2DMatrix44();
    deviceToScreen.translate(-(innerWidth - MyTools.canvasBaseWidth / 2), -(innerHeight - MyTools.canvasBaseHeight / 2));
    deviceToScreen.multScale(horPixelsToLogical, verPixelsToLogical);

    gl = getWebGLContext();
    if (!gl) {
        error('Failed to create WebGL context.');
        return;
    }

    Live2D.setGL(gl);
    MyTools.setModelGL(gl);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    if (ultraWide) {
        MyTools.scale(innerHeight / MyTools.canvasBaseHeight);
        MyTools.canvasBaseWidth = MyTools.canvasLastWidth;
        MyTools.canvasBaseHeight = MyTools.canvasLastHeight;
        MyTools.modelScale = 1;
    }

    startDraw();
}

function tick() {
    window.requestAnimationFrame(tick);

    if (MyTools.frameAvailable()) {
        draw();

        
        if (MyTools.fpsEnabled)
            MyTools.fps();
    }
}

function startDraw() {
    tick();
}

function draw() {
    MatrixStack.reset();
    MatrixStack.loadIdentity();

    dragMgr.update();
    live2DMgr.setDrag(dragMgr.getX(), dragMgr.getY());


    gl.clear(gl.COLOR_BUFFER_BIT);

    MatrixStack.multMatrix(projMatrix.getArray());
    MatrixStack.multMatrix(viewMatrix.getArray());
    MatrixStack.push();

    for (var i = 0; i < live2DMgr.numModels(); i++) {
        var model = live2DMgr.getModel(i);

        if (model === undefined) return;

        if (model.initialized && !model.updating) {
            model.update();
            model.draw(gl);
        }
    }

    MatrixStack.pop();
}

function modelAction(event, tap) {

    var vx = transformViewX(event.clientX /*- rect.left*/);
    var vy = transformViewY(event.clientY /*- rect.top*/);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        log('action device( x:' + event.clientX + ' y:' + event.clientY + ' ) view( x:' + vx + ' y:' + vy + ')');

    if (tap)
        live2DMgr.tapEvent(vx, vy);
    else
        dragMgr.setPoint(vx, vy);
}


function followPointer(event) {

    var vx = transformViewX(event.clientX /*- rect.left*/);
    var vy = transformViewY(event.clientY /*- rect.top*/);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        log('onMouseMove device( x:' + event.clientX + ' y:' + event.clientY + ' ) view( x:' + vx + ' y:' + vy + ')');

    dragMgr.setPoint(vx, vy);
}


function lookFront() {
    dragMgr.setPoint(0, 0);
}

var mouseDown = false;

function mouseEvent(e) {
    e.preventDefault();

    switch (e.type) {
        case 'mousedown':
        
            modelAction(e, false);

            mouseDown = true;
            drag = false;

            if (!MyTools.ffEnabled)
                $('body').on('mousemove', mouseEvent);

            if (MyTools.ffEnabled && MyTools.ffAutoReleaseTimeout > 0)
                MyTools.clearAutoRelease();
            break;

        case 'mousemove':
            drag = true;
            followPointer(e);

            if (!mouseDown && MyTools.ffEnabled && MyTools.ffAutoReleaseTimeout > 0)
                MyTools.updateAutoRelease();
            break;

    
        case 'mouseout':
          
            if (e.clientX >= 0)
                break;
            else if (MyTools.ffEnabled)
                lookFront();

        case 'mouseup':
          
            if (mouseDown) {
                mouseDown = false;

                if (!MyTools.ffEnabled) {
                    $('body').off('mousemove', mouseEvent);
                    lookFront();
                }

                if (!drag) {
                    modelAction(e, true);

                    if (MyTools.ffEnabled && MyTools.ffClickToRelease)
                        lookFront();
                }
            }
            break;
    }
}


function transformViewX(deviceX) {
    var screenX = deviceToScreen.transformX(deviceX);

    return viewMatrix.invertTransformX(screenX);
}


function transformViewY(deviceY) {
    var screenY = deviceToScreen.transformY(deviceY);
    return viewMatrix.invertTransformY(screenY);
}


function getWebGLContext() {
    var NAMES = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];

    for (var i = 0; i < NAMES.length; i++) {
        try {
            var ctx = canvas.getContext(NAMES[i], {premultipliedAlpha: true});
            if (ctx) return ctx;
        }
        catch (e) {
        }
    }
    return null;
}