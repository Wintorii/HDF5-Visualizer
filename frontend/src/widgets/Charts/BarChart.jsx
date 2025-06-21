import CanvasJSReact from '@canvasjs/react-charts';
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
export const BarChart = ({ title = 'Bar Chart', data = [], categories = [], label = 'Value', xLabel = 'Category', yLabel = 'Value' }) => {
 
  
  
  const options = {
    animationEnabled: true,
    title: { text: title },
    axisX: { title: xLabel, interval: 1, labelFormatter: e => categories[e.value] || e.value },
    axisY: { title: yLabel },
    data: [
      {
        type: 'column',
        name: label,
        showInLegend: true,
        dataPoints: data.map((y, x) => ({ x, y, label: categories[x] })),
      },
    ],
  };
  return <CanvasJSChart options={options} style={{ width: '100%', height: 400 }} />;
}; 
