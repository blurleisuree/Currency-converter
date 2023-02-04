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
    })

    // Swap --------------------------------------------------------------------------

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

    let swapClick = () => {

        leftBlockSwap();

        // Тут должен быть скрипт для свапа курсов валют

        if (click == true) { // Чтобы клики подряд правильно отображались
            rotate += 180
        } else {
            rotate += 90;
        }
        $(swapBtn).css("transform", `rotate(${rotate}deg)`);
        click = true;
    }

    let leftBlockSwap = () => {

        let interim; // Промежуточная перменная

        let currencyBlock1 = $(".currency-block")[0],
            currencyBlock2 = $(".currency-block")[1];

        let currencyBlockLeft = $(".currency-block__left")[0],
            currencyBlockRight = $(".currency-block__left")[1];

        interim = currencyBlockRight;
        currencyBlock2.prepend(currencyBlockLeft)
        currencyBlock1.prepend(interim)

        // Смена аттрибута для меню
        let dataCurrencyBlockList = $(".currency-block__left");
        $(dataCurrencyBlockList[0]).attr("data-attr", 1);
        $(dataCurrencyBlockList[1]).attr("data-attr", 2);
    }

    swapBtn.click(swapClick)

    // Меню выбора валюты -------------------------------------------------------

    async function valuteArrCreate() {
        let valuteArr = [];

        await $.ajax({
            url: "https://www.cbr-xml-daily.ru/daily_json.js",
            method: "get",
            dataType: "json",
            error: function () {
                console.log("error")
            },
            success: function (data) {

                $.each(data.Valute, function (key, value) {
                    valuteArr.push({
                        abb: `${value.CharCode}`,
                        name: `${value.Name}`
                    })
                })

                // Добавление RUB в массив
                valuteArr.unshift({
                    abb: "RUB",
                    name: "Российский рубль"
                })

                return valuteArr
            }
        })

        return valuteArr
    }

    valuteArrCreate().then(function (valuteArr) {
        // код для меню выбора валюты

        const currencyBlock1 = $(".currency-block__left")[0],
            currencyBlock2 = $(".currency-block__left")[1],
            currencyBlockList = $(".currency-block__left"),
            menu = $(".valute-menu");

        $.each(valuteArr, function (key, value) {
            $(menu).append("<div class='valute-menu__item'></div>");

            let valuteItem = $('.valute-menu__item');
            valuteItem = valuteItem[valuteItem.length - 1];

            $(valuteItem).append(`<div class='valute-menu__name'>${value.name}</div>`)
            $(valuteItem).append(`<div class='valute-menu__abb'>${value.abb}</div>`)
        })

        $(document).click(function (e) {
            if ($(menu).css("display") == "flex") { // Закрытие меню

                if (currencyBlockList.is(e.target) ||
                    currencyBlockList.has(e.target).length === 1) { // Проверка был ли клик на соседний блок
                    $(menu).removeAttr("style"); // обнуление прошлых top & bottom

                    if ($(e.target).attr('data-attr') == 1 || $(e.target).closest(".currency-block__left").attr("data-attr") == 1) {
                        $(menu).css("top", 0)
                    } else {
                        $(menu).css("bottom", 0)
                    }
                    $(menu).css('display', "flex") // из за обнуления стилей до этого
                    return
                }

                // Код для выбора валюты
                if (menu.has(e.target).length === 1) {
                    // Определение текущего блока
                    let currentCurrencyBlock;
                    if ($(menu).css("top") == "0px") {
                        currentCurrencyBlock = currencyBlock1;
                    } else {
                        currentCurrencyBlock = currencyBlock2;
                    };

                    let currentCurrencyBlockAbb = $(currentCurrencyBlock).find(".currency-block__abb").text(),
                        currentCurrencyBlockName = $(currentCurrencyBlock).find(".currency-block__name-text").text();

                    // Определение выбраной валюты
                    let selectedItem = $(e.target).closest(".valute-menu__item")[0],
                        selectedValuteAbb = $(selectedItem).children(".valute-menu__abb").text(),
                        selectedValuteName = $(selectedItem).children(".valute-menu__name").text();

                    // Выбор уже выбранной валюты
                    if (selectedValuteAbb == currentCurrencyBlockAbb) {
                        $(menu).css("display", "none")
                        return
                    }

                    // В том случае если выбирается валюта такая же как в соседнем блоке
                    let nextBlock, nextBlockAbb, nextBlockName;
                    if ($(currentCurrencyBlock).attr("data-attr") == 1) {
                        nextBlock = $("[data-attr = 2]");
                    } else {
                        nextBlock = $("[data-attr = 1]");
                    }
                    nextBlockAbb = $(nextBlock).find(".currency-block__abb");
                    nextBlockName = $(nextBlock).find(".currency-block__name-text");
                    if (selectedValuteAbb == $(nextBlockAbb).text()) {
                        $(nextBlockAbb).text(currentCurrencyBlockAbb);
                        $(nextBlockName).text(currentCurrencyBlockName);
                    }
                    // Установка новых значений
                    $(currentCurrencyBlock).find(".currency-block__abb").text(selectedValuteAbb)
                    $(currentCurrencyBlock).find(".currency-block__name-text").text(selectedValuteName)

                    // Тут должен быть код для смены флага
                    // Тут должен быть код для смены курса

                    //
                    $(menu).css("display", "none")
                    return
                }

                if (!menu.is(e.target) && menu.has(e.target).length === 0) {
                    $(menu).css("display", "none");
                }

            } else if (currencyBlockList.is(e.target) || // Код для открытия меню
                currencyBlockList.has(e.target).length === 1) { // второе условие это проверка на клик по дочернему элементу

                $(menu).removeAttr("style"); // обнуление прошлых top & bottom
                $(menu).css("display", "flex");

                // Проверка по какому из блоков клик
                if ($(e.target).attr('data-attr') == 1 || $(e.target).closest(".currency-block__left").attr("data-attr") == 1) {
                    $(menu).css("top", 0)
                } else {
                    $(menu).css("bottom", 0)
                }
            } else {
                console.log("nothing")
            }
        })



    })



});