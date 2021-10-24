import { ITime } from 'SACore/API/Common/ISACommonAPI';
import { ITwinkleCircuitTimes, IAdventureData } from 'SACore/API/SADX/SADX_API';
import { IFakeArray } from 'SACore/src/Common/types/FakeArray';
import { ISADXSyncSave } from '../../common/types/SADXAliases';
import { SADXOnlineStorageBase } from './SADXOnlineStorageBase';

export class SADXOnlineStorage extends SADXOnlineStorageBase {
  networkPlayerInstances: any = {};
  players: any = {};
  worlds: Array<SADXOnlineSave_Server> = [];
  saveGameSetup = false;
  rings = 0;
}

export interface ISADXSyncSaveServer extends ISADXSyncSave {
}

class SADXSyncSaveServer implements ISADXSyncSaveServer {
  checksum!: number;
  play_time!: number;
  high_scores!: IFakeArray<number>;
  best_times!: IFakeArray<ITime>;
  best_weights!: IFakeArray<number>;
  anonymous_4!: Buffer;
  most_rings!: IFakeArray<number>;
  sky_chase1_high_scores!: IFakeArray<number>;
  sky_chase2_high_scores!: IFakeArray<number>;
  ice_cap_high_scores!: IFakeArray<number>;
  sand_hill_high_scores!: IFakeArray<number>;
  hedgehog_hammer_high_score1!: number;
  hedgehog_hammer_high_score2!: number;
  hedgehog_hammer_high_score3!: number;
  twinkle_circuit_best_times!: IFakeArray<ITwinkleCircuitTimes>;
  boss_best_times!: IFakeArray<ITime>;
  emblems!: IFakeArray<number>;
  options!: number;
  lives!: IFakeArray<number>;
  last_character!: number;
  rumble!: number;
  gap_25b!: Buffer;
  last_level!: number;
  gap_25e!: Buffer;
  event_flags!: Buffer;
  npc_flags!: IFakeArray<number>;
  gap_2e0!: Buffer;
  adventure_data!: IFakeArray<IAdventureData>;
  level_clear!: IFakeArray<number>;
  mission_flags!: IFakeArray<number>;
  black_market_rings!: number;
  metal_high_scores!: IFakeArray<number>;
  metal_best_times!: IFakeArray<ITime>;
  metal_most_rings!: IFakeArray<number>;
  gap_53a!: Buffer;
  metal_ice_cap_high_scores!: IFakeArray<number>;
  metal_sand_hill_high_scores!: IFakeArray<number>;
  metal_twinkle_circuit_best_times!: ITwinkleCircuitTimes;
  metal_boss_best_times!: IFakeArray<ITime>;
  metal_emblems!: number;
}

export class SADXOnlineSave_Server {
  saveGameSetup = false;
  save: ISADXSyncSaveServer = new SADXSyncSaveServer();
}