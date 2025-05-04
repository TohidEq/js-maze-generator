import Maze from "./maze.js";

function main() {
  const maze = new Maze(5, 5);
  maze.generate();

  console.log("Generated Maze:");
  console.log(maze.toString());
}

main();
