

var combiner = require("web-combiner")
  , inliner = combiner.inliner
  , combine = combiner.combine
  , combineEx = combiner.combineEx;


//inliner("./i0212y6.html", "./tmpi.html", true);
inliner("./i0212y6.html", "./i0212y6.src.html");
