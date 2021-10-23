import { INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { bus } from 'modloader64_api/EventHandler';
import { ExternalAPIProvider } from 'modloader64_api/ExternalAPIProvider';
import path from 'path';
import { number_ref } from 'modloader64_api/Sylvain/ImGui';
import { Level } from '../types/Types';

@ExternalAPIProvider("SA_API", "3.1.0", path.resolve(__dirname))
export class SAOnlineAPIProvider {
}

export enum SAOnlineEvents {
  SERVER_PLAYER_CHANGED_LEVELS = 'SAOnline:onServerPlayerChangedLevels',
  CLIENT_REMOTE_PLAYER_CHANGED_LEVELS = 'SAOnline:onRemotePlayerChangedLevels',
  ON_INVENTORY_UPDATE = 'SAOnline:OnInventoryUpdate',
  SAVE_DATA_ITEM_SET = 'SAOnline:SAVE_DATA_ITEM_SET',
}

export class SA_PlayerLevel {
  player: INetworkPlayer;
  lobby: string;
  Level: Level;

  constructor(player: INetworkPlayer, lobby: string, Level: Level) {
    this.player = player;
    this.Level = Level;
    this.lobby = lobby;
  }
}

export class SA__SaveDataItemSet {
  key: string;
  value: boolean | number | Buffer;

  constructor(key: string, value: boolean | number | Buffer) {
    this.key = key;
    this.value = value;
  }
}