declare const BACKEND_SERVER_URL: string;

// Fix String()
interface StringConstructor {
	constructor: <Input extends unknown>(input: Input) => Input | undefined;
	new: <Input extends unknown>(input: Input) => Input | undefined;
	<Input extends unknown>(input: Input): Input | undefined;
}

type CustomCSS = { ccss?: string };
