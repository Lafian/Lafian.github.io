var Subtitle = {};

(function () {
    var saved = localStorage.locales;
    var locales = saved ? saved.split(' ') : [];

    Subtitle.setLocales = function (loc, manual) {
        if (manual) {
            locales = loc.split(' ');
            localStorage.locales = loc;
        } else if (localStorage.locales === undefined) {
            locales = loc.split(' ');
        }
    };

    Subtitle.get = function (subtitles, name) {
        var subtitle = undefined;

        function readFrom(locale, lang) {
            if (lang.locale.toLowerCase().indexOf(locale) !== -1) {
                $.each(lang.subtitles, function (i, sub) {
                    if (sub.name === name)
                        subtitle = sub.text;
                    return !subtitle;
                });
            }
        }

        $.each(subtitles, function (i, lang) {
            $.each(locales, function (i, locale) {
                readFrom(locale, lang);
                return !subtitle;
            });
            return !subtitle;
        });

        if (!subtitle) {
            $.each(subtitles, function (i, lang) {
                readFrom('default', lang);
                return !subtitle;
            });
        }

        return subtitle;
    };

    Subtitle.showSubtitle = function (sub) {
        var subtitle = $('#subtitle');
        subtitle.css('display', 'inline');
        subtitle.text(sub);
        subtitle.css('left', (innerWidth - subtitle.width()) / 2 + 'px');
        subtitle.stop(true).animate({opacity: 0.8}, 200);
    };

    Subtitle.hideSubtitle = function () {
        $('#subtitle').stop(true).animate({opacity: 0}, 300, function () {
            $(this).css('display', 'none');
        });
    };

    Subtitle.showSettings = function () {
        $('#set-sub').css('display', 'block');

        var json = live2DMgr.models[0].subtitles;
        if (json.length !== 0) {
            $('#sub-empty').css('display', 'none');

            var ulHtml = '';

            json.forEach(function (lang) {
                ulHtml += '<li class="selectable"><h3>' + lang.name + '</h3>' + lang.description + '</li>';
            });

            $('#sub-list').css('display', 'block').html(ulHtml).on('click', 'li', function () {
                Subtitle.setLocales(json[$(this).index()].locale, true);
                UI.hide();
            });
        } else {
            $('#sub-list').css('display', 'none');
            $('#sub-empty').css('display', 'block');
        }
    };
})();