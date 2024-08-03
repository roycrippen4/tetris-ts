import { black, blue, cyan, red, toANSI, yellow } from './color';
import { exit, onkeydown } from './input';
import { controls, getGameOverText, levelDisplay, pauseText, pieceDisplay, title } from './text';

function debugPoint(point: Point): string {
	const x = ` ${cyan('x')}: ${yellow(point.x.toString())}, `;
	const y = `${cyan('y')}: ${yellow(point.y.toString())}, `;
	const value = `${cyan('value')}: ${yellow(point.value.toString())} `;
	const open = red('  {');
	const close = red('}');
	return `${open}${x}${y}${value}${close}`;
}

type PointValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | string;
type Point = { x: number; y: number; value: PointValue };
export type PieceType = 'i' | 'o' | 'j' | 'l' | 't' | 's' | 'z';
// type PieceColor = 'red' | 'cyan' | 'orange' | 'green' | 'purple' | 'blue' | 'yellow';

// function getColor(value: PointValue): PieceColor {
// 	switch (value) {
// 		case 0: {
// 			return 'red';
// 		}
// 		case 1: {
// 			return 'cyan';
// 		}
// 		case 2: {
// 			return 'orange';
// 		}
// 		case 3: {
// 			return 'green';
// 		}
// 		case 4: {
// 			return 'purple';
// 		}
// 		case 5: {
// 			return 'blue';
// 		}
// 		case 6: {
// 			return 'yellow';
// 		}
// 		default: {
// 			throw new Error('Invalid option');
// 		}
// 	}
// }

class Tetromino {
	position: Point[];
	anchor: Point;
	type: PieceType;
	rotationState: number;
	dropTimer: Timer | null = null;
	dropDelay = 1000;

	constructor(type: PieceType) {
		this.type = type;
		switch (type) {
			case 'i': {
				this.position = [
					{ x: 3, y: 0, value: 6 },
					{ x: 4, y: 0, value: 6 },
					{ x: 5, y: 0, value: 6 },
					{ x: 6, y: 0, value: 6 },
				];
				this.rotationState = 1;
				this.anchor = this.position[1];
				break;
			}
			case 's': {
				this.position = [
					{ x: 4, y: 1, value: 5 },
					{ x: 5, y: 1, value: 5 },
					{ x: 5, y: 0, value: 5 },
					{ x: 6, y: 0, value: 5 },
				];
				this.rotationState = 0;
				this.anchor = this.position[1];
				break;
			}
			case 'z': {
				this.position = [
					{ x: 4, y: 0, value: 4 },
					{ x: 5, y: 0, value: 4 },
					{ x: 5, y: 1, value: 4 },
					{ x: 6, y: 1, value: 4 },
				];
				this.rotationState = 0;
				this.anchor = this.position[2];
				break;
			}
			case 'o': {
				this.position = [
					{ x: 4, y: 0, value: 3 },
					{ x: 4, y: 1, value: 3 },
					{ x: 5, y: 0, value: 3 },
					{ x: 5, y: 1, value: 3 },
				];
				this.rotationState = 0;
				this.anchor = this.position[0];
				break;
			}
			case 'l': {
				this.position = [
					{ x: 4, y: 1, value: 2 },
					{ x: 5, y: 1, value: 2 },
					{ x: 6, y: 1, value: 2 },
					{ x: 6, y: 0, value: 2 },
				];
				this.rotationState = 0;
				this.anchor = this.position[1];
				break;
			}
			case 'j': {
				this.position = [
					{ x: 4, y: 0, value: 1 },
					{ x: 4, y: 1, value: 1 },
					{ x: 5, y: 1, value: 1 },
					{ x: 6, y: 1, value: 1 },
				];
				this.rotationState = 0;
				this.anchor = this.position[2];
				break;
			}
			case 't': {
				this.position = [
					{ x: 4, y: 1, value: 0 },
					{ x: 5, y: 1, value: 0 },
					{ x: 5, y: 0, value: 0 },
					{ x: 6, y: 1, value: 0 },
				];
				this.rotationState = 0;
				this.anchor = this.position[1];
				break;
			}
			default: {
				throw new Error('Statement should be unreachable');
			}
		}
	}

	willClip(game: Game, x: number, y: number): boolean {
		const outOfBoundsX = x < 0 || x > game.width - 1;
		const outOfBoundsY = y > game.height - 1;
		const willClipCeiling = this.type === 'i' && y < 0;
		const occupied = !willClipCeiling && game.get(x, y)?.value !== '*' && !this.position.some((point) => point.x === x && point.y === y);
		return outOfBoundsX || outOfBoundsY || occupied;
	}

	/** Moves the peice to the left */
	left(game: Game) {
		const newPosition: Point[] = [];

		for (const point of this.position) {
			if (this.willClip(game, point.x - 1, point.y)) {
				return true;
			}
			newPosition.push({ x: point.x - 1, y: point.y, value: point.value });
		}

		game.updateCurrent(newPosition);
		this.anchor = { x: this.anchor.x - 1, y: this.anchor.y, value: this.anchor.value };
		return true;
	}

	down(game: Game) {
		const newPosition: Point[] = [];

		if (this.dropTimer) {
			game.lockPiece();
			game.spawn();
			clearTimeout(this.dropTimer);
			this.dropTimer = null;
			return true;
		}

		for (const point of this.position) {
			if (this.willClip(game, point.x, point.y + 1)) {
				this.dropTimer = setTimeout(() => {
					game.lockPiece();
					game.spawn();
				}, this.dropDelay);
				return true;
			}
			newPosition.push({ x: point.x, y: point.y + 1, value: point.value });
		}

		game.updateCurrent(newPosition);
		this.anchor = { x: this.anchor.x, y: this.anchor.y + 1, value: this.anchor.value };
		return true;
	}

	/** Moves the peice to the right */
	right(game: Game) {
		const newPosition: Point[] = [];

		for (const point of this.position) {
			if (this.willClip(game, point.x + 1, point.y)) {
				return true;
			}
			newPosition.push({ x: point.x + 1, y: point.y, value: point.value });
		}

		game.updateCurrent(newPosition);
		this.anchor = { x: this.anchor.x + 1, y: this.anchor.y, value: this.anchor.value };
		return true;
	}

	#rotateI(game: Game) {
		const x = this.anchor.x;
		const y = this.anchor.y;
		const newPositions =
			this.rotationState === 0
				? [
						{ x: x - 1, y: y, value: this.position[0].value },
						{ x: x, y: y, value: this.position[1].value },
						{ x: x + 1, y: y, value: this.position[2].value },
						{ x: x + 2, y: y, value: this.position[3].value },
					]
				: [
						{ x: x, y: y - 1, value: this.position[0].value },
						{ x: x, y: y, value: this.position[1].value },
						{ x: x, y: y + 1, value: this.position[2].value },
						{ x: x, y: y + 2, value: this.position[3].value },
					];

		if (
			newPositions.some((point) => {
				const clip = this.willClip(game, point.x, point.y);
				if (clip) {
					console.log('clipping! point:', point);
				}
				return clip;
			})
		) {
			return;
		}
		game.updateCurrent(newPositions);
		this.rotationState = this.rotationState === 0 ? 1 : 0;
	}

	rotate(game: Game) {
		const newPositions: Point[] = [];
		if (this.type === 'o') {
			return true;
		}

		if (this.type === 'i') {
			this.#rotateI(game);
			return true;
		}

		for (const point of this.position) {
			const x = point.x - this.anchor.x;
			const y = point.y - this.anchor.y;
			const newX = this.anchor.x - y;
			const newY = this.anchor.y + x;
			if (this.willClip(game, newX, newY)) {
				return true;
			}
			newPositions.push({ x: newX, y: newY, value: point.value });
		}

		game.updateCurrent(newPositions);
		return true;
	}

	instaDrop(game: Game) {
		let canMoveDown = true;

		while (canMoveDown) {
			const newPosition: Point[] = [];

			for (const point of this.position) {
				if (this.willClip(game, point.x, point.y + 1)) {
					canMoveDown = false;
					break;
				}
				newPosition.push({ x: point.x, y: point.y + 1, value: point.value });
			}
			if (canMoveDown) {
				game.updateCurrent(newPosition);
				this.anchor = { x: this.anchor.x, y: this.anchor.y + 1, value: this.anchor.value };
			}
		}

		game.lockPiece();
		game.spawn();
	}

	/** Calculates the lowest position for the ghost piece */
	calculateGhost(game: Game): Point[] {
		let ghostPosition = this.position.map((point) => ({ ...point }));

		let canMoveDown = true;
		while (canMoveDown) {
			const newPosition: Point[] = [];

			for (const point of ghostPosition) {
				if (this.willClip(game, point.x, point.y + 1)) {
					canMoveDown = false;
					break;
				}
				newPosition.push({ x: point.x, y: point.y + 1, value: point.value });
			}

			if (canMoveDown) {
				ghostPosition = newPosition;
			}
		}

		return ghostPosition;
	}

	public static i = new Tetromino('i');
	public static o = new Tetromino('o');
	public static j = new Tetromino('j');
	public static l = new Tetromino('l');
	public static t = new Tetromino('t');
	public static s = new Tetromino('s');
	public static z = new Tetromino('z');
}

class Game {
	#renderer: Timer | null = null;
	hold: PieceType | null = null;

	debugging = true;
	help = false;
	paused = false;
	speed = 1000;
	started = false;
	swapped = false;
	over = false;
	combo = 0;
	score = 0;
	lines = 0;
	level = 1;

	current: Tetromino;
	next: Tetromino;
	height: number;
	state: Map<string, Point>;
	width: number;

	constructor(size: { height: number; width: number }) {
		this.width = size.width;
		this.height = size.height;
		this.state = new Map();
		this.current = this.selectNext();
		this.next = this.selectNext();

		for (let y = 0; y < size.height; y++) {
			for (let x = 0; x < size.width; x++) {
				if (this.current.position.some((point) => point.x === x && point.y === y)) {
					const point = this.current.position.find((point) => point.x === x && point.y === y);
					if (point) {
						this.state.set(this.#makeKey(x, y), point);
						continue;
					}
				}
				this.state.set(this.#makeKey(x, y), { x, y, value: '*' });
			}
		}
	}

	#makeKey(x: number, y: number): string {
		return JSON.stringify({ x, y });
	}

	get(x: number, y: number): Point | null {
		const outOfBoundsX = x < 0 || x > this.width - 1;
		const outOfBoundsY = y < 0 || y > this.height - 1;

		if (outOfBoundsX || outOfBoundsY) {
			return null;
		}

		const key = JSON.stringify({ x, y });

		if (this.state.has(key)) {
			const point = this.state.get(key)!;
			return point;
		}

		return null;
	}

	set(x: number, y: number, value: PointValue): Point | null {
		const point = this.get(x, y);

		if (!point) {
			return null;
		}

		point.value = value;
		this.state.set(this.#makeKey(x, y), point);

		return point;
	}

	updateCurrent(points: Point[]) {
		this.current.position.forEach((point) => {
			this.set(point.x, point.y, '*');
		});
		this.current.position = points;
		points.forEach((point) => {
			this.set(point.x, point.y, point.value);
		});
	}

	selectNext() {
		const options = ['i', 'o', 'j', 'l', 't', 's', 'z'] as const;
		const next: PieceType = options[Math.floor(Math.random() * 7)];
		return new Tetromino(next);
	}

	calculateScore(lines: number) {
		switch (lines) {
			case 1: {
				this.score += (100 + 50 * this.combo) * this.level;
				break;
			}
			case 2: {
				this.score += (300 + 50 * this.combo) * this.level;
				break;
			}
			case 3: {
				this.score += (500 + 50 * this.combo) * this.level;
				break;
			}
			case 4: {
				this.score += (800 + 50 * this.combo) * this.level;
			}
		}
	}

	clearLines() {
		const rowsToClear: number[] = [];

		for (let y = 0; y < this.height; y++) {
			let isFullRow = true;
			for (let x = 0; x < this.width; x++) {
				if (this.get(x, y)?.value === '*') {
					isFullRow = false;
					break;
				}
			}
			if (isFullRow) {
				rowsToClear.push(y);
			}
		}

		if (rowsToClear.length === 0) {
			this.combo = 0;
			return;
		}

		this.lines += rowsToClear.length;
		this.combo += rowsToClear.length;
		this.calculateScore(rowsToClear.length);

		rowsToClear.forEach((row) => {
			for (let x = 0; x < this.width; x++) {
				this.set(x, row, '*');
			}

			for (let y = row; y > 0; y--) {
				for (let x = 0; x < this.width; x++) {
					const pointAbove = this.get(x, y - 1);
					if (pointAbove) {
						this.set(x, y, pointAbove.value);
						this.set(x, y - 1, '*');
					}
				}
			}
		});

		this.incrementLevel();
	}

	#resetState() {
		this.started = false;
		this.paused = false;
		this.hold = null;
		this.score = 0;
		this.combo = 0;
		this.lines = 0;

		if (this.#renderer) {
			clearInterval(this.#renderer);
			this.#renderer = null;
		}

		if (this.current.dropTimer) {
			clearTimeout(this.current.dropTimer);
			this.current.dropTimer = null;
		}

		this.state.forEach((point) => this.set(point.x, point.y, '*'));
		this.current = this.selectNext();
		this.next = this.selectNext();
		this.updateCurrent(this.current.position);
	}

	swap() {
		this.swapped = true;
		this.current.position.forEach((point) => this.set(point.x, point.y, '*'));
		if (!this.hold) {
			this.hold = this.current.type;
			this.current = this.next;
			this.next = this.selectNext();
			this.updateCurrent(this.current.position);
			this.frame();
			return;
		}
		const type = this.hold;
		this.hold = this.current.type;
		this.current = new Tetromino(type);
		this.updateCurrent(this.current.position);
		this.frame();
	}

	newGame() {
		this.over = false;
		this.#resetState();
		this.render();
	}

	gameOver() {
		const { score, lines, level } = this;
		console.clear();
		console.log(getGameOverText(score, lines, level));
		this.over = true;
		this.#resetState();
	}

	incrementLevel() {
		this.level = Math.floor(this.lines / 10);
		this.#renderer && clearInterval(this.#renderer);
		this.speed = 1000 - this.level * 20;
		this.render();
	}

	pause() {
		if (this.paused) {
			this.paused = false;
			this.render();
			return;
		}

		this.paused = true;
		console.clear();
		console.log(pauseText);

		if (this.current.dropTimer) {
			clearTimeout(this.current.dropTimer);
			this.current.dropTimer = null;
		}
		if (this.#renderer) {
			clearInterval(this.#renderer);
			this.#renderer = null;
		}
	}

	spawn(type?: PieceType) {
		this.current = type ? new Tetromino(type) : this.next;
		this.next = this.selectNext();

		for (const point of this.current.position) {
			const existing = this.get(point.x, point.y);
			if (existing && existing.value !== '*') {
				this.gameOver();
				return;
			}
		}

		this.updateCurrent(this.current.position);
		this.frame();
	}

	lockPiece() {
		this.swapped = false;
		this.current.position.forEach((point) => {
			this.set(point.x, point.y, point.value);
		});
		this.clearLines();
	}

	speedUp() {}

	render() {
		this.started = true;
		this.frame();
		this.#renderer = setInterval(() => {
			this.current.down(this);
			this.frame();
		}, this.speed);
	}

	/** Complicated state printer for stdout. */
	frame() {
		console.clear();
		let i = 0;
		let j = 0;
		let k = 0;
		let l = 0;

		const bar = cyan('│');
		let row: (number | string)[] = [' ', bar];

		const next = pieceDisplay('  NEXT   ', this.next.type).split('\n');
		const hold = pieceDisplay('  HOLD   ', this.hold).split('\n');
		const level = levelDisplay(this.level).split('\n');
		const ghost = this.current.calculateGhost(this);
		const top = cyan('  ┌─────────────────────┐');
		const bottom = cyan('  └─────────────────────┘');
		console.log(top);

		for (const [_, point] of this.state) {
			let char = typeof point.value === 'number' ? toANSI(point.value) : black('*');
			if (ghost.some((ghostPoint) => ghostPoint.x === point.x && ghostPoint.y === point.y) && point.value === '*') {
				char = toANSI(this.current.position[0].value as number).replaceAll('■', '⬚');
			}
			row.push(char);

			if (point.x === this.width - 1) {
				let str: string = row.toString().replaceAll(',', ' ').concat(' ', bar);
				if (i > 4 && j < next.length) {
					str = str.concat('    ', next[j]);
					j++;
				}

				if (i > 9 && k < hold.length) {
					str = str.concat('    ', hold[k]);
					k++;
				}

				if (i > 13 && l < level.length) {
					str = str.concat('    ', level[l]);
					l++;
				}

				console.log(str);
				i++;
				row = [' ', bar];
				continue;
			}
		}
		console.log(bottom);
		if (this.debugging) {
			this.#debugPosition();
			this.#debugGhostPosition();
			this.#debugSwapped();
			this.#debugLevel();
			this.#debugLines();
			this.#debugCombo();
			this.#debugScore();
			this.#debugSpeed();
		}
	}

	#debugPosition = () =>
		console.log(`\nPosition: ${blue('{')}\n`.concat(this.current.position.map(debugPoint).join('\n')).concat(`\n${blue('}')}`));
	#debugGhostPosition = () =>
		console.log(
			`\nGhost Pos: ${blue('{')}\n`.concat(this.current.calculateGhost(this).map(debugPoint).join('\n')).concat(`\n${blue('}')}`),
		);
	#debugSwapped = () => console.log(`\nSwap : ${yellow(this.swapped.toString())}`);
	#debugLevel = () => console.log(`Level: ${yellow(this.level.toString())}`);
	#debugLines = () => console.log(`Lines: ${yellow(this.lines.toString())}`);
	#debugCombo = () => console.log(`Combo: ${yellow(this.combo.toString())}`);
	#debugScore = () => console.log(`Score: ${yellow(this.score.toString())}`);
	#debugSpeed = () => console.log(`Speed: ${yellow(this.speed.toString())}`);

	titleScreen() {
		this.#resetState();

		if (!this.help) {
			console.clear();
			console.log(title);
		} else {
			console.clear();
			console.log(title.concat(controls));
		}
	}
}

const game = new Game({ height: 20, width: 10 });
game.titleScreen();

onkeydown((event) => {
	if (event.sequence === '?' && !game.started) {
		game.help = !game.help;
		game.titleScreen();
	}

	event.name === 'return' && !game.started && !game.over && game.newGame();
	event.name === 'p' && game.started && game.pause();
	event.name === 'space' && game.started && !game.paused && game.current.instaDrop(game);
	event.name === 'w' && game.started && !game.paused && game.current.rotate(game) && game.frame();
	event.name === 'a' && game.started && !game.paused && game.current.left(game) && game.frame();
	event.name === 'd' && game.started && !game.paused && game.current.right(game) && game.frame();
	event.name === 's' && game.started && !game.paused && game.current.down(game) && game.frame();
	event.name === 'e' && game.started && !game.paused && !game.swapped && game.swap();
	event.name === 'r' && ((game.started && game.paused) || game.over) && game.newGame();
	event.name === 't' && ((game.started && game.paused) || game.over) && game.titleScreen();
	event.name === 'q' && ((game.started && game.paused) || game.over) && exit();
});
