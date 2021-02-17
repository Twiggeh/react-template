import { SVGCross } from '../static/SVGS';
import SettingsCtx from './providers/settingsCtx';

export type Modal = {
	content: JSX.Element;
	modalCss?: string;
	closeBtnCss?: string;
};

const Modals = () => {
	const { modal, setModal } = useContext(ModalCtx);
	const { settings } = useContext(SettingsCtx);

	if (!modal) return null;

	const { modalCss, content, closeBtnCss } = modal;

	const SVGCrossCSS = css`
		path {
			stroke: ${allThemes[settings.theme].color.fontColor};
		}
	`;

	return (
		<>
			<ModalBackground
				onClick={e => {
					e.preventDefault();
					setModal(undefined);
				}}
			/>
			<StyledDialog ccss={modalCss}>
				<ModalButton
					ccss={closeBtnCss}
					onClick={e => {
						e.preventDefault();
						setModal(undefined);
					}}>
					<SVGCross css={SVGCrossCSS} />
				</ModalButton>
				{content}
			</StyledDialog>
		</>
	);
};

var ModalBackground = styled.div`
	width: 100vw;
	height: 100vh;
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.7);
	position: fixed;
	backdrop-filter: grayscale(1) blur(1px);
`;

var StyledDialog = styled.dialog<CustomCSS>`
	position: fixed;
	padding-top: 2em;
	border: 1px solid ${({ theme }) => theme.color.accent};
	display: flex;
	flex-direction: row-reverse;
	z-index: 200;
	filter: drop-shadow(0 0 1em rgba(200, 63, 134, 0.4));
	top: 50%;
	transform: translate(0, -50%);
	${({ ccss }) => ccss};
`;

var ModalButton = styled.button<CustomCSS>`
	border-width: 0;
	background: transparent;
	margin: 0 0 0 2em;
	padding: 0;
	cursor: pointer;
	${({ ccss }) => ccss}
	svg {
		width: clamp(25px, 2.5vw, 35px);
	}
`;

export default Modals;

import React, { useContext } from 'react';
import styled from '@emotion/styled';
import ModalCtx from './providers/modalContext';
import { allThemes } from '../static/Themes';
import { css } from '@emotion/react';
