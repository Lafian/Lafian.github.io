var UI = {};

(function () {
    UI.localize = function (locale) {
        $.getJSON('ui.json', function (ui) {
            var uiElm = $('#ui');
            var html = uiElm.html();

            var translations;

            $.each(ui, function (loc, trans) {
                if (loc.indexOf(locale) !== -1) {
                    translations = trans;
                    return false;
                }
            });

            if (!translations)
                translations = ui['en-us'];

            $.each(translations, function (k, v) {
                html = html.replace(new RegExp(k, 'g'), v);
            });

            uiElm.html(html);
        });
    };

    var panelLastSize = {width: 0, height: 0};

    function updatePanel() {
        var window = $('#ui');
        var css = {
            display: 'block'
        };

        if (window.css('display') === 'none') {
            css.left = (innerWidth - window.width()) / 2;
            css.top = (innerHeight - window.height()) / 2;
            window.stop(true).animate({opacity: 1}, 100);
        } else {
            var pos = window.position();
            css.left = pos.left - (window.width() - panelLastSize.width) / 2;
            css.top = pos.top - (window.height() - panelLastSize.height) / 2;
        }

        panelLastSize.width = window.width();
        panelLastSize.height = window.height();

        window.css(css);
    }

    UI.hide = function () {
        $('#ui').stop(true).animate({opacity: 0}, 100, function () {
            $(this).css('display', 'none');
        });
        $('#cover').off('click');
    };

    UI.showSubtitleSettings = function () {
        Subtitle.showSettings();
        updatePanel();
        $('#cover').click(UI.hide);
    };

    $(function () {
        $('#subtitle').click(UI.showSubtitleSettings);
    });
})();