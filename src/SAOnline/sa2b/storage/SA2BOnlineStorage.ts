import { ISA2BSyncSave } from '../../common/types/SA2BAliases';
import { SA2BOnlineStorageBase } from './SA2BOnlineStorageBase';

export class SA2BOnlineStorage extends SA2BOnlineStorageBase {
  networkPlayerInstances: any = {};
  players: any = {};
  worlds: Array<SA2BOnlineSave_Server> = [];
  saveGameSetup = false;
}

export interface ISA2BSyncSaveServer extends ISA2BSyncSave {
  rings: number;
}

class SA2BSyncSaveServer implements ISA2BSyncSaveServer {
  rings!: number;
}

export class SA2BOnlineSave_Server {
  saveGameSetup = false;
  save: ISA2BSyncSaveServer = new SA2BSyncSaveServer();
}