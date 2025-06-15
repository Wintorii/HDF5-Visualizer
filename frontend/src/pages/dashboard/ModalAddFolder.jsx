import React, { useState } from 'react';
import { FolderRepository } from '../../shared/api/Folder/folder';
import Modal from '../../shared/ui/modal/Modal';
import styles from './ModalAddFolder.module.scss';

export const ModalAddFolder = ({ onClose, onAdd }) => {
  const [modalData, setModalData] = useState({
    name: "",
  });

  const folderRepository = new FolderRepository();


  const createNewFolder = () => {
    folderRepository
      .create(modalData)
      .then((response) => {
        onAdd();
        onClose();
      })
      .catch(() => console.log('Произошла ошибка при создании папки'));
  };

  const isFormComplete = (data) => {
    return Object.values(data).every((value) => !!value);
  };

  const submitForm = (e) => {
    e.preventDefault();

    if (!isFormComplete(modalData)) return;

    createNewFolder();
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };
  
  return (
    <Modal overlayHandler={onClose}>
      <form className={styles.modal} onSubmit={submitForm}>
        <input
          type="text"
          name="name"
          value={modalData.name}
          onChange={onChangeHandler}
        />
        <button type="submit">Добавить</button>
      </form>
    </Modal>
  );
};
