import { ISA2BSyncSave } from "@SAOnline/common/types/SA2BAliases";
import { IKeyRing } from "@SAOnline/common/save/IKeyRing";
import { SAOnlineEvents, SA__SaveDataItemSet } from "@SAOnline/common/api/SA_API";
import { bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { ISaveSyncData } from "@SAOnline/common/save/ISaveSyncData";
import { ISA2BCore } from 'SACore/API/SA2B/SA2B_API'
import fs from 'fs';
import SA_Serialize from "@SAOnline/common/storage/SA_Serialize";

export class SA2BOSaveData implements ISaveSyncData {

  private core: ISA2BCore;
  private ModLoader: IModLoaderAPI;
  hash: string = "";

  constructor(core: ISA2BCore, ModLoader: IModLoaderAPI) {
    this.core = core;
    this.ModLoader = ModLoader;
  }

  private generateWrapper(): ISA2BSyncSave {
    let obj: any = {};
    let keys = [
      'total_rings',
      'levels',
      'emblem_count'
    ];
    obj = JSON.parse(JSON.stringify(this.core.save));
    let obj2: any = {};
    for (let i = 0; i < keys.length; i++) {
      obj2[keys[i]] = obj[keys[i]];
    }
    return obj2 as ISA2BSyncSave;
  }

  createSave(): Buffer {
    let obj = this.generateWrapper();
    let buf = SA_Serialize.serializeSync(obj);
    this.hash = this.ModLoader.utils.hashBuffer(buf);
    return buf;
  }

  private processBoolLoop(obj1: any, obj2: any) {
    Object.keys(obj1).forEach((key: string) => {
      if (typeof (obj1[key]) === 'boolean') {
        if (obj1[key] === true && obj2[key] === false) {
          obj2[key] = true;
          bus.emit(SAOnlineEvents.SAVE_DATA_ITEM_SET, new SA__SaveDataItemSet(key, obj2[key]));
        }
      }
    });
  }

  private processMixedLoop(obj1: any, obj2: any, blacklist: Array<string>) {
    Object.keys(obj1).forEach((key: string) => {
      if (blacklist.indexOf(key) > -1) return;
      if (typeof (obj1[key]) === 'boolean') {
        if (obj1[key] === true && obj2[key] === false) {
          obj2[key] = obj1[key];
          bus.emit(SAOnlineEvents.SAVE_DATA_ITEM_SET, new SA__SaveDataItemSet(key, obj2[key]));
        }
      } else if (typeof (obj1[key]) === 'number') {
        if (obj1[key] > obj2[key]) {
          obj2[key] = obj1[key];
          bus.emit(SAOnlineEvents.SAVE_DATA_ITEM_SET, new SA__SaveDataItemSet(key, obj2[key]));
        }
      }
    });
  }

  private processBoolLoop_OVERWRITE(obj1: any, obj2: any) {
    Object.keys(obj1).forEach((key: string) => {
      if (typeof (obj1[key]) === 'boolean') {
        obj2[key] = obj1[key];
      }
    });
  }

  private processMixedLoop_OVERWRITE(obj1: any, obj2: any, blacklist: Array<string>) {
    Object.keys(obj1).forEach((key: string) => {
      if (blacklist.indexOf(key) > -1) return;
      if (typeof (obj1[key]) === 'boolean') {
        obj2[key] = obj1[key];
      } else if (typeof (obj1[key]) === 'number') {
        obj2[key] = obj1[key];
      }
    });
  }

  private isGreaterThan(obj1: number, obj2: number) {
    if (obj1 === 255) obj1 = 0;
    if (obj2 === 255) obj2 = 0;
    return (obj1 > obj2);
  }

  private isNotEqual(obj1: number, obj2: number) {
    if (obj1 === 255) obj1 = 0;
    if (obj2 === 255) obj2 = 0;
    return (obj1 !== obj2);
  }

  forceOverrideSave(save: Buffer, storage: ISA2BSyncSave, side: ProxySide) {
    try {
      let obj: ISA2BSyncSave = SA_Serialize.deserializeSync(save);

      //for (let i = 0; i < obj.levels.length; i++) {
      //  let x = obj.levels[i]
      //  let y = storage.levels[i]
      //
      //  for(let j = 0; j < x.ranks.length; j++){
      //    y.ranks[j] = x.ranks[j];
      //  }
      //  for(let j = 0; j < x.scores.length; j++){
      //    y.scores[j].rings = x.scores[j].rings;
      //    y.scores[j].score = x.scores[j].score;
      //  }
      //  for(let j = 0; j < x.play_counts.length; j++){
      //    y.play_counts[j] = x.play_counts[j];
      //  }
      //}

      storage.emblem_count = obj.emblem_count;

    } catch (err: any) {
      console.log(err.stack);
    }
  }


  mergeSave(save: Buffer, storage: ISA2BSyncSave, side: ProxySide): Promise<boolean> {
    return new Promise((accept, reject) => {
      SA_Serialize.deserialize(save).then((obj: ISA2BSyncSave) => {
        // Another title screen safety check.
        //if (obj.checksum === 0) {
        //  return;
        //}

        // Object.keys(obj.levels).forEach((key: string) => {
        //   if( typeof(obj[key] === ))
        // })

        //for (let i = 0; i < obj.levels.length; i++) {
        //  let x = obj.levels[i]
        //  let y = storage.levels[i]
        //
        //  for(let j = 0; j < x.ranks.length; j++){
        //    if(y.ranks[j] < x.ranks[j]) y.ranks[j] = x.ranks[j];
        //  }
        //  for(let j = 0; j < x.scores.length; j++){
        //    if(y.scores[j].rings < x.scores[j].rings) y.scores[j].rings = x.scores[j].rings;
        //    if(y.scores[j].score < x.scores[j].score) y.scores[j].score = x.scores[j].score;
        //  }
        //  for(let j = 0; j < x.play_counts.length; j++){
        //    if(y.play_counts[j] < x.play_counts[j]) y.play_counts[j] = x.play_counts[j];
        //  }
        //}

        if(storage.emblem_count < obj.emblem_count) storage.emblem_count = obj.emblem_count;

        accept(true);
      }).catch(() => {
        reject(false);
      });
    });
  }

  applySave(save: Buffer) {
    this.mergeSave(save, this.core.save as any, ProxySide.CLIENT).then((bool: boolean) => { }).catch((bool: boolean) => { });
  }

}