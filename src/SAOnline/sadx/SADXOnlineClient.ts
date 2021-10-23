import { SAOnlineEvents, SA_PlayerLevel, SA__SaveDataItemSet } from "@SAOnline/common/api/SA_API";
import path from "path";
import { InjectCore } from "modloader64_api/CoreInjection";
import { DiscordStatus } from "modloader64_api/Discord";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI, IPlugin, ModLoaderEvents } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { Preinit, Init, Postinit, onTick } from "modloader64_api/PluginLifecycle";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { ISA_Main } from "SACore/API/Common/ISA_Main";
import { SupportedGames } from "SACore/src/Common/types/GameAliases";
import { SAO_UpdateSaveDataPacket, SAO_DownloadRequestPacket, SAO_LevelPacket, SAO_LevelRequestPacket, SAO_DownloadResponsePacket } from "../common/network/SAOPackets";
import { ISADXOnlineLobbyConfig, SADXOnlineConfigCategory } from "./SADXOnline";
import { SADXOSaveData } from "./save/SADXOnlineSaveData";
import { SADXOnlineStorage } from "./storage/SADXOnlineStorage";
import { SADXOnlineStorageClient } from "./storage/SADXOnlineStorageClient";
import fs from 'fs';
import { SADXEvents } from "SACore/API/SADX/SADX_API";
import { SAO_PRIVATE_EVENTS } from "@SAOnline/common/api/InternalAPI";

export default class SADXOnlineClient {
    @InjectCore()
    core!: ISA_Main;

    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;

    @ParentReference()
    parent!: IPlugin;

    LobbyConfig: ISADXOnlineLobbyConfig = {} as ISADXOnlineLobbyConfig;
    clientStorage: SADXOnlineStorageClient = new SADXOnlineStorageClient();
    config!: SADXOnlineConfigCategory;

    syncContext: number = -1;
    syncTimer: number = 0;
    synctimerMax: number = 60 * 20;
    syncPending: boolean = false;

    @Preinit()
    preinit() {
        this.config = this.ModLoader.config.registerConfigCategory("SADXOnline") as SADXOnlineConfigCategory;
    }

    @Init()
    init(): void {
    }

    @Postinit()
    postinit() {
        this.clientStorage.level_keys = JSON.parse(fs.readFileSync(__dirname + '/localization/level_numbers.json').toString());
        this.clientStorage.localization = JSON.parse(fs.readFileSync(__dirname + '/localization/en_US.json').toString());
        let status: DiscordStatus = new DiscordStatus('Playing SADXOnline', 'On the title screen');
        status.smallImageKey = 'SADX';
        status.partyId = this.ModLoader.clientLobby;
        status.partyMax = 30;
        status.partySize = 1;
        this.ModLoader.gui.setDiscordStatus(status);
        this.clientStorage.saveManager = new SADXOSaveData(this.core.SADX!, this.ModLoader);
        this.ModLoader.utils.setIntervalFrames(() => {
            this.inventoryUpdateTick();
        }, 20);
    }

    updateSave() {
        if (this.core.SADX!.helper.isTitleScreen() || !this.core.SADX!.helper.isLevelNumberValid() || this.core.SADX!.helper.isPaused() || !this.clientStorage.first_time_sync) return;
        let save = this.clientStorage.saveManager.createSave();
        if (this.syncTimer > this.synctimerMax) {
            this.clientStorage.lastPushHash = this.ModLoader.utils.hashBuffer(Buffer.from("RESET"));
            this.ModLoader.logger.debug("Forcing resync due to timeout.");
        }
        if (this.clientStorage.lastPushHash !== this.clientStorage.saveManager.hash) {
            this.ModLoader.privateBus.emit(SAO_PRIVATE_EVENTS.DOING_SYNC_CHECK, {});
            let packet = new SAO_UpdateSaveDataPacket(this.ModLoader.clientLobby, save, this.clientStorage.world);
            this.ModLoader.clientSide.sendPacket(packet);
            this.clientStorage.lastPushHash = this.clientStorage.saveManager.hash;
            this.syncTimer = 0;
        }
    }

    //------------------------------
    // Lobby Setup
    //------------------------------

    @EventHandler(EventsClient.ON_SERVER_CONNECTION)
    onConnect() {
        this.ModLoader.logger.debug("Connected to server.");
        this.clientStorage.first_time_sync = false;
    }

    @EventHandler(EventsClient.CONFIGURE_LOBBY)
    onLobbySetup(lobby: LobbyData): void {
    }

    @EventHandler(EventsClient.ON_LOBBY_JOIN)
    onJoinedLobby(lobby: LobbyData): void {
        this.clientStorage.first_time_sync = false;
        this.ModLoader.logger.info('SADXOnline settings inherited from lobby.');
    }

    //------------------------------
    // Level handling
    //------------------------------

    @EventHandler(SADXEvents.ON_LEVEL_CHANGE)
    onLevelChange(Level: number) {
        if (!this.clientStorage.first_time_sync && !this.syncPending) {

            this.ModLoader.utils.setTimeoutFrames(() => {
                if (this.LobbyConfig.data_syncing) {
                    this.ModLoader.me.data["world"] = this.clientStorage.world;
                    this.ModLoader.clientSide.sendPacket(new SAO_DownloadRequestPacket(this.ModLoader.clientLobby, new SADXOSaveData(this.core.SADX!, this.ModLoader).createSave()));
                }
            }, 50);
            this.syncPending = true;
        }
        this.ModLoader.clientSide.sendPacket(
            new SAO_LevelPacket(
                this.ModLoader.clientLobby,
                Level
            )
        );
        this.ModLoader.logger.info('client: I moved to Level ' + Level + '.');
        if (this.core.SADX!.helper.isLevelNumberValid()) {
            this.ModLoader.gui.setDiscordStatus(
                new DiscordStatus(
                    'Playing SADXOnline',
                    'In ' +
                    this.clientStorage.localization[
                    this.clientStorage.level_keys[Level]
                    ]
                )
            );
        }
    }

    @NetworkHandler('SAO_LevelPacket')
    onLevelChange_client(packet: SAO_LevelPacket) {
        this.ModLoader.logger.info(
            'client receive: Player ' +
            packet.player.nickname +
            ' moved to Level ' +
            this.clientStorage.localization[
            this.clientStorage.level_keys[packet.Level]
            ] +
            '.'
        );
        bus.emit(
            SAOnlineEvents.CLIENT_REMOTE_PLAYER_CHANGED_LEVELS,
            new SA_PlayerLevel(packet.player, packet.lobby, packet.Level)
        );
    }

    // This packet is basically 'where the hell are you?' if a player has a puppet on file but doesn't know what Level its suppose to be in.
    @NetworkHandler('SAO_LevelRequestPacket')
    onLevelRequest_client(packet: SAO_LevelRequestPacket) {
        if (this.core.SADX!.save !== undefined) {
            this.ModLoader.clientSide.sendPacketToSpecificPlayer(
                new SAO_LevelPacket(
                    this.ModLoader.clientLobby,
                    this.core.SADX!.global.current_level
                ),
                packet.player
            );
        }
    }

    // The server is giving me data.
    @NetworkHandler('SAO_DownloadResponsePacket')
    onDownloadPacket_client(packet: SAO_DownloadResponsePacket) {
        if (
            this.core.SADX!.helper.isTitleScreen() ||
            !this.core.SADX!.helper.isLevelNumberValid()
        ) {
            return;
        }
        if (!packet.host) {
            if (packet.save) {
                this.clientStorage.saveManager.forceOverrideSave(packet.save!, this.core.SADX!.save as any, ProxySide.CLIENT);
                // Update hash.
                this.clientStorage.saveManager.createSave();
                this.clientStorage.lastPushHash = this.clientStorage.saveManager.hash;
            }
        } else {
            this.ModLoader.logger.info("The lobby is mine!");
        }
        this.ModLoader.utils.setTimeoutFrames(() => {
            this.clientStorage.first_time_sync = true;
        }, 20);
    }

    @NetworkHandler('SAO_UpdateSaveDataPacket')
    onSaveUpdate(packet: SAO_UpdateSaveDataPacket) {
        if (
            this.core.SADX!.helper.isTitleScreen() ||
            !this.core.SADX!.helper.isLevelNumberValid()
        ) {
            return;
        }
        if (packet.world !== this.clientStorage.world) {
            return;
        }
        this.clientStorage.saveManager.applySave(packet.save);
        // Update hash.
        this.clientStorage.saveManager.createSave();
        this.clientStorage.lastPushHash = this.clientStorage.saveManager.hash;
    }

    @EventHandler(ModLoaderEvents.ON_SOFT_RESET_PRE)
    onReset(evt: any) {
        this.clientStorage.first_time_sync = false;
    }

    @onTick()
    onTick() {
        if (
            !this.core.SADX!.helper.isTitleScreen() &&
            this.core.SADX!.helper.isInGame()
        ) {
            if (!this.core.SADX!.helper.isPaused()) {
                this.ModLoader.me.data["world"] = this.clientStorage.world;
                if (!this.clientStorage.first_time_sync) {
                    return;
                }
                if (this.LobbyConfig.data_syncing) {
                    this.syncTimer++;
                }
            }
        }
    }

    inventoryUpdateTick() {
        this.updateSave();
    }
}
