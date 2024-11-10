document.addEventListener("DOMContentLoaded", () => {
    new fullpage('#fullpage', {
        anchors: ['hero', 'about', 'portfolio', 'contact'], 
        menu: '.navbar', 
        navigation: true,
        navigationPosition: 'right', 
        scrollBar: false, 
        responsiveWidth: 900, 
    });
});