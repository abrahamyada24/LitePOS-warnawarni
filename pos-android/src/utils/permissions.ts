import { PermissionsAndroid, Platform } from 'react-native';

export const requestPrinterPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
        // For Android 12+ (API 31+)
        if (Platform.Version >= 31) {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            return (
                result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted' &&
                result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted'
            );
        } else {
            // Android 11 and below
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);
            return result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 'granted';
        }
    } catch (error) {
        console.warn('Failed to request printer permissions', error);
        return false;
    }
};
