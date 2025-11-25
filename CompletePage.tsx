'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { Suspense } from 'react';

function CompletePageContent() {
  const searchParams = useSearchParams();
  const params = useParams();

  const orderNumber = searchParams.get('orderNumber');
  const amount = searchParams.get('amount');
  const branchSlug = params.branchSlug as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            결제가 완료되었습니다
          </h1>

          <p className="text-gray-600 mb-6">
            주문이 정상적으로 처리되었습니다.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">지점:</span>
              <span className="font-semibold text-gray-900">{branchSlug}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">주문번호:</span>
              <span className="font-semibold text-gray-900">{orderNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">결제금액:</span>
              <span className="font-semibold text-gray-900">
                {amount ? `${Number(amount).toLocaleString()}원` : '-'}
              </span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = `/${branchSlug}`}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CompletePageContent />
    </Suspense>
  );
}
