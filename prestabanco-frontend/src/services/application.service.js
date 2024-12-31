// src/services/application.service.js
import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/applications');
}

const create = data => {
    return httpClient.post("/api/applications", data);
}

const get = id => {
    return httpClient.get(`/api/applications/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/applications/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/applications/${id}`);
}

const evaluate = (applicationId) => {
    return httpClient.post(`/api/applications/${applicationId}/evaluate`);
};

const getByUserId = userId => {
    return httpClient.get(`/api/applications/user/${userId}`);
}

const getByStatus = status => {
    return httpClient.get(`/api/applications/status/${status}`);
}

const updateStatus = (id, newStatus) => {
    return httpClient.put(`/api/applications/${id}/status`, { status: newStatus });
};



const applicationService = { 
    getAll, 
    create, 
    get, 
    update, 
    remove, 
    evaluate,
    getByUserId,
    getByStatus,
    updateStatus,
 
};


export default applicationService;
