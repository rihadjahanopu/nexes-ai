'use client';

import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
}

interface ConfirmDialogState extends ConfirmOptions {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    loading: false,
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'destructive',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState((prev) => ({
        ...prev,
        open: true,
        loading: false,
        title: options.title ?? 'Are you sure?',
        description: options.description ?? 'This action cannot be undone.',
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        variant: options.variant ?? 'destructive',
        onConfirm: () => {
          setState((s) => ({ ...s, open: false, loading: false }));
          resolve(true);
        },
        onCancel: () => {
          setState((s) => ({ ...s, open: false }));
          resolve(false);
        },
      }));
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => !open && state.onCancel()}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {state.variant === 'destructive' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              )}
              <div>
                <DialogTitle className="text-base font-semibold">{state.title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  {state.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={state.onCancel}
              disabled={state.loading}
            >
              {state.cancelText}
            </Button>
            <Button
              variant={state.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={state.onConfirm}
              disabled={state.loading}
            >
              {state.loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {state.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmDialogProvider');
  return ctx.confirm;
}
