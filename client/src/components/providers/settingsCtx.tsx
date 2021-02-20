/* eslint-disable no-mixed-spaces-and-tabs */
import { createContext, useReducer } from 'react';
import { allThemes } from '../../static/Themes';
import useLocalStorage from '../hooks/useLocalStorage';

interface ISetting {
	settings: SettingsState;
	settingsDispatch: React.Dispatch<SettingsAction>;
}

export type SettingsAction = { type: 'setTheme'; theme: SettingsState['theme'] };

export type SettingsState = {
	theme: keyof typeof allThemes;
};

const initialSettings: SettingsState = { theme: 'lightTheme' };

export const useSettings = () => {
	const [savedSettingsState, setSettingsState] = useLocalStorage(
		'SettingsState',
		initialSettings
	);
	const settingsReducer = (
		state: SettingsState,
		action: SettingsAction
	): SettingsState => {
		switch (action.type) {
			case 'setTheme': {
				const newState = { ...state, theme: action.theme };
				setSettingsState(newState);
				return newState;
			}
		}
	};

	return useReducer(settingsReducer, savedSettingsState, () => savedSettingsState);
};

const DefaultModalCtx: ISetting = {
	settings: initialSettings,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	settingsDispatch: () => {},
};

const SettingsCtx = createContext<ISetting>(DefaultModalCtx);

export default SettingsCtx;
