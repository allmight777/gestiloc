// src/hooks/usePaymentStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { landlordPayments } from '../services/landlordPayments';

interface PaymentStatistics {
  period: string;
  total_amount: number;
  completed_amount: number;
  failed_amount: number;
  refunded_amount: number;
  transaction_count: number;
  success_rate: number;
}

export function usePaymentStatistics(period: string = 'month') {
  return useQuery<PaymentStatistics>({
    queryKey: ['payment-statistics', period],
    queryFn: () => landlordPayments.getPaymentStatistics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
