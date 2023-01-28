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

        // тут должен быть скрипт для сваппа

        if (click == true) { // Чтобы клики подряд правильно отображались
            rotate += 180
        } else {
            rotate += 90;
        }
        $(swapBtn).css("transform", `rotate(${rotate}deg)`);
        click = true;
    }

    swapBtn.click(swapClick)
    //


});