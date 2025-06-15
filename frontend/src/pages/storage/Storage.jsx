import React, { useState } from 'react';
import styles from './Storage.module.scss';
import { mockStorageServers } from './mockData';
import { FiPlus, FiServer, FiHardDrive, FiGlobe, FiClock } from 'react-icons/fi';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const AddStorageModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    accessKey: '',
    secretKey: '',
    region: '',
    bucket: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Add New Storage</h2>
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
              type="text"
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
            <button type="button" className={styles.secondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primary}>
              Add Storage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServerCard = ({ server }) => {
  const usedPercentage = (server.usedSpace / server.totalSpace) * 100;
  const progressBarClass = usedPercentage > 90 ? 'critical' : usedPercentage > 70 ? 'warning' : '';

  return (
    <div className={styles.serverCard}>
      <div className={styles.serverHeader}>
        <h3>{server.name}</h3>
        <div className={`${styles.statusIndicator} ${styles[server.status]}`} />
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
              <FiClock /> Last Sync
            </span>
            <span>{new Date(server.lastSync).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Storage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servers, setServers] = useState(mockStorageServers);

  const handleAddStorage = (newStorage) => {
    // In a real application, this would make an API call to add the storage
    console.log('Adding new storage:', newStorage);
    // For now, we'll just show a success message
    alert('Storage added successfully!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Хранилище данных</h1>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Добавить хранилище
        </button>
      </div>
      
      <div className={styles.grid}>
        {servers.map(server => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      <AddStorageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStorage}
      />
    </div>
  );
};