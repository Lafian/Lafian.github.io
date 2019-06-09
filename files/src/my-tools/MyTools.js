var MyTools = {
    altIdleEnabled: false,
    altIdleAvailable: false,

    setBackground: Background.setBackground,

    setCustomModelEnabled: Model.setCustomEnabled,
    setCustomModel: Model.setCustom,
    setModelGL: Model.setGL,

    startUp: Event.startUp,
    loadTimingMotions: Event.loadTimingMotions,

    localize (locale) {
        UI.localize(locale);
        Subtitle.setLocales(locale, false);
    },


       /* ===========================================================
     * Free following
     */

    ffEnabled: false,
    ffClickToRelease: false,
    ffAutoReleaseTimeout: 0,
    ffAutoReleaseTime: 0,
    ffAutoReleaseIId: -1,

    setFFEnabled (enabled) {
        if (this.ffEnabled !== enabled) {
            if (enabled) {
                $('body').on('mousemove', mouseEvent);
            } else {
                $('body').off('mousemove', mouseEvent);
                this.clearAutoRelease();
                lookFront();
            }
        }
        this.ffEnabled = enabled;
    },

    setFFAutoReleaseTimeout (value) {
        this.ffAutoReleaseTimeout = value;
        if (value <= 0)
            this.clearAutoRelease();
    },

    updateAutoRelease () {
        if (this.ffAutoReleaseIId === -1) {
            var self = this;
            this.ffAutoReleaseIId = setInterval(function () {
                if (Date.now() > self.ffAutoReleaseTime) {
                    self.clearAutoRelease();
                    lookFront();
                }
            }, 100);
        }
        this.ffAutoReleaseTime = Date.now() + this.ffAutoReleaseTimeout;
    },

    clearAutoRelease () {
        clearInterval(this.ffAutoReleaseIId);
        this.ffAutoReleaseIId = -1;
    },


    /* ===========================================================
     * Sound & Subtitle
     */

    subtitleEnabled: false,
    volume: 0,

    updateAudio (audio, subtitle) {
        this.audio = audio;
        audio.volume = this.volume;

        if (subtitle) {
            this.showSubtitle(subtitle);
            audio.addEventListener('ended', this.hideSubtitle);
        }
    },

    setVolume (value) {
        this.volume = value;
        if (this.audio)
            this.audio.volume = value;
    },

    setSubtitleEnabled (enabled) {
        this.subtitleEnabled = enabled;
    },

    getSubtitle: Subtitle.get,
    showSubtitle: Subtitle.showSubtitle,
    hideSubtitle: Subtitle.hideSubtitle,

    /* ===========================================================
     * Limiting fps
     *
     * https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
     */

    fpsInterval: 1000 / 60,

    setFpsLimit (value) {
        if (!isNaN(value) && value > 0) {
            this.fpsInterval = 1000 / value;
            L2DTargetPoint.FRAME_RATE = value;
        } else {
            this.fpsInterval = -1;
        }
    },

    // Returns whether this frame is available for drawing or not.
    frameAvailable: (function () {
        var now, elapsed, then = Date.now();

        return function () {
            if (this.fpsInterval === -1)
                return false;

            now = Date.now();
            elapsed = now - then;
            if (elapsed > this.fpsInterval) {
                then = now - (elapsed % this.fpsInterval);
                return true;
            }
            return false;
        };
    })(),

    /* ===========================================================
     * Recording and showing fps
     *
     * https://stackoverflow.com/questions/4787431/check-fps-in-js
     */

    fpsEnabled: false,

    fps () {
        this.curFramTime = (this.curLoop = new Date) - this.lastLoop;
        this.frameTime += (this.curFramTime - this.frameTime) / 20;
        this.lastLoop = this.curLoop;
    },

    startFps () {
        if (!this.fpsEnabled) {
            this.fpsEnabled = true;

            this.fpsElm = document.getElementById('fps');
            this.fpsElm.style.display = 'inline';

            var self = this;
            this.intervalId = setInterval(function () {
                self.fpsElm.innerText = ~~(1000 / self.frameTime);
            }, 500);

            this.frameTime = 0;
            this.lastLoop = new Date;
        }
    },

    stopFps () {
        if (this.fpsEnabled) {
            this.fpsEnabled = false;

            clearInterval(this.intervalId);
            this.fpsElm.style.display = 'none';
        }
    },

    /* ===========================================================
     * Model settings
     */

    modelScale: 1,
    canvasBaseWidth: 0,
    canvasBaseHeight: 0,
    canvasLastWidth: 0,
    canvasLastHeight: 0,

    scale (value) {
        if (isNaN(value) || value <= 0 || value > 2)
            return;

        var newCanvasWidth = this.canvasBaseWidth * value;
        var newCanvasHeight = this.canvasBaseHeight * value;

       
        window.deviceToScreen.multScale(this.modelScale / value, this.modelScale / value);
        window.deviceToScreen.multTranslate((newCanvasWidth - this.canvasLastWidth) / 2 * window.deviceToScreen.getScaleX(),
            (newCanvasHeight - this.canvasLastHeight) / 2 * window.deviceToScreen.getScaleY());

      
        L2DViewMatrix.prototype.adjustScale.call(window.projMatrix, -1, -1, value / this.modelScale);

        window.canvas.width = ~~newCanvasWidth;
        window.canvas.height = ~~newCanvasHeight;

        this.modelScale = value;
        this.canvasLastWidth = newCanvasWidth;
        this.canvasLastHeight = newCanvasHeight;
    },

    offsetX (value) {
        window.deviceToScreen.multTranslate(
            (-value - window.canvas.style.right.slice(0, -2)) * window.deviceToScreen.getScaleX(), 0);
        window.canvas.style.right = -value + 'px';
    },

    offsetY (value) {
        window.deviceToScreen.multTranslate(
            0, (value - window.canvas.style.bottom.slice(0, -2)) * window.deviceToScreen.getScaleY());
        window.canvas.style.bottom = value + 'px';
    }
};