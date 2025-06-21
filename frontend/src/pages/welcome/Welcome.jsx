import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.scss'

export const Welcome = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: '📊',
            title: 'Визуализация данных',
            description: 'Создавайте красивые графики и диаграммы из ваших HDF5 файлов. Поддерживаются линейные, столбчатые, точечные графики и таблицы.',
            color: '#4CAF50'
        },
        {
            icon: '🔍',
            title: 'Просмотр структуры',
            description: 'Изучайте иерархическую структуру HDF5 файлов. Навигация по группам и датасетам с удобным древовидным интерфейсом.',
            color: '#2196F3'
        },
        {
            icon: '✏️',
            title: 'Редактирование данных',
            description: 'Редактируйте содержимое датасетов прямо в браузере. Изменения сохраняются в реальном времени.',
            color: '#FF9800'
        },
        {
            icon: '📁',
            title: 'Файловый менеджер',
            description: 'Управляйте файлами и папками в облачном хранилище. Создавайте, удаляйте и организуйте ваши данные.',
            color: '#9C27B0'
        },
        {
            icon: '🔎',
            title: 'Быстрый поиск',
            description: 'Находите нужные файлы и папки мгновенно с помощью интеллектуального поиска по всему хранилищу.',
            color: '#F44336'
        },
        {
            icon: '📈',
            title: 'Примеры визуализации',
            description: 'Изучите готовые примеры графиков и диаграмм для вдохновения и понимания возможностей системы.',
            color: '#00BCD4'
        }
    ];

    const quickStartSteps = [
        {
            step: '1',
            title: 'Загрузите HDF5 файл',
            description: 'Используйте файловый менеджер для загрузки ваших HDF5 файлов в облачное хранилище'
        },
        {
            step: '2',
            title: 'Изучите структуру',
            description: 'Откройте файл и изучите его иерархическую структуру групп и датасетов'
        },
        {
            step: '3',
            title: 'Создайте визуализацию',
            description: 'Выберите датасет и создайте график, выбрав подходящий тип визуализации'
        },
        {
            step: '4',
            title: 'Редактируйте данные',
            description: 'При необходимости отредактируйте данные прямо в браузере'
        }
    ];

    const handleGetStarted = () => {
        navigate('/dashboard');
    };

    const handleViewExamples = () => {
        navigate('/examples');
    };

    return (
        <div className={styles.welcome}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        HDF5 Visualizer
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Платформа для визуализации и управления HDF5 файлами в облаке
                    </p>
                    <div className={styles.heroButtons}>
                        <button 
                            className={styles.primaryButton}
                            onClick={handleGetStarted}
                        >
                            Начать работу
                        </button>
                        <button 
                            className={styles.secondaryButton}
                            onClick={handleViewExamples}
                        >
                            Посмотреть примеры
                        </button>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.heroImage}>
                        📊📈📉
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <h2 className={styles.sectionTitle}>Возможности платформы</h2>
                <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <div 
                                className={styles.featureIcon}
                                style={{ backgroundColor: feature.color }}
                            >
                                {feature.icon}
                            </div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Start Section */}
            <section className={styles.quickStart}>
                <h2 className={styles.sectionTitle}>Быстрый старт</h2>
                <div className={styles.stepsContainer}>
                    {quickStartSteps.map((step, index) => (
                        <div key={index} className={styles.stepCard}>
                            <div className={styles.stepNumber}>{step.step}</div>
                            <div className={styles.stepContent}>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDescription}>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Готовы начать?</h2>
                    <button 
                        className={styles.ctaButton}
                        onClick={handleGetStarted}
                    >
                        Перейти к Dashboard
                    </button>
                </div>
            </section>
        </div>
    )
}
