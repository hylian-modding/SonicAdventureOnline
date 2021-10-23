import { ISA_Main } from "SACore/API/Common/ISA_Main";
import { ISA2BSaveContext, ISA2BSyncSave } from "./SA2BAliases";

import { IPluginServerConfig } from "modloader64_api/IModLoaderAPI";
import { ISADXSaveContext, ISADXSyncSave } from "./SADXAliases";


export type ISA_SaveContext = ISADXSaveContext | ISA2BSaveContext;
export type ISA_SyncSave = ISADXSyncSave | ISA2BSyncSave;
export type Level = number;
export type Core = ISA_Main;

export interface ISA_GameMain extends IPluginServerConfig{
}