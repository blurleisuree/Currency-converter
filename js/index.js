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
            // currencyBlockLeftList = $(".currency-block__left"),
            currencyCodeList = $(".currency-block__abb"),
            currencyNameList = $(".currency-block__name-text"),
            flagList = $(".currency-block__flag"),
            menu = $(".valute-menu");

            let currencyBlockLeftList = $('.currency-block__left')

        let currentCode1,
            currentCode2;

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
            if ($(block).attr("data-index") == 1) {
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
                    if ($(menu).is(e.target) || $(menu).has(e.target).length === 1) { // Проверка клика на меню
                        // Тут должен быть код для флага

                        // Установка новых значений code & name в блок ---------------------------------------------------
                        let selectedItem = $(e.target).closest(".valute-menu__item"),
                            selectedValuteCode = $(selectedItem).find(".valute-menu__abb").text(),
                            selectedValuteName = $(selectedItem).find(".valute-menu__name").text()

                        if ($(menu).css("top") == "0px") {      // Проверка на каком из блоков был выбор
                            $(currencyCodeList[0]).text(selectedValuteCode)
                            $(currencyNameList[0]).text(selectedValuteName)
                        } else {
                            $(currencyCodeList[1]).text(selectedValuteCode)
                            $(currencyNameList[1]).text(selectedValuteName)
                        }

                        currentCode1 = getCurrentCode(currencyBlockList[0]);
                        currentCode2 = getCurrentCode(currencyBlockList[1]);

                        // Подсчет и установка курса -----------------------------------------------------------------------

                        let currentRate = getRate(currentCode1, currentCode2, $(inputList[0]).val())
                        $(inputList[1]).val(currentRate)

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
        }

        // Динамический ввод 

        inputList.keyup(function () {
            let currentBlockIndex = $(this).closest(".currency-block").attr("data-index");

            if (currentBlockIndex == 1) {       // Определяет в каком блоке запись
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

    // Swap --------------------------------------------------------------------------

    // const swapBtn = $(".swap-btn");

    // swapBtn.css("transition", "all 0.25s ease-out");

    // let click = false, // Проверка был ли клик
    //     rotate = 0;

    // swapBtn.hover(function () {
    //     rotate += 90
    //     $(this).css("transform", `rotate(${rotate}deg)`);
    // }, function () {
    //     if (click == true) {
    //         click = false // Обнуление
    //         return
    //     }
    //     rotate -= 90
    //     $(this).css("transform", `rotate(${rotate}deg)`);
    // })

    // let swapClick = () => {

    //     leftBlockSwap();

    //     // Тут должен быть скрипт для свапа курсов валют

    //     if (click == true) { // Чтобы клики подряд правильно отображались
    //         rotate += 180
    //     } else {
    //         rotate += 90;
    //     }
    //     $(swapBtn).css("transform", `rotate(${rotate}deg)`);
    //     click = true;
    // }

    // let leftBlockSwap = () => {

    //     let interim; // Промежуточная перменная

    //     let currencyBlock1 = $(".currency-block")[0],
    //         currencyBlock2 = $(".currency-block")[1];

    //     interim = currencyBlock2;
    //     $(".converter__currencies-wrapper").append(currencyBlock1)
    //     $(".converter__currencies-wrapper").prepend(interim)

    //     // Смена аттрибута для меню
    //     let dataCurrencyBlockList = $(".currency-block__left");
    //     $(dataCurrencyBlockList[0]).attr("data-attr", 1);
    //     $(dataCurrencyBlockList[1]).attr("data-attr", 2);

    // }

    // swapBtn.click(swapClick)

    // Меню выбора валюты -------------------------------------------------------

    // async function ratesObjCreate() {
    //     // Установка значений по умолчанию
    //     const output1 = $(".currency-block__number")[0],
    //         output2 = $(".currency-block__number")[1];

    //     let rates = await $.getJSON(
    //         'https://www.cbr-xml-daily.ru/latest.js',
    //         function (data) {
    //             if (typeof fx !== "undefined" && fx.rates) {
    //                 fx.rates = data.rates;
    //                 fx.base = data.base;
    //             } else {
    //                 var fxSetup = {
    //                     rates: data.rates,
    //                     base: data.base
    //                 }
    //             }
    //         }
    //     )

    //     function setDefaultValues() {
    //         let abb2 = $(".currency-block__abb")[1];
    //         let result = fx(output1.value).from("USD").to(`${$(abb2).text()}`);
    //         result = result.toFixed(2)
    //         if (result[result.length - 1] == 0) {
    //             result = result - result[result.length - 1] // удаление нуля на конце
    //         }
    //         output2.value = result
    //     }
    //     setDefaultValues()

    //     return rates
    // }

    // ratesObjCreate().then(function (rates) {

    // async function valuteArrCreate() {
    //     let valuteArr = [];

    //     await $.ajax({
    //         url: "https://www.cbr-xml-daily.ru/daily_json.js",
    //         method: "get",
    //         dataType: "json",
    //         error: function () {
    //             console.log("error")
    //         },
    //         success: function (data) {

    //             $.each(data.Valute, function (key, value) {
    //                 valuteArr.push({
    //                     abb: `${value.CharCode}`,
    //                     name: `${value.Name}`
    //                 })
    //             })

    //             // Добавление RUB в массив
    //             valuteArr.unshift({
    //                 abb: "RUB",
    //                 name: "Российский рубль"
    //             })

    //             return valuteArr
    //         }
    //     })
    //     return valuteArr
    // }

    //     valuteArrCreate().then(function (valuteArr) {
    //         // код для меню выбора валюты

    //         const currencyBlock1 = $(".currency-block__left")[0],
    //             currencyBlock2 = $(".currency-block__left")[1],
    //             currencyBlockList = $(".currency-block__left"),
    //             menu = $(".valute-menu");

    //         $.each(valuteArr, function (key, value) {
    //             $(menu).append("<div class='valute-menu__item'></div>");

    //             let valuteItem = $('.valute-menu__item');
    //             valuteItem = valuteItem[valuteItem.length - 1];

    //             $(valuteItem).append(`<div class='valute-menu__name'>${value.name}</div>`)
    //             $(valuteItem).append(`<div class='valute-menu__abb'>${value.abb}</div>`)
    //         })

    //         $(document).click(function (e) {
    //             if ($(menu).css("display") == "flex") { // Закрытие меню

    //                 if (currencyBlockList.is(e.target) ||
    //                     currencyBlockList.has(e.target).length === 1) { // Проверка был ли клик на соседний блок
    //                     $(menu).removeAttr("style"); // обнуление прошлых top & bottom

    //                     if ($(e.target).attr('data-attr') == 1 || $(e.target).closest(".currency-block__left").attr("data-attr") == 1) {
    //                         $(menu).css("top", 0)
    //                     } else {
    //                         $(menu).css("bottom", 0)
    //                     }
    //                     $(menu).css('display', "flex") // из за обнуления стилей до этого
    //                     return
    //                 }

    //                 // Код для выбора валюты
    //                 if (menu.has(e.target).length === 1) {
    //                     // Определение текущего блока
    //                     let currentCurrencyBlock;
    //                     if ($(menu).css("top") == "0px") {
    //                         currentCurrencyBlock = currencyBlock1;
    //                     } else {
    //                         currentCurrencyBlock = currencyBlock2;
    //                     };

    //                     let currentCurrencyBlockAbb = $(currentCurrencyBlock).find(".currency-block__abb").text(),
    //                         currentCurrencyBlockName = $(currentCurrencyBlock).find(".currency-block__name-text").text(),
    //                         currentCurrencyBlockFlag = $(currentCurrencyBlock).find("img").attr("src");

    //                     // Определение выбраной валюты
    //                     let selectedItem = $(e.target).closest(".valute-menu__item")[0],
    //                         selectedValuteAbb = $(selectedItem).children(".valute-menu__abb").text(),
    //                         selectedValuteName = $(selectedItem).children(".valute-menu__name").text();

    //                     // Выбор уже выбранной валюты
    //                     if (selectedValuteAbb == currentCurrencyBlockAbb) {
    //                         $(menu).css("display", "none")
    //                         return
    //                     }

    //                     // В том случае если выбирается валюта такая же как в соседнем блоке
    //                     let nextBlock, nextBlockAbb, nextBlockName, nextBlockFlag;
    //                     if ($(currentCurrencyBlock).attr("data-attr") == 1) {
    //                         nextBlock = $("[data-attr = 2]");
    //                     } else {
    //                         nextBlock = $("[data-attr = 1]");
    //                     }
    //                     nextBlockAbb = $(nextBlock).find(".currency-block__abb");
    //                     nextBlockName = $(nextBlock).find(".currency-block__name-text");
    //                     nextBlockFlag = $(nextBlock).find("img");
    //                     if (selectedValuteAbb == $(nextBlockAbb).text()) {
    //                         $(nextBlockAbb).text(currentCurrencyBlockAbb);
    //                         $(nextBlockName).text(currentCurrencyBlockName);
    //                         $(nextBlockFlag).attr("src", currentCurrencyBlockFlag);
    //                     }
    //                     // Установка новых значений
    //                     $(currentCurrencyBlock).find(".currency-block__abb").text(selectedValuteAbb)
    //                     $(currentCurrencyBlock).find(".currency-block__name-text").text(selectedValuteName)

    //                     // Тут должен быть код для смены курса

    //                     let currencyBlock1Output = $(".currency-block__number")[0],
    //                         currencyBlock2Output = $(".currency-block__number")[1];

    //                     let currentInputValue = currencyBlock1Output.value;
    //                     // if ($(menu).css("top") == "0px") {
    //                     //     currentInputValue = currencyBlock1Output.value
    //                     // } else {
    //                     //     currentInputValue = currencyBlock2Output.value
    //                     // }

    //                     console.log(selectedValuteAbb, nextBlockAbb.text(), currentInputValue)

    //                     let result = fx(currentInputValue).from(`${selectedValuteAbb}`).to(`${nextBlockAbb.text()}`)
    //                     if (result > 1) {
    //                         result = result.toFixed(2)
    //                     } else {
    //                         result = result.toFixed(3)
    //                     }

    //                     if (result[result.length - 1] == 0) {
    //                         result = result - result[result.length - 1] // удаление нуля на конце
    //                     }

    //                     // if ($(menu).css("top") == "0px") {
    //                     //     currencyBlock2Output.value = result
    //                     // } else {
    //                     //     currencyBlock1Output.value = result
    //                     // }
    //                     currencyBlock2Output.value = result

    //                     // Тут должен быть код для смены флага
    //                     if (selectedValuteAbb == "EUR") { // Костыль для флага ЕС т.к. на сайте его нет 
    //                         $(currentCurrencyBlock).find("img").attr("src", "/img/EuFlag.png");
    //                         $(currentCurrencyBlock).find("img").attr("alt", "ЕС Флаг");
    //                         $(menu).css("display", "none")
    //                         return
    //                     }

    //                     $.getJSON('countries.json').then(function (countries) {
    //                         let body = countries[selectedValuteAbb]
    //                     })
    //                     // так же alt добавлять

    //                     //
    //                     $(menu).css("display", "none")
    //                     return
    //                 }

    //                 if (!menu.is(e.target) && menu.has(e.target).length === 0) {
    //                     $(menu).css("display", "none");
    //                 }

    //             } else if (currencyBlockList.is(e.target) || // Код для открытия меню
    //                 currencyBlockList.has(e.target).length === 1) { // второе условие это проверка на клик по дочернему элементу

    //                 $(menu).removeAttr("style"); // обнуление прошлых top & bottom
    //                 $(menu).css("display", "flex");

    //                 // Проверка по какому из блоков клик
    //                 if ($(e.target).attr('data-attr') == 1 || $(e.target).closest(".currency-block__left").attr("data-attr") == 1) {
    //                     $(menu).css("top", 0)
    //                 } else {
    //                     $(menu).css("bottom", 0)
    //                 }
    //             } else {
    //                 console.log("nothing")
    //             }
    //         })
    //     })
    // })

});