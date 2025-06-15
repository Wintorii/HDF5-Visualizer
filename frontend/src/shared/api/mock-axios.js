import axios from 'axios';

// В памяти храним изменяемые моки (например, структуру файлов)
const memoryMocks = {};

// Соответствие url -> mock-файл
const endpointToMock = {
  '/file_structure': 'file_structure.json',
  '/get_attributes': 'get_attributes.json',
  '/update_attributes': 'update_attributes.json',
  '/create_group': 'create_group.json',
  '/delete_file_or_folder': 'delete_file_or_folder.json',
  '/rename_file_or_folder': 'rename_file_or_folder.json',
  '/delete_hdf5_object': 'delete_hdf5_object.json',
  '/rename_hdf5_object': 'rename_hdf5_object.json',
  '/get_dataset': 'get_dataset.json',
  '/update_dataset': 'update_dataset.json',
  '/generate_mock_hdf5': 'generate_mock_hdf5.json',
  '/get_file_names': 'get_file_names.json',
  '/directory_tree': 'directory_tree.json',
  '/create_folder': 'create_folder.json',
};

function getMockFile(url) {
  // Убираем query params
  const cleanUrl = url.replace(/\?.*$/, '');
  // Убираем baseApi
  const path = cleanUrl.replace(/^https?:\/\/[^/]+\/api/, '');
  return endpointToMock[path];
}

async function loadMock(mockFile) {
  // Если мок был изменён в рантайме — возвращаем его
  if (memoryMocks[mockFile]) return memoryMocks[mockFile];
  // Иначе грузим с диска
  return import(`../../mocks/${mockFile}`).then(m => m.default);
}

// Имитация задержки
function delay(ms = 300) {
  return new Promise(res => setTimeout(res, ms));
}

// Главный перехватчик
export function setupMockAxios() {
  axios.interceptors.request.use(async config => {
    const mockFile = getMockFile(config.url);
    if (!mockFile) return Promise.reject({
      response: { status: 404, data: { error: 'Mock not found for ' + config.url } }
    });

    await delay();
    let data = await loadMock(mockFile);

    // Примитивная имитация изменения моков (например, создание/удаление папок)
    if (config.url.includes('/create_folder') && config.method === 'post') {
      // Добавляем новую папку в структуру
      const { name, parent } = config.data || {};
      if (name) {
        const treeFile = 'directory_tree.json';
        let tree = memoryMocks[treeFile] || (await import(`../../mocks/${treeFile}`)).default;
        tree = Array.isArray(tree) ? tree : [];
        tree.push({ name, parent });
        memoryMocks[treeFile] = tree;
        data = { success: true };
      }
    }
    if (config.url.includes('/delete_file_or_folder') && config.method === 'post') {
      // Удаляем из структуры
      const { path } = config.data || {};
      const treeFile = 'directory_tree.json';
      let tree = memoryMocks[treeFile] || (await import(`../../mocks/${treeFile}`)).default;
      tree = Array.isArray(tree) ? tree.filter(f => f.path !== path) : tree;
      memoryMocks[treeFile] = tree;
      data = { success: true };
    }
    // ...добавьте другие операции по необходимости

    config.adapter = async () => ({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  });
} 