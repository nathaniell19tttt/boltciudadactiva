import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Job } from '@/types';

interface Filters {
  search?: string;
  district?: string;
  modality?: string;
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  category?: string;
}

export function useJobs(initialFilters?: Filters) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters || {});

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('jobs')
        .select('*, company:company_profiles(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.district) {
        query = query.eq('district', filters.district);
      }
      if (filters.modality) {
        query = query.eq('modality', filters.modality);
      }
      if (filters.contract_type) {
        query = query.eq('contract_type', filters.contract_type);
      }
      if (filters.salary_min) {
        query = query.gte('salary_max', filters.salary_min);
      }
      if (filters.salary_max) {
        query = query.lte('salary_min', filters.salary_max);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setJobs(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar empleos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    jobs,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh: fetchJobs,
  };
}
