import {
	blue,
	boldGreen,
	boldPurple,
	boldRed,
	boldYellow,
	cyan,
	green,
	italic,
	purple,
	red,
	strikethrough,
	toANSI,
	underline,
	yellow,
} from './color';
import { exit, onkeydown } from './input';

function debugPoint(point: Point): string {
	const x = ` ${cyan('x')}: ${yellow(point.x.toString())}, `;
	const y = `${cyan('y')}: ${yellow(point.y.toString())}, `;
	const value = `${cyan('value')}: ${yellow(point.value.toString())} `;
	const open = red('{');
	const close = red('}');
	return `${open}${x}${y}${value}${close}`;
}

type PointValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | string;
type Point = { x: number; y: number; value: PointValue };
type PieceType = 'i' | 'o' | 'j' | 'l' | 't' | 's' | 'z';
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
		const occupied = game.get(x, y)?.value !== '*' && !this.position.some((point) => point.x === x && point.y === y);
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
			this.lockPiece(game);
			this.spawn(game);
			clearTimeout(this.dropTimer);
			this.dropTimer = null;
			return true;
		}

		for (const point of this.position) {
			if (this.willClip(game, point.x, point.y + 1)) {
				this.dropTimer = setTimeout(() => {
					this.lockPiece(game);
					this.spawn(game);
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

		if (newPositions.some((point) => this.willClip(game, point.x, point.y))) {
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

		this.lockPiece(game);
		this.spawn(game);
	}

	lockPiece(game: Game) {
		this.position.forEach((point) => {
			game.set(point.x, point.y, point.value);
		});
		game.clearLines();
	}

	spawn(game: Game) {
		game.current = game.next;
		game.updateCurrent(game.current.position);
		game.frame();
		game.next = game.selectNextTetromino();
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
	current: Tetromino;
	height: number;
	help: boolean = false;
	next: Tetromino;
	paused: boolean = false;
	speed: number = 2000;
	started: boolean = false;
	state: Map<string, Point>;
	width: number;
	debugging: boolean = true;

	constructor(size: { height: number; width: number }) {
		this.width = size.width;
		this.height = size.height;
		this.state = new Map();
		this.current = this.selectNextTetromino();
		this.next = this.selectNextTetromino();

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

	selectNextTetromino() {
		const options = ['i', 'o', 'j', 'l', 't', 's', 'z'] as const;
		const next: PieceType = options[Math.floor(Math.random() * 7)];
		return new Tetromino(next);
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
	}

	#resetState() {
		this.started = false;
		this.paused = false;

		if (this.#renderer) {
			clearInterval(this.#renderer);
			this.#renderer = null;
		}

		if (this.current.dropTimer) {
			clearTimeout(this.current.dropTimer);
			this.current.dropTimer = null;
		}

		this.state.forEach((point) => this.set(point.x, point.y, '*'));
		this.current = this.selectNextTetromino();
		this.next = this.selectNextTetromino();
		this.updateCurrent(this.current.position);
	}

	newGame() {
		this.#resetState();
		this.render();
	}

	pause() {
		if (this.paused) {
			this.paused = false;
			this.render();
			return;
		}

		this.paused = true;
		const pauseText = `
    ${boldRed(`
                  ╔═╗╔═╗╦ ╦╔═╗╔═╗╔╦╗
                  ╠═╝╠═╣║ ║╚═╗║╣  ║║
                  ╩  ╩ ╩╚═╝╚═╝╚═╝═╩╝
`)}
                  ${green('[p]')}: Resume
                   ${yellow('[r]')}: New Game
                   ${cyan('[t]')}: Title Screen 
                   ${red('[q]')}: Quit
       ${this.#controls}`;

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

	render() {
		this.started = true;
		game.frame();
		this.#renderer = setInterval(() => {
			game.current.down(game);
			game.frame();
		}, game.speed);
	}

	/** Complicated state printer for stdout. */
	frame() {
		console.clear();
		let i = 0;
		let row: (number | string)[] = [];
		const top = Array.from({ length: this.width }, (_, i) => i)
			.toString()
			.replaceAll(',', ' ');
		if (this.debugging) {
			console.log('   '.concat(boldRed(top)));
		}

		for (const [_, point] of this.state) {
			const char = typeof point.value === 'number' ? toANSI(point.value) : '*';
			row.push(char);

			if (point.x === this.width - 1) {
				let str: string = row.toString().replaceAll(',', ' ');
				if (this.debugging) {
					str =
						i < 10
							? boldRed(` ${i} `).concat(row.toString().replaceAll(',', ' '))
							: boldRed(`${i} `).concat(row.toString().replaceAll(',', ' '));
					i++;
				}
				console.log(str);
				row = [];
				continue;
			}
		}
		if (this.debugging) {
			this.#debugPosition();
		}
	}

	#debugPosition = () => console.log(this.current.position.map(debugPoint).join('\n'));

	#controls = `
                        ${boldGreen('Controls')}
               ${blue('┌────────────┬──────────────┐')}
               ${blue('│')}    ${boldPurple('Key')}     ${blue('│')}    ${boldYellow('Action')}    ${blue('│')}
               ${blue('├────────────┼──────────────┤')}
               ${blue('│')}   ${purple('[w]')}      ${blue('│')}  ${yellow('Rotate')}      ${blue('│')}
               ${blue('│')}   ${purple('[a]')}      ${blue('│')}  ${yellow('Move Left')}   ${blue('│')}
               ${blue('│')}   ${purple('[d]')}      ${blue('│')}  ${yellow('Move Right')}  ${blue('│')}
               ${blue('│')}   ${purple('[s]')}      ${blue('│')}  ${yellow('Move Down')}   ${blue('│')}
               ${blue('│')}   ${purple('[e]')}      ${blue('│')}  ${yellow('Swap')}        ${blue('│')}
               ${blue('│')}   ${purple('[space]')}  ${blue('│')}  ${yellow('Drop Piece')}  ${blue('│')}
               ${blue('│')}   ${purple('[p]')}      ${blue('│')}  ${yellow('Pause')}       ${blue('│')}
               ${blue('│')}   ${purple('[?]')}      ${blue('│')}  ${yellow('Hide Help')}   ${blue('│')}
               ${blue('└────────────┴──────────────┘')}`;

	#title = `
${purple('──┘')}${yellow(' └───────────────────────────────────────────────┘ ')}${blue('└──')}
${cyan('──┐ ')}${green('┌───────────────────────────────────────────────┐')} ${red('┌──')}
${cyan('  │ ')}${green('│')} ████████╗███████╗████████╗██████╗ ██╗███████╗ ${green('│')} ${red('│')}
${cyan('  │ ')}${green('│')} ╚══██╔══╝██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝ ${green('│')} ${red('│')}
${cyan('  │ ')}${green('│')}    ██║   █████╗     ██║   ██████╔╝██║███████╗ ${green('│')} ${red('│')}
${cyan('  │ ')}${green('│')}    ██║   ██╔══╝     ██║   ██╔══██╗██║╚════██║ ${green('│')} ${red('│')}
${cyan('  │ ')}${green('│')}    ██║   ███████╗   ██║   ██║  ██║██║███████║ ${green('│')} ${red('│')}
${cyan('  │ ')}${green('│')}    ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝ ${green('│')} ${red('│')}
${cyan('──┘ ')}${green('└───────────────────────────────────────────────┘')} ${red('└──')}
${red('──┐')} ${purple('┌───────────────────────────────────────────────┐')} ${yellow('┌──')}
${red('  │')} ${purple('│')}     A ${strikethrough(italic('shitty'))} remake by ${underline('Roy E. Crippen IV')}      ${purple('│')} ${yellow('│')}

                 Press ${green('enter')} to start
                 Press ${yellow('?')} to toggle controls 
                 Press ${red('ctrl + c')} to exit
`;

	titleScreen() {
		this.#resetState();

		if (!this.help) {
			console.clear();
			console.log(this.#title);
		} else {
			console.clear();
			console.log(this.#title.concat(this.#controls));
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
	event.name === 'return' && !game.started && game.newGame();
	event.name === 'p' && game.started && game.pause();
	event.name === 'space' && game.started && !game.paused && game.current.instaDrop(game);
	event.name === 'w' && game.started && !game.paused && game.current.rotate(game) && game.frame();
	event.name === 'a' && game.started && !game.paused && game.current.left(game) && game.frame();
	event.name === 'd' && game.started && !game.paused && game.current.right(game) && game.frame();
	event.name === 's' && game.started && !game.paused && game.current.down(game) && game.frame();
	event.name === 'r' && game.started && game.paused && game.newGame();
	event.name === 't' && game.started && game.paused && game.titleScreen();
	event.name === 'q' && game.started && game.paused && exit();
});
