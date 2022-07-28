import Cell from "./Cell";

export default class Grid {
	width: number;
	height: number;

	grid: Cell[][];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;

		this.grid = [];

		for (let x = 0; x < width; x++) {
			let col: Cell[] = [];
			for (let y = 0; y < height; y++) {
				col.push(new Cell());
			}

			this.grid.push(col);
		}
	}

	setCell(x: number, y: number, state: "empty" | "wall" | "goal" | "start") {
		this.grid[x][y].state = state;
	}

	reset() {
		for (let x = 0; x < this.grid.length; x++) {
			const element = this.grid[x];
			for (let y = 0; y < element.length; y++) {
				const cell = element[y];
				cell.reset();
			}
		}
	}

	randomize() {
		for (let x = 0; x < this.grid.length; x++) {
			const element = this.grid[x];
			for (let y = 0; y < element.length; y++) {
				const cell = element[y];
				cell.randomize();
			}
		}
	}
}
