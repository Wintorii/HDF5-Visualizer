import { baseApi } from '../env';

export class FolderApi {
  getFolders() {
    return `${baseApi}/directory_tree`;
  }

  createFolder() {
    return `${baseApi}/create_folder`;
  }

  deleteFileOrFolder() {
    return `${baseApi}/delete_file_or_folder`;
  }

  renameFileOrFolder() {
    return `${baseApi}/rename_file_or_folder`;
  }
}