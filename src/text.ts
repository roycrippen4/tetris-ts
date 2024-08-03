import {
	blue,
	bold,
	boldBlue,
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
import { PieceType } from './game';

export const controls = `
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
             ${blue('└────────────┴──────────────┘')}`;

export const pauseText = `
    ${boldRed(`
                  ╔═╗╔═╗╦ ╦╔═╗╔═╗╔╦╗
                  ╠═╝╠═╣║ ║╚═╗║╣  ║║
                  ╩  ╩ ╩╚═╝╚═╝╚═╝═╩╝\n`)}
                   ${green('[p]')}: Resume
                   ${yellow('[r]')}: New Game
                   ${cyan('[t]')}: Title Screen 
                   ${red('[q]')}: Quit
       ${controls}`;

export const title = `
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

function gameOverStats(score: number, lines: number, level: number) {
	return `
            ${purple('┌───────────────────────┐')}
            ${purple('│')}         ${bold('Stats')}         ${purple('│')}
            ${purple('├─────────┬─────────────┤')}
            ${purple('│')}  ${boldBlue('Score')}  ${purple('│')}  ${green(score.toString())}          ${purple('│')}
            ${purple('│')}  ${boldBlue('Lines')}  ${purple('│')}  ${green(lines.toString())}          ${purple('│')}
            ${purple('│')}  ${boldBlue('Level')}  ${purple('│')}  ${green(level.toString())}          ${purple('│')}
            ${purple('│')}  ${boldBlue('Trash')}  ${purple('│')}  ${green('yes')}        ${purple('│')}
            ${purple('└─────────┴─────────────┘')}`;
}

const gameOverControls = `
                 ${yellow('[r]')}: New Game
                 ${cyan('[t]')}: Title Screen 
                 ${red('[q]')}: Quit`;

export function getGameOverText(score: number, lines: number, level: number) {
	return red(`

       ██████╗  █████╗ ███╗   ███╗███████╗ 
       ██╔════╝ ██╔══██╗████╗ ████║██╔════╝ 
       ██║  ███╗███████║██╔████╔██║█████╗   
       ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝   
       ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗ 
       ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝ 
       
       ██████╗ ██╗   ██╗███████╗██████╗ ██╗
       ██╔═══██╗██║   ██║██╔════╝██╔══██╗██║
       ██║   ██║██║   ██║█████╗  ██████╔╝██║
       ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚═╝
       ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║██╗
       ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝ 
${gameOverStats(score, lines, level)}
${gameOverControls}`);
}

export function pieceDisplay(title: string, type?: PieceType | null) {
	if (!type) {
		return blue('┌─────────┐').concat(
			'\n',
			blue('│'),
			title,
			blue('│'),
			'\n',
			blue('│         │'),
			'\n',
			blue('│         │'),
			'\n',
			blue('└─────────┘'),
		);
	}
	let grid = [
		[blue('│'), ' ', ' ', ' ', ' ', blue('│')],
		[blue('│'), ' ', ' ', ' ', ' ', blue('│')],
	];
	switch (type) {
		case 'i':
			grid[0][1] = toANSI(6);
			grid[0][2] = toANSI(6);
			grid[0][3] = toANSI(6);
			grid[0][4] = toANSI(6);
			break;
		case 'o':
			grid[0][2] = toANSI(3);
			grid[0][3] = toANSI(3);
			grid[1][2] = toANSI(3);
			grid[1][3] = toANSI(3);
			break;
		case 'j':
			grid[0][1] = toANSI(1);
			grid[0][2] = toANSI(1);
			grid[0][3] = toANSI(1);
			grid[1][3] = toANSI(1);
			break;
		case 'l':
			grid[0][1] = toANSI(2);
			grid[0][2] = toANSI(2);
			grid[0][3] = toANSI(2);
			grid[1][1] = toANSI(2);
			break;
		case 't':
			grid[0][2] = toANSI(0);
			grid[1][1] = toANSI(0);
			grid[1][2] = toANSI(0);
			grid[1][3] = toANSI(0);
			break;
		case 's':
			grid[0][2] = toANSI(5);
			grid[0][3] = toANSI(5);
			grid[1][1] = toANSI(5);
			grid[1][2] = toANSI(5);
			break;
		case 'z':
			grid[0][1] = toANSI(4);
			grid[0][2] = toANSI(4);
			grid[1][2] = toANSI(4);
			grid[1][3] = toANSI(4);
			break;
	}

	const result = grid.map((row) => row.join(' ')).join('\n');
	return blue('┌─────────┐').concat('\n', blue('│'), title, blue('│'), '\n', result, '\n', blue('└─────────┘'));
}

export function levelDisplay(level: number) {
	const formattedLevel = level.toString().padStart(2, '0');
	return `
${purple('┌─────────┐')}
${purple('│')} ${bold(' Level ')} ${purple('│')}
${purple('│')}   ${formattedLevel}    ${purple('│')}
${purple('└─────────┘')}`;
}
