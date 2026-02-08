export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      administrations: {
        Row: {
          administered_at: string
          administered_by: string
          dose_given: string
          encounter_id: string
          id: string
          notes: string | null
          patient_id: string
          prescription_id: string
          route: Database["public"]["Enums"]["med_route"]
        }
        Insert: {
          administered_at?: string
          administered_by: string
          dose_given: string
          encounter_id: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription_id: string
          route: Database["public"]["Enums"]["med_route"]
        }
        Update: {
          administered_at?: string
          administered_by?: string
          dose_given?: string
          encounter_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_id?: string
          route?: Database["public"]["Enums"]["med_route"]
        }
        Relationships: [
          {
            foreignKeyName: "administrations_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "administrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "administrations_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      encounters: {
        Row: {
          arrival_time: string
          box_number: number | null
          ccmu: number | null
          cimu: number | null
          created_at: string
          discharge_time: string | null
          id: string
          ide_id: string | null
          medecin_id: string | null
          motif_sfmu: string | null
          orientation: string | null
          patient_id: string
          status: Database["public"]["Enums"]["encounter_status"]
          triage_time: string | null
          zone: Database["public"]["Enums"]["zone_type"] | null
        }
        Insert: {
          arrival_time?: string
          box_number?: number | null
          ccmu?: number | null
          cimu?: number | null
          created_at?: string
          discharge_time?: string | null
          id?: string
          ide_id?: string | null
          medecin_id?: string | null
          motif_sfmu?: string | null
          orientation?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["encounter_status"]
          triage_time?: string | null
          zone?: Database["public"]["Enums"]["zone_type"] | null
        }
        Update: {
          arrival_time?: string
          box_number?: number | null
          ccmu?: number | null
          cimu?: number | null
          created_at?: string
          discharge_time?: string | null
          id?: string
          ide_id?: string | null
          medecin_id?: string | null
          motif_sfmu?: string | null
          orientation?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["encounter_status"]
          triage_time?: string | null
          zone?: Database["public"]["Enums"]["zone_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          adresse: string | null
          allergies: string[] | null
          antecedents: string[] | null
          created_at: string
          date_naissance: string
          id: string
          ins_numero: string | null
          medecin_traitant: string | null
          nom: string
          prenom: string
          sexe: string
          telephone: string | null
          traitements_actuels: Json | null
        }
        Insert: {
          adresse?: string | null
          allergies?: string[] | null
          antecedents?: string[] | null
          created_at?: string
          date_naissance: string
          id?: string
          ins_numero?: string | null
          medecin_traitant?: string | null
          nom: string
          prenom: string
          sexe: string
          telephone?: string | null
          traitements_actuels?: Json | null
        }
        Update: {
          adresse?: string | null
          allergies?: string[] | null
          antecedents?: string[] | null
          created_at?: string
          date_naissance?: string
          id?: string
          ins_numero?: string | null
          medecin_traitant?: string | null
          nom?: string
          prenom?: string
          sexe?: string
          telephone?: string | null
          traitements_actuels?: Json | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          dosage: string
          encounter_id: string
          frequency: string | null
          id: string
          medication_name: string
          notes: string | null
          patient_id: string
          prescriber_id: string
          priority: Database["public"]["Enums"]["prescription_priority"]
          route: Database["public"]["Enums"]["med_route"]
          status: Database["public"]["Enums"]["prescription_status"]
        }
        Insert: {
          created_at?: string
          dosage: string
          encounter_id: string
          frequency?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          patient_id: string
          prescriber_id: string
          priority?: Database["public"]["Enums"]["prescription_priority"]
          route?: Database["public"]["Enums"]["med_route"]
          status?: Database["public"]["Enums"]["prescription_status"]
        }
        Update: {
          created_at?: string
          dosage?: string
          encounter_id?: string
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescriber_id?: string
          priority?: Database["public"]["Enums"]["prescription_priority"]
          route?: Database["public"]["Enums"]["med_route"]
          status?: Database["public"]["Enums"]["prescription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          encounter_id: string
          id: string
          notes: string | null
          patient_id: string
          performed_at: string
          performed_by: string
          procedure_type: Database["public"]["Enums"]["procedure_type"]
        }
        Insert: {
          encounter_id: string
          id?: string
          notes?: string | null
          patient_id: string
          performed_at?: string
          performed_by: string
          procedure_type: Database["public"]["Enums"]["procedure_type"]
        }
        Update: {
          encounter_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          performed_at?: string
          performed_by?: string
          procedure_type?: Database["public"]["Enums"]["procedure_type"]
        }
        Relationships: [
          {
            foreignKeyName: "procedures_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          category: Database["public"]["Enums"]["result_category"]
          content: Json
          encounter_id: string
          id: string
          is_critical: boolean
          is_read: boolean
          patient_id: string
          received_at: string
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["result_category"]
          content?: Json
          encounter_id: string
          id?: string
          is_critical?: boolean
          is_read?: boolean
          patient_id: string
          received_at?: string
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["result_category"]
          content?: Json
          encounter_id?: string
          id?: string
          is_critical?: boolean
          is_read?: boolean
          patient_id?: string
          received_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_items: {
        Row: {
          content: string
          created_at: string
          id: string
          item_type: Database["public"]["Enums"]["timeline_item_type"]
          patient_id: string
          source_author: string | null
          source_date: string | null
          source_document: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          item_type: Database["public"]["Enums"]["timeline_item_type"]
          patient_id: string
          source_author?: string | null
          source_date?: string | null
          source_document?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          item_type?: Database["public"]["Enums"]["timeline_item_type"]
          patient_id?: string
          source_author?: string | null
          source_date?: string | null
          source_document?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      transmissions: {
        Row: {
          actions: string | null
          author_id: string
          cible: string | null
          created_at: string
          donnees: string | null
          encounter_id: string
          id: string
          patient_id: string
          resultats: string | null
        }
        Insert: {
          actions?: string | null
          author_id: string
          cible?: string | null
          created_at?: string
          donnees?: string | null
          encounter_id: string
          id?: string
          patient_id: string
          resultats?: string | null
        }
        Update: {
          actions?: string | null
          author_id?: string
          cible?: string | null
          created_at?: string
          donnees?: string | null
          encounter_id?: string
          id?: string
          patient_id?: string
          resultats?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transmissions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transmissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          encounter_id: string
          eva_douleur: number | null
          fc: number | null
          frequence_respiratoire: number | null
          gcs: number | null
          id: string
          pa_diastolique: number | null
          pa_systolique: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          spo2: number | null
          temperature: number | null
        }
        Insert: {
          encounter_id: string
          eva_douleur?: number | null
          fc?: number | null
          frequence_respiratoire?: number | null
          gcs?: number | null
          id?: string
          pa_diastolique?: number | null
          pa_systolique?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          spo2?: number | null
          temperature?: number | null
        }
        Update: {
          encounter_id?: string
          eva_douleur?: number | null
          fc?: number | null
          frequence_respiratoire?: number | null
          gcs?: number | null
          id?: string
          pa_diastolique?: number | null
          pa_systolique?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          spo2?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "medecin" | "ioa" | "ide" | "as" | "secretaire"
      encounter_status:
        | "planned"
        | "arrived"
        | "triaged"
        | "in-progress"
        | "finished"
      med_route: "IV" | "PO" | "SC" | "IM" | "INH"
      prescription_priority: "routine" | "urgent" | "stat"
      prescription_status: "active" | "completed" | "cancelled"
      procedure_type:
        | "vvp"
        | "prelevement"
        | "pansement"
        | "sondage"
        | "ecg"
        | "autre"
      result_category: "bio" | "imagerie" | "ecg"
      timeline_item_type:
        | "antecedent"
        | "allergie"
        | "traitement"
        | "crh"
        | "resultat"
        | "diagnostic"
      zone_type: "sau" | "uhcd" | "dechocage"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["medecin", "ioa", "ide", "as", "secretaire"],
      encounter_status: [
        "planned",
        "arrived",
        "triaged",
        "in-progress",
        "finished",
      ],
      med_route: ["IV", "PO", "SC", "IM", "INH"],
      prescription_priority: ["routine", "urgent", "stat"],
      prescription_status: ["active", "completed", "cancelled"],
      procedure_type: [
        "vvp",
        "prelevement",
        "pansement",
        "sondage",
        "ecg",
        "autre",
      ],
      result_category: ["bio", "imagerie", "ecg"],
      timeline_item_type: [
        "antecedent",
        "allergie",
        "traitement",
        "crh",
        "resultat",
        "diagnostic",
      ],
      zone_type: ["sau", "uhcd", "dechocage"],
    },
  },
} as const
