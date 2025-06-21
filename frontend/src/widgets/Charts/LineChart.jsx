import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export const LineChart = ({ title = 'Line Chart', data = [], label = 'Value', xLabel = 'Index', yLabel = 'Value' }) => {
  const options = {
    animationEnabled: true,
    title: { text: title },
    axisX: { title: xLabel },
    axisY: { title: yLabel },
    data: [
      {
        type: 'line',
        name: label,
        showInLegend: true,
        dataPoints: data.map((y, x) => ({ x, y })),
      },
    ],
  };
  return <CanvasJSChart options={options} style={{ width: '100%', height: 400 }} />;
}; 
