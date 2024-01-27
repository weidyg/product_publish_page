import { RateConfigPolicy, WmsRateOptions } from "../../../components/WmsRateEdit/interface";
declare global {
    interface Window {
        loadRateConfigPolicy: any,
        saveRateConfigPolicy: any,
        getRateConfigOptions: any,
        convertRateConfigType: any
    }
}
export async function loadRateConfigPolicy(id?: number): Promise<RateConfigPolicy> {
    return await window.loadRateConfigPolicy(id);
}
export async function saveRateConfigPolicy(value: RateConfigPolicy): Promise<void> {
    return await window.saveRateConfigPolicy(value);
}
export async function getRateConfigOptions(): Promise<WmsRateOptions> {
    return await window.getRateConfigOptions();
}