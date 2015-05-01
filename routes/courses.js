var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Course = require('../models/course');

function requireLogin (req, res, next) {
  if (!req.session.user) {
    res.status(403).json({status:403, message:"Login Required!"});
  } else {
    next();
  }
};

/* All courses listing. */
router.get('/', requireLogin, function(req, res) {
  var query = Course.find({})
  .populate('_owner', '_id fname lname email phone userType').exec(function(err, courses){
    if(err){
      res.status(500).json(err);
    }else{
      res.json({
        courses:courses
      });
    }
  });
});

/* Courses I teach listing. */
router.get('/me', requireLogin, function(req, res) {
  var query = Course.find({ _owner:req.session.user._id })
  .populate('_owner', '_id fname lname email phone userType').exec(function(err, courses){
    if(err){
      res.status(500).json(err);
    }else{
      res.json({
        courses:courses
      });
    }
  });
});

/* Get a specific course */
router.get('/:courseId', function(req, res){
  var data = req.body;
  var courseId = req.param("courseId");
  var course = Course.findOne({ _id: courseId })
  .populate('_owner', '_id fname lname email phone userType').exec(function(err, course){
    if(err || typeof course == 'undefined' || course==null){
      res.status(400).json(err);
    }else{
      res.json(course);
    }
  });
});

/* Add a course that I teach */
router.post('/', requireLogin, function(req, res){
  var data = req.body;
  var user = req.session.user;
  data._owner = user._id;
  var course = new Course(data);
  course.save(function(err){
    if (err){
      res.status(400).json(err);
    }else{
      res.json({
        status:200,
        message:"success",
        course:course
      });
    }
  });
});

/* Modify a specific course that I teach */
router.put('/:courseId', requireLogin, function(req, res){
  var data = req.body;
  var courseId = req.param("courseId");
  var course = Course.findOneAndUpdate({ _id: courseId }, data, { 'new': true }, function(err, course){
    if(err || typeof course == 'undefined' || course==null){
      res.status(400).json(err);
    }else if(course._owner!=req.session.user._id){
      res.json({
        status:403,
        message:"Can't edit a course you don't owned!"
      });
    }else{
      res.json({
        status:200,
        message:"success",
        course:course
      });
    }
  });
});

module.exports = router;
