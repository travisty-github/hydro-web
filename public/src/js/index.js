var TreeMap = require('./treemap');

(function() {
    'use strict';


    var treeMap = new TreeMap();
    treeMap.load('/api/lakes/currentLevels');
}());
