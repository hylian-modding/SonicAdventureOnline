import { ISaveContext } from "SACore/API/SA2B/SA2B_API";
import { SupportedGames } from "SACore/src/Common/types/GameAliases";

export type ISA2BSaveContext = ISaveContext;

export interface ISA2BSyncSave extends Pick<ISA2BSaveContext, 'rings'> {
}

export const SA2B_GAME: SupportedGames = SupportedGames.SA2B_GC;