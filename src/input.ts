import readline from 'readline';
import { bold, italic, underline } from './color';

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
	process.stdin.setRawMode(true);
}

export type KeyEvent = {
	sequence: string;
	name: string;
	ctrl: boolean;
	meta: boolean;
	shift: boolean;
};

/**
 * Registers a callback for keydown events
 * @param callback The callback to be called when a key is pressed
 */
export function onkeydown(callback: (event: KeyEvent) => void) {
	process.stdin.on('keypress', (_, event: KeyEvent) => callback(event));
}

/** Hides the cursor */
process.stdout.write('\x1b[?25l');

/** Shows the cursor before exiting */
process.on('beforeExit', () => process.stdout.write('\x1b[?25h'));

/** Quits the game */
export function exit() {
	console.log(`GG ${underline(italic(bold('NOOB')))} get rekt`);
	process.stdout.write('\x1b[?25h');
	process.exit();
}

/** Exits the program on <C-c> */
process.stdin.on('keypress', (_, event: KeyEvent) => {
	event.name === 'c' && event.ctrl && exit();
});
