// src/services/test.service.js
import httpClient from "../http-common";

const testConnection = () => {
    return httpClient.get("/api/test")
        .then(response => {
            console.log("Conexión exitosa:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error de conexión:", error);
            throw error;
        });
};

export default {
    testConnection
};