import { BoletoData } from './boleto.types';
import { GenericScanData } from './generic.types';
import { PixData } from './pix.types';

export type HistoryRecord =
  | { id: string; name: string; scannedAt: string; type: 'pix'; data: PixData }
  | { id: string; name: string; scannedAt: string; type: 'boleto'; data: BoletoData }
  | { id: string; name: string; scannedAt: string; type: 'generic'; data: GenericScanData };

export type NewHistoryRecord =
  | { name: string; type: 'pix'; data: PixData }
  | { name: string; type: 'boleto'; data: BoletoData }
  | { name: string; type: 'generic'; data: GenericScanData };
