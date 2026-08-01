"use client";
import React, { useEffect, useRef } from 'react'
import { scanReceipt } from '@/actions/transaction';
import useFetch from '@/hooks/use-fetch';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ReceiptScanner = ({
  onScanComplete,
}: {
  onScanComplete: (data: any) => void; // replace `any` with a proper scanned-receipt type once you know its shape
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt) as unknown as {
    loading: boolean;
    fn: (file: File) => Promise<any>;
    data: any;
  };

  const handleReceiptScan = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanReceiptLoading, scannedData]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className='hidden'
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <Button
        type="button"
        className='w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white'
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className='mr-2 animate-spin' />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className='mr-2' />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  )
}

export default ReceiptScanner