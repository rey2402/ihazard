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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Laporan Bahaya Terkirim!</h3>
        <p className="text-sm text-slate-400 mb-6">
          Terima kasih telah berkontribusi menjaga keselamatan kerja di area tambang.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-mono">NOMOR TIKET</span>
            <button
              onClick={handleCopyTicket}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <div className="text-lg font-mono font-bold text-white tracking-wider">{report.id}</div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Area</span>
              <span className="text-slate-300 font-medium">{report.area}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tingkat Risiko</span>
              <span
                className={`font-semibold ${
                  report.riskLevel === 'Tinggi'
                    ? 'text-red-400'
                    : report.riskLevel === 'Sedang'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
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
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/10"
          >
            Buat Laporan Baru
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Lihat Dashboard SHE
          </button>
        </div>
      </div>
    </div>
  );
};
