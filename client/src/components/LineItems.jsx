import { GST_RATES } from '../utils/gstCalculations'

const emptyItem = {
  description: '',
  quantity: 1,
  rate: 0,
  gstRate: 18,
}

export default function LineItems({ items, onChange }) {

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  const addItem = () => onChange([...items, { ...emptyItem }])

  const removeItem = (index) => {
    if (items.length === 1) return
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Line Items</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-indigo-50 text-gray-600">
            <tr>
              <th className="p-3 text-left w-[35%]">Description</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-center">Rate (₹)</th>
              <th className="p-3 text-center">GST %</th>
              <th className="p-3 text-center">Amount (₹)</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={e => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={item.gstRate}
                    onChange={e => updateItem(index, 'gstRate', parseFloat(e.target.value))}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {GST_RATES.map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-center font-medium text-gray-700">
                  ₹{(item.quantity * item.rate).toFixed(2)}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addItem}
        className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
      >
        + Add Line Item
      </button>
    </div>
  )
}