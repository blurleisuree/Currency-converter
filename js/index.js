$(document).ready(function () {

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

});