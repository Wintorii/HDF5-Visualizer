import { AsideMenu } from "../../../widgets/asideMenu/AsideMenu"
import styles from './DefaultLayout.module.scss'
import { Outlet } from "react-router-dom"


export const DefaultLayout = () => {
    return (
        <div className={styles.layout}>
            <main>
                <AsideMenu />
                <Outlet />
            </main>
        </div>
    )
}