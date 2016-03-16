var express = require('express');
var router = express.Router();
var LakeLevels = require('../controllers/lakedata.js');

// Load lake levels
// TODO: Error handling.
var lakeLevels = new LakeLevels('./lakedata.json');

/* GET lakes listing. */
router.get('/', function(req, res) {
  res.json(lakeLevels.lakes());
});

/* Get all current levels */
router.get('/currentlevels', function(req, res) {
  res.json(lakeLevels.currentLevels());
});

/* GET lake historical levels. */
router.get('/levels/:name', function(req, res) {
  var levels = null;
  try {
    levels = lakeLevels.lakeLevels(req.params.name);
  } catch (err) {
    console.log('Error getting levels.');
    console.log(err);
    res.redirect(500, '/');
    return;
  }

  // If null is returned no matches were found.
  if (levels === null) res.redirect(404, '/');

  res.json(levels);
});

/* GET all information about a lake */
router.get('/:name', function(req, res) {
  var lake = null;
  try {
    lake = lakeLevels.getLake(req.params.name);
  } catch (err) {
    console.log('Error getting lake.');
    console.log(err);
    res.redirect(500, '/');
    return;
  }

  // If null is returned no matches were found.
  if (lake === null) res.redirect(404, '/');

  res.json(lake);
});


module.exports = router;
