import { ISA2BSyncSave } from '../../common/types/SA2BAliases';
import { SA2BOnlineStorageBase } from './SA2BOnlineStorageBase';
import * as API from 'SACore/API/imports';
import { IFakeArray } from 'SACore/src/Common/types/FakeArray';
import { IChaoData, IChaoGarden } from 'SACore/API/Common/Chao/ChaoAPI';

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

export interface SA2BChaoGardenStorage {
  chaos: Pick<IChaoGarden, 'chaos'>;
}

export class SA2BChaoDataStorage implements IChaoData {
  name!: string;
  gap_019!: Buffer;
  swim_fraction!: number;
  fly_fraction!: number;
  gap_000!: Buffer;
  run_fraction!: number;
  power_fraction!: number;
  stamina_fraction!: number;
  lucky_fraction!: number;
  intelligence_fraction!: number;
  unknown_fraction!: number;
  swim_grade!: API.ChaoAPI.Grade;
  fly_grade!: API.ChaoAPI.Grade;
  run_grade!: API.ChaoAPI.Grade;
  power_grade!: API.ChaoAPI.Grade;
  stamina_grade!: API.ChaoAPI.Grade;
  lucky_grade!: number;
  intelligence_grade!: number;
  unknown_grade!: number;
  swim_level!: number;
  fly_level!: number;
  run_level!: number;
  power_level!: number;
  stamina_level!: number;
  luck_level!: number;
  intelligence_level!: number;
  unknown_level!: number;
  swim_stat!: number;
  fly_stat!: number;
  run_stat!: number;
  power_stat!: number;
  stamina_stat!: number;
  luck_stat!: number;
  intelligence_stat!: number;
  unknown_stat!: number;
  field_046!: Buffer;
  type!: API.ChaoAPI.ChaoType;
  garden!: API.ChaoAPI.ChaoGarden;
  happiness!: number;
  field_084!: Buffer;
  clock_rollovers!: number;
  field_088!: Buffer;
  lifespan!: number;
  lifespan2!: number;
  reincarnations!: number;
  field_090!: Buffer;
  power_run!: number;
  fly_swim!: number;
  alignment!: number;
  gap_0B4!: Buffer;
  evolution_progress!: number;
  gap_0C4!: Buffer;
  eye_type!: API.ChaoAPI.Eyes;
  mouth_type!: API.ChaoAPI.Mouth;
  ball_type!: API.ChaoAPI.Emotiball;
  gap_0D4!: Buffer;
  headgear!: API.ChaoAPI.SADXHat | API.ChaoAPI.SA2BHat;
  hide_feet!: boolean;
  medal!: API.ChaoAPI.Medal;
  color!: API.ChaoAPI.SADXColor | API.ChaoAPI.SA2BColor;
  monotone_highlights!: boolean;
  texture!: API.ChaoAPI.SADXTexture | API.ChaoAPI.SA2BTexture;
  shiny!: boolean;
  egg_color!: API.ChaoAPI.SADXEggColor | API.ChaoAPI.SA2BEggColor;
  body_type!: API.ChaoAPI.SADXBodyType | API.ChaoAPI.SA2BBodyType;
  body_type_animal!: number;
  field_0DF!: Buffer;
  sa2_animal_behaviors!: API.ChaoAPI.ISA2BAnimalFlags;
  sa2b_arm_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_ear_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_forehead_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_horn_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_leg_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_tail_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_wing_type!: API.ChaoAPI.SA2BAnimal;
  sa2b_face_type!: API.ChaoAPI.SA2BAnimal;
  field_124!: Buffer;
  joy!: number;
  field_12D!: Buffer;
  urge_to_cry!: number;
  fear!: number;
  field_130!: Buffer;
  dizziness!: number;
  field_132!: Buffer;
  sleepiness!: number;
  tiredness!: number;
  hunger!: number;
  mate_desire!: number;
  boredom!: number;
  field_13E!: Buffer;
  energy!: number;
  normal_curiosity!: number;
  field_14B!: Buffer;
  cry_baby_energetic!: number;
  naive_normal!: number;
  field_14E!: Buffer;
  normal_bigeater!: number;
  field_151!: Buffer;
  normal_carefree!: number;
  field_156!: Buffer;
  favorite_fruit!: API.ChaoAPI.FavoriteFruit;
  field_158!: Buffer;
  cough_level!: number;
  cold_level!: number;
  rash_level!: number;
  runny_nose_level!: number;
  hiccups_level!: number;
  stomach_ache_level!: number;
  sa2b_skills!: API.ChaoAPI.IClassroomLessonFlags;
  sa2b_toys!: API.ChaoAPI.IToyFlags;
  field_166!: Buffer;
  sa2b_character_bonds!: API.ChaoAPI.ISA2BCharacterBonds;
  field_190!: Buffer;
  dna!: API.ChaoAPI.IChaoDNA;
  field_4DC!: Buffer;
  sadx_animal_behaviors!: API.ChaoAPI.ISADXAnimalFlags;
  arm_type!: API.ChaoAPI.SADXAnimal;
  ear_type!: API.ChaoAPI.SADXAnimal;
  eyebrow_type!: API.ChaoAPI.SADXAnimal;
  forehead_type!: API.ChaoAPI.SADXAnimal;
  leg_type!: API.ChaoAPI.SADXAnimal;
  tail_type!: API.ChaoAPI.SADXAnimal;
  wing_type!: API.ChaoAPI.SADXAnimal;
  unknown_type!: API.ChaoAPI.SADXAnimal;
  field_4EC!: Buffer;
  sadx_character_bonds!: API.ChaoAPI.ISADXCharacterBonds;
  pointer!: number;

}