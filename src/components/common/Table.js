import React from 'react';

const Table = ({ columns, data = [], actions, onEdit, onDelete, onView }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="table-header-cell">
                {column.label}
              </th>
            ))}
            {actions && <th className="table-header-cell">Actions</th>}
          </tr>
        </thead>
        <tbody className="table-body">
          {data && data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="table-row">
                {columns.map((column) => (
                  <td key={`${item.id}-${column.key}`} className="table-cell">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
