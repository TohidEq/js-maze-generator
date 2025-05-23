class Maze {
  constructor(width, height) {
    this.width = width + (width % 2 == 0); // convert to odd if it is not
    this.height = height + (height % 2 == 0); // convert to odd if it is not
    this.grid = this.initGrid();
    // Choose a random position to start  (1, (x,y)-2) BCZ first and last cells should be wall and cannot be choosen as started position
    this.xStart = this.randOdd(1, this.width - 2);
    this.yStart = this.randOdd(1, this.height - 2);
  }

  // Initialize the grid with walls (true means wall)
  initGrid() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(true); // wall
      }
      grid.push(row);
    }
    return grid;
  }

  randOdd(min, max) {
    return min + (~~(Math.random() * (((max - min) >> 1) + 1)) << 1);
    /*
    HOW IT WORKS:

    * binary *
    ~~() == Math.floor()
    X<<1 == X*2
    X>>1 == Math.floor(X/2)

    Min and Max SHOULD BE ODD !!!
    First calculate distance between Min and Max
    so we should separate them into 2 to get real numbers we need to choose
    for example between 5 and 11
    5,6,7,8,9,10,11 (7 numbers (0 to `6` indexing number))
    we need only:
    5,7,9,11 (4 numbers (0 to `3` indexing number))
    the calculate proccess is :
    7-5 = 6 (distance)
    6/2 = 3 (indexing number)
    3+1 = 4 (real number)
    Now we can choose a number between 0 and less than 4
    by `~~(Math.random()*4)` floor(random(0 to 3.99))
    Result will be one of 0,1,2,3
    At the end, double it and add to Min nubmer to get real RANDOM NUMBER BETWEEN MIN AND MAX:
    Min + (Result * 2) = RealRandomNumber:
    5 + (0 * 2) = 5
    5 + (1 * 2) = 7
    5 + (2 * 2) = 9
    5 + (3 * 2) = 11
    */
  }

  // Check if a cell is inside the grid bounds
  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  // Get neighbors that can be carved
  // (2 cells away and still walls by default [can be changed to "CanBeCraved"])
  getNeighbors(x, y, canBeCraved = false, onlyCraved = false) {
    const neighbors = [];
    const directions = [
      [0, -2], // up
      [2, 0], // right
      [0, 2], // down
      [-2, 0], // left
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      let condition = false;
      if (onlyCraved) {
        if (this.inBounds(nx, ny) && !this.grid[ny][nx]) condition = true;
      } else if (canBeCraved) {
        if (this.inBounds(nx, ny) && this.grid[ny][nx]) condition = true;
      } else if (this.inBounds(nx, ny) && this.grid[ny][nx]) condition = true;
      if (condition) {
        neighbors.push([nx, ny]);
      }
    }
    return neighbors;
  }

  // Carve a path between two cells (remove wall between two cells)
  carvePath(x1, y1, x2, y2) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    this.grid[y1][x1] = false; // path
    this.grid[my][mx] = false; // path between
    this.grid[y2][x2] = false; // path
  }

  // Generate the maze using DFS with backtracking (Good enough to play with it and chill)
  generateDFS(startX = this.xStart, startY = this.yStart) {
    // Start with all walls, carve starting cell
    this.grid[startY][startX] = false;

    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];
      const neighbors = this.getNeighbors(x, y);

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const randomNeighborsIndex = ~~(Math.random() * neighbors.length);
        const [nx, ny] = neighbors[randomNeighborsIndex];
        // Remove wall between current cell and choosen one
        this.carvePath(x, y, nx, ny);

        stack.push([nx, ny]);
      }
    }
  }

  // Generate the maze using Aldous-Broder(Hard Maze! but Worst way to generate maze)
  generateAldousBroder(startX = this.xStart, startY = this.yStart) {
    // Start with all walls, carve starting cell
    this.grid[startY][startX] = false;

    const allUnvisitedCellsCount =
      ((this.width - 1) / 2) * ((this.height - 1) / 2);

    let visitedCellsCount = 1;

    let [x, y] = [startX, startY];

    while (visitedCellsCount != allUnvisitedCellsCount) {
      const neighbors = this.getNeighbors(x, y, true);
      const randomNeighborsIndex = ~~(Math.random() * neighbors.length);
      const [nx, ny] = neighbors[randomNeighborsIndex];

      if (this.grid[ny][nx]) {
        this.carvePath(x, y, nx, ny);
        visitedCellsCount++;
      }

      // Move to the next cell
      x = nx;
      y = ny;
    }
  }

  // Generate the maze using Prime (Hard! Random! fast enough)
  generatePrime(startX = this.xStart, startY = this.yStart) {
    // Start with all walls, carve starting cell
    this.grid[startY][startX] = false;

    const walledNeighbors = [];

    function wallsRemoveItemByIndex(index) {
      // Swap indexed item and last item in array
      [walledNeighbors[index], walledNeighbors[walledNeighbors.length - 1]] = [
        walledNeighbors[walledNeighbors.length - 1],
        walledNeighbors[index],
      ];
      // Remove the last item
      walledNeighbors.pop();
    }
    // Add new item to array, if not exists
    function wallsAddIfNotExists(newItem) {
      const exists = walledNeighbors.some(
        (item) => JSON.stringify(item) === JSON.stringify(newItem)
      );
      if (!exists) {
        walledNeighbors.push(newItem);
      }
    }

    const neighbors = this.getNeighbors(startX, startY);
    neighbors.map((wall) => {
      wallsAddIfNotExists(wall);
    });
    while (walledNeighbors.length != 0) {
      const randomNeighborsIndex = ~~(Math.random() * walledNeighbors.length); // Randomly choose a neighbor
      const [wx, wy] = walledNeighbors[randomNeighborsIndex];

      const cravedNeighbors = this.getNeighbors(wx, wy, true, true);

      if (cravedNeighbors.length > 0) {
        this.grid[wy][wx] = false;

        const randomCravedNeighborsIndex = ~~(
          Math.random() * cravedNeighbors.length
        );
        const [cnx, cny] = cravedNeighbors[randomCravedNeighborsIndex];

        this.carvePath(wx, wy, cnx, cny);

        // Get and Add new walls to walledNeighbors
        const newWalls = this.getNeighbors(wx, wy);
        newWalls.forEach((wall) => {
          wallsAddIfNotExists(wall);
        });
      }
      // remove choosen wall from array
      wallsRemoveItemByIndex(randomNeighborsIndex);
    }
  }

  // Render the maze as a string for console output
  toString() {
    return this.grid
      .map((row, indexY) =>
        row.map((cell, indexX) => (cell ? "██" : "  ")).join("")
      )
      .join("\n");
  }
}

export default Maze;
