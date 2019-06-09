(function () {
    const M = MyTools;

    let schemeColorCss;
    let subDialogBgCss;
    let subDialogUseSchemeColor = true;

    window.wallpaperPropertyListener = {
        hasBeenCalled: false,

        applyUserProperties: function (props) {
            this.hasBeenCalled = true;

            let _ = (name, func, caller = M) => props[name] && func.call(caller, props[name].value);
            // For numbers
            let __ = (name, func, caller = M) => props[name]
            && (typeof(props[name].value) === 'number' || !isNaN(parseInt(props[name].value)))
            && func.call(caller, props[name].value);

            let color2Css = color => 'rgb(' + color.split(' ').map(e => ~~(e * 255)) + ')';

            //====================== Important Settings =====================

            _('console', v => {
                let con = $('#console');
                con.css('display', v ? 'inline' : 'none');
                v ? con.on('click', simpleConsole) : con.off('click', simpleConsole);
            });

            //=========================== General ===========================

            _('schemecolor', v => {
                schemeColorCss = color2Css(v);
                if (subDialogUseSchemeColor)
                    $('#subtitle').css('background-color', schemeColorCss);
            });

            _('volume', v => M.setVolume(v / 10));
            _('bgimg', v => M.setBackground(v && 'file:///' + v, 'img'));
            _('bgurl', v => M.setBackground(v, 'url'));

            //========================== Position ==========================

            __('offsetx', M.offsetX);
            __('offsety', M.offsetY);
            __('scale', v => M.scale(v / 100));
            _('custommodel', M.setCustomModelEnabled);
          

            //========================== Subtitle ===========================

            let subtitleElm = $('#subtitle');

            _('showsubtitle', M.setSubtitleEnabled);
            _('dialogusescheme', v => {
                subDialogUseSchemeColor = v;
                let css = subDialogUseSchemeColor ? schemeColorCss : subDialogBgCss;
                css && subtitleElm.css('background-color', css);
            });

            _('dialogbgcolor', v => {
                subDialogBgCss = color2Css(v);
                if (!subDialogUseSchemeColor)
                    subtitleElm.css('background-color', subDialogBgCss);
            });

            _('dialogtextcolor', v => {
                let css = color2Css(v);
                subtitleElm.css({
                    color: css,
                    border: '1px solid ' + css
                });
            });

            _('dialogmaxwidth', v => subtitleElm.css('max-width', v));
            _('dialogtextsize', v => subtitleElm.css('font-size', v));
            _('dialogfont', v => subtitleElm.css('font-family', v));

           


            //=========================== Following ============================

            _('freefollowing', M.setFFEnabled);
            _('clicktorelease', v => M.ffClickToRelease = v);
            __('autoreleasetimeout', v => M.setFFAutoReleaseTimeout(v * 1000));
           
            _('fps', v => v ? M.startFps() : M.stopFps());

            if (props.console && props.fps && $$.onFinishFuncs) {
                $$.onFinishFuncs.forEach(f => f());
                $$.onFinishFuncs = undefined;
            }
        },

        applyGeneralProperties: function (props) {
            if (props.language)
                M.localize(props.language); // NOT props.language.value!!!
        },

        userDirectoryFilesAddedOrChanged: function (propName, files) {
            log(files.join('\n'));
        },

        userDirectoryFilesRemoved: function (propName, files) {
            log(files.join('\n'));
       
        }
    };
})();