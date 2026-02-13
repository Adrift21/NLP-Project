
import React from 'react';
import { AnalysisRecord, SentimentType } from '../types';

interface Props {
  records: AnalysisRecord[];
  onDelete: (id: string) => void;
}

const getSentimentColor = (sentiment: SentimentType) => {
  switch (sentiment) {
    case SentimentType.POSITIVE: return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    case SentimentType.NEGATIVE: return 'text-rose-700 bg-rose-50 border-rose-100';
    case SentimentType.NEUTRAL: return 'text-slate-700 bg-slate-50 border-slate-100';
  }
};

const HistoryTable: React.FC<Props> = ({ records, onDelete }) => {
  if (records.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Analysis History</h3>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{records.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
            <tr>
              <th className="px-6 py-3">Analysis Date</th>
              <th className="px-6 py-3">Review Text</th>
              <th className="px-6 py-3">Sentiment</th>
              <th className="px-6 py-3">Confidence</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {new Date(record.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 max-w-md truncate">
                  {record.text}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSentimentColor(record.sentiment)}`}>
                    {record.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  {(record.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    title="Delete record"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
