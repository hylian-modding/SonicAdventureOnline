import { SADXOnlineStorageBase } from './SADXOnlineStorageBase';

export class SADXOnlineStorageClient extends SADXOnlineStorageBase {
  world: number = 0;
  first_time_sync = false;
  lastPushHash = "!";
  localization: any = {};
  level_keys: any = {};
}
