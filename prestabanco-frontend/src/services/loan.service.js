// src/services/loan.service.js
import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/loans');
}

const create = data => {
    return httpClient.post("/api/loans", data);
}

const get = id => {
    return httpClient.get(`/api/loans/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/loans/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/loans/${id}`);
}

const calculateCost = data => {
    return httpClient.post("/api/loans/calculate-cost", {
        requestedAmount: parseFloat(data.amount),
        interestRate: parseFloat(data.interestRate),
        term: parseInt(data.term)
    });
};

const simulate = (data) => {
    return httpClient.post("/api/loans/simulate", {
        requestedAmount: parseFloat(data.amount),
        interestRate: parseFloat(data.interestRate),
        term: parseInt(data.term)
    });
};

const getByUserId = userId => {
    return httpClient.get(`/api/loans/user/${userId}`);
}

const loanService = { 
    getAll, 
    create, 
    get, 
    update, 
    remove,
    calculateCost,
    getByUserId, 
    simulate
};

export default loanService;