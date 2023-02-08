$(document).ready(function () {

    // Вставка даты последнего обновления базы данных ----------------------------------

    const date = $(".converter__date")[0];

    $.ajax({
        url: "https://www.cbr-xml-daily.ru/daily_json.js",
        method: "get",
        dataType: "json",
        error: function () {
            console.log("error")
        },
        success: function (data) {
            console.log(data.Timestamp)
            let dateJson = new Date(data.Timestamp)
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                timezone: 'UTC',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            }
            console.log(data)
            dateJson = dateJson.toLocaleString("ru", options)
            dateJson = $(date).text() + dateJson;

            $(date).text(dateJson)
        }
    });

    // Все элементы управления требующие money.js // Возможно неправильно что все в одной анонимной функции, но как иначе я хз

    (async function () {
        // Импорт fx ----------------------------------------------------------------
        await $.getJSON(
            'https://www.cbr-xml-daily.ru/latest.js',
            function (data) {
                if (typeof fx !== "undefined" && fx.rates) {
                    fx.rates = data.rates;
                    fx.base = data.base;
                } else {
                    var fxSetup = {
                        rates: data.rates,
                        base: data.base
                    }
                }
            }
        )

        // Объявление всех переменных и функций ------------------------------------------

        const inputList = $("input"),
            currencyBlockList = $(".currency-block"),
            menu = $(".valute-menu");

        let currencyBlockLeftList = $('.currency-block__left'),
            currencyCodeList = $(".currency-block__abb"),
            currencyNameList = $(".currency-block__name-text"),
            flagList = $(".currency-block__flag"),
            currentCode1,
            currentCode2,
            currentBlockIndex;

        function getRate(code1, code2, value) {
            let rate = fx(value).from(code1).to(code2);
            if (rate > 1) {     // Округление
                rate = rate.toFixed(2)
            } else {
                rate = rate.toFixed(3)
            };
            if (rate[length - 1] == 0) {    // Фикс нуля на конце в десятичном числе
                rate = rate - rate[length - 1];
            }
            return rate
        }

        function getCurrentCode(block) {
            return $(block).find(".currency-block__abb").text()
        }

        // Установка курса по умолчанию ---------------------------------------------------

        currentCode1 = getCurrentCode(currencyBlockList[0]);
        currentCode2 = getCurrentCode(currencyBlockList[1]);

        $(inputList)[1].value = getRate(currentCode1, currentCode2, 1) // по умолчанию всегда 1, поэтому устанавливаю value вручную

        // Импорт валют, их имен, char кодов и курсов
        let rates = await $.ajax({
            url: "https://www.cbr-xml-daily.ru/daily_json.js",
            method: "get",
            dataType: "json",
            error: function () {
                console.log("error")
            },
            success: function (data) {
                data.Valute.RUB = {
                    "CharCode": "RUB",
                    "Name": "Российский рубль"
                }
                return data
            }
        })

        let valuteList = rates.Valute;

        // Создание меню ---------------------------------------------------

        (function () {
            $.each(valuteList, function (key, value) {

                $(menu).append('<div class="valute-menu__item"></div>');
                let menuItem = $(".valute-menu__item");
                menuItem = menuItem[menuItem.length - 1]

                $(menuItem).append(`<div class='valute-menu__name'>${value.Name}</div>`)
                $(menuItem).append(`<div class='valute-menu__abb'>${value.CharCode}</div>`)
            })
        })();

        // Все кейсы с меню -------------------------------------------------

        function openMenu(block) {
            $(menu).removeAttr("style"); // Обнуление предыдущих стилей

            $(menu).css("display", "flex");
            // Определение над каким блоком открыть меню
            if ($(block).attr("data-index") == 0) {
                $(menu).css("top", "0px");
            } else {
                $(menu).css("bottom", "0px");
            }
        }

        $(document).click(function (e) {
            if ($(menu).css("display") == "flex") { // Проверка открыто ли меню
                if (currencyBlockLeftList.is(e.target) ||
                    currencyBlockLeftList.has(e.target).length === 1) { // Проверка кликa на соседний блок
                    let siblingBlock = $(`[data-index="${$(e.target).closest(".currency-block").attr('data-index')}"]`) // Ищет аттрибут блока по которому был клик и по этому аттрибуту находит нужный блок
                    openMenu(siblingBlock)
                } else {
                    if ($(menu).is(e.target)) { // В том случае если клик по меню но не по его элементам 
                        return
                    }
                    if ($(menu).has(e.target).length === 1) { // Проверка клика на меню
                        // Определение текущего блока --------------------------------------------
                        if ($(menu).css("top") == "0px") {
                            currentBlockIndex = 0;
                        } else {
                            currentBlockIndex = 1;
                        };

                        // Установка новых значений code & name в блок ---------------------------------------------------
                        let selectedItem = $(e.target).closest(".valute-menu__item"),
                            selectedValuteCode = $(selectedItem).find(".valute-menu__abb").text(),
                            selectedValuteName = $(selectedItem).find(".valute-menu__name").text()

                        $(currencyCodeList[currentBlockIndex]).text(selectedValuteCode)
                        $(currencyNameList[currentBlockIndex]).text(selectedValuteName)

                        currentCode1 = getCurrentCode(currencyBlockList[0]);
                        currentCode2 = getCurrentCode(currencyBlockList[1]);

                        // Подсчет и установка курса -----------------------------------------------------------------------

                        let currentRate = getRate(currentCode1, currentCode2, $(inputList[0]).val())
                        $(inputList[1]).val(currentRate);

                        // Установка нового флага ------------------------------------------------

                        (async function () {
                            let urlsList = await $.getJSON("final.json");

                            if (urlsList[selectedValuteCode].url === undefined) { // Проверка на наличие нужной ссылки
                                $(flagList[currentBlockIndex]).attr("src", "/img/emptyFlag.png")
                                return
                            }

                            $(flagList[currentBlockIndex]).attr("src", urlsList[selectedValuteCode].url)
                            // Евро вручную добавлен в json и ссылается на локальный img в проекте
                        })()
                    }
                    $(menu).css("display", "none");
                }
            } else {        // Код открытия меню
                if (currencyBlockLeftList.is(e.target) ||
                    currencyBlockLeftList.has(e.target).length === 1) {
                    let selectedBlock = $(e.target).closest(".currency-block")[0];
                    openMenu(selectedBlock)
                }
            }
        })

        // Swap ----------------------------------------------------------------

        const swapBtn = $(".swap-btn");

        swapBtn.css("transition", "all 0.25s ease-out");
        let click = false, // Проверка был ли клик
            rotate = 0;

        swapBtn.hover(function () {
            rotate += 90
            $(this).css("transform", `rotate(${rotate}deg)`);
        }, function () {
            if (click == true) {
                click = false // Обнуление
                return
            }
            rotate -= 90
            $(this).css("transform", `rotate(${rotate}deg)`);
        })

        swapBtn.click(function () {
            leftBlockSwap();

            // Обновление курса
            currentCode1 = getCurrentCode(currencyBlockList[0]);
            currentCode2 = getCurrentCode(currencyBlockList[1]);

            currentRate = getRate(currentCode1, currentCode2, $(inputList[0]).val())
            $(inputList[1]).val(currentRate)

            // Поворот
            if (click == true) { // Чтобы клики подряд правильно отображались
                rotate += 180
            } else {
                rotate += 90;
            }
            $(swapBtn).css("transform", `rotate(${rotate}deg)`);
            click = true;
        })

        let leftBlockSwap = () => {
            // Смена местами обертки валюты 

            let interim = $(currencyBlockLeftList[1]); // Промежуточная переменная
            $(currencyBlockList[1]).prepend(currencyBlockLeftList[0])
            $(currencyBlockList[0]).prepend(interim)

            currencyBlockLeftList = $(".currency-block__left"); // Обновление списка оберток
            currencyCodeList = $(".currency-block__abb");
            currencyNameList = $(".currency-block__name-text");
            flagList = $(".currency-block__flag");
        }

        // Динамический ввод ---------------------------------------------------------

        inputList.keyup(function () {
            let currentBlockIndex = $(this).closest(".currency-block").attr("data-index");

            if (currentBlockIndex == 0) {       // Определяет в каком блоке запись
                currentCode1 = getCurrentCode(currencyBlockList[0]);
                currentCode2 = getCurrentCode(currencyBlockList[1]);

                currentRate = getRate(currentCode1, currentCode2, $(inputList[0]).val())
                $(inputList[1]).val(currentRate)
            } else {
                currentCode1 = getCurrentCode(currencyBlockList[1]);
                currentCode2 = getCurrentCode(currencyBlockList[0]);

                currentRate = getRate(currentCode1, currentCode2, $(inputList[1]).val())
                $(inputList[0]).val(currentRate)
            }
        })

    })()
});