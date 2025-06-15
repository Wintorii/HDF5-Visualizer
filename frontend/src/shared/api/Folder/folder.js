import axios from 'axios';
import { handleResponse, handleError } from '../base-api';
import { FolderApi } from './folder.api';

export class FolderRepository {
  constructor() {
    this._api = new FolderApi();
  }

  get() {
    const url = this._api.getFolders();

    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(handleResponse(resolve))
        .catch(handleError(reject));
    });
  }

  create(formData) {
    const url = this._api.createFolder();
    const body = {
      ...formData,
    };

    return new Promise((resolve, reject) => {
        axios
        .post(url, body)
        .then(handleResponse(resolve))
        .catch(handleError(reject));
    });
  }

  delete(path) {
    const url = this._api.deleteFileOrFolder();
    return new Promise((resolve, reject) => {
      axios
        .post(url, { path })
        .then(handleResponse(resolve))
        .catch(handleError(reject));
    });
  }

  rename(path, new_name) {
    const url = this._api.renameFileOrFolder();
    return new Promise((resolve, reject) => {
      axios
        .post(url, { path, new_name })
        .then(handleResponse(resolve))
        .catch(handleError(reject));
    });
  }
}