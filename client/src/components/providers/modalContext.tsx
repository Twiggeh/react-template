import { createContext } from 'react';
import { Modal } from '../Modals';

type ModalCtx = {
	modal?: Modal;
	setModal: React.Dispatch<React.SetStateAction<Modal | undefined>>;
};

const DefaultModalCtx: ModalCtx = {
	modal: undefined,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setModal: () => {},
};

const ModalCtx = createContext<ModalCtx>(DefaultModalCtx);

export default ModalCtx;
