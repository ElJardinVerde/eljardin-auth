// src/react-qr-scanner.d.ts
declare module 'react-qr-scanner' {
    import { CSSProperties, Component } from 'react';
  
    interface QrScannerProps {
      delay?: number;
      onError: (err: any) => void;
      onScan: (data: { text: string } | null) => void;
      style?: CSSProperties;
    }
  
    export default class QrScanner extends Component<QrScannerProps> {}
  }
  