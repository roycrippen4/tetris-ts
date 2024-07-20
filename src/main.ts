import './style.css';

// @ts-ignore
window.backgroundColor = '#181818';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game"></canvas>
`;

const game = document.getElementById('game') as HTMLCanvasElement | null;

if (!game) {
	throw new Error('Canvas not found');
}

const width = 125 * 4;
const height = 237 * 4;
game.width = width;
game.height = height;

const ctx = game.getContext('2d');
if (!ctx) {
	throw new Error('Canvas context not found');
}

ctx.fillStyle = '#181818'; // give the canvas a background color
ctx.fillRect(0, 0, game.width, game.height);
