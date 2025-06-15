import React from 'react';
import styles from './ModalOverlay.module.scss';

const ModalOverlay = ({
    overlayHandler,
    children,
    isLeft,
    isRight,
    isNeedCheckVisible,
    isVisible,
}) => {
    return (
        <section
            className={`${styles.overlay} ${isLeft ? styles.leftDirection : ''} ${isRight ? styles.rightDirection : ''} ${isNeedCheckVisible && !isVisible ? styles.invisible : isNeedCheckVisible && isVisible ? styles.visible : ''}`}
            onClick={(evt) => evt.currentTarget === evt.target && overlayHandler()}
        >
            {children}
        </section>
    );
};

export default ModalOverlay;