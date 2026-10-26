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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Laporan Bahaya Terkirim!</h3>
        <p className="text-sm text-slate-600 mb-6">
          Terima kasih telah berkontribusi menjaga keselamatan kerja di area tambang.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 font-mono font-semibold">NOMOR TIKET</span>
            <button
              onClick={handleCopyTicket}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <div className="text-lg font-mono font-bold text-slate-900 tracking-wider">{report.id}</div>
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Area</span>
              <span className="text-slate-800 font-semibold">{report.area}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tingkat Risiko</span>
              <span
                className={`font-bold ${
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
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
          >
            Buat Laporan Baru
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
          >
            Lihat Dashboard SHE
          </button>
        </div>
      </div>
    </div>
  );
};
