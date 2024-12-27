// src/services/document.service.js
import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/documents');
}

const create = data => {
    return httpClient.post("/api/documents", data);
}

const get = id => {
    return httpClient.get(`/api/documents/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/documents/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/documents/${id}`);
}

const getByApplicationId = applicationId => {
    return httpClient.get(`/api/documents/application/${applicationId}`);
}

const documentService = { 
    getAll, 
    create, 
    get, 
    update, 
    remove,
    getByApplicationId 
};

export default documentService;