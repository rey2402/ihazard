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
    <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-xl max-w-sm w-full p-6 text-center shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-semibold text-zinc-950 mb-1">Laporan Berhasil Terkirim</h3>
        <p className="text-xs text-zinc-500 mb-5">
          Terima kasih atas kontribusi Anda dalam menjaga keselamatan kerja di area tambang.
        </p>

        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 mb-5 text-left">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Nomor Tiket</span>
            <button
              onClick={handleCopyTicket}
              className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <div className="text-base font-mono font-semibold text-zinc-950">{report.id}</div>
          <div className="mt-2.5 pt-2.5 border-t border-zinc-200/60 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-zinc-400 block">Area</span>
              <span className="text-zinc-800 font-medium">{report.area}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Tingkat Risiko</span>
              <span
                className={`font-semibold ${
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
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Buat Laporan Baru
          </button>
          <button
            onClick={onClose}
            className="w-full py-1.5 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors"
          >
            Lihat Status Laporan
          </button>
        </div>
      </div>
    </div>
  );
};
