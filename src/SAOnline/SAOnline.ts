import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { ISA_GameMain } from "./common/types/Types";
import { ProxySide, SidedProxy } from "modloader64_api/SidedProxy/SidedProxy";
import path from 'path';
import { SupportedGames } from "SACore/src/Common/types/GameAliases";
import { current_game } from "SACore/src/SACore";

export default class SAOnline implements ISA_GameMain {

    @SidedProxy(ProxySide.UNIVERSAL, path.resolve(__dirname, "sa2b", "SA2BOnline.js"), "SACore", () => { return current_game === SupportedGames.SA2B_GC })
    SA2B!: ISA_GameMain;
    @SidedProxy(ProxySide.UNIVERSAL, path.resolve(__dirname, "sadx", "SADXOnline.js"), "SACore", () => { return current_game === SupportedGames.SADX_GC })
    SADX!: ISA_GameMain;

    ModLoader!: IModLoaderAPI;

    init() {
        
    }

    getServerURL(): string {
        if (this.SA2B !== undefined) return this.SA2B.getServerURL();
        if (this.SADX !== undefined) return this.SADX.getServerURL();
        return "";
    }
}