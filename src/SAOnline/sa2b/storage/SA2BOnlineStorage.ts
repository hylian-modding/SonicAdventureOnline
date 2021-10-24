import { ISA2BSyncSave } from '../../common/types/SA2BAliases';
import { SA2BOnlineStorageBase } from './SA2BOnlineStorageBase';
import * as API from 'SACore/API/imports';
import { IFakeArray } from 'SACore/src/Common/types/FakeArray';

export class SA2BOnlineStorage extends SA2BOnlineStorageBase {
  networkPlayerInstances: any = {};
  players: any = {};
  worlds: Array<SA2BOnlineSave_Server> = [];
  saveGameSetup = false;
}

export interface ISA2BSyncSaveServer extends ISA2BSyncSave {
}

class SA2BSyncSaveServer implements ISA2BSyncSaveServer {
  checksum!: number; // 0x4
  dword_1DEC604!: number; // 0x4
  anonymous_0!: number; // 0x1
  anonymous_1!: number; // 0x1
  anonymous_2!: number; // 0x1
  anonymous_3!: number; // 0x1
  anonymous_4!: number; // 0x1
  anonymous_5!: number; // 0x1
  emblem_count!: number; // 0x1
  anonymous_6!: number; // 0x1
  last_character!: number; // 0x1
  last_level!: number; // 0x1
  anonymous_9!: number; // 0x1
  anonymous_10!: number; // 0x1
  gap_14!: Buffer; // 0x8
  anonymous_11!: number; // 0x2
  anonymous_12!: number; // 0x2
  anonymous_13!: number; // 0x2
  anonymous_14!: number; // 0x2
  dword_1DEC624!: number; // 0x4
  dword_1DEC628!: number; // 0x4
  play_time!: number; // 0x4
  total_rings!: number; // 0x4
  dword_1DEC634!: number; // 0x4
  levels!: IFakeArray<API.SA2B.ISaveLevelInfo>; // 62 * 0xC4; 0x2F78
  kart_race!: IFakeArray<API.SA2B.ISaveKartInfo>; // 3 * 0xD
  anonymous_80!: number; // 0x1
  anonymous_81!: number; // 0x1
  gap_2fd9!: Buffer; // 0x17
  hero_boss_attack!: API.SA2B.ISaveBossInfo; // 0xAD
  gap_309d!: Buffer; // 0x17
  dark_boss_attack!: API.SA2B.ISaveBossInfo; // 0xAD
  gap_3161!: Buffer; // 0x17
  all_boss_attack!: API.SA2B.ISaveBossInfo; // 0xAD
}

export class SA2BOnlineSave_Server {
  saveGameSetup = false;
  save: ISA2BSyncSaveServer = new SA2BSyncSaveServer();
}