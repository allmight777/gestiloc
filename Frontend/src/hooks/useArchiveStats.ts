// src/hooks/useArchiveStats.ts
import { useQuery } from '@tanstack/react-query';
import { landlordPayments } from '../services/landlordPayments';

interface ArchiveStats {
  total_documents: number;
  total_size_mb: number;
  by_type?: Record<string, number>;
  by_month?: Record<string, number>;
}

export function useArchiveStats() {
  return useQuery<ArchiveStats>({
    queryKey: ['archive-stats'],
    queryFn: () => landlordPayments.getArchiveStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
