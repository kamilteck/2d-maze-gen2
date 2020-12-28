import Sketch from 'react-p5';

const width = 320;
const height = 320;
const squareSize = 20;
const rows = Math.floor(width / squareSize);
const cols = Math.floor(height / squareSize);
const grid = [];
const stack = [];

let current;

const getIndex = (col, row) =>
  col < 0 || row < 0 || col > cols - 1 || row > rows - 1
    ? -1
    : col + row * cols;

class Square {
  constructor(row, col) {
    this.col = col;
    this.row = row;
    this.y = this.col * squareSize;
    this.x = this.row * squareSize;
    this.walls = Array(4).fill(true);
    //top right bottom left wall
    this.visited = false;
  }

  getARandomNeighbour = () => {
    let neighbours = [];

    const top = grid[getIndex(this.col, this.row - 1)];
    const right = grid[getIndex(this.col + 1, this.row)];
    const bottom = grid[getIndex(this.col, this.row + 1)];
    const left = grid[getIndex(this.col - 1, this.row)];

    [top, right, bottom, left].forEach(item => {
      if (item && !item.visited) neighbours.push(item);
    });

    const neighbourIndex = Math.floor(Math.random() * neighbours.length);
    return neighbours.length > 0 ? neighbours[neighbourIndex] : undefined;
  };

  highlight = p5 => {
    p5.noStroke();
    p5.fill(12, 74, 96, 175);

    p5.rect(this.x, this.y, squareSize, squareSize);
  };

  show = p5 => {
    // => dont wanna draw squares, just walls
    p5.stroke(0);

    if (this.walls[0]) p5.line(this.x, this.y, this.x + squareSize, this.y);
    // top

    if (this.walls[1])
      p5.line(
        this.x + squareSize,
        this.y,
        this.x + squareSize,
        this.y + squareSize
      );
    // right

    if (this.walls[2])
      p5.line(
        this.x + squareSize,
        this.y + squareSize,
        this.x,
        this.y + squareSize
      );
    // bottom

    if (this.walls[3]) p5.line(this.x, this.y + squareSize, this.x, this.y);
    // left

    if (this.visited) {
      p5.noStroke();
      p5.rect(this.x, this.y, squareSize, squareSize);
    }
  };
}

const removeWalls = (a, b) => {
  const x = a.col - b.col;
  const y = a.row - b.row;

  a.walls[2 + y] = false;
  b.walls[2 - y] = false;

  a.walls[1 - x] = false;
  b.walls[1 + x] = false;
};

const Gen = props => {
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(width, height).parent(canvasParentRef);

    [...Array(cols).keys()].forEach(col =>
      [...Array(rows).keys()].forEach(row => grid.push(new Square(col, row)))
    );

    current = grid[0];
  };

  const draw = p5 => {
    p5.background('#E1DDDB');

    [...Array(grid.length).keys()].forEach(index => {
      grid[index].show(p5);
    });

    //dont do anything if started or (started and paused)
    if (props.started && !props.paused) {
      p5.frameRate(props.frameRate);
      // you can also use it in setup() instead of here
      // having it here you can control the frame rate on the go
      current.visited = true;
      current.highlight(p5);

      const next = current.getARandomNeighbour();

      if (next) {
        next.visited = true;
        stack.push(current);
        removeWalls(current, next);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      }

      if (current.row === 0 && current.col === 0) {
        props.setFinished(true);
        // letting the parent component know it's finished
      } 
    } else if (props.started && props.paused) {
      //highlight the square if started and paused
      current.highlight(p5);
    }
  };

  return <Sketch setup={setup} draw={draw} />;
};

export default Gen;
