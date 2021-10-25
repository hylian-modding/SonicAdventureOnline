import { IChaoGarden } from 'SACore/API/Common/Chao/ChaoAPI';
import { SA2BOnlineStorageBase } from './SA2BOnlineStorageBase';

export class SA2BOnlineStorageClient extends SA2BOnlineStorageBase {
  world: number = 0;
  first_time_sync = false;
  lastPushHash = "!";
  localization: any = {};
  level_keys: any = {};
}
