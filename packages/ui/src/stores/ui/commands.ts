import { createCommand } from '@naikidev/commiq';
import type { TradingPair } from '@commiq-markets/shared';

export const UiCommand = {
  selectPair: (pair: TradingPair) =>
    createCommand('ui:selectPair', { pair }),

  addToast: (message: string, type: 'success' | 'error' | 'info') =>
    createCommand('ui:addToast', { message, type }),

  removeToast: (id: string) =>
    createCommand('ui:removeToast', { id }),
};
