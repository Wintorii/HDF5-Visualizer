import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FolderRepository } from '../../shared/api/Folder/folder';
import FileIcon from '../dashboard/lib/assets/file-icon.svg';
import FolderIcon from '../dashboard/lib/assets/folder-icon.svg';
import RightChevronIcon from '../dashboard/lib/assets/right-chevron.svg';
import styles from './FolderView.module.scss';
import clsx from 'clsx';
import { routerConfig } from '../../shared/consts/routerConfig';

const FolderView = () => {
    const { '*': path } = useParams();
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [sortType, setSortType] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isFoldersOpen, setIsFoldersOpen] = useState(true);
    
    const folderRepository = new FolderRepository();

    useEffect(() => {
        loadAllItems();
    }, []);

    useEffect(() => {
        if (allItems.length > 0) {
            filterCurrentItems();
        }
    }, [allItems, path]);

    const loadAllItems = () => {
        folderRepository.get().then((response) => {
            setAllItems(response.data);
        });
    };

    const filterCurrentItems = () => {
        const currentPath = path || '';
        const items = allItems.filter(item => item.parent === currentPath);
        setCurrentItems(items);
    };

    const sortedItems = useMemo(() => {
        return [...currentItems].sort((a, b) => {
            const aValue = a[sortType];
            const bValue = b[sortType];

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [currentItems, sortType, sortDirection]);

    const handleSort = (type) => {
        if (type === sortType) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortType(type);
            setSortDirection('asc');
        }
    };

    const addToRecentFiles = (file) => {
        // Извлекаем только имя файла из полного пути для корректного отображения
        const fileName = file.name.includes('/') ? file.name.split('/').pop() : file.name;
        const fileForRecent = {
            ...file,
            name: fileName,
            displayPath: file.path // Сохраняем полный путь для отображения
        };
        
        const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
        const updatedRecentFiles = [fileForRecent, ...recentFiles.filter(f => f.path !== file.path)].slice(0, 5);
        localStorage.setItem('recentFiles', JSON.stringify(updatedRecentFiles));
    };

    const handleItemClick = (item) => {
        if (item.type === 'file' && item.name.endsWith('.hdf5')) {
            addToRecentFiles(item);
            // Используем только имя файла для навигации
            const fileName = item.name.includes('/') ? item.name.split('/').pop() : item.name;
            navigate(routerConfig.fileView.replace(':fileName', fileName));
        } else if (item.type === 'folder') {
            navigate(routerConfig.folderView.replace('*', item.path));
        }
    };

    const pathSegments = path ? path.split('/').filter(Boolean) : [];

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumbs}>
                <Link to="/dashboard" className={styles.breadcrumb_link}>
                    Dashboard
                </Link>
                {pathSegments.map((segment, index) => {
                    const currentPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathSegments.length - 1;
                    
                    return (
                        <React.Fragment key={currentPath}>
                            <span className={styles.breadcrumb_separator}>/</span>
                            {isLast ? (
                                <span className={styles.breadcrumb_current}>{segment}</span>
                            ) : (
                                <Link 
                                    to={routerConfig.folderView.replace('*', currentPath)} 
                                    className={styles.breadcrumb_link}
                                >
                                    {segment}
                                </Link>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className={styles.header}>
                <h2 className={styles.header_title}>
                    {pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'Корневая папка'}
                </h2>
            </div>

            <div className={styles.folders}>
                <div className={styles.folders_header}>
                    <div className={styles.folders_title_wrapper}>
                        <h3 className={styles.folders_title}>Содержимое папки</h3>
                        <button 
                            className={styles.folders_toggleView}
                            onClick={() => setIsFoldersOpen((prev) => !prev)}
                            aria-label={isFoldersOpen ? 'Свернуть папки' : 'Развернуть папки'}
                        >
                            <img 
                                src={RightChevronIcon} 
                                alt='icon' 
                                className={clsx(styles.folders_toggleView_icon, { 
                                    [styles.folders_toggleView_icon_rotated]: isFoldersOpen 
                                })}
                            />
                        </button>
                    </div>
                    <div className={styles.sort_buttons}>
                        <button onClick={() => handleSort('name')}>
                            Сортировать по имени {sortType === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </button>
                        <button onClick={() => handleSort('type')}>
                            Сортировать по типу {sortType === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </button>
                    </div>
                </div>
                
                <ul className={clsx(styles.folders_list, { 
                    [styles.folders_list_collapsed]: !isFoldersOpen 
                })}>
                    {sortedItems.length > 0 ? (
                        sortedItems.map((item) => (
                            <li 
                                key={item.id} 
                                className={styles.folders_list_item} 
                                onClick={() => handleItemClick(item)} 
                                style={{ cursor: 'pointer' }}
                            >
                                <img 
                                    src={item.type === 'folder' ? FolderIcon : FileIcon} 
                                    alt='icon' 
                                    className={styles.folders_list_item_icon}
                                />
                                <p className={styles.folders_list_item_name}>{item.name}</p>
                            </li>
                        ))
                    ) : (
                        <li className={styles.empty_message}>
                            Папка пуста
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default FolderView; 