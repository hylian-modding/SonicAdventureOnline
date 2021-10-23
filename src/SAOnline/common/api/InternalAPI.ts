import { INetworkPlayer, IPacketHeader } from "modloader64_api/NetworkHandler";
import { ISA_Clientside } from "../storage/SA_Storage";
import { ISA_GameMain } from "../types/Types";

export const enum SAO_PRIVATE_EVENTS {
    DOING_SYNC_CHECK = "DOING_SYNC_CHECK",
}

export class SendToPlayer{
    packet: IPacketHeader;
    player: INetworkPlayer;

    constructor(player: INetworkPlayer, packet: IPacketHeader){
        this.packet = packet;
        this.player = player;
    }
}