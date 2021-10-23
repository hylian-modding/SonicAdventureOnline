import { IKeyRing } from "@SAOnline/common/save/IKeyRing";
import { ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { ISA_SyncSave } from "../types/Types";

export interface ISaveSyncData {
    hash: string;
    createSave(): Buffer;
    forceOverrideSave(save: Buffer, storage: ISA_SyncSave, side: ProxySide): void;
    mergeSave(save: Buffer, storage: ISA_SyncSave, side: ProxySide): Promise<boolean>;
    applySave(save: Buffer): void;
}
