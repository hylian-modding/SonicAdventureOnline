import { ISADXSyncSave } from '../../common/types/SADXAliases';
import { SADXOnlineStorageBase } from './SADXOnlineStorageBase';

export class SADXOnlineStorage extends SADXOnlineStorageBase {
  networkPlayerInstances: any = {};
  players: any = {};
  worlds: Array<SADXOnlineSave_Server> = [];
  saveGameSetup = false;
}

export interface ISADXSyncSaveServer extends ISADXSyncSave {
  rings: number;
}

class SADXSyncSaveServer implements ISADXSyncSaveServer {
  rings!: number;
}

export class SADXOnlineSave_Server {
  saveGameSetup = false;
  save: ISADXSyncSaveServer = new SADXSyncSaveServer();
}