import Maze from "./maze.js";

function main() {
  const maze = new Maze(5, 5);
  // maze.generateAldousBroder();
  // maze.generateDFS();
  maze.generatePrime();

  console.log("Generated Maze:");
  console.log(maze.toString());
}

main();
