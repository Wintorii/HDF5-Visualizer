import styles from './ChartExamples.module.scss';
import { LineChart } from '../../widgets/Charts/LineChart';
import { BarChart } from '../../widgets/Charts/BarChart';
import { ScatterChart } from '../../widgets/Charts/ScatterChart';
import { TableView } from '../../widgets/Charts/TableView';

export const ChartExamples = () => {

    const hdf5Data = {
        temperature: Array.from({length: 100}, (_, i) => 20 + 5 * Math.sin(i/10) + Math.random()),
        pressure: Array.from({length: 100}, (_, i) => 1013 + 20 * Math.cos(i/15) + Math.random() * 5),
        spectrum1: Array.from({length: 50}, (_, i) => [
            400 + i * 10, // wavelength from 400-900nm
            Math.exp(-((i-25)**2)/100) * 100 + Math.random() * 5 // gaussian peak with noise
        ]),
        summary: [
            [85.2, 0.92, 12.3],
            [76.8, 0.88, 11.9],
            [91.4, 0.95, 13.1],
            [82.6, 0.90, 12.1],
            [88.9, 0.93, 12.8]
        ],
        summaryColumns: ['Efficiency (%)', 'Quality Factor', 'Output Power (W)']
    };

    return (
          <div className={styles.container}>
                <h2>Визуализация HDF5</h2>
                <ul className={styles.charts}>
                    <li>
                        <LineChart title="Temperature" data={hdf5Data.temperature || []} label="Temperature" xLabel="Index" yLabel="°C" />
                    </li>
                    <li>
                        <LineChart title="Pressure" data={hdf5Data.pressure || []} label="Pressure" xLabel="Index" yLabel="hPa" />
                    </li>
                    <li>
                        <ScatterChart title="Spectrum 1" data={hdf5Data.spectrum1 ? hdf5Data.spectrum1.map(row => [row[0], row[1]]) : []} label="Spectrum" xLabel="Wavelength" yLabel="Intensity" />
                    </li>
                    <li>
                        <BarChart title="Summary (A)" data={hdf5Data.summary ? hdf5Data.summary.map(row => row[0]) : []} categories={hdf5Data.summaryColumns ? hdf5Data.summaryColumns.map(c => c.toString()) : []} label="A" xLabel="Sample" yLabel="Value" />
                    </li>
                    <li>
                        <TableView data={hdf5Data.summary || []} columns={hdf5Data.summaryColumns ? hdf5Data.summaryColumns.map(c => c.toString()) : []} />
                    </li>
                </ul>
                
            </div>
    );
};
