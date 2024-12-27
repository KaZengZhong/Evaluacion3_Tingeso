// src/services/savings.service.js
import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/savings');
}

const create = data => {
    return httpClient.post("/api/savings", data);
}

const get = id => {
    return httpClient.get(`/api/savings/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/savings/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/savings/${id}`);
}

const getByUserId = userId => {
    return httpClient.get(`/api/savings/user/${userId}`);
}

const getByAccountNumber = accountNumber => {
    return httpClient.get(`/api/savings/account/${accountNumber}`);
}

const savingsService = { 
    getAll, 
    create, 
    get, 
    update, 
    remove,
    getByUserId,
    getByAccountNumber 
};

export default savingsService;