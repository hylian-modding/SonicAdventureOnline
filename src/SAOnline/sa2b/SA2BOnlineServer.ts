import { SAO_PRIVATE_EVENTS } from "@SAOnline/common/api/InternalAPI";
import { SAOnlineEvents, SA_PlayerLevel } from "@SAOnline/common/api/SA_API";
import { InjectCore } from "modloader64_api/CoreInjection";
import { EventHandler, EventsServer, EventServerJoined, EventServerLeft, bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI, IPlugin } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { IPacketHeader, LobbyData, ServerNetworkHandler } from "modloader64_api/NetworkHandler";
import { Preinit } from "modloader64_api/PluginLifecycle";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { ISA_Main } from "SACore/API/Common/ISA_Main";
import { SAO_LevelPacket, SAO_DownloadRequestPacket, SAO_DownloadResponsePacket, SAO_UpdateSaveDataPacket, SAO_ErrorPacket } from "../common/network/SAOPackets";
import { SA2BOSaveData } from "./save/SA2BOnlineSaveData";
import { SA2BOnlineStorage, SA2BOnlineSave_Server } from "./storage/SA2BOnlineStorage";
import SA_Serialize from "@SAOnline/common/storage/SA_Serialize";

export default class SA2BOnlineServer {

    @InjectCore()
    core!: ISA_Main;
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    @ParentReference()
    parent!: IPlugin;

    sendPacketToPlayersInLevel(packet: IPacketHeader) {
        try {
            let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
                packet.lobby,
                this.parent
            ) as SA2BOnlineStorage;
            if (storage === null) {
                return;
            }
            Object.keys(storage.players).forEach((key: string) => {
                if (storage.players[key] === storage.players[packet.player.uuid]) {
                    if (storage.networkPlayerInstances[key].uuid !== packet.player.uuid) {
                        this.ModLoader.serverSide.sendPacketToSpecificPlayer(
                            packet,
                            storage.networkPlayerInstances[key]
                        );
                    }
                }
            });
        } catch (err: any) { }
    }

    @EventHandler(EventsServer.ON_LOBBY_CREATE)
    onLobbyCreated(lobby: string) {
        try {
            this.ModLoader.lobbyManager.createLobbyStorage(lobby, this.parent, new SA2BOnlineStorage());
            let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
                lobby,
                this.parent
            ) as SA2BOnlineStorage;
            if (storage === null) {
                return;
            }
            storage.saveManager = new SA2BOSaveData(this.core.SA2B!, this.ModLoader);
        }
        catch (err: any) {
            this.ModLoader.logger.error(err);
        }
    }

    @Preinit()
    preinit() {

    }

    @EventHandler(EventsServer.ON_LOBBY_DATA)
    onLobbyData(ld: LobbyData) {
    }

    @EventHandler(EventsServer.ON_LOBBY_JOIN)
    onPlayerJoin_server(evt: EventServerJoined) {
        let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            evt.lobby,
            this.parent
        ) as SA2BOnlineStorage;
        if (storage === null) {
            return;
        }
        storage.players[evt.player.uuid] = -1;
        storage.networkPlayerInstances[evt.player.uuid] = evt.player;
    }

    @EventHandler(EventsServer.ON_LOBBY_LEAVE)
    onPlayerLeft_server(evt: EventServerLeft) {
        let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            evt.lobby,
            this.parent
        ) as SA2BOnlineStorage;
        if (storage === null) {
            return;
        }
        delete storage.players[evt.player.uuid];
        delete storage.networkPlayerInstances[evt.player.uuid];
    }

    @ServerNetworkHandler('SAO_LevelPacket')
    onLevelChange_server(packet: SAO_LevelPacket) {
        try {
            let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
                packet.lobby,
                this.parent
            ) as SA2BOnlineStorage;
            if (storage === null) {
                return;
            }
            storage.players[packet.player.uuid] = packet.Level;
            this.ModLoader.logger.info(
                'Server: Player ' +
                packet.player.nickname +
                ' moved to Level ' +
                packet.Level +
                '.'
            );
            bus.emit(SAOnlineEvents.SERVER_PLAYER_CHANGED_LEVELS, new SA_PlayerLevel(packet.player, packet.lobby, packet.Level));
        } catch (err: any) {
        }
    }

    // Client is logging in and wants to know how to proceed.
    @ServerNetworkHandler('SAO_DownloadRequestPacket')
    onDownloadPacket_server(packet: SAO_DownloadRequestPacket) {
        let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as SA2BOnlineStorage;
        if (storage === null) {
            return;
        }
        if (typeof storage.worlds[packet.player.data.world] === 'undefined') {
            this.ModLoader.logger.info(`Creating world ${packet.player.data.world} for lobby ${packet.lobby}.`);
            storage.worlds[packet.player.data.world] = new SA2BOnlineSave_Server();
        }
        let world = storage.worlds[packet.player.data.world];
        if (world.saveGameSetup) {
            // Game is running, get data.
            let resp = new SAO_DownloadResponsePacket(packet.lobby, false);
            SA_Serialize.serialize(world.save).then((buf: Buffer) => {
                resp.save = buf;
                this.ModLoader.serverSide.sendPacketToSpecificPlayer(resp, packet.player);
            }).catch((err: string) => { });
        } else {
            // Game is not running, give me your data.
            SA_Serialize.deserialize(packet.save).then((data: any) => {
                Object.keys(data).forEach((key: string) => {
                    let obj = data[key];
                    world.save[key] = obj;
                });
                world.saveGameSetup = true;
                let resp = new SAO_DownloadResponsePacket(packet.lobby, true);
                this.ModLoader.serverSide.sendPacketToSpecificPlayer(resp, packet.player);
            });
        }
    }

    //------------------------------
    // Flag Syncing
    //------------------------------

    @ServerNetworkHandler('SAO_UpdateSaveDataPacket')
    onLevelFlagSync_server(packet: SAO_UpdateSaveDataPacket) {
        let storage: SA2BOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
            packet.lobby,
            this.parent
        ) as SA2BOnlineStorage;
        if (storage === null) {
            return;
        }
        if (typeof storage.worlds[packet.player.data.world] === 'undefined') {
            if (packet.player.data.world === undefined){
                this.ModLoader.serverSide.sendPacket(new SAO_ErrorPacket("The server has encountered an error with your world. (world id is undefined)", packet.lobby));
                return;
            }else{
                storage.worlds[packet.player.data.world] = new SA2BOnlineSave_Server();
            }
        }
        let world = storage.worlds[packet.player.data.world];
        storage.saveManager.mergeSave(packet.save, world.save, ProxySide.SERVER).then((bool: boolean) => {
            if (bool) {
                SA_Serialize.serialize(world.save).then((buf: Buffer) => {
                    this.ModLoader.serverSide.sendPacket(new SAO_UpdateSaveDataPacket(packet.lobby, buf, packet.player.data.world));
                }).catch((err: string) => { });
            }
        });
    }
}