import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { InjectCore } from "modloader64_api/CoreInjection";
import { SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { IPacketHeader } from "modloader64_api/NetworkHandler";
import path from 'path';
import { ISA_Main } from "SACore/API/Common/ISA_Main";
import { Preinit } from "modloader64_api/PluginLifecycle";
import { ISA_GameMain } from "@SAOnline/common/types/Types";
import { ISA_ClientStorage } from "@SAOnline/common/storage/SA_Storage";

export interface ISADXOnlineLobbyConfig {
  data_syncing: boolean;
}

export class SADXOnlineConfigCategory {
}

export default class SADXOnline implements ISA_GameMain {

  ModLoader!: IModLoaderAPI;
  @InjectCore()
  core!: ISA_Main;
  @SidedProxy(ProxySide.CLIENT, path.resolve(__dirname, "SADXOnlineClient.js"))
  client!: any;
  @SidedProxy(ProxySide.SERVER, path.resolve(__dirname, "SADXOnlineServer.js"))
  server!: any;

  sendPacketToPlayersInLevel(packet: IPacketHeader): void {
    if (this.server !== undefined) {
      this.server.sendPacketToPlayersInLevel(packet);
    }
  }

  getClientStorage(): ISA_ClientStorage {
    return this.client !== undefined ? this.client.clientStorage : null;
  }

  @Preinit()
  preinit(): void {

  }

  getServerURL(): string {
    return "127.0.0.1:8082";
  }

}