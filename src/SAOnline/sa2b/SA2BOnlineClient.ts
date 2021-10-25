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
import { SAO_UpdateSaveDataPacket, SAO_DownloadRequestPacket, SAO_LevelPacket, SAO_LevelRequestPacket, SAO_DownloadResponsePacket, SAO_ChaoPacket } from "../common/network/SAOPackets";
import { ISA2BOnlineLobbyConfig, SA2BOnlineConfigCategory } from "./SA2BOnline";
import { SA2BOSaveData } from "./save/SA2BOnlineSaveData";
import { SA2BOnlineStorage } from "./storage/SA2BOnlineStorage";
import { SA2BOnlineStorageClient } from "./storage/SA2BOnlineStorageClient";
import fs from 'fs';
import { SA2BEvents } from "SACore/API/SA2B/SA2B_API";
import { SAO_PRIVATE_EVENTS } from "@SAOnline/common/api/InternalAPI";
import { ChaoGarden as Garden, IChaoGarden } from "SACore/API/Common/Chao/ChaoAPI";
import { ChaoGarden } from "SACore/src/Common/Chao/ChaoGarden";
import { SA2BChaoGardenStorage } from "./storage/SA2BOnlineStorageBase";
import SA_Serialize from "@SAOnline/common/storage/SA_Serialize";

export default class SA2BOnlineClient {
    @InjectCore()
    core!: ISA_Main;

    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;

    @ParentReference()
    parent!: IPlugin;

    LobbyConfig: ISA2BOnlineLobbyConfig = {} as ISA2BOnlineLobbyConfig;
    clientStorage: SA2BOnlineStorageClient = new SA2BOnlineStorageClient();
    config!: SA2BOnlineConfigCategory;

    syncContext: number = -1;
    syncTimer: number = 0;
    synctimerMax: number = 60 * 20;
    syncPending: boolean = false;
    timestamp: number = -1;
    isChaoSafe: boolean = false;

    @Preinit()
    preinit() {
        this.config = this.ModLoader.config.registerConfigCategory("SA2BOnline") as SA2BOnlineConfigCategory;
    }

    @Init()
    init(): void {
    }

    @Postinit()
    postinit() {
        this.clientStorage.level_keys = JSON.parse(fs.readFileSync(__dirname + '/localization/level_numbers.json').toString());
        this.clientStorage.localization = JSON.parse(fs.readFileSync(__dirname + '/localization/en_US.json').toString());
        let status: DiscordStatus = new DiscordStatus('Playing SA2BOnline', 'On the title screen');
        status.smallImageKey = 'sa2b';
        status.partyId = this.ModLoader.clientLobby;
        status.partyMax = 30;
        status.partySize = 1;
        this.ModLoader.gui.setDiscordStatus(status);
        this.clientStorage.saveManager = new SA2BOSaveData(this.core.SA2B!, this.ModLoader);
        this.clientStorage.chao = new SA2BChaoGardenStorage();
        this.ModLoader.utils.setIntervalFrames(() => {
            this.inventoryUpdateTick();
        }, 20);
    }

    chao_data() { return this.ModLoader.emulator.rdramRead32(0x803AD80C) + 0x48E4; }

    updateSave() {
        if (this.core.SA2B!.helper.isTitleScreen() || !this.core.SA2B!.helper.isMenuSafe() || this.core.SA2B!.helper.isPaused() || !this.clientStorage.first_time_sync) return;

        let save = this.clientStorage.saveManager.createSave();
        if (this.isChaoSafe) this.clientStorage.chao = this.core.SA2B!.chao;

        if (this.syncTimer > this.synctimerMax) {
            this.clientStorage.lastPushHash = this.ModLoader.utils.hashBuffer(Buffer.from("RESET"));
            //this.ModLoader.logger.debug("Forcing resync due to timeout.");
        }
        if (this.clientStorage.lastPushHash !== this.clientStorage.saveManager.hash) {
            this.ModLoader.privateBus.emit(SAO_PRIVATE_EVENTS.DOING_SYNC_CHECK, {});
            let packet = new SAO_UpdateSaveDataPacket(this.ModLoader.clientLobby, save, this.clientStorage.world);
            this.ModLoader.clientSide.sendPacket(packet);
            if (this.isChaoSafe) {
                let chaoPacket = new SAO_ChaoPacket(this.clientStorage.chao, this.ModLoader.clientLobby);
                this.ModLoader.clientSide.sendPacket(chaoPacket);
            }
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
        lobby.data['SAOnline:data_syncing'] = true;
    }

    @EventHandler(EventsClient.ON_LOBBY_JOIN)
    onJoinedLobby(lobby: LobbyData): void {
        this.clientStorage.first_time_sync = false;
        this.LobbyConfig.data_syncing = lobby.data['SAOnline:data_syncing'];
        this.ModLoader.logger.info('SA2BOnline settings inherited from lobby.');
    }

    //------------------------------
    // Level handling
    //------------------------------

    @EventHandler(SA2BEvents.ON_SAVE_LOADED)
    onSaveLoad(Level: number) {
        if (!this.clientStorage.first_time_sync && !this.syncPending) {

            this.ModLoader.utils.setTimeoutFrames(() => {
                if (this.LobbyConfig.data_syncing) {
                    this.ModLoader.me.data["world"] = this.clientStorage.world;
                    this.ModLoader.clientSide.sendPacket(new SAO_DownloadRequestPacket(this.ModLoader.clientLobby, new SA2BOSaveData(this.core.SA2B!, this.ModLoader).createSave()));
                }
            }, 50);
            this.syncPending = true;
        }
    }

    @EventHandler(SA2BEvents.ON_LEVEL_CHANGE)
    onLevelChange(Level: number) {
        if (!this.clientStorage.first_time_sync && !this.syncPending) {

            this.ModLoader.utils.setTimeoutFrames(() => {
                if (this.LobbyConfig.data_syncing) {
                    this.ModLoader.me.data["world"] = this.clientStorage.world;
                    this.ModLoader.clientSide.sendPacket(new SAO_DownloadRequestPacket(this.ModLoader.clientLobby, new SA2BOSaveData(this.core.SA2B!, this.ModLoader).createSave()));
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
        if (this.core.SA2B!.helper.isLevelNumberValid()) {
            this.ModLoader.gui.setDiscordStatus(
                new DiscordStatus(
                    'Playing SA2BOnline',
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
            packet.Level +
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
        if (this.core.SA2B!.save !== undefined) {
            this.ModLoader.clientSide.sendPacketToSpecificPlayer(
                new SAO_LevelPacket(
                    this.ModLoader.clientLobby,
                    this.core.SA2B!.global.current_level
                ),
                packet.player
            );
        }
    }

    // The server is giving me data.
    @NetworkHandler('SAO_DownloadResponsePacket')
    onDownloadPacket_client(packet: SAO_DownloadResponsePacket) {
        if (
            this.core.SA2B!.helper.isTitleScreen() ||
            !this.core.SA2B!.helper.isMenuSafe()
        ) {
            return;
        }
        if (!packet.host) {
            if (packet.save) {
                this.clientStorage.saveManager.forceOverrideSave(packet.save!, this.core.SA2B!.save as any, ProxySide.CLIENT);
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
            this.core.SA2B!.helper.isTitleScreen() ||
            !this.core.SA2B!.helper.isMenuSafe()
            //|| !this.core.SA2B!.helper.isLevelNumberValid()
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

    //Chao Handling
    @NetworkHandler('SAO_ChaoPacket')
    onChao(packet: SAO_ChaoPacket) {
        //packet.chao.chaos = SA_Serialize.FixArray(packet.chao.chaos);
        //console.log(packet);
        for (let i = 0; i < this.core.SA2B!.chao.chaos.length; i++) {
            let incoming = packet.chao.chaos[i];
            let save = this.core.SA2B!.chao.chaos[i];
            if (incoming.garden !== Garden.UNDEFINED) {
                Object.keys(incoming).forEach((key: string) => {
                    if (typeof incoming[key] === 'string') {
                        if (incoming[key] !== save[key]) 
                        if(incoming[key] !== ""){
                            save[key] = incoming[key];
                        }
                    }
                    if (typeof incoming[key] === 'number') {
                        const manual = [
                            incoming.swim_level, incoming.fly_level,
                            incoming.run_level, incoming.power_run,
                            incoming.stamina_level, incoming.luck_level,
                            incoming.intelligence_level, incoming.unknown_level,
                            incoming.swim_fraction, incoming.fly_fraction,
                            incoming.run_fraction, incoming.power_run,
                            incoming.stamina_fraction, incoming.lucky_fraction,
                            incoming.intelligence_fraction, incoming.unknown_fraction,
                            incoming.garden, incoming.type, incoming.sa2b_skills,
                            incoming.sa2b_toys, incoming.sa2b_character_bonds,
                            incoming.evolution_progress, incoming.happiness,
                            incoming.alignment, incoming.medal
                        ]
                        const blacklist = [save.pointer];
                        if (!blacklist.includes(save[key])) {
                            if (manual.includes(save[key])) {
                                save[key] = incoming[key];
                            }
                            else {
                                //save[key] += incoming[key];
                            }
                        }

                    }
                });
            }
        }
    }

    @onTick()
    onTick() {
        if ((this.core.SA2B!.global.global_frame_count % 300) === 0) {
            //console.log(`isTitleScreen(): ${this.core.SA2B!.helper.isTitleScreen()}`);
            //console.log(`isMenuSafe(): ${this.core.SA2B!.helper.isMenuSafe()}`);
            //console.log(`isLevelNumberValid(): ${this.core.SA2B!.helper.isLevelNumberValid()} | Level: ${this.core.SA2B!.global.current_level}`);
        }
        if (
            !this.core.SA2B!.helper.isTitleScreen() &&
            this.core.SA2B!.helper.isMenuSafe()
        ) {
            if (!this.core.SA2B!.helper.isPaused()) {
                this.ModLoader.me.data["world"] = this.clientStorage.world;
                if (!this.clientStorage.first_time_sync) {
                    return;
                }
                if (this.LobbyConfig.data_syncing) {
                    this.syncTimer++;
                }
                if (this.core.SA2B!.helper.isInGame() && this.core.SA2B!.global.current_level === 90) {
                    this.isChaoSafe = true;
                }
                else {
                    this.isChaoSafe = false;
                }
            }
            else console.log(`isPaused(): ${this.core.SA2B!.helper.isPaused()}`);
        }

    }

    inventoryUpdateTick() {
        this.updateSave();
    }
}
