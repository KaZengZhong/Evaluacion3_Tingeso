import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import UserService from '../services/user.service';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await UserService.login(credentials);
            navigate('/');
        } catch (err) {
            setError('Email o contraseña incorrectos');
        }
    };

    return (
        <Box sx={{ 
            position: 'absolute',
            width: '100%',
            left: 0,
            minHeight: '100vh', 
            bgcolor: 'background.default',
            pt: 10,
            pb: 4,
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Container maxWidth="sm">
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                            Iniciar Sesión
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                type="email"
                                margin="normal"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({
                                    ...credentials,
                                    email: e.target.value
                                })}
                            />

                            <TextField
                                fullWidth
                                label="Contraseña"
                                variant="outlined"
                                type="password"
                                margin="normal"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({
                                    ...credentials,
                                    password: e.target.value
                                })}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                Iniciar Sesión
                            </Button>
                        </form>

                        <Box textAlign="center" mt={2}>
                            <Button
                                onClick={() => navigate('/register')}
                                color="primary"
                            >
                                ¿No tienes una cuenta? Regístrate
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;