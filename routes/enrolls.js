var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Course = require('../models/course');
var Enroll = require('../models/enroll');

function requireLogin (req, res, next) {
  if (!req.session.user) {
    res.status(403).json({status:403, message:"Login Required!"});
  } else {
    next();
  }
};

/* My enrollments listing. */
router.get('/', requireLogin, function(req, res) {
  var query = Enroll.find({ _student:req.session.user._id })
  .populate('_student', '_id fname lname email phone')
  .populate('_course').exec(function(err, enrolls){
    if(err){
      res.status(500).json(err);
    }else{
      res.json({
        enrolls:enrolls
      });
    }
  });
});

/* Enroll a course. */
router.post('/', requireLogin, function(req, res) {
  var data = req.body;
  var user = req.session.user;
  data._student = user._id;
  var enroll = new Enroll(data);
  enroll.save(function(err){
    if (err){
      res.status(400).json(err);
    }else{
      res.json({
        status:200,
        message:"success",
        enroll:enroll
      });
    }
  });
});

/* Modify a specific enrollment, this part is dirty, eligible for student and teacher*/
router.put('/:enrollId', requireLogin, function(req, res){
  var data = req.body;
  var enrollId = req.param("enrollId");
  var enroll = Enroll.findOneAndUpdate({ _id: enrollId }, data, { 'new': true }, function(err, enroll){
    if(err || typeof enroll == 'undefined' || enroll==null){
      res.status(400).json(err);
    }else if(enroll._student!=req.session.user._id){
      res.json({
        status:403,
        message:"Can't edit a enroll you don't owned!"
      });
    }else{
      res.json({
        status:200,
        message:"success",
        enroll:enroll
      });
    }
  });
});

module.exports = router;