import React from 'react';
import { CheckCircle2, Copy, Check, X, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-emerald-200/80 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">
            Laporan Berhasil Terkirim!
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed font-normal">
            Laporan Anda telah tercatat ke dalam sistem iHazard dan segera ditinjau oleh tim SHE Pengawas.
          </p>

          {/* Ticket Information Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-left space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                ID TIKET HAZARD
              </span>
              <button
                type="button"
                onClick={handleCopyTicket}
                className="text-[11px] text-slate-700 hover:text-slate-950 flex items-center gap-1 font-semibold transition-colors bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <div className="text-base font-mono font-bold text-slate-900 tracking-wide bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
              {report.id}
            </div>

            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Area Lokasi</span>
                <span className="text-slate-800 font-semibold truncate block">{report.area}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tingkat Risiko</span>
                <span
                  className={`font-bold inline-block text-[11px] px-2 py-0.5 rounded ${
                    report.riskLevel === 'Tinggi'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : report.riskLevel === 'Sedang'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {report.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Pantau di Status Laporan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="w-full py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Kirim Laporan Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
