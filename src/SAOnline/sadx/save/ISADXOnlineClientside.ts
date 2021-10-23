import { SADXOnlineStorageClient } from "@SAOnline/sadx/storage/SADXOnlineStorageClient";

export interface ISADXOClientside {
    getClientStorage(): SADXOnlineStorageClient | null;
}