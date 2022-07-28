import "./style.css";
import Grid from "./Grid";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const width = 400;
const height = 400;
const rectSize = 10;

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const grid = new Grid(width / rectSize, height / rectSize);

ctx.clearRect(0, 0, width, height);
drawGrid();

(document.getElementById("clearBtn") as HTMLButtonElement).onclick = clear;
(document.getElementById("randomBtn") as HTMLButtonElement).onclick = randomize;

setupmouseClickInput();
//

let startPos = { x: 0, y: 0 };
let goalPos = { x: width / rectSize - 1, y: height / rectSize - 1 };

grid.setCell(startPos.x, startPos.y, "start");
grid.setCell(goalPos.x, goalPos.y, "goal");

calculate();

//

function clear() {
	grid.reset();

	grid.setCell(0, 0, "start");
	grid.setCell(width / rectSize - 1, width / rectSize - 1, "goal");

	startPos = { x: 0, y: 0 };
	goalPos = { x: width / rectSize - 1, y: height / rectSize - 1 };

	drawGrid();
	calculate();
}

function randomize() {
	grid.randomize();

	grid.setCell(0, 0, "start");
	grid.setCell(width / rectSize - 1, width / rectSize - 1, "goal");

	startPos = { x: 0, y: 0 };
	goalPos = { x: width / rectSize - 1, y: height / rectSize - 1 };

	drawGrid();
	calculate();
}

function drawGrid() {
	ctx.clearRect(0, 0, width, height);

	for (let x = 0; x < grid.grid.length; x++) {
		const element = grid.grid[x];
		for (let y = 0; y < element.length; y++) {
			const cell = element[y];
			ctx.beginPath();

			if (cell.state == "wall") {
				ctx.fillStyle = "#000000";
				ctx.fillRect(x * rectSize, y * rectSize, rectSize, rectSize);
			} else if (cell.state == "empty") {
				ctx.rect(x * rectSize, y * rectSize, rectSize, rectSize);
			} else if (cell.state == "goal") {
				ctx.fillStyle = "#ff0000";
				ctx.fillRect(x * rectSize, y * rectSize, rectSize, rectSize);
			} else if (cell.state == "start") {
				ctx.fillStyle = "#00ff00";
				ctx.fillRect(x * rectSize, y * rectSize, rectSize, rectSize);
			}

			ctx.stroke();
		}
	}
}

interface pos {
	x: number;
	y: number;
	f: number;
	g: number;
	h: number;
	parent: pos | null;
}
function calculate() {
	let openList: pos[] = [
		{ x: startPos.x, y: startPos.y, f: 0, g: 0, h: 0, parent: null },
	];

	let closedList: pos[] = [];

	let solution: pos | undefined = undefined;

	while (openList.length > 0 && !solution) {
		let lowestFIndex = 0;

		openList.forEach((e, i) => {
			if (e.f < openList[lowestFIndex].f) {
				lowestFIndex = i;
			}
		});

		const q = openList[lowestFIndex];

		openList.splice(lowestFIndex, 1);

		[
			{ x: -1, y: 0 },
			{ x: 1, y: 0 },
			{ x: 0, y: -1 },
			{ x: 0, y: 1 },
		].forEach((p) => {
			const x = q.x + p.x;
			const y = q.y + p.y;
			const g = q.g + 1;
			const h =
				Math.abs(q.x + p.x - goalPos.x) +
				Math.abs(q.y + p.y - goalPos.y);
			const f = g + h;

			const successor: pos = {
				x,
				y,
				g,
				h,
				f,
				parent: q,
			};

			if (x < 0 || x > width / rectSize - 1) return;
			if (y < 0 || y > height / rectSize - 1) return;

			if (grid.grid[x][y].state == "wall") return;
			if (grid.grid[x][y].state == "goal") {
				solution = successor;
				return;
			}

			for (let i = 0; i < openList.length; i++) {
				const element = openList[i];

				if (element.x == x && element.y == y) {
					if (element.f < f) return;
					else {
						openList[i] = successor;
						return;
					}
				}
			}

			for (let i = 0; i < closedList.length; i++) {
				const element = closedList[i];

				if (element.x == x && element.y == y) {
					if (element.f < f) return;
				}
			}

			openList.push(successor);
		});

		closedList.push(q);
	}

	drawGrid();

	if (solution) drawSolution(solution);
}

function drawSolution(solution: pos) {
	if (solution.parent == null) return;

	let currStep = solution.parent;
	ctx.fillStyle = "#0000ff";
	while (currStep.parent != null) {
		ctx.fillRect(
			currStep.x * rectSize,
			currStep.y * rectSize,
			rectSize,
			rectSize
		);

		currStep = currStep.parent;
	}
}

function setupmouseClickInput() {
	let mouseDown = false;
	let mouseButton = 0;

	canvas.oncontextmenu = () => {
		return false;
	};

	document.body.onmousedown = (e) => {
		mouseButton = e.button;

		mouseDown = true;
	};
	document.body.onmouseup = () => {
		mouseDown = false;
	};

	canvas.onmousemove = (e) => {
		if (mouseDown) {
			clickCanvas(e);
		}
	};

	canvas.onmousedown = (e) => {
		mouseButton = e.button;
		clickCanvas(e);
	};

	function clickCanvas(e: MouseEvent) {
		const pos = getMousePos(canvas, e);

		if (mouseButton == 0 && !e.shiftKey) {
			grid.setCell(pos.x, pos.y, "wall");
		} else if (mouseButton == 0 && e.shiftKey) {
			grid.setCell(pos.x, pos.y, "empty");
		} else if (mouseButton == 2 && !e.shiftKey) {
			grid.setCell(goalPos.x, goalPos.y, "empty");
			grid.setCell(pos.x, pos.y, "goal");

			goalPos = pos;
		} else if (mouseButton == 2 && e.shiftKey) {
			grid.setCell(startPos.x, startPos.y, "empty");
			grid.setCell(pos.x, pos.y, "start");

			startPos = pos;
		}

		calculate();
	}

	function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: Math.floor((evt.clientX - rect.left) / rectSize),
			y: Math.floor((evt.clientY - rect.top) / rectSize),
		};
	}
}
