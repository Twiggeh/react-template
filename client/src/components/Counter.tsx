import styled from '@emotion/styled';
import React, { useState } from 'react';

const Counter: React.FC = () => {
	const [counter, setCounter] = useState(0);
	return (
		<StyledCounter>
			<StyledCounterDisplay>Current count : {counter}</StyledCounterDisplay>
			<div>
				<CounterButton onClick={() => setCounter(c => c + 1)}>+</CounterButton>
				<CounterButton onClick={() => setCounter(c => c - 1)}>-</CounterButton>
			</div>
		</StyledCounter>
	);
};

var StyledCounterDisplay = styled.div`
	padding: 0em 2em;
`;

var CounterButton = styled.div`
	padding: 0em 2em;
	background-color: ${({ theme }) => theme.color.accent};
	font-weight: 899;
	color: white;
	cursor: pointer;
	user-select: none;
`;

var StyledCounter = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 0em;
	font-size: ${({ theme }) => theme.fontSize.medium};
`;

export default Counter;
