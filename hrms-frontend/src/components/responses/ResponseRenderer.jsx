
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import MarkdownResponse from "./MarkdownResponse";

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#06b6d4",
  "#16a34a",
  "#f59e0b",
  "#ec4899",
];

function ResponseRenderer({ response }) {
  if (!response) return null;

  const {
    message,
    kpis = [],
    table,
    chart,
    insights = [],
  } = response;

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-hidden">

      {/* Text Response */}
      {message && (
        <div className="w-full min-w-0 max-w-full break-words">
          <MarkdownResponse content={message} />
        </div>
      )}

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {kpis.map((item, index) => (
            <div
              key={index}
              className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-md"
            >
              <p className="break-words text-xs text-gray-500">
                {item.title || item.label || "Metric"}
              </p>

              <h2 className="mt-2 break-words text-2xl font-bold text-blue-600">
                {item.value ?? "-"}
              </h2>
            </div>
          ))}
        </div>
      )}

      {/* Table Response */}
      {table?.columns?.length > 0 && (
        <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-gray-200">
          <table className="w-full min-w-[500px] border-collapse text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {table.columns.map((column, index) => (
                  <th
                    key={index}
                    className="max-w-[220px] whitespace-normal break-words px-4 py-3 font-semibold text-gray-700"
                  >
                    {typeof column === "string"
                      ? column
                      : column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {table.rows?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                >
                  {table.columns.map((column, cellIndex) => {
                    const value = Array.isArray(row)
                      ? row[cellIndex]
                      : row[
                          typeof column === "string"
                            ? column
                            : column.key
                        ];

                    return (
                      <td
                        key={cellIndex}
                        className="max-w-[220px] whitespace-normal break-words px-4 py-3 align-top text-gray-600"
                      >
                        {value ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart Response */}
      {chart?.data?.length > 0 && (
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <h3 className="mb-4 break-words font-semibold text-gray-800">
            {chart.title || "HRMS Analytics"}
          </h3>

          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {chart.type === "pie" ? (
                <PieChart>
                  <Pie
                    data={chart.data}
                    dataKey={chart.dataKey || "value"}
                    nameKey={chart.nameKey || "name"}
                    outerRadius="75%"
                    label
                  >
                    {chart.data.map((item, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : chart.type === "line" ? (
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey={chart.xKey || "name"}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey={chart.dataKey || "value"}
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={chart.data}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey={chart.xKey || "name"}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey={chart.dataKey || "value"}
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="w-full min-w-0 space-y-2">
          <h3 className="font-semibold text-gray-800">
            Key Insights
          </h3>

          {insights.map((insight, index) => (
            <div
              key={index}
              className="break-words rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-gray-700"
            >
              {insight}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ResponseRenderer;
