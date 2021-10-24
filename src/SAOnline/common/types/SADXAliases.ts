import { ISaveContext } from "SACore/API/SADX/SADX_API";
import { SupportedGames } from "SACore/src/Common/types/GameAliases";

export type ISADXSaveContext = ISaveContext;

export interface ISADXSyncSave extends Pick<ISADXSaveContext, 'checksum' | 'play_time'| 'high_scores'| 'best_times'| 'best_weights'| 'anonymous_4'| 'most_rings'| 'sky_chase1_high_scores'| 'sky_chase2_high_scores'| 'ice_cap_high_scores'| 'sand_hill_high_scores'| 'hedgehog_hammer_high_score1'| 'hedgehog_hammer_high_score2'| 'hedgehog_hammer_high_score3'| 'twinkle_circuit_best_times'| 'boss_best_times'| 'emblems'| 'options'| 'lives'| 'last_character'| 'rumble'| 'gap_25b'| 'last_level'| 'gap_25e'| 'event_flags'| 'npc_flags'| 'gap_2e0'| 'adventure_data'| 'level_clear'| 'mission_flags'| 'black_market_rings'| 'metal_high_scores'| 'metal_best_times'| 'metal_most_rings'| 'gap_53a'| 'metal_ice_cap_high_scores'| 'metal_sand_hill_high_scores'| 'metal_twinkle_circuit_best_times'| 'metal_boss_best_times'| 'metal_emblems'> {
}

export const SADX_GAME: SupportedGames = SupportedGames.SADX_GC;