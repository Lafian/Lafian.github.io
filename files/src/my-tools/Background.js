var Background = {};

(function () {
    var bgUrl;
    var bgImg;

    Background.setForcedBackground = function (url) {
        url = url || bgImg || bgUrl || 'files/assets/image/lastation_day.jpg';

        document.body.style.backgroundImage = 'url(' + url + ')';
        document.body.style.backgroundSize = 'cover';
    };

    Background.setBackground = function (url, type) {
        if (type === 'img')
            bgImg = url;
        else
            bgUrl = url;

        Background.setForcedBackground(url);

    };
})();