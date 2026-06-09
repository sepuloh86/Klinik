import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { Search, History, Filter, HeartHandshake } from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export default function ActivityLogView({ logs }: ActivityLogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');

  const filteredLogs = logs.filter(log => {
    const matchesQuery = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'Semua' || log.userRole === roleFilter;

    return matchesQuery && matchesRole;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <History className="h-5 w-5 animate-spin-reverse-once" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">Log Historis Aktivitas Sistem (Auditing)</h2>
            <p className="text-xs text-slate-500">Log sinkronisasi transaksi, rekam medis, antrean, rujukan, serta status login pegawai</p>
          </div>
        </div>

        <div className="flex space-x-3 flex-wrap gap-2 text-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kata kunci tindakan..."
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <select
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="Semua">Semua Jabatan</option>
            <option value="Admin">Admin</option>
            <option value="Dokter">Dokter</option>
            <option value="Perawat">Perawat</option>
            <option value="Apoteker">Apoteker</option>
            <option value="Kasir">Kasir</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto text-xs font-sans">
        <div className="relative border-l-2 border-slate-150 ml-4 pl-6 space-y-6">
          {filteredLogs.map((log) => {
            const timeFormatted = new Date(log.timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div key={log.id} className="relative group leading-normal">
                {/* Dot marker */}
                <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white bg-slate-400 group-hover:bg-amber-500 transition-all"></span>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:shadow-xs transition-shadow">
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{log.userName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.userRole === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : log.userRole === 'Dokter'
                          ? 'bg-red-100 text-red-800'
                          : log.userRole === 'Perawat'
                          ? 'bg-blue-100 text-blue-800'
                          : log.userRole === 'Apoteker'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.userRole}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp.slice(0, 10)} @ {timeFormatted} WIB</span>
                  </div>

                  <strong className="text-slate-700 text-xs font-semibold block">{log.action}</strong>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                </div>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <p className="py-12 italic text-slate-400 text-center font-sans">Belum ada catatan log historis yang cocok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
