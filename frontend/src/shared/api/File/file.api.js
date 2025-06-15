import { baseApi } from '../env';

export class FileApi {
  getStructure() {
    return `${baseApi}/file_structure`;
  }

  getAttributes() {
    return `${baseApi}/get_attributes`;
  }

  updateAttributes() {
    return `${baseApi}/update_attributes`;
  }

  createGroup() {
    return `${baseApi}/create_group`;
  }

  deleteFileOrFolder() {
    return `${baseApi}/delete_file_or_folder`;
  }

  renameFileOrFolder() {
    return `${baseApi}/rename_file_or_folder`;
  }

  deleteHdf5Object() {
    return `${baseApi}/delete_hdf5_object`;
  }

  renameHdf5Object() {
    return `${baseApi}/rename_hdf5_object`;
  }

  getDataset() {
    return `${baseApi}/get_dataset`;
  }

  updateDataset() {
    return `${baseApi}/update_dataset`;
  }

  generateMockHdf5() {
    return `${baseApi}/generate_mock_hdf5`;
  }

  getFileNames() {
    return `${baseApi}/get_file_names`;
  }
}