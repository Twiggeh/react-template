import { Theme } from '@emotion/react';

const lightTheme: Theme = {
	fontSize: {
		mini: 'clamp(12px, 1vw, 25px)',
		medium: 'clamp(28px, 2vw, 45px)',
	},
	color: {
		accent: 'hotpink',
		primary: '#0066ff',
		fontColor: 'black',
	},
	mq: {
		tablet: '@media (max-width: 1400px)',
		phone: '@media (max-width: 700px)',
	},
};

export const allThemes = {
	lightTheme,
};
