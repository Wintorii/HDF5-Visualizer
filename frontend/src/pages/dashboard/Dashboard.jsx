import styles from './Dashboard.module.scss'
import { FolderRepository } from '../../shared/api/Folder/folder';
import { useEffect, useState, useRef } from 'react';
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
    const folderRepository = new FolderRepository();
    const [menuOpen, setMenuOpen] = useState(false);
    const buttonRef = useRef(null);
    const [isFoldersOpen, setIsFoldersOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    const [openModalAddFolder, setOpenModalAddFolder] = useState(false);
    // const [hdf5Data, setHdf5Data] = useState({});

    

    const fileRepository = new FileRepository();
    const navigate = useNavigate();

    useEffect(() => {
        updateFolders();
        // loadHdf5Data();
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
            setFolders(response.data);
        });
    };

    // const loadHdf5Data = () => {
    //     const fileName = 'test_dataset_1.hdf5';
    //     fileRepository.getDataset(fileName, 'internal').then(res => {
    //         setHdf5Data(prev => ({ ...prev, internal: res.data.data }));
    //     });
    //     fileRepository.getDataset(fileName, 'external').then(res => {
    //         setHdf5Data(prev => ({ ...prev, external: res.data.data }));
    //     });
    //     // fileRepository.getDataset(fileName, '').then(res => {
    //     //     setHdf5Data(prev => ({ ...prev, spectrum1: res.data.data }));
    //     // });
    //     // fileRepository.getDataset(fileName, '').then(res => {
    //     //     setHdf5Data(prev => ({ ...prev, summary: res.data.data, summaryColumns: res.data.attrs?.columns || [] }));
    //     // });
    // };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setIsSearching(!!query);

        if (query) {
            const filteredResults = folders.filter(item => 
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
        handleFileClick(item);
    };

    const handleAddFolder = (folder) => {
        // setFolders([...folders, folder]);
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

    const handleFileClick = (file) => {
        if (file.type === 'file' && file.name.endsWith('.hdf5')) {
            navigate(routerConfig.fileView.replace(':fileName', file.name));
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
                <ul 
                    className={clsx(styles.folders_list, { [styles.folders_list_collapsed]: !isFoldersOpen })}
                >
                    {folders.length && folders.map((folder) => (
                        <li key={folder.id} className={styles.folders_list_item} onClick={() => handleFileClick(folder)} style={{ cursor: folder.type === 'file' ? 'pointer' : 'default' }}>
                            <img src={folder.type === 'folder' ? FolderIcon : FileIcon} alt='icon' className={styles.folders_list_item_icon}/>
                            <p className={styles.folders_list_item_name}>{folder.name}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.recents}>
                <h3 className={styles.recents_title}>Недавние файлы</h3>
                <ul className={styles.recents_list}>

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