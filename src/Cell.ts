export default class Cell {
	state: "empty" | "wall" | "goal" | "start" = "empty";

	constructor() {
		if (Math.round(Math.random() * 100) > 70) {
			this.state = "wall";
		}
	}

	reset() {
		this.state = "empty";
	}

	randomize() {
		this.state = "empty";

		if (Math.round(Math.random() * 100) > 70) {
			this.state = "wall";
		}
	}
}
