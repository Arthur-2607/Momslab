'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface PaymentButtonProps {
  orderNumber?: string;
  amount?: number;
}

export default function PaymentButton({
  orderNumber = '12345',
  amount = 29900
}: PaymentButtonProps) {
  const router = useRouter();
  const params = useParams();
  const branchSlug = params.branchSlug as string;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      // In a real app, you would call your payment API here
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to complete page with query parameters
      const completeUrl = `/${branchSlug}/complete?orderNumber=${orderNumber}&amount=${amount}`;
      router.push(completeUrl);
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      // Handle error (show error message, etc.)
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isProcessing ? '처리 중...' : '결제하기'}
    </button>
  );
}
