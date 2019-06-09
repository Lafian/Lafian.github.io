var Event = Event || {};

(function () {
    var startUpMotionEnabled = false;
    var startUpMotions = [];

    Event.loadStartUpMotion = function (model) {
        var motions = model.modelSetting.getMotions(LAppDefine.MOTION_GROUP_START_UP);
        if (!motions)
            return;

        var nowHr = new Date().getHours();
        var dt, min = 24, selected = [];

        for (var i = motions.length - 1; i >= 0; i--) {
            dt = nowHr - motions[i]['time'];

            if (!isNaN(dt) && dt >= 0 && dt <= min) {
                if (dt === min) {
                    selected.push(i);
                } else {
                    min = dt;
                    selected = [i];
                }
            }
        }

        if (selected.length > 0)
            startUpMotions.push({
                model: model,
                no: selected[~~(selected.length * Math.random())]
            });
    };

    Event.startUp = function (motionEnabled) {
        if (motionEnabled !== undefined)
            startUpMotionEnabled = motionEnabled;

        if (!startUpMotionEnabled)
            return;

        for (var i in live2DMgr.models)
            Event.loadStartUpMotion(live2DMgr.models[i]);

        for (i in startUpMotions)
            startUpMotions[i].model.startMotion(LAppDefine.MOTION_GROUP_START_UP,
                startUpMotions[i].no, LAppDefine.PRIORITY_NORMAL);

        startUpMotions = [];
    };

    Event.loadTimingMotions = function (motions) {
    };
})();