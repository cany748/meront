window.deviceType = {
    browser: (function () {
        if ( !platform.version ) {
            platform.version = '0.0'
        }
        document.documentElement.classList.add(platform.name.toLowerCase().split(' ')[0], (platform.name.toLowerCase().split(' ')[0] + platform.version.split('.')[0]).toLowerCase());
        return {
            name: platform.name,
            version: platform.version
        };
    })(),
    mobile: isMobile.any,
    mouse: false,
    touch: false,
    scrollWidth: 0
};

$(function(){
    var $window = $(window);
    var docElement = document.documentElement;
    var $test = $('<div />').css({
        'position': 'absolute',
        'top': -500,
        'overflow': 'scroll'
    }).appendTo(document.body);

    deviceType.scrollWidth = $test.outerWidth();


    if ( deviceType.mobile ) {
        deviceType.touch = true;
        docElement.classList.add('device-mobile', 'device-touch');
        docElement.addEventListener('touchstart', function(){});
        // typeEvents('mouse');
    }
    else {
        deviceType.mouse = true;
        docElement.classList.add('device-mouse');
        // typeEvents('touch');
    }

    typeEvents();

    function typeEvents (type) {
        $window.off('.detect-device-pointer');
        if ( !type || type == 'touch' ) {
            $window.one('touchstart.detect-device-pointer', function () {
                $window.off('.detect-device-pointer');
                docElement.classList.remove('device-mouse');
                docElement.classList.add('device-touch');
                deviceType.touch = true;
                deviceType.mouse = false;
                $window.trigger('pointerChanged');
                // typeEvents('mouse');
            });
        }
        if ( !type || type == 'mouse' ) {
            $window.one('mousemove.detect-device-pointer', function () {
                $window.off('.detect-device-pointer');
                docElement.classList.remove('device-touch');
                docElement.classList.add('device-mouse');
                deviceType.touch = false;
                deviceType.mouse = true;
                $window.trigger('pointerChanged');
                // typeEvents('touch');
            });
        }
    }
});
