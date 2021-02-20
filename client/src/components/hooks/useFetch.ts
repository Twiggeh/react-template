/* eslint-disable no-mixed-spaces-and-tabs */
const useFetch = <Result>(
	url: RequestInfo,
	{
		fetchOptions = { method: 'GET' },
		hookOptions: { condition, dep, parser } = { condition: true, parser: 'json' },
		callbacks: { successCb, finalCb, failCb } = {},
	}: FetchOptions<Result>
) => {
	const isMounted = useRef(false);

	useEffect(() => {
		isMounted.current = true;
	}, []);

	const initFState: ReturnFStates<Result> = {
		res: undefined,
		loading: true,
		error: undefined,
		uuid: uuid(),
	};

	const fStateReducer = (
		state: ReturnFStates<Result>,
		action: FetchAction<Result>
	): ReturnFStates<Result> => {
		switch (action.type) {
			case 'loading':
				return { ...state, res: undefined, loading: true, error: undefined };
			case 'error':
				return { ...state, res: undefined, loading: false, error: action.error };
			case 'setData':
				return { ...state, res: action.res, loading: false, error: undefined };
		}
	};

	const [fState, fDispatch] = useReducer(fStateReducer, initFState);

	// Fetches Lobbies and refreshes
	useEffect(() => {
		if (!condition) return;
		const fetchData = async () => {
			fDispatch({ type: 'loading' });

			const result: [result?: Result, error?: string] = [];

			if (!isMounted.current) return;
			try {
				const rawRes = await fetch(url, fetchOptions);

				if (rawRes === undefined) throw 'Empty Response';
				if (!rawRes.ok) throw rawRes.statusText;

				let res;
				switch (parser) {
					case 'string':
						res = await rawRes.text();
						break;
					case 'json':
						res = await rawRes.json();
						break;
				}

				fDispatch({ type: 'setData', res });
				successCb && successCb(res);

				result[0] = res;
			} catch (error) {
				console.log(error);
				fDispatch({ type: 'error', error });
				failCb && failCb(error);

				result[1] = error;
			}

			finalCb && finalCb(...result);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dep, condition]);

	return fState;
};

type FetchAction<Result> =
	| {
			type: 'loading';
	  }
	| {
			type: 'error';
			error: string;
	  }
	| {
			type: 'setData';
			res: Result;
	  };

type ReturnFStates<Result> =
	// Fetch successful
	| { res: Result; loading: false; error?: undefined; uuid: string }
	// Fetch Loading
	| { res?: undefined; loading: true; error?: undefined; uuid: string }
	// Fetch Failed
	| { res?: undefined; loading: false; error: string; uuid: string }
	// Fetch initializing
	| { res?: undefined; loading: false; error?: undefined; uuid: string };

interface FetchOptions<Result> {
	fetchOptions: RequestInit;
	hookOptions?: {
		condition?: boolean | number;
		dep?: number | boolean;
		parser?: 'json' | 'string';
	};
	callbacks?: {
		finalCb?: (result: Result | undefined, error: string | undefined) => void;
		successCb?: (result: Result) => void;
		failCb?: (error: string) => void;
	};
}

import { v4 as uuid } from 'uuid';
import { useReducer, useEffect, useRef } from 'react';

export default useFetch;
