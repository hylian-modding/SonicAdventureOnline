import { ISaveContext } from "SACore/API/SA2B/SA2B_API";
import { SupportedGames } from "SACore/src/Common/types/GameAliases";

export type ISA2BSaveContext = ISaveContext;

export interface ISA2BSyncSave extends Pick<ISA2BSaveContext, 'checksum' | 'dword_1DEC604' | 'anonymous_0' | 'anonymous_1' | 'anonymous_2' |
 'anonymous_3' | 'anonymous_4' | 'anonymous_5' | 'emblem_count' | 'anonymous_6' | 'last_character' | 'last_level' | 'anonymous_9' | 
 'anonymous_10' | 'gap_14' | 'anonymous_11' | 'anonymous_12' | 'anonymous_13' | 'anonymous_14' | 'dword_1DEC624' | 'dword_1DEC628' | 
 'play_time' | 'total_rings' | 'dword_1DEC634' | 'levels' | 'kart_race' | 'anonymous_80' | 'anonymous_81' | 'gap_2fd9' | 
 'hero_boss_attack' | 'gap_309d' | 'dark_boss_attack' | 'gap_3161' | 'all_boss_attack'> {
}

export const SA2B_GAME: SupportedGames = SupportedGames.SA2B_GC;