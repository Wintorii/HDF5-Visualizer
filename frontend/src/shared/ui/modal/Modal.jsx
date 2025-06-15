import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import ModalOverlay from '../modalOverlay/ModalOverlay';
import Styles from './Modal.module.scss';
// import { ConstantImage } from '../../utils/constant-image';
import CloseIcon from '../../assets/close.svg';

const modalRoot = document.getElementById('react-modals');

const Modal = (props) => {
    // const imageService = new ConstantImage();
    const handleUserKeyPress = (event) => {
        const { key } = event;

        if (key === 'Escape') {
            props.overlayHandler();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress);

        return () => {
            window.removeEventListener('keydown', handleUserKeyPress);
        };
    });

    return ReactDOM.createPortal(
        <ModalOverlay
            overlayHandler={props.overlayHandler}
            isLeft={props?.isLeft}
            isRight={props?.isRight}
        >
            <div className={Styles.popup}>
                <div className={Styles.header}>
                    <p className={Styles.title}>{props.title}</p>
                    <button
                        className={Styles.button}
                        type="button"
                        onClick={props.overlayHandler}
                    >
                        <img
                            className={Styles.cross}
                            src={CloseIcon}
                            alt="Закрыть"
                        />
                    </button>
                </div>
                {props.children}
            </div>
        </ModalOverlay>,
        modalRoot
    );
};

export default Modal;