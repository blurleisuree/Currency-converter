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
    }

    swapBtn.click(swapClick)

    // Меню выбора валюты 


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
                return valuteArr
            }
        })

        return valuteArr
    }

    valuteArrCreate().then(function (result) {
        // код для меню выбора валюты
    })


});