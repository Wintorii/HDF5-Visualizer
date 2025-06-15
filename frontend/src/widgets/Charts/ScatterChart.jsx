import CanvasJSReact from '@canvasjs/react-charts';
//var CanvasJSReact = require('@canvasjs/react-charts');
 
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
export const ScatterChart = ({ title = 'Scatter Chart', data = [], label = 'Point', xLabel = 'X', yLabel = 'Y' }) => {
  const options = {
    animationEnabled: true,
    title: { text: title },
    axisX: { title: xLabel },
    axisY: { title: yLabel },
    data: [
      {
        type: 'scatter',
        name: label,
        showInLegend: true,
        dataPoints: data.map(([x, y]) => ({ x, y })),
      },
    ],
  };
  return <CanvasJSChart options={options} style={{ width: '100%', height: 400 }} />;
}; 