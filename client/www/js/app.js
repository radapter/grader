(function($) {
    "use strict";

    var gApoint = 90.0;
    var currentUser ={};
    var urlroot = "http://localhost:3000";

    // Setup the event handlers
    $( document ).on( "ready", function()
    {
        //sessionStorage.clear();
        $('#computeGrade').on('click', computeGrade);
        $('#saveSettings').on('click', saveSettings);
        $('#cancelSettings').on('click', cancelSettings);
        $('#createCourseBtn').on('click', createCourse);

        //delegate click event on course panel, aim to pass courseid
        $('#userCourseList').delegate('.coursePanel', 'click', function () {
            console.log($(this).attr('id'));

        });

        $('#testJson').on('click', getlocJson);

        //login button handler
        $('#loginBtn').on('click', login);
        //logout button handler
        $('#logoutBtn').on('click', logout);
        //signup button handler
        $('#signupBtn').on('click', signup);


        //TODO control logged in user info and show/hide different components in pages
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if(currentUser) {
            console.log(currentUser.email);
            prepareUserPages(currentUser);
        } else {
            $('#beforeLoginHome').show();
            $('#afterLoginHome').hide();
        }


        var gradeCutOffSetting = localStorage.getItem('gradeCutOff');

        if (gradeCutOffSetting) {
            gApoint = parseFloat(gradeCutOffSetting);
        }
        $('#gradeCutOff').val(gApoint);

    });


    // Load plugin
    $( document ).on( "deviceready", function(){
        //StatusBar.overlaysWebView( false );
        //StatusBar.backgroundColorByName("gray");
    });

    var computeGrade = function() {
        var currentPoints = Number( $('#points').val() );
        var currentGrade = "NA";

        if (currentPoints >= gApoint) {
            currentGrade = "A";
        } else {
            currentGrade = "F";
        }
        $('#finalgrade').text(currentGrade);
    };

    var saveSettings = function() {
        try {
            var aPoint = parseFloat( $('#gradeCutOff').val() );

            localStorage.setItem('gradeCutOff', aPoint);
            gApoint = aPoint;
            window.history.back();
        } catch (ex) {
            alert('Points must be a decimal value');
        }
    };

    var cancelSettings = function() {
        localStorage.clear();
    };

    //test function
    var getlocJson = function () {
        $.ajax({
            method: "POST",
            dataType: "application/x-www-form-urlencoded",
            url: "http://localhost:3000/users/login",
            data:"email=ddd@ddd.com&password=whatever",
            success: function(data){
                console.log(data);
            },
            error: function(err){
                console.log(err);
            }
        });
        //$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=san jose', function (data) {
        //    console.log(data);
        //
        //    $('#loc').text(data.results[0].formatted_address);
        //})
    };

    var login = function (e) {
        e.preventDefault();

        var formdata = $('#loginForm').serialize();
        $.ajax({
            method: "POST",
            url: urlroot + "/users/login",
            data:formdata,
            success: function(data){
                console.log("login success");
                console.log(data);

                //store current user to sessionStorage
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));

                currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                console.log(currentUser.email);


                prepareUserPages(currentUser);

                //login success, redirect to main page
                $.mobile.changePage($('#userhome'), 'slide', true, true);

            },
            error: function(err){
                console.log("login failed");
                console.log(err.responseText);
                //TODO, login error, show alert dialog
            }
        });
    };

    var logout = function () {
        $.ajax({
            method: "POST",
            url: urlroot + "/users/logout",
            success: function(data){
                console.log("logout success");
                console.log(data);

                //store current user to sessionStorage
                sessionStorage.clear();
                $('#beforeLoginHome').show();
                $('#afterLoginHome').hide();
            },
            error: function(err){
                console.log("login failed");
                console.log(err.responseText);
                //TODO, login error, show alert dialog
            }
        });
    };


    var signup = function (e) {
        e.preventDefault();

        var formdata = $('#signupForm').serialize();

        //assign user id with timestamp/1000
        var userId = Math.floor(Date.now()/1000);
        formdata = formdata +  "&userId=" + userId;

        $.ajax({
            method: "POST",
            url: urlroot + "/users/signup",
            data:formdata,
            success: function(data){
                console.log("signup success");
                console.log(data);

                //store current user to sessionStorage
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));

                currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                console.log(currentUser.email);

                prepareUserPages(currentUser);

                //login success, redirect to main page
                $.mobile.changePage($('#userhome'), 'slide', true, true);

            },
            error: function(err){
                console.log("signup failed");
                console.log(err.responseText);
                //TODO, signup error, show alert dialog
            }
        });
    };

    var createCourse = function (e) {
        e.preventDefault();

        //build course data to json
        var formdata = $("#createCourseForm").serializeArray();
        console.log(formdata);

        var courseObj = {};
        courseObj.name = $("input[name=name]").val();
        courseObj.description = $("textarea[name=description]").val();

        var meta ={};
        var Homeworks ={};
        Homeworks.max = $("input[name=HomeworksMax]").val();
        Homeworks.factor = $("input[name=HomeworksFactor]").val();
        var Labs ={};
        Labs.max = $("input[name=LabsMax]").val();
        Labs.factor = $("input[name=LabsFactor]").val();
        var Project ={};
        Project.max = $("input[name=ProjectMax]").val();
        Project.factor = $("input[name=ProjectFactor]").val();
        var Presentation ={};
        Presentation.max = $("input[name=PresentationMax]").val();
        Presentation.factor = $("input[name=PresentationFactor]").val();
        var Midterm ={};
        Midterm.max = $("input[name=MidtermMax]").val();
        Midterm.factor = $("input[name=MidtermFactor]").val();
        var Final ={};
        Final.max = $("input[name=FinalMax]").val();
        Final.factor = $("input[name=FinalFactor]").val();

        meta.Homeworks = Homeworks;
        meta.Labs = Labs;
        meta.Project = Project;
        meta.Presentation = Presentation;
        meta.Midterm = Midterm;
        meta.Final = Final;

        courseObj.meta = meta;

        var policy ={};
        policy.A = $("input[name=PolicyA]").val();
        policy.B = $("input[name=PolicyB]").val();
        policy.C = $("input[name=PolicyC]").val();
        policy.D = $("input[name=PolicyD]").val();

        courseObj.policy = policy;

        console.log(courseObj);

        $.ajax({
            url:urlroot+"/courses",
            type: "POST",
            data: JSON.stringify(courseObj),
            contentType: "application/json",
            success: function(data){
                console.log(data.course);

                //TODO goto course detail page
            },
            error: function(err){
                console.log(err);
            }
        });

    };


    function goCourseDetail(courseId) {
        console.log(courseId);
    }

    //prepare pages based on user info
    var prepareUserPages = function (currentUser) {

        $('#beforeLoginHome').hide();
        $('#afterLoginHome').show();

        $("#userFname").html(currentUser.fname);

        //userCourse list template
        var userCoursesTmp = _.template($("script#userCourseListTmp").html());

        //load user profile
        var userProfileTmp = _.template($("script#userProfileTmp").html());
        currentUser.avatarUrl = "./img/avatars/"+currentUser.avatarId +".png";
        $("#userProfilePanel").html(userProfileTmp(currentUser));


        if(currentUser.userType === "teacher") {

            //userhome page setting
            //hide enrolBtn
            $("#goEnrollCourseBtn").hide();
            //show createBtn
            $("#gocCreateCourseBtn").show();

            //get userCourseList
            $.getJSON(urlroot+"/courses/me", function (data) {
                var userCourseList = data;

                console.log(userCourseList);
                //data.courses
                $("#userCourseList").html(userCoursesTmp(userCourseList));

                //!!apply styles after dynamically adding element
                $("#userCourseList").trigger('create');
            });

        } else {
            //userhome page setting
            $("#goEnrollCourseBtn").show();
            $("#gocCreateCourseBtn").hide();

            //get userCourseList
            $.getJSON(urlroot+"/enrolls/", function (data) {
                var userCourseList = data;
                console.log(userCourseList);
                //data.enrolls
                $("#userCourseList").html(userCoursesTmp(userCourseList));

                //!!apply styles after dynamically adding element
                $("#userCourseList").trigger('create');

            });
        }


    }


}


)(jQuery);
