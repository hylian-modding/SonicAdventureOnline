import { IChaoGarden } from "SACore/API/Common/Chao/ChaoAPI";
import { SA2BOSaveData } from "../save/SA2BOnlineSaveData";
import { SA2BChaoDataStorage } from "./SA2BOnlineStorage";
import * as API from "SACore/API/imports"

export class SA2BChaoGardenStorage implements Pick<IChaoGarden, 'chaos'>{
    chaos: API.ChaoAPI.IChaoData[] = [];
}

export class SA2BOnlineStorageBase {
    saveManager!: SA2BOSaveData;
    chao!: Pick<IChaoGarden, 'chaos'>;
}
