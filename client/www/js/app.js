(function($) {
    "use strict";

    var gApoint = 90.0;
    var currentUser = {};
    var allCoursesList= {};
    var userCourseList= {};
    var urlroot = "http://localhost:3000";

    // Setup the event handlers
    $( document ).on( "ready", function()
    {
        //sessionStorage.clear();
        $('#computeGrade').on('click', computeGrade);
        $('#saveSettings').on('click', saveSettings);
        $('#cancelSettings').on('click', cancelSettings);
        $('#testJson').on('click', getlocJson);

        //login button handler
        $('#loginBtn').on('click', login);
        //logout button handler
        $('#logoutBtn').on('click', logout);
        //signup button handler
        $('#signupBtn').on('click', signup);
        //create a course
        $('#createCourseBtn').on('click', createCourse);
        //search course list
        $('#goEnrollCourseBtn').on('click', goEnrollCourse);
        //enroll a course
        $('#enrollCourseBtn').on('click', enrollCourse);

        //delegate click event on course panel, aim to pass courseid
        $('#userCourseList').delegate('.coursePanel', 'click', function () {
            console.log($(this).attr('id'));

            //if teacher, go to course detail page
            if(currentUser.userType === "teacher"){
                var courseId = $(this).attr('id');
                prepareCourseDetailPage(courseId);
                //load course success, redirect to courseDeatil page
                $.mobile.changePage($('#courseDetail'), 'slide', true, true);
            }

            //if student, go to enroll detail page
            if(currentUser.userType === "student"){
                var enrollId = $(this).attr('id');
                prepareEnrollDetailPage(enrollId);
                //load course success, redirect to enrollDetail page
                $.mobile.changePage($('#enrollDetail'), 'slide', true, true);
            }

        });

        //delegate click event on all enroll course list, aim to pass courseid
        $('#allEnrollCourseList').delegate('.coursePanel', 'click', function () {
            console.log($(this).attr('id'));
            var courseId = $(this).attr('id');
            prepareCourseShowPage(courseId);
            //load course success, redirect to courseDeatil page
            $.mobile.changePage($('#courseDetail'), 'slide', true, true);
        });

        //delegate click event on enroll list fo teacher, aim to pass enrollid
        $('#enrollList').delegate('.enrollPanel', 'click', function () {
            console.log($(this).attr('id'));
            var enrollId = $(this).attr('id');
            prepareEnrollDetailPage(enrollId);
            //load course success, redirect to courseDeatil page
            $.mobile.changePage($('#enrollDetail'), 'slide', true, true);
        });

        //init hiding landing home icon, show after login
        $('#landingHomeIcon').hide();

        // control logged in user info and show/hide different components in pages
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if(currentUser) {
            console.log(currentUser.email);
            prepareUserPages(currentUser);

            allCoursesList = JSON.parse(sessionStorage.getItem('allCoursesList'));
            if(allCoursesList){
                prepareEnrollCoursePage(allCoursesList);
            }

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
                $('#landingHomeIcon').hide();
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

                // goto course detail page
                prepareCourseDataPage(data.course);
                prepareUserPages(currentUser);
                $.mobile.changePage($('#courseDetail'), 'slide', true, true);

            },
            error: function(err){
                console.log(err);
            }
        });

    };

    //prepare pages based on user info
    var prepareUserPages = function (currentUser) {

        $('#beforeLoginHome').hide();
        $('#afterLoginHome').show();
        $('#landingHomeIcon').show();

        $("#userFname").html(currentUser.fname);

        //userCourse list template
        var userCoursesTmp = _.template($("script#userCourseListTmp").html());
        var userEnrollListTmp = _.template($("script#userEnrollListTmp").html());

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

                //save userCourseList in sessionStorage
                sessionStorage.setItem('userCourseList', JSON.stringify(userCourseList));

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

                //save userCourseList in sessionStorage
                sessionStorage.setItem('userCourseList', JSON.stringify(userCourseList));

                //data.enrolls
                $("#userCourseList").html(userEnrollListTmp(userCourseList));

                //!!apply styles after dynamically adding element
                $("#userCourseList").trigger('create');

            });
        }

    };

    //prepare course detail page based on stored courseList.courses
    var prepareCourseDetailPage = function (courseId) {

        if(currentUser.userType === "teacher") {
            $('#enrollCourseBtn').hide();
            $('#editCourseBtn').show();
            prepareEnrollList(courseId);
            $('#enrollList').show();
        } else {
            $('#enrollCourseBtn').show();
            $('#editCourseBtn').hide();
            $('#enrollList').hide();
        }

        //courseDetail  template
        var courseDetailTmp = _.template($("script#courseDetailTmp").html());
        var courseData = {};

        //first check sessionStroage
        var userCourseList = JSON.parse(sessionStorage.getItem('userCourseList'));
        if(userCourseList) {

            //if teacher, go to course detail page
            if(userCourseList.courses) {
                console.log(userCourseList.courses);
                $.each(userCourseList.courses, function (index, course) {
                    if(course._id === courseId){
                        console.log("course hit");
                        courseData = course;
                    }
                });
                console.log(courseData);
            }
        }
        //if not in sessionstorage, call GET to get course detail
        else {}

        //load course template, go to coursedetail page
        //data.enrolls
        $("#courseDetailPanel").html(courseDetailTmp(courseData));

        //!!apply styles after dynamically adding element
        $("#courseDetailPanel").trigger('create');


    };

    //prepare course show page based on stored allCoursesList.courses
    var prepareCourseShowPage = function (courseId) {

        if(currentUser.userType === "teacher") {
            $('#enrollCourseBtn').hide();
            $('#editCourseBtn').show();
            prepareEnrollList(courseId);
            $('#enrollList').show();
        } else {
            $('#enrollCourseBtn').show();
            $('#editCourseBtn').hide();
            $('#enrollList').hide();
        }

        //courseDetail  template
        var courseDetailTmp = _.template($("script#courseDetailTmp").html());
        var courseData = {};

        //first check sessionStroage
        var allCoursesList = JSON.parse(sessionStorage.getItem('allCoursesList'));
        if(allCoursesList) {

            //if teacher, go to course detail page
            if(allCoursesList.courses) {
                console.log(allCoursesList.courses);
                $.each(allCoursesList.courses, function (index, course) {
                    if(course._id === courseId){
                        console.log("course hit");
                        courseData = course;
                    }
                });
                console.log(courseData);
            }
        }
        //if not in sessionstorage, call GET to get course detail
        else {}

        //load course template, go to coursedetail page
        //data.enrolls
        $("#courseDetailPanel").html(courseDetailTmp(courseData));

        //!!apply styles after dynamically adding element
        $("#courseDetailPanel").trigger('create');


    };

    //prepare course show page based on passed course data
    var prepareCourseDataPage = function (course) {

        if(currentUser.userType === "teacher") {
            $('#enrollCourseBtn').hide();
            $('#editCourseBtn').show();
            prepareEnrollList(course._id);
            $('#enrollList').show();
        } else {
            $('#enrollCourseBtn').show();
            $('#editCourseBtn').hide();
            $('#enrollList').hide();
        }

        //courseDetail  template
        var courseDetailTmp = _.template($("script#courseDetailTmp").html());

        //load course template, go to coursedetail page
        //data.enrolls
        $("#courseDetailPanel").html(courseDetailTmp(course));

        //!!apply styles after dynamically adding element
        $("#courseDetailPanel").trigger('create');


    };

    //prepare enroll list in course detail page for teacher
    var prepareEnrollList = function (courseId) {

        //get all enrolls under a class
        $.getJSON(urlroot+"/enrolls/courses/"+ courseId, function (data) {
            console.log(data);
            var courseEnrolListTmp = _.template($("script#courseEnrolListTmp").html());
            $("#enrollList").html(courseEnrolListTmp(data));
            //!!apply styles after dynamically adding element
            $("#enrollList").trigger('create');
        });

    };

    //prepare enroll detail page based on stored courseList.enrolls
    var prepareEnrollDetailPage = function (enrollId) {

        if(currentUser.userType === "teacher") {
            $('#whatifBtn').hide();
            $('#editScoreBtn').show();

            //courseDetail  template
            var studentEnrollDetailTmp = _.template($("script#studentEnrollDetailTmp").html());
            var studentEnrollData = {};

            console.log("load enroll detail for teacher....");


            //TODO get enrollData
            //need GET a enroll with id api for teacher to access enroll detail page
            //$.getJSON(XX, function (data) {
            //
            //    //load course template, go to coursedetail page
            //    //data.enrolls
            //    $("#enrollDetailPanel").html(studentEnrollDetailTmp(data));
            //
            //    //!!apply styles after dynamically adding element
            //    $("#enrollDetailPanel").trigger('create');
            //
            //});
            //

        } else {

            // if student
            $('#whatifBtn').show();
            $('#editScoreBtn').hide();

            //courseDetail  template
            var myEnrollDetailTmp = _.template($("script#myEnrollDetailTmp").html());
            var myEnrollData = {};

            //first check sessionStroage
            var userCourseList = JSON.parse(sessionStorage.getItem('userCourseList'));
            if(userCourseList) {

                //if student, go to enroll detail page
                if(userCourseList.enrolls){
                    console.log(userCourseList.enrolls);
                    $.each(userCourseList.enrolls, function (index, enroll) {
                        if(enroll._id === enrollId){
                            console.log("enroll hit");

                            myEnrollData = enroll;

                        }
                    });
                }
            }
            //if not in sessionstorage, call GET to get course detail
            else {}

            //load course template, go to coursedetail page
            //data.enrolls
            $("#enrollDetailPanel").html(myEnrollDetailTmp(myEnrollData));

            //!!apply styles after dynamically adding element
            $("#enrollDetailPanel").trigger('create');

        }

    };

    //prepare enrollCourse page, get all course list
    var prepareEnrollCoursePage = function (allCoursesList) {
        var allEnrollCourseListTmp = _.template($("script#allEnrollCourseListTmp").html());
        $("#allEnrollCourseList").html(allEnrollCourseListTmp(allCoursesList));
        //!!apply styles after dynamically adding element
        $("#allEnrollCourseList").trigger('create');
    };

    //goto enrollCourse page, prepare and redirect
    var goEnrollCourse = function () {
        //call all course api to get all course list
        //get userCourseList
        $.getJSON(urlroot+"/courses/", function (data) {
            var allCoursesList = data;
            console.log(allCoursesList);

            //save userCourseList in sessionStorage
            sessionStorage.setItem('allCoursesList', JSON.stringify(allCoursesList));

            userCourseList =  JSON.parse(sessionStorage.getItem('userCourseList'));

            var showCourse = [];

            //compare userCourseList and allCourseList, remove user already enrolled courses
            $.each(allCoursesList.courses, function (index, course) {


                var hasEnroll = false;
                $.each(userCourseList.enrolls, function (index, enroll) {
                   if(course._id == enroll._course._id) hasEnroll = true;
                });

                if(!hasEnroll) showCourse.push(course);

            });

            console.log(showCourse);

            var showCourseList = {};
            showCourseList.courses = showCourse;

            prepareEnrollCoursePage(showCourseList);
            $.mobile.changePage($('#enrollCourse'), 'slide', true, true);
        });
    };

    //enroll a course
    var enrollCourse = function () {
        //get courseId
        var courseId = $('#courseIDDetailPage').html();
        console.log(courseId);

        var enrollObj ={};
        enrollObj._course = courseId;

        $.ajax({
            url:urlroot+"/enrolls",
            type: "POST",
            data: JSON.stringify(enrollObj),
            contentType: "application/json",
            success: function(data){
                console.log(data);

                // goto userhome page
                prepareUserPages(currentUser);
                $.mobile.changePage($('#userhome'), 'slide', true, true);
            },
            error: function(err){
                console.log(err);
            }
        });
    };

}


)(jQuery);
