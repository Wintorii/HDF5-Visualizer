import axios from 'axios';
import { handleResponse, handleError } from '../base-api';
import { FileApi } from './file.api';

export class FileRepository {
  constructor() {
    this._api = new FileApi();
  }

  getStructure(file_name) {
    const url = this._api.getStructure();
    return axios.post(url, { file_name }).then(res => res.data);
  }

  getAttributes(file_name, object_path = '') {
    const url = this._api.getAttributes();
    return axios.post(url, { file_name, object_path }).then(res => res.data);
  }

  updateAttributes(file_name, object_path = '', attrs = {}) {
    const url = this._api.updateAttributes();
    return axios.post(url, { file_name, object_path, attrs }).then(res => res.data);
  }

  createGroup(file_name, parent_path = '', name) {
    const url = this._api.createGroup();
    return axios.post(url, { file_name, parent_path, name }).then(res => res.data);
  }

  deleteFileOrFolder(path) {
    const url = this._api.deleteFileOrFolder();
    return axios.post(url, { path }).then(res => res.data);
  }

  renameFileOrFolder(path, new_name) {
    const url = this._api.renameFileOrFolder();
    return axios.post(url, { path, new_name }).then(res => res.data);
  }

  deleteHdf5Object(file_name, object_path) {
    const url = this._api.deleteHdf5Object();
    return axios.post(url, { file_name, object_path }).then(res => res.data);
  }

  renameHdf5Object(file_name, old_path, new_name) {
    const url = this._api.renameHdf5Object();
    return axios.post(url, { file_name, old_path, new_name }).then(res => res.data);
  }

  getDataset(file_name, dataset_path) {
    const url = this._api.getDataset();
    return axios.post(url, { file_name, dataset_path }).then(res => res.data);
  }

  updateDataset(file_name, dataset_path, data) {
    const url = this._api.updateDataset();
    return axios.post(url, { file_name, dataset_path, data }).then(res => res.data);
  }

  generateMockHdf5(file_name) {
    const url = this._api.generateMockHdf5();
    return axios.post(url, { file_name }).then(res => res.data);
  }

  getFileNames() {
    const url = this._api.getFileNames();
    return axios.get(url).then(res => res.data);
  }
} 