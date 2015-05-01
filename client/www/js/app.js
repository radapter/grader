(function($) {
    "use strict";

    var gApoint = 90.0;

    var computeGrade = function()
    {
        var currentPoints = Number( $('#points').val() );
        var currentGrade = "NA";

        if (currentPoints >= gApoint)
        {
            currentGrade = "A";
        }
        else
        {
            currentGrade = "F";
        }
        $('#finalgrade').text(currentGrade);
    };

    var saveSettings = function()
    {
        try {
            var aPoint = parseFloat( $('#gradeCutOff').val() );

            localStorage.setItem('gradeCutOff', aPoint);
            gApoint = aPoint;
            window.history.back();
        } catch (ex)
        {
            alert('Points must be a decimal value');
        }
    };

    var cancelSettings = function()
    {
        localStorage.clear();
    };

    var getlocJson = function () {

        //$.ajax({
        //    method: "POST",
        //    url: "http://localhost:3000/login?email=jj@me.com&password=1234",
        //    success: function(data){
        //        console.log(data);
        //    },
        //    error: function (err) {
        //        console.log("in error");
        //        console.log(err);
        //    }
        //
        //});

        $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=san jose', function (data) {
            console.log(data);

            $('#loc').text(data.results[0].formatted_address);
        })
    };


    // Setup the event handlers
    $( document ).on( "ready", function()
    {
        $('#computeGrade').on('click', computeGrade);
        $('#saveSettings').on('click', saveSettings);
        $('#cancelSettings').on('click', cancelSettings);

        $('#testJson').on('click', getlocJson);

        var gradeCutOffSetting = localStorage.getItem('gradeCutOff');

        if (gradeCutOffSetting)
        {
            gApoint = parseFloat(gradeCutOffSetting);
        }

        $('#gradeCutOff').val(gApoint);

    });

    // Load plugin
    $( document ).on( "deviceready", function(){
        StatusBar.overlaysWebView( false );
        StatusBar.backgroundColorByName("gray");
    });
}


)(jQuery);
