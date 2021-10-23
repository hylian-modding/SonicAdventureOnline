import { ISaveContext } from "SACore/API/SADX/SADX_API";
import { SupportedGames } from "SACore/src/Common/types/GameAliases";

export type ISADXSaveContext = ISaveContext;

export interface ISADXSyncSave extends Pick<ISADXSaveContext, 'rings'> {
}

export const SADX_GAME: SupportedGames = SupportedGames.SADX_GC;