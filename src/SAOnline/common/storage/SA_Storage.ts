
export interface ISA_ClientStorage{
    world: number;
    localization: any;
}

export interface ISA_Clientside {
    getClientStorage(): ISA_ClientStorage;
}