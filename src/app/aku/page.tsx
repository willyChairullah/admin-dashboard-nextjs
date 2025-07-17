import React from "react";

export default function Page() {
  return (
    <>
      <div className="p-5 h-screen bg-gray-100">
        <h1 className="text-xl mb-2">Your orders</h1>

        <div className="overflow-auto rounded-lg shadow ">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="w-20 p-3 text-sm font-semibold tracking-wide text-left">
                  No.
                </th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left">
                  Details
                </th>
                <th className="w-24 p-3 text-sm font-semibold tracking-wide text-left">
                  Status
                </th>
                <th className="w-24 p-3 text-sm font-semibold tracking-wide text-left">
                  Date
                </th>
                <th className="w-32 p-3 text-sm font-semibold tracking-wide text-left">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-white">
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  <a
                    href="#"
                    className="font-bold text-blue-500 hover:underline"
                  >
                    10001
                  </a>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  Kring New Fit office chair, mesh + PU, black
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  <span className="p-1.5 text-xs font-medium uppercase tracking-wider text-green-800 bg-green-200 rounded-lg bg-opacity-50">
                    Delivered
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  16/10/2021
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  $200.00
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  <a
                    href="#"
                    className="font-bold text-blue-500 hover:underline"
                  >
                    10002
                  </a>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  Kring New Fit office chair, mesh + PU, black
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  <span className="p-1.5 text-xs font-medium uppercase tracking-wider text-yellow-800 bg-yellow-200 rounded-lg bg-opacity-50">
                    Shipped
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  16/10/2021
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  $200.00
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  <a
                    href="#"
                    className="font-bold text-blue-500 hover:underline"
                  >
                    10002
                  </a>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  Kring New Fit office chair, mesh + PU, black
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  <span className="p-1.5 text-xs font-medium uppercase tracking-wider text-gray-800 bg-gray-200 rounded-lg bg-opacity-50">
                    Cancelled
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  16/10/2021
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  $200.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
