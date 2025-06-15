import React from 'react';

export const TableView = ({ data = [[]], columns = [] }) => {
  if (!data.length) return <div>Нет данных</div>;
  return (
    <div style={{ overflow: 'auto', maxHeight: 400 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
        <thead>
          <tr>
            {columns.length
              ? columns.map((col, i) => <th key={i} style={{ border: '1px solid #ccc', padding: 4 }}>{col}</th>)
              : data[0].map((_, i) => <th key={i} style={{ border: '1px solid #ccc', padding: 4 }}>Col {i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ border: '1px solid #ccc', padding: 4 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 