import React, { useState, useEffect } from 'react';
import styles from './Storage.module.scss';
import { mockStorageServers } from './mockData';
import { FiPlus, FiServer, FiHardDrive, FiGlobe, FiClock, FiEdit2, FiTrash2, FiDatabase } from 'react-icons/fi';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const StorageModal = ({ isOpen, onClose, onSave, storage = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    accessKey: '',
    secretKey: '',
    region: '',
    bucket: ''
  });

  useEffect(() => {
    if (storage && mode === 'edit') {
      setFormData({
        name: storage.name || '',
        endpoint: storage.endpoint || '',
        accessKey: storage.accessKey || '',
        secretKey: storage.secretKey || '',
        region: storage.region || '',
        bucket: storage.bucket || ''
      });
    } else {
      setFormData({
        name: '',
        endpoint: '',
        accessKey: '',
        secretKey: '',
        region: '',
        bucket: ''
      });
    }
  }, [storage, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, storage?.id);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      endpoint: '',
      accessKey: '',
      secretKey: '',
      region: '',
      bucket: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>{mode === 'edit' ? 'Редактировать хранилище' : 'Добавить новое хранилище'}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Storage Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter storage name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>S3 Endpoint</label>
            <input
              type="text"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="e.g., s3.amazonaws.com"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Access Key</label>
            <input
              type="password"
              value={formData.accessKey}
              onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })}
              placeholder="Enter access key"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Secret Key</label>
            <input
              type="password"
              value={formData.secretKey}
              onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
              placeholder="Enter secret key"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              placeholder="e.g., us-east-1"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Bucket Name</label>
            <input
              type="text"
              value={formData.bucket}
              onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
              placeholder="Enter bucket name"
              required
            />
          </div>
          <div className={styles.buttons}>
            <button type="button" className={styles.secondary} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primary}>
              {mode === 'edit' ? 'Save Changes' : 'Add Storage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServerCard = ({ server, onEdit, onDelete }) => {
  const usedPercentage = (server.usedSpace / server.totalSpace) * 100;
  const progressBarClass = usedPercentage > 90 ? 'critical' : usedPercentage > 70 ? 'warning' : '';

  return (
    <div className={styles.serverCard}>
      <div className={styles.serverHeader}>
        <h3>{server.name}</h3>
        <div className={styles.headerActions}>
          <div className={`${styles.statusIndicator} ${styles[server.status]}`} />
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionButton} 
              onClick={() => onEdit(server)}
              title="Редактировать"
            >
              <FiEdit2 />
            </button>
            <button 
              className={`${styles.actionButton} ${styles.deleteButton}`} 
              onClick={() => onDelete(server.id)}
              title="Удалить"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.storageInfo}>
        <div className={`${styles.progressBar} ${styles[progressBarClass]}`}>
          <div className={styles.progress} style={{ width: `${usedPercentage}%` }} />
        </div>
        <div className={styles.details}>
          <div className={styles.detail}>
            <span>
              <FiHardDrive /> Used Space
            </span>
            <span>{formatBytes(server.usedSpace)} / {formatBytes(server.totalSpace)}</span>
          </div>
          <div className={styles.detail}>
            <span>
              <FiGlobe /> Region
            </span>
            <span>{server.region}</span>
          </div>
          <div className={styles.detail}>
            <span>
              <FiServer /> Endpoint
            </span>
            <span>{server.endpoint}</span>
          </div>
          <div className={styles.detail}>
            <span>
              <FiDatabase /> Bucket
            </span>
            <span>{server.bucket}</span>
          </div>
          <div className={styles.detail}>
            <span>
              <FiClock /> Last Sync
            </span>
            <span>{server.lastSync}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Storage = () => {
  const [servers, setServers] = useState(mockStorageServers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const handleAddStorage = () => {
    setModalMode('add');
    setEditingStorage(null);
    setIsModalOpen(true);
  };

  const handleEditStorage = (storage) => {
    setModalMode('edit');
    setEditingStorage(storage);
    setIsModalOpen(true);
  };

  const handleDeleteStorage = (storageId) => {
    setServers(prev => prev.filter(server => server.id !== storageId));
  };

  const handleSaveStorage = (formData, storageId = null) => {
    if (storageId) {
      // Edit existing storage
      setServers(prev => prev.map(server => 
        server.id === storageId 
          ? { ...server, ...formData }
          : server
      ));
    } else {
      // Add new storage
      const newStorage = {
        id: Date.now(),
        ...formData,
        status: 'active',
        usedSpace: 0,
        totalSpace: 1000000000000, // 1TB default
        lastSync: new Date().toLocaleDateString()
      };
      setServers(prev => [...prev, newStorage]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStorage(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Хранилище данных</h1>
        <button className={styles.addButton} onClick={handleAddStorage}>
          <FiPlus /> Добавить хранилище
        </button>
      </div>

      <div className={styles.grid}>
        {servers.map(server => (
          <ServerCard
            key={server.id}
            server={server}
            onEdit={handleEditStorage}
            onDelete={handleDeleteStorage}
          />
        ))}
      </div>

      <StorageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStorage}
        storage={editingStorage}
        mode={modalMode}
      />
    </div>
  );
};