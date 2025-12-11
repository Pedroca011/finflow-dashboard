import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase/supabase.service";

@Module({
    controllers: [],
    providers: [SupabaseService],
})

export class SupabaseModule {}