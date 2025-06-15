import styles from './Welcome.module.scss'

export const Welcome = () => {
    return (
        <div className={styles.welcome}>
            <h1 className={styles.welcome_title}>Добро пожаловать в наш сервис</h1>
            <p className={styles.welcome_description}>Сервис для хранения и обмена файлами</p>
            <button className={styles.welcome_button}>Войти</button>
        </div>
    )
}
