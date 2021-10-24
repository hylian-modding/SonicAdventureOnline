import {
  Packet
} from 'modloader64_api/ModLoaderDefaultImpls';
import { INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { Level } from '../types/Types';
import { ChaoGarden } from 'SACore/src/Common/Chao/ChaoGarden';

export class PacketWithTimeStamp extends Packet{
  timestamp: number = Date.now();
}

export class SAO_RingPacket extends PacketWithTimeStamp {
  delta: number;

  constructor(delta: number, lobby: string){
    super('SAO_RingPacket', 'SAOnline', lobby, true);
    this.delta = delta;
  }
}

export class SAO_LevelPacket extends Packet {
  Level: Level;

  constructor(lobby: string, Level: Level) {
    super('SAO_LevelPacket', 'SAOnline', lobby, true);
    this.Level = Level;
  }
}

export class SAO_LevelRequestPacket extends Packet {
  constructor(lobby: string) {
    super('SAO_LevelRequestPacket', 'SAOnline', lobby, true);
  }
}

export class SAO_DownloadResponsePacket extends Packet {

  save?: Buffer;
  host: boolean;

  constructor(lobby: string, host: boolean) {
    super('SAO_DownloadResponsePacket', 'SAOnline', lobby, false);
    this.host = host;
  }
}

export class SAO_DownloadRequestPacket extends Packet {

  save: Buffer;

  constructor(lobby: string, save: Buffer) {
    super('SAO_DownloadRequestPacket', 'SAOnline', lobby, false);
    this.save = save;
  }
}

export class SAO_UpdateSaveDataPacket extends Packet {

  save: Buffer;
  world: number;

  constructor(lobby: string, save: Buffer, world: number) {
    super('SAO_UpdateSaveDataPacket', 'SAOnline', lobby, false);
    this.save = save;
    this.world = world;
  }
}

export class SA2B_ChaoPacket extends Packet {
  chaoData: ChaoGarden;
  hash: number;

  constructor(chaoData: ChaoGarden, hash: number, lobby: string) {
    super('SAO_PermFlagsPacket', 'SAOnline', lobby, false);
    this.chaoData = chaoData;
    this.hash = hash;
  }
}
export class SAO_ErrorPacket extends Packet{

  message: string;

  constructor(msg: string, lobby: string){
    super('SAO_ErrorPacket', 'SAO', lobby, false);
    this.message = msg;
  }

}