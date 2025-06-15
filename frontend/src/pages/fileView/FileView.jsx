import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockFileRepository as FileRepository } from './mockHdf5';

import { LineChart } from '../../widgets/Charts/LineChart';
import { BarChart } from '../../widgets/Charts/BarChart';
import { ScatterChart } from '../../widgets/Charts/ScatterChart';
import { TableView } from '../../widgets/Charts/TableView';
import { DatasetTree } from './DatasetTree';

import styles from './FileView.module.scss';

const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  SCATTER: 'scatter',
  TABLE: 'table'
};

const CHART_OPTIONS = [
  { value: CHART_TYPES.LINE, label: 'Line Chart' },
  { value: CHART_TYPES.BAR, label: 'Bar Chart' },
  { value: CHART_TYPES.SCATTER, label: 'Scatter Chart' },
  { value: CHART_TYPES.TABLE, label: 'Table' },
];

const collectDatasets = (nodes, prefix = '') => {
  return nodes.reduce((result, node) => {
    if (node.type === 'dataset') {
      result.push({ path: `${prefix}/${node.name}`, ...node });
    } else if (node.type === 'group' && node.children) {
      result.push(...collectDatasets(node.children, `${prefix}/${node.name}`));
    }
    return result;
  }, []);
};

export const FileView = () => {
  const { fileName } = useParams();
  const navigate = useNavigate();
  const fileRepository = useMemo(() => new FileRepository(), []);
  
  const [structure, setStructure] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasetData, setDatasetData] = useState(null);
  const [chartType, setChartType] = useState(CHART_TYPES.LINE);
  const [xAxis, setXAxis] = useState(0);
  const [yAxis, setYAxis] = useState(1);
  const [columns, setColumns] = useState([]);

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
        // TODO: Add proper error handling
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
        // TODO: Add proper error handling
      }
    };
    
    loadDataset();
  }, [fileName, selectedDataset, fileRepository]);

  const axisOptions = useMemo(() => {
    if (!datasetData || !Array.isArray(datasetData.data[0])) return [];
    return datasetData.data[0].map((_, i) => `Column ${columns[i] || i}`);
  }, [datasetData, columns]);

  const renderChart = () => {
    if (!datasetData) {
      return <div className={styles.loading}>Loading data...</div>;
    }

    const chartProps = {
      title: selectedDataset,
      xLabel: 'Index',
      yLabel: axisOptions[yAxis] || 'Value'
    };

    switch (chartType) {
      case CHART_TYPES.LINE:
        return (
          <LineChart
            {...chartProps}
            data={Array.isArray(datasetData.data[0]) 
              ? datasetData.data.map(row => row[yAxis]) 
              : datasetData.data}
            label={axisOptions[yAxis] || 'Value'}
          />
        );
      case CHART_TYPES.BAR:
        return (
          <BarChart
            {...chartProps}
            data={Array.isArray(datasetData.data[0]) 
              ? datasetData.data.map(row => row[yAxis]) 
              : datasetData.data}
            categories={Array.isArray(datasetData.data[0]) 
              ? datasetData.data.map((_, i) => i.toString()) 
              : []}
            label={axisOptions[yAxis] || 'Value'}
          />
        );
      case CHART_TYPES.SCATTER:
        return (
          <ScatterChart
            {...chartProps}
            data={Array.isArray(datasetData.data[0]) 
              ? datasetData.data.map(row => [row[xAxis], row[yAxis]]) 
              : []}
            xLabel={axisOptions[xAxis] || 'X'}
            yLabel={axisOptions[yAxis] || 'Y'}
          />
        );
      case CHART_TYPES.TABLE:
        return <TableView data={datasetData.data} columns={columns} />;
      default:
        return null;
    }
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
        <div className={styles.header}>
          <h2 className={styles.title}>Визуализация файла: <span className={styles.fileName}>{fileName}</span></h2>
          <button 
            className={styles.buttonEdit}
            onClick={() => navigate(`/edit/${fileName}`)}
          >
            Редактировать
          </button>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>Chart Type:
              <select 
                value={chartType} 
                onChange={e => setChartType(e.target.value)}
              >
                {CHART_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>

          {chartType === CHART_TYPES.SCATTER && axisOptions.length > 1 && (
            <div className={styles.controlGroup}>
              <label>X Axis:
                <select 
                  value={xAxis} 
                  onChange={e => setXAxis(Number(e.target.value))}
                >
                  {axisOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt}</option>
                  ))}
                </select>
              </label>
              <label>Y Axis:
                <select 
                  value={yAxis} 
                  onChange={e => setYAxis(Number(e.target.value))}
                >
                  {axisOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {(chartType === CHART_TYPES.LINE || chartType === CHART_TYPES.BAR) && 
           axisOptions.length > 1 && (
            <div className={styles.controlGroup}>
              <label>Y Axis:
                <select 
                  value={yAxis} 
                  onChange={e => setYAxis(Number(e.target.value))}
                >
                  {axisOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        <div className={styles.chartContainer}>
          {renderChart()}
        </div>
      </main>
    </div>
  );
}; 