var message_Path = 'live2d/';
function renderTip(template, context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return template.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) {
            return word.replace('\\', '');
        }
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;
        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
}

String.prototype.renderTip = function (context) {
    return renderTip(this, context);
};

var re = /x/;
console.log(re);
re.toString = function() {
    showMessage('Хаха, ты открыл консоль, хочешь увидеть мой секрет?', 5000);
    return '';
};

$(document).on('copy', function (){
    showMessage('Что вы скопировали? Перепечатано, чтобы не забыть добавить источник ~~', 5000);
});

function initTips(){
    $.ajax({
        cache: true,
        url: `${message_Path}message.json`,
        dataType: "json",
        success: function (result){
            $.each(result.mouseover, function (index, tips){
                $(tips.selector).mouseover(function (){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];//鼠标移动
                    text = text.renderTip({text: $(this).text()});
                    showMessage(text, 3000);
                });
            });
            $.each(result.click, function (index, tips){
                $(tips.selector).click2(function (){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];//鼠标点击
                    text = text.renderTip({text: $(this).text()});
                    showMessage(text, 3000);
                });
            });
        }
    });
}
initTips();

(function (){
    var text;
            var now = (new Date()).getHours();
            if (now > 23 || now <= 5) {
                text = 'Вы сова? Я до сих пор не сплю так поздно, ты придешь завтра?';
            } else if (now > 5 && now <= 7) {
                text = 'Доброе утро Утром день, и начинается хороший день!';
            } else if (now > 7 && now <= 11) {
                text = 'Доброе утро Работай хорошо, не сиди долго, вставай и гуляй.！';
            } else if (now > 11 && now <= 14) {
                text = 'В полдень я работал но, сейчас время обеда!';
            } else if (now > 14 && now <= 17) {
                text = 'Днем легко скучать. Закончена ли цель современного спорта?';
            } else if (now > 17 && now <= 19) {
                text = 'Уже поздно Пейзаж заката за окном очень красивый, но самый красивый,закат красный ~~';
            } else if (now > 19 && now <= 21) {
                text = 'Добрый вечер, как у тебя дела сегодня?';
            } else if (now > 21 && now <= 23) {
                text = 'Уже так поздно, отдохни рано, спокойной ночи ~~';
            } else {
                text = 'Эй ~ Приди и дразни меня!';
            }
    showMessage(text, 12000);
})();

window.setInterval(showTouhou,30000);

function showTouhou(){
    $.ajax({
        cache: true,
        url: `${message_Path}message.json`,
        dataType: "json",
        success: function (result){
            $.each(result.Touhou, function(index,tips){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];//新的
                    text = text.renderTip({text: $(this).text()});
                    showMessage(text, 5000);
            });
        }
    });
}


function showMessage(text, timeout){
    if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
    //console.log('showMessage', text);
    $('.message').stop();
    $('.message').html(text).fadeTo(200, 1);
    if (timeout === null) timeout = 5000;
    hideMessage(timeout);
}

function hideMessage(timeout){
    $('.message').stop().css('opacity',1);
    if (timeout === null) timeout = 5000;
    $('.message').delay(timeout).fadeTo(200, 0);
}

function initLive2d (){
    $('.hide-button').fadeOut(0).on('click', () => {
        $('#landlord').css('display', 'none')
    })
    $('#landlord').hover(() => {
        $('.hide-button').fadeIn(600)
    }, () => {
        $('.hide-button').fadeOut(600)
    })
}
initLive2d ();
