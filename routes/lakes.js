var express = require('express');
var router = express.Router();
var LakeLevels = require('../controllers/lakedata.js');

var lakeLevels = new LakeLevels('url to go here');

/* GET lakes listing. */
router.get('/', function(req, res) {
  lakeLevels.lakes(function(d) {
    res.json(d);
  });
});

/* Get all current levels */
router.get('/currentlevels', function(req, res) {
  lakeLevels.currentLevels(function(data) {
    res.json(data);
  });
});

/* GET lake historical levels. */
router.get('/levels/:name', function(req, res) {
  var levels = null;
  levels = lakeLevels.lakeLevels(req.params.name, function(levels) {
    res.json(levels);
  });
});

/* GET all information about a lake */
// TODO
router.get('/:name', function(req, res) {
  var lake = null;
  try {
    lakeLevels.getLake(req.params.name, function(err, data) {
      res.json(data[0]);
    });
  } catch (err) {
    console.log('Error getting lake.');
    console.log(err);
    res.status(500).send('Error getting lake.');
    return;
  }

});


module.exports = router;
