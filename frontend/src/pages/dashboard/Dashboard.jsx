import styles from './Dashboard.module.scss'
import { FolderRepository } from '../../shared/api/Folder/folder';
import { useEffect, useState, useRef, useMemo } from 'react';
import FileIcon from './lib/assets/file-icon.svg';
import FolderIcon from './lib/assets/folder-icon.svg';
import RightChevronIcon from './lib/assets/right-chevron.svg';
import DropdownMenu from './DropdownMenu';
import clsx from 'clsx';
import { ModalAddFolder } from './ModalAddFolder';
import { FileRepository } from '../../shared/api/File/file';
import { useNavigate } from 'react-router-dom';
import { routerConfig } from '../../shared/consts/routerConfig';


export const Dashboard = () => {
    const [folders, setFolders] = useState([]);
    const [allItems, setAllItems] = useState([]); // Все элементы для поиска
    const [recentFiles, setRecentFiles] = useState([]);
    const [sortType, setSortType] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const folderRepository = new FolderRepository();
    const [menuOpen, setMenuOpen] = useState(false);
    const buttonRef = useRef(null);
    const [isFoldersOpen, setIsFoldersOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    const [openModalAddFolder, setOpenModalAddFolder] = useState(false);
    
    const fileRepository = new FileRepository();
    const navigate = useNavigate();

    useEffect(() => {
        updateFolders();
        loadRecentFiles();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const updateFolders = () => {
        folderRepository.get().then((response) => {
            setAllItems(response.data); // Сохраняем все элементы
            // Показываем только корневые элементы (без parent или parent = null)
            const rootItems = response.data.filter(item => !item.parent || item.parent === null);
            setFolders(rootItems);
        });
    };

    const loadRecentFiles = () => {
        const files = JSON.parse(localStorage.getItem('recentFiles') || '[]');
        setRecentFiles(files);
    };

    const addToRecentFiles = (file) => {
        // Извлекаем только имя файла из полного пути для корректного отображения
        const fileName = file.name.includes('/') ? file.name.split('/').pop() : file.name;
        const fileForRecent = {
            ...file,
            name: fileName,
            displayPath: file.path // Сохраняем полный путь для отображения
        };
        
        const updatedRecentFiles = [fileForRecent, ...recentFiles.filter(f => f.path !== file.path)].slice(0, 5);
        setRecentFiles(updatedRecentFiles);
        localStorage.setItem('recentFiles', JSON.stringify(updatedRecentFiles));
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setIsSearching(!!query);

        if (query) {
            const filteredResults = allItems.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filteredResults);
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchItemClick = (item) => {
        setSearchQuery('');
        setIsSearching(false);
        setSearchResults([]);
        handleItemClick(item);
    };

    const handleAddFolder = (folder) => {
        setMenuOpen(false);
        setOpenModalAddFolder(false);
        updateFolders();
    };

    const handleOpenModalAddFolder = () => {
        setOpenModalAddFolder(true);
    };

    const closeModalAddFolder = () => {
        setOpenModalAddFolder(false);
        setMenuOpen(false);
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

    const handleRecentFileClick = (file) => {
        // Для недавних файлов используем оригинальный путь для навигации
        const fileName = file.name.includes('/') ? file.name.split('/').pop() : file.name;
        navigate(routerConfig.fileView.replace(':fileName', fileName));
    };
    
    const sortedFolders = useMemo(() => {
        return [...folders].sort((a, b) => {
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
    }, [folders, sortType, sortDirection]);

    const handleSort = (type) => {
        if (type === sortType) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortType(type);
            setSortDirection('asc');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.searchContainer} ref={searchRef}>
                <input
                    className={styles.search}
                    type='search'
                    placeholder='Поиск файлов и папок...'
                    id="search"
                    name="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setIsSearching(true)}
                />
                {isSearching && (
                    <div className={styles.searchResults}>
                        {searchResults.length > 0 ? (
                            <ul className={styles.searchResultsList}>
                                {searchResults.map((item) => (
                                    <li 
                                        key={item.id} 
                                        className={styles.searchResultsItem}
                                        onClick={() => handleSearchItemClick(item)}
                                    >
                                        <img 
                                            src={item.type === 'folder' ? FolderIcon : FileIcon} 
                                            alt={item.type} 
                                            className={styles.searchResultsIcon}
                                        />
                                        <span className={styles.searchResultsName}>{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : searchQuery ? (
                            <div className={styles.noResults}>
                                Ничего не найдено
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
            <div className={styles.header}>
                <h2 className={styles.header_title}>Библиотека</h2>

                <div className={styles.header_buttons}>
                    <label className={styles.header_label} htmlFor='file'>Добавить файл</label>
                    <input className={styles.header_button} type='file' name='file' id='file' />
                    <button 
                        className={styles.header_options}
                        ref={buttonRef}
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        ...
                    </button>
                    {openModalAddFolder && <ModalAddFolder onClose={closeModalAddFolder} onAdd={handleAddFolder} />}
                </div>
            </div>
            
            <div className={styles.folders}>
                <div className={styles.folders_header}>
                    <div className={styles.folders_title_wrapper}>
                        <h3 className={styles.folders_title}>Мои файлы</h3>
                        <button 
                            className={styles.folders_toggleView}
                            onClick={() => setIsFoldersOpen((prev) => !prev)}
                            aria-label={isFoldersOpen ? 'Свернуть папки' : 'Развернуть папки'}
                        >
                            <img 
                                src={RightChevronIcon} 
                                alt='icon' 
                                className={clsx(styles.folders_toggleView_icon, { [styles.folders_toggleView_icon_rotated]: isFoldersOpen })}
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
                <ul 
                    className={clsx(styles.folders_list, { [styles.folders_list_collapsed]: !isFoldersOpen })}
                >
                    {sortedFolders.map((item) => (
                        <li key={item.id} className={styles.folders_list_item} onClick={() => handleItemClick(item)} style={{ cursor: 'pointer' }}>
                            <img src={item.type === 'folder' ? FolderIcon : FileIcon} alt='icon' className={styles.folders_list_item_icon}/>
                            <p className={styles.folders_list_item_name}>{item.name}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.recents}>
                <h3 className={styles.recents_title}>Недавние файлы</h3>
                <ul className={styles.recents_list}>
                    {recentFiles.map(file => (
                         <li key={file.id} className={styles.folders_list_item} onClick={() => handleRecentFileClick(file)} style={{ cursor: 'pointer' }}>
                            <img src={FileIcon} alt='icon' className={styles.folders_list_item_icon}/>
                            <div className={styles.folders_list_item_content}>
                                <p className={styles.folders_list_item_name}>{file.name}</p>
                                {file.displayPath && file.displayPath !== `/${file.name}` && (
                                    <p className={styles.folders_list_item_path}>{file.displayPath}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {menuOpen && (
                <DropdownMenu
                    anchorRef={buttonRef}
                    onClose={() => setMenuOpen(false)}
                    onAddFolder={handleOpenModalAddFolder}
                    onUpdateFolders={updateFolders}
                />
            )}
        </div>
    );
}