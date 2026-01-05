import React, { createContext, useContext, useState, type ReactNode } from 'react';

type ModalType = 'info' | 'error' | 'success' | 'warning';

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
}

interface ToastState {
    id: string;
    message: string;
    type: ModalType;
}

interface UiContextType {
    showAlert: (title: string, message: string, type?: ModalType) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    showToast: (message: string, type?: ModalType) => void;
    hideModal: () => void;
    modal: ModalState;
    toasts: ToastState[];
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const showAlert = (title: string, message: string, type: ModalType = 'info') => {
        setModal({ isOpen: true, title, message, type });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setModal({ isOpen: true, title, message, type: 'warning', onConfirm });
    };

    const hideModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const showToast = (message: string, type: ModalType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <UiContext.Provider value={{ showAlert, showConfirm, showToast, hideModal, modal, toasts }}>
            {children}
        </UiContext.Provider>
    );
};

export const useUi = () => {
    const context = useContext(UiContext);
    if (!context) throw new Error('useUi must be used within UiProvider');
    return context;
};
