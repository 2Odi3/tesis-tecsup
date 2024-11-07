import CryptoJS from 'crypto-js';

const secretKey = import.meta.env.VITE_SECRET_KEY;

export const encryptId = (id) => {
    return encodeURIComponent(CryptoJS.AES.encrypt(String(id), secretKey).toString());
};

export const decryptId = (encryptedId) => {
    try {
        const decodedId = decodeURIComponent(encryptedId);
        const decryptedBytes = CryptoJS.AES.decrypt(decodedId, secretKey);
        const decryptedId = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedId) {
            throw new Error("ID no válido");
        }
        return decryptedId;
    } catch (error) {
        console.error("Error al desencriptar el ID:", error);
        throw new Error("Error al procesar el ID");
    }
};
