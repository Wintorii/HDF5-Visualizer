// mockHdf5.js

// Генерация «картинок» и таблиц
const WIDTH = 100;
const HEIGHT = 100;
const ROWS_METEO = 365;
const N_POINTS = 500;

// Цифровая модель рельефа (DEM): волнообразная поверхность + шум
const elevation = Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) =>
    1000 
    + 200 * Math.sin((2 * Math.PI * x) / WIDTH) * Math.cos((2 * Math.PI * y) / HEIGHT)
    + 10 * (Math.random() - 0.5)
  )
);

// RGB-каналы: простая градиентная заливка + шум
const redChannel = Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) =>
    150 + 100 * (x / WIDTH) + 20 * (Math.random() - 0.5)
  )
);
const greenChannel = Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) =>
    120 + 100 * (y / HEIGHT) + 20 * (Math.random() - 0.5)
  )
);
const blueChannel = Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) =>
    100 + 50 * Math.sin((2 * Math.PI * (x + y)) / (WIDTH + HEIGHT)) 
    + 20 * (Math.random() - 0.5)
  )
);

// Тепловая карта (thermal): температура поверхности в Кельвинах
const thermal = Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) =>
    280 + 5 * Math.sin((2 * Math.PI * x) / 50) * Math.cos((2 * Math.PI * y) / 50)
    + 2 * (Math.random() - 0.5)
  )
);

// Набор случайных точек (lat, lon) внутри условного квадрата
const points = Array.from({ length: N_POINTS }, () => [
  55 + (Math.random() - 0.5) * 0.1,   // latitude ~55±0.05
  37 + (Math.random() - 0.5) * 0.1    // longitude ~37±0.05
]);

// Метеоданные: 365 дней, три колонки (температура, давление, влажность)
const meteo = Array.from({ length: ROWS_METEO }, (_, i) => {
  // простая сезонная модель: temp колеблется в диапазоне [260..300]
  const temp = 280 + 20 * Math.sin((2 * Math.PI * i) / ROWS_METEO);
  const pressure = 1000 + 10 * Math.cos((2 * Math.PI * i) / ROWS_METEO);
  const humidity = 50 + 30 * Math.sin((4 * Math.PI * i) / ROWS_METEO);
  return [temp + 2*(Math.random()-0.5), pressure + (Math.random()-0.5), humidity + (Math.random()-0.5)*5];
});

// Структура HDF5 (группы и датасеты)
export const mockStructure = {
  data: [
    {
      type: 'group',
      name: 'satellite_data',
      children: [
        { type: 'dataset', name: 'elevation' },
        {
          type: 'group',
          name: 'rgb',
          children: [
            { type: 'dataset', name: 'red' },
            { type: 'dataset', name: 'green' },
            { type: 'dataset', name: 'blue' }
          ]
        },
        { type: 'dataset', name: 'thermal' }
      ]
    },
    { type: 'dataset', name: 'points' },
    {
      type: 'group',
      name: 'statistics',
      children: [
        { type: 'dataset', name: 'elevation_stats' },   // тут будут min/max/mean
        { type: 'dataset', name: 'thermal_stats' }
      ]
    },
    {
      type: 'group',
      name: 'meteorology',
      children: [
        { type: 'dataset', name: 'daily' }
      ]
    }
  ]
};

// Все «дейтасеты» с их данными и атрибутами
export const mockDatasets = {
  '/satellite_data/elevation': {
    data: elevation,
    attrs: {
      units: 'meters'
    }
  },
  '/satellite_data/rgb/red': {
    data: redChannel,
    attrs: { units: 'DN' }
  },
  '/satellite_data/rgb/green': {
    data: greenChannel,
    attrs: { units: 'DN' }
  },
  '/satellite_data/rgb/blue': {
    data: blueChannel,
    attrs: { units: 'DN' }
  },
  '/satellite_data/thermal': {
    data: thermal,
    attrs: { units: 'K' }
  },
  '/points': {
    data: points,
    attrs: {
      columns: ['Latitude', 'Longitude'],
      description: 'Random sample points'
    }
  },
  '/statistics/elevation_stats': {
    data: [
      ['min', Math.min(...elevation.flat())],
      ['max', Math.max(...elevation.flat())],
      ['mean', elevation.flat().reduce((a,b)=>a+b,0)/elevation.flat().length]
    ],
    attrs: { columns: ['stat', 'value'] }
  },
  '/statistics/thermal_stats': {
    data: [
      ['min', Math.min(...thermal.flat())],
      ['max', Math.max(...thermal.flat())],
      ['mean', thermal.flat().reduce((a,b)=>a+b,0)/thermal.flat().length]
    ],
    attrs: { columns: ['stat', 'value'] }
  },
  '/meteorology/daily': {
    data: meteo,
    attrs: { columns: ['Temperature', 'Pressure', 'Humidity'], units: ['K', 'hPa', '%'] }
  }
};

// Как «привязать» к FileRepository
export class MockFileRepository {
  getStructure(fileName) {
    // игнорим fileName, всегда возвращаем одну и ту же структуру
    return Promise.resolve(mockStructure);
  }
  getDataset(fileName, datasetPath) {
    const ds = mockDatasets[datasetPath];
    if (!ds) {
      return Promise.reject(new Error(`Dataset ${datasetPath} not found in mock`));
    }
    // т.к. в вашем коде ожидается res.data.data и res.data.attrs
    return Promise.resolve({
      data: { data: ds.data, attrs: ds.attrs }
    });
  }
}