import { AsideMenu } from "../../../widgets/asideMenu/AsideMenu"
import styles from './DefaultLayout.module.scss'
import { Outlet } from "react-router-dom"
import { useEffect, useState } from "react";
import clsx from "clsx";
import ModalOverlay from "../../../shared/ui/modalOverlay/ModalOverlay";


export const DefaultLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={styles.layout}>
            <header className={styles.mobileHeader}>
                <button 
                    className={clsx(styles.hamburger, {[styles.open]: isMenuOpen})} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>
            {isMobile && isMenuOpen && <ModalOverlay overlayHandler={() => setIsMenuOpen(false)} />}
            <main>
                <AsideMenu isMobileMenuOpen={isMenuOpen} closeMobileMenu={() => setIsMenuOpen(false)}/>
                <Outlet />
            </main>
        </div>
    )
}