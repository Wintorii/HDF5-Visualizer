import React, { useRef, useEffect, useState } from 'react';
import styles from './DropdownMenu.module.scss';

const SortSubMenu = ({ onSelect, onClose }) => {
    const [visible, setVisible] = useState(false);
    const subMenuRef = useRef(null);

    useEffect(() => {
        setTimeout(() => setVisible(true), 10);
    }, []);

    return (
        <div
            ref={subMenuRef}
            className={styles.submenu + (visible ? ' ' + styles.submenu_visible : '')}
        >
            <div className={styles.submenu_item} onClick={() => { onSelect('name'); onClose(); }}>Имя</div>
            <div className={styles.submenu_item} onClick={() => { onSelect('size'); onClose(); }}>Размер</div>
            <div className={styles.submenu_item} onClick={() => { onSelect('type'); onClose(); }}>Тип</div>
        </div>
    );
};

const DropdownMenu = ({ anchorRef, onClose, onAddFolder, onUpdateFolders }) => {
    const menuRef = useRef(null);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 10);
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                (!anchorRef.current || !anchorRef.current.contains(event.target))
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, anchorRef]);

    // Позиционирование меню относительно anchorRef
    const [position, setPosition] = useState({ top: 0, left: 0 });
    useEffect(() => {
        if (anchorRef.current && menuRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const menuWidth = menuRef.current.offsetWidth;
            let left = rect.left - menuWidth - 8 + window.scrollX;
            // Если меню выходит за пределы экрана слева, прижимаем к левому краю
            if (left < 0) left = 8;
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left,
            });
        }
    }, [anchorRef]);

    const handleSelect = (type) => {
        // Здесь можно обработать сортировку
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className={styles.menu + (visible ? ' ' + styles.menu_visible : '')}
            style={{ top: position.top, left: position.left, position: 'absolute', zIndex: 1000 }}
        >
            <div className={styles.menu_item} onClick={() => { /* Новая папка */ onAddFolder(); onClose(); }}>Новая папка</div>
            <div className={styles.menu_item} onClick={() => { /* Обновить */ onUpdateFolders(); onClose(); }}>Обновить</div>
            <div
                className={styles.menu_item + ' ' + styles.menu_item_hasSub}
                onMouseEnter={() => setSubmenuOpen(true)}
                onMouseLeave={() => setSubmenuOpen(false)}
            >
                Сортировка
                <span className={styles.menu_arrow}>▶</span>
                {submenuOpen && (
                    <SortSubMenu onSelect={handleSelect} onClose={onClose} />
                )}
            </div>
        </div>
    );
};

export default DropdownMenu; 