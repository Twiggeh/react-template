import '@emotion/react';

declare module '@emotion/react' {
	export interface Theme {
		color: {
			accent: string;
			primary: string;
			fontColor: string;
		};
		mq: {
			tablet: string;
			phone: string;
		};
		fontSize: {
			mini: string;
			medium: string;
		};
	}
}
