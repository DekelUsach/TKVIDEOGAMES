import React from 'react';
import { useUi } from '../../context/UiContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const ToastContainer: React.FC = () => {
    const { toasts } = useUi();

    return (
        <div className="fixed top-6 right-6 z-[300] space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: any }> = ({ toast }) => {
    const icons = {
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
        warning: <AlertTriangle size={18} />,
        error: <AlertCircle size={18} />
    };

    const colors = {
        info: "bg-blue-600/90 text-white border-blue-400/30",
        success: "bg-green-600/90 text-white border-green-400/30",
        warning: "bg-yellow-600/90 text-white border-yellow-400/30",
        error: "bg-red-600/90 text-white border-red-400/30"
    };

    return (
        <div className={clsx(
            "pointer-events-auto min-w-[300px] flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300",
            colors[toast.type as keyof typeof colors]
        )}>
            <div className="flex-shrink-0">
                {icons[toast.type as keyof typeof icons]}
            </div>
            <p className="flex-1 text-sm font-medium">
                {toast.message}
            </p>
        </div>
    );
};
