import React, { useEffect, useState } from 'react';
// import Icon from 'shared/assets/icons/iconMedium.svg?react';
import Styles from './asideMenu.module.scss';
import { menuItemList } from './lib/consts';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
// import TextLogo from 'shared/assets/icons/smallLogoText.svg?react';

export const AsideMenu = ({ isMobileMenuOpen, closeMobileMenu }) => {
    const [menuList, setMenuList] = useState(menuItemList);
    const navigate = useNavigate();
    const location = useLocation();
    const [isHoverOpen, setIsHoverOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isOpen = isMobile ? isMobileMenuOpen : isHoverOpen;
   
    const activateSingleItem = (activeIndex) => {
        setMenuList((prev) =>
            prev.map((item, index) => ({
                ...item,
                isActive: index === activeIndex
            }))
        );
    };

    const onMenuItemClick = (item) => {
        navigate(`/${item.url}`);
        if (isMobile) {
            closeMobileMenu();
        }
    }

    useEffect(() => {
        const pathName = location.pathname.substring(1); // убираем начальный '/'
        const activeIndex = menuList.findIndex(item => item.url === pathName);
        const currentActiveIndex = menuList.findIndex(item => item.isActive);

        if (activeIndex !== -1 && activeIndex !== currentActiveIndex) {
            setMenuList((prev) =>
                prev.map((item, index) => ({
                    ...item,
                    isActive: index === activeIndex
                }))
            );
        }
    }, [location.pathname]);

    return (
        <aside 
            className={clsx(Styles.aside, {
                [Styles.opened]: isOpen,
                [Styles.mobile]: isMobile
            })}
            onMouseEnter={!isMobile ? () => setIsHoverOpen(true) : undefined}
            onMouseLeave={!isMobile ? () => setIsHoverOpen(false) : undefined}
        >
            <div className={Styles.iconBlock}>
                {/* <Icon className={Styles.icon} /> */}
                {/* <TextLogo className={clsx(Styles.textLogo, {
                    [Styles.opened]: isOpen
                })} /> */}
            </div>
            <ul className={clsx(Styles.menu, {
                [Styles.opened]: isOpen
            })}>
                {menuList.map((item, index) => (
                    <li
                        key={index}
                        title={item.title}
                        className={clsx(Styles.item, {
                            [Styles.opened]: isOpen,
                            [Styles.active]: item.isActive
                        })}
                        onClick={() => {
                            activateSingleItem(index);
                            onMenuItemClick(item);
                        }}
                    >
                        <item.icon className={Styles.menuIcon} />
                        <p className={clsx(Styles.text, {
                            [Styles.opened]: isOpen,
                            [Styles.active]: item.isActive
                        })}>
                            {item.title}
                        </p>
                    </li>
                ))}
            </ul>
        </aside>
    );
};
