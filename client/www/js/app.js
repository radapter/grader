(function($) {
    "use strict";

    var gApoint = 90.0;
    var currentUser = {};
    var allCoursesList= {};
    var userCourseList= {};
    var tempEnrollData = {};
    var urlroot = "http://localhost:3000";

    // Setup the event handlers
    $( document ).on( "ready", function()
    {
        //sessionStorage.clear();
        $(".nav-dropdown").on("click", function(){
           $(".nav-dropdown-list").toggle();
        });

        $(".nav-dropdown-list").on("click", function(){
           $(this).closest(".nav-dropdown-list").toggle();
        });

        $("a").click(function(){
           $(".nav-dropdown-list").hide();
        });

        //$("#createCourseForm").rangeslider();


        $(document).on('pageshow', '#createCourse' ,function(){
            //$("div.cutoffs").rangeslider({defaults: true});
            changeSliders();

            $("#createCourseForm input.percent").on("change", function(){
                var totalPercent = 0;
                $("#createCourseForm input.percent").each(function(){
                    if($(this).val().length){
                        //console.log($(this).id + ": " + $(this).val());
                        totalPercent += parseInt($(this).val());
                        console.log("totalPercent is: " + totalPercent);
                        $("span.total-percent").html(totalPercent);
                    }
                });

                $("#createCourseForm input.percent").blur(function(){
                    //check that not all are empty
                    var empty = $(this).closest("div.course-meta").find("input.percent").filter(function() {
                        return $(this).val().length === 0;
                    });
                    if(!empty.length) {
                        if(totalPercent != 100){
                            console.log("total percent does not add up to 100");
                            $("span#total-percent").css("color","red");
                            $("p.percent-error").show();
                        }
                        else{
                            $("span#total-percent").css("color","black");
                            $("p.percent-error").hide();
                        }
                    }
                });
            });


        });

        $(document).on('pageshow', '#editCourse', function(){
            changeSlidersEdit();
        });

        $(document).on('pageshow', '#enrollDetail', function(){
            calculateGrade();
        });

        $(document).on('pageshow', '#actualScoreEdit', function(){
            calculateGrade();
            $("input").change(function(){
                //console.log("here");
               calculateGrade();
            });
        });

        $(document).on('pageshow', '#enrollDetail', function(){
            var enrollid = $("button#whatifBtn").data("enrollid");

            //get enroll with enrollid
            console.log(enrollid);
            tempEnrollData = JSON.parse(sessionStorage.getItem("tempEnrollData"));
            console.log(tempEnrollData);

            var totalScore = 0;
            for(var section in tempEnrollData.grade){
                var sectMax = tempEnrollData._course.meta[section].max;
                var factor = tempEnrollData._course.meta[section].factor;
                var score = tempEnrollData.grade[section].actual;

                console.log(section, sectMax, factor, score);
                totalScore += (score/sectMax)*factor;
                console.log(totalScore);
            }

            $("span.grade-value").html(totalScore.toFixed(1));

            var letterGrade = '';
            var aMin = tempEnrollData._course.policy.A;
            var bMin = tempEnrollData._course.policy.B;
            var cMin = tempEnrollData._course.policy.C;
            var dMin = tempEnrollData._course.policy.D;
            if(totalScore >= aMin){
                letterGrade = 'A';
            }
            else if (totalScore >= bMin){
                letterGrade = 'B';
            }
            else if (totalScore >= cMin){
                letterGrade = 'C';
            }
            else if (totalScore >= dMin){
                letterGrade = 'D';
            }
            else{
                letterGrade = 'F';
            }

            $("span.letter-grade").html(letterGrade);

        });

        $(document).on('pageshow', '#whatifEdit', function(){
            recalcGrade();
            $("input").change(function(){
               recalcGrade();
            });

        });

        $('#computeGrade').on('click', computeGrade);
        $('#saveSettings').on('click', saveSettings);
        $('#cancelSettings').on('click', cancelSettings);

        //login button handler
        $('#loginBtn').on('click', login);
        //logout button handler
        $('.logoutBtn').on('click', logout);
        //signup button handler
        $('#signupBtn').on('click', signup);
        //create a course
        $('#createCourseBtn').on('click', createCourse);

        //edit a course
        $('#editCourseBtn').on('click', editCourse);

        //search course list
        $('#goEnrollCourseBtn').on('click', goEnrollCourse);
        //enroll a course
        $('#enrollCourseBtn').on('click', enrollCourse);

        //back to courselist - teacher
        $('#backToCourseBtn').on('click', backToCourseDetail);
        //back to enroldetail - student
        $('#backToEnrollBtn').on('click', backToEnrollDetail);
        $('#backToEnrollDetailBtn').on('click', backToEnrollDetail);


        //delegate click event on course panel, aim to pass courseid
        $('#userCourseList').delegate('.coursePanel', 'click', function () {
            console.log($(this).attr('id'));

            //if teacher, go to course detail page
            if(currentUser.userType === "Teacher"){
                var courseId = $(this).attr('id');
                prepareCourseDetailPage(courseId);
                //load course success, redirect to courseDeatil page
                $.mobile.changePage($('#courseDetail'), 'slide', true, true);
            }

            //if student, go to enroll detail page
            if(currentUser.userType === "Student"){
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


    var recalcGrade = function(){
        var form = $("form#whatifGradeForm");

        //collect user input
        var actualGrade = {};
        var Homeworks = {};
        var totalScore = 0;
        Homeworks.whatif = form.find('input[name="HomeworksWhatif"]').val();
        Homeworks.max = form.find('input[name="HomeworksWhatif"]').prop('max');
        Homeworks.factor = form.find('input#HomeworksFactor').val();
        //console.log(Homeworks);
        totalScore += (Homeworks.whatif/Homeworks.max)*(Homeworks.factor);
        //console.log(totalScore.toFixed(3));

        var Labs = {};
        Labs.whatif = form.find('input[name="LabsWhatif"]').val();
        Labs.max = form.find('input[name="LabsWhatif"]').prop('max');
        Labs.factor = form.find('input#LabsFactor').val();
        totalScore += (Labs.whatif/Labs.max)*(Labs.factor);
        //console.log(totalScore.toFixed(3));

        var Project = {};
        Project.whatif = form.find('input[name="ProjectWhatif"]').val();
        Project.max = form.find('input[name="ProjectWhatif"]').prop('max');
        Project.factor = form.find('input#ProjectFactor').val();
        totalScore += (Project.whatif/Project.max)*(Project.factor);
        //console.log(totalScore.toFixed(3));

        var Presentation = {};
        Presentation.whatif = form.find('input[name="PresentationWhatif"]').val();
        Presentation.max = form.find('input[name="PresentationWhatif"]').prop('max');
        Presentation.factor = form.find('input#PresentationFactor').val();
        totalScore += (Presentation.whatif/Presentation.max)*(Presentation.factor);
        //console.log(totalScore.toFixed(3));

        var Midterm = {};
        Midterm.whatif = form.find('input[name="MidtermWhatif"]').val();
        Midterm.max = form.find('input[name="MidtermWhatif"]').prop('max');
        Midterm.factor = form.find('input#MidtermFactor').val();
        totalScore += (Midterm.whatif/Midterm.max)*(Midterm.factor);
        //console.log(totalScore.toFixed(3));

        var Final = {};
        Final.whatif = form.find('input[name="FinalWhatif"]').val();
        Final.max = form.find('input[name="FinalWhatif"]').prop('max');
        Final.factor = form.find('input#FinalFactor').val();
        totalScore += (Final.whatif/Final.max)*(Final.factor);
        //console.log(totalScore.toFixed(3));

        actualGrade.Homeworks = Homeworks;
        actualGrade.Labs = Labs;
        actualGrade.Project = Project;
        actualGrade.Presentation = Presentation;
        actualGrade.Midterm = Midterm;
        actualGrade.Final = Final;

        //console.log(actualGrade);
        //console.log(totalScore.toFixed(1));

        $("h1.student-grade span.grade-value").html(totalScore.toFixed(1));
        var totalGrade = '';

        var scale = $("input#grading-scale");
        var minA = scale.attr("data-a");
        var minB = scale.attr("data-b");
        var minC = scale.attr("data-c");
        var minD = scale.attr("data-d");
        console.log(minA, minB, minC, minD);
        if(totalScore >= minA){
            totalGrade = "A";
        }
        else if(totalScore >= minB){
            totalGrade = "B";
        }
        else if (totalScore >= minC){
            totalGrade = "C";
        }
        else if (totalScore >= minD){
            totalGrade = "D";
        }
        else{
            totalGrade = "F";
        }

        $("h1.student-grade span.letter-grade").html(totalGrade);

    }


    var calculateGrade = function(){
        var form = $('#actualScoreForm');
        //console.log(form);

        //collect user input
        var actualGrade = {};
        var Homeworks = {};
        var totalScore = 0;
        Homeworks.actual = form.find('input[name="HomeworksActual"]').val();
        Homeworks.max = form.find('input[name="HomeworksActual"]').prop('max');
        Homeworks.factor = form.find('input#HomeworksFactor').val();
        totalScore += (Homeworks.actual/Homeworks.max)*(Homeworks.factor);
        //console.log(totalScore.toFixed(3));

        var Labs = {};
        Labs.actual = form.find('input[name="LabsActual"]').val();
        Labs.max = form.find('input[name="LabsActual"]').prop('max');
        Labs.factor = form.find('input#LabsFactor').val();
        totalScore += (Labs.actual/Labs.max)*(Labs.factor);
        //console.log(totalScore.toFixed(3));

        var Project = {};
        Project.actual = form.find('input[name="ProjectActual"]').val();
        Project.max = form.find('input[name="ProjectActual"]').prop('max');
        Project.factor = form.find('input#ProjectFactor').val();
        totalScore += (Project.actual/Project.max)*(Project.factor);
        //console.log(totalScore.toFixed(3));

        var Presentation = {};
        Presentation.actual = form.find('input[name="PresentationActual"]').val();
        Presentation.max = form.find('input[name="PresentationActual"]').prop('max');
        Presentation.factor = form.find('input#PresentationFactor').val();
        totalScore += (Presentation.actual/Presentation.max)*(Presentation.factor);
        //console.log(totalScore.toFixed(3));

        var Midterm = {};
        Midterm.actual = form.find('input[name="MidtermActual"]').val();
        Midterm.max = form.find('input[name="MidtermActual"]').prop('max');
        Midterm.factor = form.find('input#MidtermFactor').val();
        totalScore += (Midterm.actual/Midterm.max)*(Midterm.factor);
        //console.log(totalScore.toFixed(3));

        var Final = {};
        Final.actual = form.find('input[name="FinalActual"]').val();
        Final.max = form.find('input[name="FinalActual"]').prop('max');
        Final.factor = form.find('input#FinalFactor').val();
        totalScore += (Final.actual/Final.max)*(Final.factor);
        //console.log(totalScore.toFixed(3));

        actualGrade.Homeworks = Homeworks;
        actualGrade.Labs = Labs;
        actualGrade.Project = Project;
        actualGrade.Presentation = Presentation;
        actualGrade.Midterm = Midterm;
        actualGrade.Final = Final;

        //console.log(actualGrade);
        console.log(totalScore.toFixed(1));

        $("h1.student-grade span.grade-value").html(totalScore.toFixed(1));
        var totalGrade = '';

        var scale = $("input#grading-scale");
        var minA = scale.attr("data-a");
        var minB = scale.attr("data-b");
        var minC = scale.attr("data-c");
        var minD = scale.attr("data-d");
        console.log(minA, minB, minC, minD);
        if(totalScore >= minA){
            totalGrade = "A";
        }
        else if(totalScore >= minB){
            totalGrade = "B";
        }
        else if (totalScore >= minC){
            totalGrade = "C";
        }
        else if (totalScore >= minD){
            totalGrade = "D";
        }
        else{
            totalGrade = "F";
        }

        $("h1.student-grade span.letter-grade").html(totalGrade);



    }

    var changeSlidersEdit = function(){
        $(".slider input").on("change", function(){
            //console.log(this.id);
            var $this = $(this).closest("div.cutoffs");
            var aMin = $this.find("#edit-a-min").val();
            var bMax = $this.find("#edit-b-max").val();
            var bMin = $this.find("#edit-b-min").val();
            var cMax = $this.find("#edit-c-max").val();
            var cMin = $this.find("#edit-c-min").val();
            var dMax = $this.find("#edit-d-max").val();
            var dMin = $this.find("#edit-d-min").val();
            var fMax = $this.find("#edit-f-max").val();

            if(this.id == "edit-a-min"){
                $this.find("#edit-b-max").val(parseInt(aMin)-1)
                $this.find("#edit-b-max").slider("refresh");
            }
            else if (this.id == "edit-b-max"){
                $this.find("#edit-a-min").val(parseInt(bMax)+1);
                //$this.find("#edit-a-min").slider("refresh");
            }

            if (this.id == "edit-b-min"){
                $this.find("#edit-c-max").val(parseInt(bMin)-1);
                $this.find("#edit-c-max").slider("refresh");
            }
            else if (this.id == "edit-c-max") {
                $this.find("#edit-b-min").val(parseInt(cMax) + 1);
                //$this.find("#edit-b-min").slider("refresh");
            }

            if (this.id == "edit-c-min"){
                $this.find("#edit-d-max").val(parseInt(cMin)-1);
                $this.find("#edit-d-max").slider("refresh");
            }
            else if (this.id == "edit-d-max"){
                $this.find("#edit-c-min").val(parseInt(dMax)+1);
                //$this.find("#edit-c-min").slider("refresh");
            }

            if (this.id == "edit-d-min"){
                $this.find("#edit-f-max").val(parseInt(dMin)-1);
                $this.find("#edit-f-max").slider("refresh");
            }
            else if (this.id == "edit-f-max"){
                $this.find("#edit-d-min").val(parseInt(fMax)+1);
                //$this.find("#edit-d-min").slider("refresh");
            }
        });
    }

    var changeSliders = function(){
        $(".slider input").on("change", function(){
            //console.log(this.id);
            var $this = $(this).closest("div.cutoffs");
            var aMin = $this.find("#range-a-min").val();
            var bMax = $this.find("#range-b-max").val();
            var bMin = $this.find("#range-b-min").val();
            var cMax = $this.find("#range-c-max").val();
            var cMin = $this.find("#range-c-min").val();
            var dMax = $this.find("#range-d-max").val();
            var dMin = $this.find("#range-d-min").val();
            var fMax = $this.find("#range-f-max").val();

            if(this.id == "range-a-min"){
                $this.find("#range-b-max").val(parseInt(aMin)-1)
                $this.find("#range-b-max").slider("refresh");
            }
            else if (this.id == "range-b-max"){
                $this.find("#range-a-min").val(parseInt(bMax)+1);
                //$this.find("#range-a-min").slider("refresh");
            }

            if (this.id == "range-b-min"){
                $this.find("#range-c-max").val(parseInt(bMin)-1);
                $this.find("#range-c-max").slider("refresh");
            }
            else if (this.id == "range-c-max") {
                $this.find("#range-b-min").val(parseInt(cMax) + 1);
                //$this.find("#range-b-min").slider("refresh");
            }

            if (this.id == "range-c-min"){
                $this.find("#range-d-max").val(parseInt(cMin)-1);
                $this.find("#range-d-max").slider("refresh");
            }
            else if (this.id == "range-d-max"){
                $this.find("#range-c-min").val(parseInt(dMax)+1);
                //$this.find("#range-c-min").slider("refresh");
            }

            if (this.id == "range-d-min"){
                $this.find("#range-f-max").val(parseInt(dMin)-1);
                $this.find("#range-f-max").slider("refresh");
            }
            else if (this.id == "range-f-max"){
                $this.find("#range-d-min").val(parseInt(fMax)+1);
                //$this.find("#range-d-min").slider("refresh");
            }
        });
    }

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
                // login error, show alert dialog
                //TODO using JQM dialog or popup
                alert("Login failed!");
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
                console.log("logout failed");
                console.log(err.responseText);
                //logout error, show alert dialog
                //TODO using JQM dialog or popup
                alert("Logout failed");
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
                //TODO using JQM dialog or popup
                //$.mobile.changePage("#singUpAlert", {role: 'dialog'});
                alert("Signup failed");
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
        policy.A = $("input#range-a-min").val();
        policy.B = $("input#range-b-min").val();
        policy.C = $("input#range-c-min").val();
        policy.D = $("input#range-d-min").val();

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


        if(currentUser.userType === "Teacher") {

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
                /*if(!userCourseList.length){
                    $("p.no-courses").show();
                }*/

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

        if(currentUser.userType === "Teacher") {
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

        if(currentUser.userType === "Teacher") {
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

        if(currentUser.userType === "Teacher") {
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

        if(currentUser.userType === "Teacher") {
            $('#whatifBtn').hide();
            $('#editScoreBtn').show();
            $('#backToCourseBtn').show();


            //courseDetail  template
            var studentEnrollDetailTmp = _.template($("script#studentEnrollDetailTmp").html());
            //var studentEnrollData = {};

            console.log("load enroll detail for teacher....");

            // get enrollData
            //need GET a enroll with id api for teacher to access enroll detail page
            $.getJSON(urlroot+"/enrolls/"+enrollId, function (data) {
                console.log(data[0]);

                sessionStorage.setItem('tempEnrollData',JSON.stringify(data[0]));

                //load course template, go to coursedetail page
                //data.enrolls
                $("#enrollDetailPanel").html(studentEnrollDetailTmp(data[0]));

                //!!apply styles after dynamically adding element
                $("#enrollDetailPanel").trigger('create');

                //edit actual score
                //!!!render in template, events after loading template
                $('#editScoreBtn').on('click', goEditScorePage);

            });


        } else {

            // if student
            $('#whatifBtn').show();
            $('#editScoreBtn').hide();
            $('#backToCourseBtn').hide();

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
                            sessionStorage.setItem('tempEnrollData',JSON.stringify(myEnrollData));

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

            //calculate what-if score
            //!!!render in template, events after loading template
            $('#whatifBtn').on('click', goWhatifPage);
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

    //prepare and go to whatif page
    var goWhatifPage = function () {
        var enrollid = $(this).data("enrollid");

        //get enroll with enrollid
        tempEnrollData = JSON.parse(sessionStorage.getItem("tempEnrollData"));
        console.log(tempEnrollData);

        var myEnrollDetailTmp = _.template($("script#enrollCoursePanelTmp").html());
        $("#enrollCoursePanel").html(myEnrollDetailTmp(tempEnrollData));
        //!!apply styles after dynamically adding element
        $("#enrollCoursePanel").trigger('create');

        //calculte whatif grade
        $('#calWhatifGradeBtn').on('click', calWhatifGradePre);

        $.mobile.changePage($('#whatifEdit'), 'slide', true, true);

    };

    //get whatif inputs and build inputs
    var calWhatifGradePre = function (e) {
        e.preventDefault();
        var form = $('#whatifGradeForm');
        console.log(form);

        //collect user input
        var whatifgrade = {};
        var Homeworks = {};
        Homeworks.whatif = form.find('input[name="HomeworksWhatif"]').val();
        var Labs = {};
        Labs.whatif = form.find('input[name="LabsWhatif"]').val();
        var Project = {};
        Project.whatif = form.find('input[name="ProjectWhatif"]').val();
        var Presentation = {};
        Presentation.whatif = form.find('input[name="PresentationWhatif"]').val();
        var Midterm = {};
        Midterm.whatif = form.find('input[name="MidtermWhatif"]').val();
        var Final = {};
        Final.whatif = form.find('input[name="FinalWhatif"]').val();
        whatifgrade.Homeworks = Homeworks;
        whatifgrade.Labs = Labs;
        whatifgrade.Project = Project;
        whatifgrade.Presentation = Presentation;
        whatifgrade.Midterm = Midterm;
        whatifgrade.Final = Final;

        console.log(whatifgrade);

        var gradeData = {};
        gradeData.grade = whatifgrade;


        // post whatif grade - confilict with teacher put, not save what if currently
        //$.ajax({
        //    type: 'PUT',
        //    data: JSON.stringify(gradeData),
        //    contentType: "application/json",
        //    url: urlroot+"/enrolls/"+tempEnrollData._id,
        //    success: function (data) {
        //        console.log(data);
        //
        //        //TODO might need to update the other views
        //        prepareUserPages(currentUser);
        //        prepareEnrollList(data.enroll._course);
        //
        //        var grade = calWhatifGrade(whatifgrade);
        //        $('#whatifGrade').html(grade);
        //    },
        //    error: function(err){
        //        console.log(err);
        //    }
        //});



        var grade = calWhatifGrade(whatifgrade);
        $('#whatifGrade').html(grade);
    };

    var calWhatifGrade = function (whatifgrade) {
        //get current enroll data
        console.log(tempEnrollData);

        //calculate score based on meta
        var meta = tempEnrollData._course.meta;
        var hwscore = whatifgrade.Homeworks.whatif/meta.Homeworks.max * meta.Homeworks.factor;
        var labscore = whatifgrade.Labs.whatif/meta.Labs.max * meta.Labs.factor;
        var projectscore = whatifgrade.Project.whatif/meta.Project.max * meta.Project.factor;
        var presentationscore = whatifgrade.Presentation.whatif/meta.Presentation.max * meta.Presentation.factor;
        var midtermscore = whatifgrade.Midterm.whatif/meta.Midterm.max * meta.Midterm.factor;
        var finalscore = whatifgrade.Final.whatif/meta.Final.max * meta.Final.factor;

        var totalScore = hwscore + labscore + projectscore+ presentationscore+ midtermscore + finalscore;

        //match policy
        var policy = tempEnrollData._course.policy;
        if(totalScore >= policy.A) {
            return 'A';
        } else if(totalScore >= policy.B) {
            return 'B';
        } else if(totalScore >= policy.C) {
            return 'C';
        } else {
            return 'D';
        }

    };

    //prepare and go to edit score page
    var goEditScorePage = function () {
        //get enroll with enrollid
        tempEnrollData = JSON.parse(sessionStorage.getItem("tempEnrollData"));
        console.log(tempEnrollData);

        var editAcutalScoreTmp = _.template($("script#editAcutalScoreTmp").html());
        $("#editActualScorePanel").html(editAcutalScoreTmp(tempEnrollData));
        //!!apply styles after dynamically adding element
        $("#editActualScorePanel").trigger('create');

        //calculte whatif grade
        $('#calActualGradeBtn').on('click', calActualGradePre);

        $.mobile.changePage($('#actualScoreEdit'), 'slide', true, true);
    };

    //get whatif inputs and build inputs
    var calActualGradePre = function (e) {
        e.preventDefault();
        var form = $('#actualScoreForm');
        console.log(form);

        //collect user input
        var actualGrade = {};
        var Homeworks = {};
        Homeworks.actual = form.find('input[name="HomeworksActual"]').val();
        var Labs = {};
        Labs.actual = form.find('input[name="LabsActual"]').val();
        var Project = {};
        Project.actual = form.find('input[name="ProjectActual"]').val();
        var Presentation = {};
        Presentation.actual = form.find('input[name="PresentationActual"]').val();
        var Midterm = {};
        Midterm.actual = form.find('input[name="MidtermActual"]').val();
        var Final = {};
        Final.actual = form.find('input[name="FinalActual"]').val();
        actualGrade.Homeworks = Homeworks;
        actualGrade.Labs = Labs;
        actualGrade.Project = Project;
        actualGrade.Presentation = Presentation;
        actualGrade.Midterm = Midterm;
        actualGrade.Final = Final;

        console.log(actualGrade);
        var grade = {};
        grade.grade = actualGrade;

        // post actual grade
        $.ajax({
            type: 'PUT',
            data: JSON.stringify(grade),
            contentType: "application/json",
            url: urlroot+"/enrolls/"+tempEnrollData._id,
            success: function (data) {
                console.log(data);

                //TODO might need to update the other views - not stable
                prepareEnrollList(data.enroll._course);
                prepareEnrollDetailPage(data.enroll._id);

                var grade = calActualGrade(actualGrade);
                $('#actualGrade').html(grade);
                $.mobile.changePage($('#enrollDetail'), 'slide', true, true);
            },
            error: function(err){
                console.log(err);
            }

        });

    };

    var calActualGrade = function (actualGrade) {
        //get current enroll data
        console.log(tempEnrollData);

        //calculate score based on meta
        var meta = tempEnrollData._course.meta;
        var hwscore = actualGrade.Homeworks.actual/meta.Homeworks.max * meta.Homeworks.factor;
        var labscore = actualGrade.Labs.actual/meta.Labs.max * meta.Labs.factor;
        var projectscore = actualGrade.Project.actual/meta.Project.max * meta.Project.factor;
        var presentationscore = actualGrade.Presentation.actual/meta.Presentation.max * meta.Presentation.factor;
        var midtermscore = actualGrade.Midterm.actual/meta.Midterm.max * meta.Midterm.factor;
        var finalscore = actualGrade.Final.actual/meta.Final.max * meta.Final.factor;

        var totalScore = hwscore + labscore + projectscore+ presentationscore+ midtermscore + finalscore;

        //match policy
        var policy = tempEnrollData._course.policy;
        if(totalScore >= policy.A) {
            return 'A';
        } else if(totalScore >= policy.B) {
            return 'B';
        } else if(totalScore >= policy.C) {
            return 'C';
        } else {
            return 'D';
        }

    };

    var backToCourseDetail = function () {
        $.mobile.changePage($('#courseDetail'), 'slide', true, true);
    };

    var backToEnrollDetail = function () {
        $.mobile.changePage($('#enrollDetail'), 'slide', true, true);
    };

    //eidtcourse for teahcer, using userCourseList.courses
    var editCourse = function () {
        var courseid= $('#courseIDDetailPage').html();
        console.log(courseid);

        userCourseList = JSON.parse(sessionStorage.getItem("userCourseList"));
        var coursedata = {};

        $.each(userCourseList.courses, function (index, course) {
            if(course._id === courseid) {
                coursedata = course;
            }
        });

        var editCourseTmp = _.template($("script#editCourseTmp").html());
        $("#editCoursePanel").html(editCourseTmp(coursedata));
        //!!apply styles after dynamically adding element
        $("#editCoursePanel").trigger('create');
        //calculte whatif grade
        $('#editCourseSubmitBtn').on('click', editCourseSubmit);

        $.mobile.changePage($('#editCourse'), 'slide', true, true);
    };

    var editCourseSubmit = function () {
        var form = $('#editCourseForm');

        var courseid= $('#courseIDDetailPage').html();
        console.log(courseid);

        var courseObj = {};
        courseObj.name = form.find("input[name=name]").val();
        courseObj.description = form.find("textarea[name=description]").val();

        var meta ={};
        var Homeworks ={};
        Homeworks.max = form.find("input[name=HomeworksMax]").val();
        Homeworks.factor = form.find("input[name=HomeworksFactor]").val();
        var Labs ={};
        Labs.max = form.find("input[name=LabsMax]").val();
        Labs.factor = form.find("input[name=LabsFactor]").val();
        var Project ={};
        Project.max = form.find("input[name=ProjectMax]").val();
        Project.factor = form.find("input[name=ProjectFactor]").val();
        var Presentation ={};
        Presentation.max = form.find("input[name=PresentationMax]").val();
        Presentation.factor = form.find("input[name=PresentationFactor]").val();
        var Midterm ={};
        Midterm.max = form.find("input[name=MidtermMax]").val();
        Midterm.factor = form.find("input[name=MidtermFactor]").val();
        var Final ={};
        Final.max = form.find("input[name=FinalMax]").val();
        Final.factor = form.find("input[name=FinalFactor]").val();

        meta.Homeworks = Homeworks;
        meta.Labs = Labs;
        meta.Project = Project;
        meta.Presentation = Presentation;
        meta.Midterm = Midterm;
        meta.Final = Final;

        courseObj.meta = meta;

        var policy ={};
        policy.A = form.find("#edit-a-min").val();
        policy.B = form.find("#edit-b-min").val();
        policy.C = form.find("#edit-c-min").val();
        policy.D = form.find("#edit-d-min").val();

        courseObj.policy = policy;

        console.log(courseObj);

        $.ajax({
            url:urlroot+"/courses/" + courseid,
            type: "PUT",
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

    }

}


)(jQuery);
