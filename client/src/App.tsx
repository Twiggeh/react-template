import { hot } from 'react-hot-loader/root';
import React from 'react';
import { ThemeProvider } from '@emotion/react';
import './assets/cssReset.css';
import {
	ApolloClient,
	NormalizedCacheObject,
	InMemoryCache,
	ApolloProvider,
} from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import Counter from './components/Counter';
import SettingsCtx, { useSettings } from './components/providers/settingsCtx';
import { allThemes } from './static/Themes';
import { SmallFox } from './static/Images';

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
	cache: new InMemoryCache(),
	credentials: 'include',
	link: createUploadLink({
		credentials: 'include',
		uri: `${BACKEND_SERVER_URL}/graphql`,
	}),
});

const App = () => {
	const [settings, settingsDispatch] = useSettings();

	return (
		<>
			<ApolloProvider client={client}>
				<ThemeProvider theme={allThemes[settings.theme]}>
					<SettingsCtx.Provider value={{ settings, settingsDispatch }}>
						<Counter />
						<div>Hello there</div>
						<img src={SmallFox} />
					</SettingsCtx.Provider>
				</ThemeProvider>
			</ApolloProvider>
		</>
	);
};

export default hot(App);
