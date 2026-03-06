/**
 * useOfflineData — Fetches data from Supabase when online,
 * falls back to IndexedDB cache when offline.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getAllCachedEncounters,
  getCachedPatient,
  cacheEncounter,
  cachePatient,
} from '@/lib/offline-db';

interface OfflineEncounter {
  id: string;
  patient_id: string;
  status: string;
  zone: string | null;
  box_number: number | null;
  ccmu: number | null;
  cimu: number | null;
  motif_sfmu: string | null;
  medecin_id: string | null;
  arrival_time: string;
  [key: string]: unknown;
}

interface OfflinePatient {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  allergies: string[] | null;
  [key: string]: unknown;
}

interface OfflineBoardData {
  encounters: (OfflineEncounter & { patients: OfflinePatient })[];
  isFromCache: boolean;
  loading: boolean;
  error: string | null;
}

export function useOfflineBoardData(isOnline: boolean): OfflineBoardData & { refresh: () => Promise<void> } {
  const [data, setData] = useState<OfflineBoardData>({
    encounters: [],
    isFromCache: false,
    loading: true,
    error: null,
  });

  const fetchOnline = useCallback(async () => {
    try {
      const { data: encData, error } = await supabase
        .from('encounters')
        .select('*, patients(nom, prenom, date_naissance, sexe, allergies)')
        .in('status', ['arrived', 'triaged', 'in-progress'])
        .order('arrival_time', { ascending: true });

      if (error) throw error;
      if (!encData) return;

      // Cache each encounter and patient for offline
      for (const enc of encData) {
        await cacheEncounter(enc as any);
        if ((enc as any).patients) {
          await cachePatient({ id: enc.patient_id, ...(enc as any).patients } as any);
        }
      }

      setData({
        encounters: encData as any,
        isFromCache: false,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('[OfflineData] Online fetch failed', err);
      // Fallback to cache
      await fetchFromCache();
    }
  }, []);

  const fetchFromCache = useCallback(async () => {
    try {
      const cachedEncounters = await getAllCachedEncounters();
      const activeEncounters = cachedEncounters.filter(
        (e: any) => ['arrived', 'triaged', 'in-progress'].includes(e.status)
      ) as OfflineEncounter[];

      // Resolve patients from cache
      const withPatients = await Promise.all(
        activeEncounters.map(async (enc) => {
          const patient = await getCachedPatient(enc.patient_id);
          return {
            ...enc,
            patients: patient
              ? {
                  id: patient.id as string,
                  nom: (patient.nom as string) || 'Inconnu',
                  prenom: (patient.prenom as string) || '',
                  date_naissance: (patient.date_naissance as string) || '',
                  sexe: (patient.sexe as string) || '',
                  allergies: (patient.allergies as string[]) || null,
                }
              : { id: enc.patient_id, nom: 'Patient', prenom: '(hors ligne)', date_naissance: '', sexe: '', allergies: null },
          };
        })
      );

      setData({
        encounters: withPatients,
        isFromCache: true,
        loading: false,
        error: cachedEncounters.length === 0 ? 'Aucune donnée en cache' : null,
      });
    } catch {
      setData(s => ({ ...s, loading: false, isFromCache: true, error: 'Cache indisponible' }));
    }
  }, []);

  const refresh = useCallback(async () => {
    setData(s => ({ ...s, loading: true }));
    if (isOnline) {
      await fetchOnline();
    } else {
      await fetchFromCache();
    }
  }, [isOnline, fetchOnline, fetchFromCache]);

  useEffect(() => {
    refresh();
  }, [isOnline]); // Re-fetch when connectivity changes

  return { ...data, refresh };
}
