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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_abuse_reports: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          reason: string
          reviewed: boolean
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          reason?: string
          reviewed?: boolean
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          reason?: string
          reviewed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_abuse_reports_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "live_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          alert_id: string | null
          created_at: string
          detail: Json
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          alert_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          alert_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_audit_log_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "live_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_confirmations: {
        Row: {
          alert_id: string
          created_at: string
          distance_m: number | null
          id: string
          response: Database["public"]["Enums"]["alert_confirm_response"]
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          distance_m?: number | null
          id?: string
          response: Database["public"]["Enums"]["alert_confirm_response"]
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          distance_m?: number | null
          id?: string
          response?: Database["public"]["Enums"]["alert_confirm_response"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_confirmations_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "live_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_alerts: {
        Row: {
          abuse_count: number
          confidence: number
          confirm_count: number
          created_at: string
          description: string
          expires_at: string
          id: string
          improved_count: number
          kind: Database["public"]["Enums"]["live_alert_kind"]
          last_confirmed_at: string
          lat: number
          lng: number
          media_url: string | null
          neighborhood: string
          notfound_count: number
          severity: Database["public"]["Enums"]["live_alert_severity"]
          source: string
          status: Database["public"]["Enums"]["live_alert_status"]
          user_id: string | null
        }
        Insert: {
          abuse_count?: number
          confidence?: number
          confirm_count?: number
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          improved_count?: number
          kind: Database["public"]["Enums"]["live_alert_kind"]
          last_confirmed_at?: string
          lat: number
          lng: number
          media_url?: string | null
          neighborhood?: string
          notfound_count?: number
          severity?: Database["public"]["Enums"]["live_alert_severity"]
          source?: string
          status?: Database["public"]["Enums"]["live_alert_status"]
          user_id?: string | null
        }
        Update: {
          abuse_count?: number
          confidence?: number
          confirm_count?: number
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          improved_count?: number
          kind?: Database["public"]["Enums"]["live_alert_kind"]
          last_confirmed_at?: string
          lat?: number
          lng?: number
          media_url?: string | null
          neighborhood?: string
          notfound_count?: number
          severity?: Database["public"]["Enums"]["live_alert_severity"]
          source?: string
          status?: Database["public"]["Enums"]["live_alert_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          neighborhood: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          neighborhood?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          neighborhood?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string
          hazard: Database["public"]["Enums"]["hazard_type"]
          id: string
          lat: number | null
          lng: number | null
          neighborhood: string
          occurred_at: string
          photo_url: string | null
          severity: number
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          hazard: Database["public"]["Enums"]["hazard_type"]
          id?: string
          lat?: number | null
          lng?: number | null
          neighborhood: string
          occurred_at?: string
          photo_url?: string | null
          severity?: number
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          hazard?: Database["public"]["Enums"]["hazard_type"]
          id?: string
          lat?: number | null
          lng?: number | null
          neighborhood?: string
          occurred_at?: string
          photo_url?: string | null
          severity?: number
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_zones: {
        Row: {
          created_at: string
          description: string | null
          hazard: Database["public"]["Enums"]["hazard_type"]
          id: string
          lat: number
          lng: number
          name: string
          radius_m: number
          risk_level: string
          source: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hazard: Database["public"]["Enums"]["hazard_type"]
          id?: string
          lat: number
          lng: number
          name: string
          radius_m?: number
          risk_level?: string
          source?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hazard?: Database["public"]["Enums"]["hazard_type"]
          id?: string
          lat?: number
          lng?: number
          name?: string
          radius_m?: number
          risk_level?: string
          source?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          event_date: string
          hazard: Database["public"]["Enums"]["hazard_type"] | null
          id: string
          image_url: string | null
          source_url: string | null
          summary: string
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          event_date: string
          hazard?: Database["public"]["Enums"]["hazard_type"] | null
          id?: string
          image_url?: string | null
          source_url?: string | null
          summary: string
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string
          hazard?: Database["public"]["Enums"]["hazard_type"] | null
          id?: string
          image_url?: string | null
          source_url?: string | null
          summary?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_reports: {
        Row: {
          created_at: string | null
          description: string | null
          hazard: Database["public"]["Enums"]["hazard_type"] | null
          id: string | null
          lat: number | null
          lng: number | null
          neighborhood: string | null
          occurred_at: string | null
          photo_url: string | null
          severity: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hazard?: Database["public"]["Enums"]["hazard_type"] | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          occurred_at?: string | null
          photo_url?: string | null
          severity?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hazard?: Database["public"]["Enums"]["hazard_type"] | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          occurred_at?: string | null
          photo_url?: string | null
          severity?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approx_distance_m: {
        Args: { _lat1: number; _lat2: number; _lng1: number; _lng2: number }
        Returns: number
      }
      expire_live_alerts: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
      live_alert_ttl: {
        Args: { _kind: Database["public"]["Enums"]["live_alert_kind"] }
        Returns: string
      }
      recalc_live_alert: { Args: { _alert_id: string }; Returns: undefined }
    }
    Enums: {
      alert_confirm_response: "continua" | "melhorou" | "nao_encontrado"
      app_role: "admin" | "moderator" | "user"
      hazard_type:
        | "alagamento"
        | "deslizamento"
        | "vendaval"
        | "ressaca"
        | "outro"
      live_alert_kind:
        | "alagamento"
        | "deslizamento"
        | "risco_deslizamento"
        | "enxurrada"
        | "queda_arvore"
        | "queda_poste"
        | "falta_energia"
        | "rua_interditada"
        | "danos_estruturais"
      live_alert_severity: "baixo" | "moderado" | "alto" | "critico"
      live_alert_status: "ativo" | "expirado" | "oculto"
      report_status: "pendente" | "aprovado" | "rejeitado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      alert_confirm_response: ["continua", "melhorou", "nao_encontrado"],
      app_role: ["admin", "moderator", "user"],
      hazard_type: [
        "alagamento",
        "deslizamento",
        "vendaval",
        "ressaca",
        "outro",
      ],
      live_alert_kind: [
        "alagamento",
        "deslizamento",
        "risco_deslizamento",
        "enxurrada",
        "queda_arvore",
        "queda_poste",
        "falta_energia",
        "rua_interditada",
        "danos_estruturais",
      ],
      live_alert_severity: ["baixo", "moderado", "alto", "critico"],
      live_alert_status: ["ativo", "expirado", "oculto"],
      report_status: ["pendente", "aprovado", "rejeitado"],
    },
  },
} as const
