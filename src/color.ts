export const bold = (str: string) => clear('\x1b[1m'.concat(str));
export const italic = (str: string) => clear('\x1b[3m'.concat(str));
export const strikethrough = (str: string) => clear('\x1b[9m'.concat(str));
export const blinking = (str: string) => clear('\x1b[5m'.concat(str));
export const underline = (str: string) => clear('\x1b[4m'.concat(str));

const clear = (str: string) => str.concat('\x1b[0m');

export const boldBlack = (str: string) => clear('\x1b[1;30m'.concat(str));
export const boldRed = (str: string) => clear('\x1b[1;31m'.concat(str));
export const boldGreen = (str: string) => clear('\x1b[1;32m'.concat(str));
export const boldYellow = (str: string) => clear('\x1b[1;33m'.concat(str));
export const boldBlue = (str: string) => clear('\x1b[1;34m'.concat(str));
export const boldPurple = (str: string) => clear('\x1b[1;35m'.concat(str));
export const boldCyan = (str: string) => clear('\x1b[1;36m'.concat(str));
export const boldWhite = (str: string) => clear('\x1b[1;37m'.concat(str));

export const black = (str: string) => clear('\x1b[0;30m'.concat(str));
export const red = (str: string) => clear('\x1b[0;31m'.concat(str));
export const green = (str: string) => clear('\x1b[0;32m'.concat(str));
export const yellow = (str: string) => clear('\x1b[0;33m'.concat(str));
export const blue = (str: string) => clear('\x1b[0;34m'.concat(str));
export const purple = (str: string) => clear('\x1b[0;35m'.concat(str));
export const cyan = (str: string) => clear('\x1b[0;36m'.concat(str));
export const white = (str: string) => clear('\x1b[0;37m'.concat(str));

/** Returns a colorized string based on the number */
export function toANSI(value: number): string {
	switch (value) {
		case 0: {
			return red('■');
		}
		case 1: {
			return cyan('■');
		}
		case 2: {
			return yellow('■');
		}
		case 3: {
			return green('■');
		}
		case 4: {
			return purple('■');
		}
		case 5: {
			return blue('■');
		}
		case 6: {
			return white('■');
		}
		default: {
			throw new Error('Invalid option');
		}
	}
}
