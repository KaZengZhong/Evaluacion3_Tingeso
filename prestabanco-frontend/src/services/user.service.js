// src/services/user.service.js
import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/users');
}

const create = data => {
    return httpClient.post("/api/users", data);
}

const get = id => {
    return httpClient.get(`/api/users/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/users/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/users/${id}`);
}

const findByRut = rut => {
    return httpClient.get(`/api/users/rut/${rut}`);
}

const findByEmail = email => {
    return httpClient.get(`/api/users/email/${email}`);
}


const register = (userData) => {
    return httpClient.post("/api/users/register", userData);
};

const login = (credentials) => {
    return httpClient.post("/api/users/login", credentials)
        .then(response => {
            if (response.data.isAuthenticated) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
    return httpClient.post("/api/users/logout");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};


const userService = { 
    getAll, 
    create, 
    get, 
    update, 
    remove,
    findByRut,
    findByEmail, 
    register,
    login,
    logout,
    getCurrentUser
};

export default userService;