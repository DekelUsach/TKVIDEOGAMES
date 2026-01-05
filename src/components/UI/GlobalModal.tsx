import React from 'react';
import { useUi } from '../../context/UiContext';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export const GlobalModal: React.FC = () => {
    const { modal, hideModal } = useUi();

    if (!modal.isOpen) return null;

    const icons = {
        info: <Info className="text-accent-cyan" size={48} />,
        success: <CheckCircle className="text-green-500" size={48} />,
        warning: <AlertTriangle className="text-yellow-500" size={48} />,
        error: <AlertCircle className="text-red-500" size={48} />
    };

    const handleConfirm = () => {
        if (modal.onConfirm) {
            modal.onConfirm();
        }
        hideModal();
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={hideModal}
        >
            <div
                className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl max-w-sm w-full mx-4 relative shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={hideModal}
                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                        {icons[modal.type]}
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-white capitalize">
                        {modal.title}
                    </h3>

                    <p className="text-gray-400 mb-8 leading-relaxed">
                        {modal.message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {modal.onConfirm ? (
                            <>
                                <button
                                    onClick={hideModal}
                                    className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={clsx(
                                        "flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg",
                                        modal.type === 'warning' ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-accent-cyan text-black hover:opacity-90"
                                    )}
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={hideModal}
                                className="w-full py-3 px-6 bg-accent-cyan text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-cyan/10"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
