var totalRows = 40;
var totalCols = 40;
var inProgress = false;
var cellsToAnimate = [];
var createWalls = false;
var algorithm = "D* Algorithm";
var justFinished = false;
// var animationState = null;
var startCell = [5, 20]; //the green cell
var endCell = [20, 20]; //the red cell
var movingStart = false;
var movingEnd = false;

/*
------------------------------------------------
Functions  to create grid of size n*n.
------------------------------------------------
*/

function generateGrid(rows, cols) {
  var grid = "<table>";

  for (row = 1; row <= rows; row++) {
    grid += "<tr>";
    for (col = 1; col <= cols; col++) {
      grid += "<td></td>";
    }
    grid += "</tr>";
  }
  grid += "</table>";

  return grid;
}

var merigrid = generateGrid(totalRows, totalCols);

$("#tableContainer").append(merigrid);

/*
--------------------------------------
Object and Data Structures to be used
--------------------------------------
*/

function Queue() {
  this.stack = new Array();
  this.dequeue = function () {
    return this.stack.pop();
  };
  this.enqueue = function (item) {
    this.stack.unshift(item);
    return;
  };
  this.empty = function () {
    return this.stack.length == 0;
  };
  this.clear = function () {
    this.stack = new Array();
    return;
  };
}

/*
----------------
Mouse Functions
----------------
*/

/*moving the positioned cursors in the grid */

$("td").mousedown(function () {
  var index = $("td").index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];

  if (!inProgress) {
    //this means that the process of pathfinding has finished
    if (justFinished && !inProgress) {
      clearBoard((keepWalls = true));
      justFinished = false;
    }
    if (index == startCellIndex) {
      //if the chosen cell to be moved is the start index
      movingStart = true;
    } else if (index == endCellIndex) {
      //if the chosen cell to be moved is the end index
      movingEnd = true;
    } else {
      //else the creation of wall needs to take place at that place
      createWalls = true;
    }
  }
});

/*function to drop cells around */
$("td").mouseup(function () {
  createWalls = false;
  movingStart = false;
  movingEnd = false;
});

//function to help create a wall at any clicked cell of the grid
//and also help in the movement of the start or end index
$("td").mouseenter(function () {
  if (!createWalls && !movingStart && !movingEnd) {
    return;
  }
  var index = $("td").index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (!inProgress) {
    if (justFinished) {
      clearBoard((keepWalls = true)); //we would keep the walls even though the process has finished
      justFinished = false;
    }

    if (index != startCellIndex && index != endCellIndex) {
      $(this).toggleClass("wall");
    }
  }
});

$("td").click(function () {
  var index = $("td").index(this);
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  if (
    inProgress == false &&
    !(index == startCellIndex) &&
    !(index == endCellIndex)
  ) {
    //if the clicked/hovered cell is not a start/end index
    if (justFinished) {
      clearBoard((keepWalls = true));
      justFinished = false;
    }
    $(this).toggleClass("wall"); // else if the process is not started/finished it will make it a wall
  }
});

/*
-----------
Buttons
-----------
*/

//activating the start button

$("#startBtn").click(function () {
  if (inProgress) {
    // if the algorithm is running
    // update("wait");
    return;
  }
  traverseGraph();
});

//activating the end button

$("#clearBtn").click(function () {
  if (inProgress) {
    // update("wait");
    return;
  } // if the user presses the button while the algorithm is still going on, then display the error message!
  clearBoard((keepWalls = false)); //else, we will call the clear board function, with specification like dont keep the walls, remove them also
});

/*
-------------------
Functions
-------------------
*/

//Preparing the Grid for grpah traversal

async function traverseGraph() {
  inProgress = true;
  clearBoard((keepWalls = true));
  executeAlgo();
  await animateCells();
  inProgress = false;
  justFinished = true;
}

//Finding the desired path for the chosen Algorithm

function executeAlgo() {
  var pathFound = A();
  return pathFound;
}

//Function to retain the walls while traversing the algorithm

// function makewall(cell) {
//   if (!createWalls) {
//     return;
//   }
//   var index = $("td").index(cell);
//   var row = Math.floor(index / totalRows) + 1;
//   var col = (index % totalCols) + 1;
//   console.log([row, col]);
//   if (
//     inProgress == false &&
//     !(row == 1 && col == 1) &&
//     !(row == totalRows && col == totalCols)
//   ) {
//     $(cell).toggleClass("wall");
//   }
// }

//Function to make or consider a cell to be visited

function createVisited() {
  var visited = [];
  var cells = $("#tableContainer").find("td");
  for (var i = 0; i < totalRows; i++) {
    var row = [];
    for (var j = 0; j < totalCols; j++) {
      if (cellIsAWall(i, j, cells)) {
        row.push(true);
      } else {
        row.push(false);
      }
    }
    visited.push(row);
  }
  return visited;
}

//Function to check if a cell has a wall or not.

function cellIsAWall(i, j, cells) {
  var cellNum = i * totalCols + j;
  return $(cells[cellNum]).hasClass("wall");
}

//Function for A* traversal

function A() {
  var pathFound = false;
  var myQueue = new Queue();
  var prev = createPrev();
  var visited = createVisited();
  myQueue.enqueue(startCell);
  cellsToAnimate.push(startCell, "searching");
  visited[startCell[0]][startCell[1]] = true;
  while (!myQueue.empty()) {
    var cell = myQueue.dequeue();
    var r = cell[0];
    var c = cell[1];
    cellsToAnimate.push([cell, "visited"]);
    if (r == endCell[0] && c == endCell[1]) {
      pathFound = true;
      break;
    }
    //adding the neighbouring cells in queue
    var neighbors = getNeighbors(r, c);
    for (var k = 0; k < neighbors.length; k++) {
      var m = neighbors[k][0];
      var n = neighbors[k][1];
      if (visited[m][n]) {
        continue;
      }
      visited[m][n] = true;
      prev[m][n] = [r, c];
      cellsToAnimate.push([neighbors[k], "searching"]);
      myQueue.enqueue(neighbors[k]);
    }
  }

  //making nodes in the queue to be "visited"
  while (!myQueue.empty()) {
    var cell = myQueue.dequeue();
    var r = cell[0];
    var c = cell[1];
    cellsToAnimate.push([cell, "visited"]);
  }

  //highlighting the found path
  if (pathFound) {
    var r = endCell[0];
    var c = endCell[1];
    cellsToAnimate.push([[r, c], "success"]);
    while (prev[r][c] != null) {
      var prevCell = prev[r][c];
      r = prevCell[0];
      c = prevCell[1];
      cellsToAnimate.push([[r, c], "success"]);
    }
  }

  return pathFound;
}

// function makeWalls() {
//   var walls = [];
//   for (var i = 0; i < totalRows; i++) {
//     var row = [];
//     for (var j = 0; j < totalCols; j++) {
//       row.push(true);
//     }
//     walls.push(row);
//   }
//   return walls;
// }

function createPrev() {
  var prev = [];
  for (var i = 0; i < totalRows; i++) {
    var row = [];
    for (var j = 0; j < totalCols; j++) {
      row.push(null);
    }
    prev.push(row);
  }
  return prev;
}

//used for getting the neighbours of the node we are on!
function getNeighbors(i, j) {
  var neighbors = [];
  if (i > 0) {
    neighbors.push([i - 1, j]);
  }
  if (j > 0) {
    neighbors.push([i, j - 1]);
  }
  if (i < totalRows - 1) {
    neighbors.push([i + 1, j]);
  }
  if (j < totalCols - 1) {
    neighbors.push([i, j + 1]);
  }
  return neighbors;
}

async function animateCells() {
  // animationState = null;
  var cells = $("#tableContainer").find("td");
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  var delay = 5;
  for (var i = 0; i < cellsToAnimate.length; i++) {
    var cellCoordinates = cellsToAnimate[i][0];
    var x = cellCoordinates[0];
    var y = cellCoordinates[1];
    var num = x * totalCols + y;
    if (num == startCellIndex || num == endCellIndex) {
      continue;
    }
    var cell = cells[num];
    var colorClass = cellsToAnimate[i][1];

    // Wait until its time to animate
    await new Promise((resolve) => setTimeout(resolve, delay));

    $(cell).removeClass();
    $(cell).addClass(colorClass);
  }
  cellsToAnimate = [];
  //console.log("End of animation has been reached!");
  return new Promise((resolve) => resolve(true));
}

function clearBoard(keepWalls) {
  var cells = $("#tableContainer").find("td");
  var startCellIndex = startCell[0] * totalCols + startCell[1];
  var endCellIndex = endCell[0] * totalCols + endCell[1];
  for (var i = 0; i < cells.length; i++) {
    isWall = $(cells[i]).hasClass("wall");
    $(cells[i]).removeClass();
    if (i == startCellIndex) {
      $(cells[i]).addClass("start");
    } else if (i == endCellIndex) {
      $(cells[i]).addClass("end");
    } else if (keepWalls && isWall) {
      $(cells[i]).addClass("wall");
    }
  }
}

clearBoard();
