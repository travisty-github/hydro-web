var express = require('express');
var router = express.Router();
var LakeLevels = require('../controllers/lakedata.js');

// Load lake levels
// TODO: Error handling.
var lakeLevels = new LakeLevels('./lakedata.json');

/* GET lakes listing. */
router.get('/', function(req, res) {
  res.json(lakeLevels.lakes());
} );

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
} );

module.exports = router;
