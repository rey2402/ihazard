import React from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { HazardReport } from '../../types/hazard';

interface HazardSuccessModalProps {
  report: HazardReport;
  onClose: () => void;
  onReset: () => void;
}

export const HazardSuccessModal: React.FC<HazardSuccessModalProps> = ({
  report,
  onClose,
  onReset,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(report.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-lg max-w-sm w-full text-center shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="h-1.5 w-full bg-hazard-stripes" />
        <div className="p-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Laporan Berhasil Terkirim</h3>
          <p className="text-xs text-slate-500 mb-5 font-medium">
            Terima kasih atas kontribusi Anda dalam menjaga keselamatan kerja operasional pertambangan.
          </p>

          <div className="bg-slate-50 border border-slate-300 rounded p-3.5 mb-5 text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-widest">[ TIKET HAZARD ]</span>
              <button
                onClick={handleCopyTicket}
                className="text-xs text-slate-700 hover:text-slate-950 flex items-center gap-1 font-bold transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <div className="text-base font-mono font-black text-slate-950 tracking-wider">{report.id}</div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block font-medium">Area Lokasi</span>
                <span className="text-slate-900 font-bold">{report.area}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Tingkat Risiko</span>
                <span
                  className={`font-black uppercase tracking-wider ${
                    report.riskLevel === 'Tinggi'
                      ? 'text-red-600'
                      : report.riskLevel === 'Sedang'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {report.riskLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onReset}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded shadow-md border border-amber-600/30 transition-all cursor-pointer"
            >
              Buat Laporan Baru
            </button>
            <button
              onClick={onClose}
              className="w-full py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors uppercase font-mono"
            >
              Lihat Status Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
