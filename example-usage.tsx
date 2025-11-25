// Example usage in app/[branchSlug]/payment/page.tsx

'use client';

import PaymentButton from '@/components/PaymentButton';
import { useParams } from 'next/navigation';

export default function PaymentPage() {
  const params = useParams();
  const branchSlug = params.branchSlug as string;

  // In a real app, you would fetch or generate these values
  const orderNumber = `ORD-${Date.now()}`;
  const totalAmount = 29900;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">결제 확인</h1>

        <div className="mb-8 space-y-4">
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">지점</span>
            <span className="font-semibold">{branchSlug}</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">주문번호</span>
            <span className="font-semibold">{orderNumber}</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">총 결제금액</span>
            <span className="text-xl font-bold text-blue-600">
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        <PaymentButton orderNumber={orderNumber} amount={totalAmount} />
      </div>
    </div>
  );
}

// --------------------------------------------------
// Example Complete Page Route: app/[branchSlug]/complete/page.tsx

import CompletePage from '@/components/CompletePage';

export default function CompleteRoute() {
  return <CompletePage />;
}
