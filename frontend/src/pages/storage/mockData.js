export const mockStorageServers = [
  {
    id: 1,
    name: 'wintori',
    endpoint: 'storage.yandexcloud.net',
    status: 'active',
    totalSpace: 1024 * 1024 * 1024 * 1000,  // 1TB
    usedSpace: 1024 * 1024 * 1024 * 1.6, // 1G
    region: 'us-east-1',
    lastSync: '2025-05-24T22:32:13Z',
    health: 98,
    transferRate: '120 MB/s'
  },
  {
    id: 2,
    name: 'Backup Server',
    endpoint: 'backup-s3.company.com',
    status: 'warning',
    totalSpace: 1024 * 1024 * 1024 * 1000, // 1TB
    usedSpace: 1024 * 1024 * 1024 * 950, // 950GB
    region: 'eu-west-1',
    lastSync: '2025-05-28T12:14:09Z',
    health: 87,
    transferRate: '95 MB/s'
  },
  {
    id: 3,
    name: 'Test Storage',
    endpoint: 'archive-s3.company.com',
    status: 'error',
    totalSpace: 1024 * 1024 * 1024 * 2000, // 2TB
    usedSpace: 1024 * 1024 * 1024 * 1200, // 1.2TB
    region: 'ap-southeast-1',
    lastSync: '2025-06-01T09:15:51Z',
    health: 45,
    transferRate: '0 MB/s'
  },
  {
    id: 4,
    name: 'Test Storage 2',
    endpoint: 'dev-s3.company.com',
    status: 'active',
    totalSpace: 1024 * 1024 * 1024 * 250, // 250GB
    usedSpace: 1024 * 1024 * 1024 * 100, // 100GB
    region: 'eu-central-1',
    lastSync: '2025-06-01T17:49:01Z',
    health: 99,
    transferRate: '150 MB/s'
  }
]; 