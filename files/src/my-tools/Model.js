var Model = {};

(function () {
    var customEnabled = undefined;
    var customModelPath;
    var gl;

    Model.setCustomEnabled = function (enabled) {
        var tmp = customEnabled;
        customEnabled = enabled;
        MyTools.altIdleAvailable = !enabled;

        if (enabled !== tmp)
            Model.loadModel();
    };

    Model.setCustom = function (path) {
        customModelPath = path;
        if (customEnabled)
            Model.loadModel();
    };

    Model.setGL = function (g) {
        gl = g;
    };

    Model.loadModel = function () {
        if (gl) {
            if (customEnabled)
                customModelPath && live2DMgr.loadModel(gl, customModelPath, MyTools.startUp);
            else
                live2DMgr.loadModel(gl, LAppDefine.MODEL_LIVE2D, MyTools.startUp);
        }
    };

    Model.motion = function (group, no) {
        var model = live2DMgr.models[0];
        model.startMotion(group, no, LAppDefine.PRIORITY_NORMAL);
    };
})();