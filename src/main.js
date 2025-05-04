import Maze from "./maze.js";

function main() {
  const maze = new Maze(41, 41);
  // maze.generateAldousBroder();
  // maze.generateDFS();
  maze.generatePrime();
  // maze.test();

  console.log("Generated Maze:");
  console.log(maze.toString());
}

main();
