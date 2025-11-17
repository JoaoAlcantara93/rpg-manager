// src/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      initiative_entries: {
        Row: {
          created_at: string
          id: string
          initiative_value: number
          name: string
          position: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiative_value: number
          name: string
          position: number
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initiative_value?: number
          name?: string
          position?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      npcs: {
        Row: {
          attributes: Json
          campaign_id: string; // NOVO
          created_at: string
          id: string
          name: string
          spells: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          attributes?: Json
          campaign_id: string; // NOVO
          created_at?: string
          id?: string
          name: string
          spells?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          attributes?: Json
          campaign_id: string; // NOVO
          created_at?: string
          id?: string
          name?: string
          spells?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          ac: number | null
          attributes: Json
          character_class: string | null
          created_at: string
          hp_current: number | null
          hp_max: number | null
          id: string
          level: number | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ac?: number | null
          attributes?: Json
          character_class?: string | null
          created_at?: string
          hp_current?: number | null
          hp_max?: number | null
          id?: string
          level?: number | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ac?: number | null
          attributes?: Json
          character_class?: string | null
          created_at?: string
          hp_current?: number | null
          hp_max?: number | null
          id?: string
          level?: number | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          system: string
          status: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          system?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          system?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Aliases para facilitar o uso
export type Tables = Database['public']['Tables']
export type Campaign = Tables['campaigns']['Row']
export type CampaignInsert = Tables['campaigns']['Insert']
export type CampaignUpdate = Tables['campaigns']['Update']

export type Npc = Tables['npcs']['Row']
export type NpcInsert = Tables['npcs']['Insert']
export type NpcUpdate = Tables['npcs']['Update']

export type Player = Tables['players']['Row']
export type PlayerInsert = Tables['players']['Insert']
export type PlayerUpdate = Tables['players']['Update']

export type InitiativeEntry = Tables['initiative_entries']['Row']
export type InitiativeEntryInsert = Tables['initiative_entries']['Insert']
export type InitiativeEntryUpdate = Tables['initiative_entries']['Update']

export type Profile = Tables['profiles']['Row']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProfileUpdate = Tables['profiles']['Update']

// Tipos auxiliares para formulários
export interface CampaignFormData {
  name: string
  system: string
  description: string
}

export interface NpcFormData {
  name: string
  attributes: Json
  spells: Json
  current_hp?: number
  max_hp?: number
  armor_class?: number
  fortitude_save?: number
  reflex_save?: number
  will_save?: number
  perception?: number
  attacks?: string
  image_url?: string
  observation?: string
}

export interface PlayerFormData {
  name: string
  character_class?: string
  level?: number
  hp_current?: number
  hp_max?: number
  ac?: number
  attributes?: Json
  notes?: string
}

// Tipos para selects
export type SystemType = 
  | 'D&D 5e'
  | 'Pathfinder'
  | 'Call of Cthulhu'
  | 'Shadowrun'
  | 'Cyberpunk Red'
  | 'Tormenta20'
  | 'Ordem Paranormal'
  | 'Outro'

export type CampaignStatus = 
  | 'active'
  | 'inactive'
  | 'completed'
  | 'on_hold'

// Restante do código permanece igual...
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables_Old<
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

export type TablesInsert_Old<
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

export type TablesUpdate_Old<
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
    Enums: {},
  },
} as const