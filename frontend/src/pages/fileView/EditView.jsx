import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MockFileRepository as FileRepository } from './mockHdf5';
import { DatasetTree } from './DatasetTree';
import styles from './EditView.module.scss';

const EditableCell = ({ value, onChange, isEditing, onStartEdit, onFinishEdit }) => {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onChange(editValue);
      onFinishEdit();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onFinishEdit();
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          onChange(editValue);
          onFinishEdit();
        }}
        autoFocus
        className={styles.cellInput}
      />
    );
  }

  return (
    <div 
      className={styles.cell} 
      onClick={onStartEdit}
    >
      {value}
    </div>
  );
};

export const EditView = () => {
  const { fileName } = useParams();
  const fileRepository = useMemo(() => new FileRepository(), []);
  
  const [structure, setStructure] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasetData, setDatasetData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const loadStructure = async () => {
      if (!fileName) return;
      
      try {
        const res = await fileRepository.getStructure(fileName);
        setStructure(res);
        
        const ds = collectDatasets(res.data);
        setDatasets(ds);
        if (ds.length) setSelectedDataset(ds[0].path);
      } catch (error) {
        console.error('Failed to load file structure:', error);
      }
    };
    
    loadStructure();
  }, [fileName, fileRepository]);

  useEffect(() => {
    const loadDataset = async () => {
      if (!fileName || !selectedDataset) return;
      
      try {
        const res = await fileRepository.getDataset(fileName, selectedDataset);
        setDatasetData(res.data);
        
        if (Array.isArray(res.data.data[0])) {
          const columnNames = res.data.attrs?.columns?.map(c => c.toString()) || [];
          setColumns(columnNames);
        } else {
          setColumns([]);
        }
      } catch (error) {
        console.error('Failed to load dataset:', error);
      }
    };
    
    loadDataset();
  }, [fileName, selectedDataset, fileRepository]);

  const handleCellChange = (rowIndex, colIndex, newValue) => {
    if (!datasetData) return;

    const newData = [...datasetData.data];
    if (Array.isArray(newData[rowIndex])) {
      newData[rowIndex] = [...newData[rowIndex]];
      newData[rowIndex][colIndex] = Number(newValue);
    } else {
      newData[rowIndex] = Number(newValue);
    }

    setDatasetData({
      ...datasetData,
      data: newData
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!datasetData || !hasUnsavedChanges) return;

    try {
      await fileRepository.saveDataset(fileName, selectedDataset, datasetData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save dataset:', error);
    }
  };

  const renderTable = () => {
    if (!datasetData) {
      return <div className={styles.loading}>Выберите датасет...</div>;
    }

    const data = datasetData.data;
    const isMultiDimensional = Array.isArray(data[0]);

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Index</th>
              {isMultiDimensional ? (
                columns.map((col, i) => (
                  <th key={i}>{col || `Column ${i}`}</th>
                ))
              ) : (
                <th>Value</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className={styles.indexCell}>{rowIndex}</td>
                {isMultiDimensional ? (
                  row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <EditableCell
                        value={cell}
                        onChange={(newValue) => handleCellChange(rowIndex, colIndex, newValue)}
                        isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
                        onStartEdit={() => setEditingCell({ row: rowIndex, col: colIndex })}
                        onFinishEdit={() => setEditingCell(null)}
                      />
                    </td>
                  ))
                ) : (
                  <td>
                    <EditableCell
                      value={row}
                      onChange={(newValue) => handleCellChange(rowIndex, 0, newValue)}
                      isEditing={editingCell?.row === rowIndex && editingCell?.col === 0}
                      onStartEdit={() => setEditingCell({ row: rowIndex, col: 0 })}
                      onFinishEdit={() => setEditingCell(null)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Datasets</h3>
        <DatasetTree
          nodes={structure?.data || []}
          selectedPath={selectedDataset}
          onSelect={setSelectedDataset}
        />
      </aside>
      
      <main className={styles.content}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            Редактирование файла: <span className={styles.fileName}>{fileName}</span>
          </h2>
          <div className={styles.datasetPath}>
            Датасет: <span className={styles.pathText}>{selectedDataset}</span>
          </div>
        </div>
        
        <div className={styles.editorContainer}>
          <div className={styles.headerActions}>
            {hasUnsavedChanges && (
              <span className={styles.unsavedIndicator}>Есть несохраненные изменения</span>
            )}
            <button 
              className={styles.saveButton}
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              Сохранить изменения
            </button>
          </div>
          
          {renderTable()}
        </div>
      </main>
    </div>
  );
}; 