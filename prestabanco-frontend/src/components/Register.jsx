import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Typography, 
    Alert,
    Grid,
    Snackbar
} from '@mui/material';
import userService from '../services/user.service';

const Register = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        rut: '',
        phone: '',
        age: ''
    });
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (userData.password !== userData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        try {
            await userService.register(userData);
            setShowSuccess(true);
            // Limpiar el formulario
            setUserData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                rut: '',
                phone: '',
                age: ''
            });
            setError('');
        } catch (err) {
            setError('Error al registrar usuario');
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: 'background.default',
            pt: 10,
            pb: 4,
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Container maxWidth="sm" sx={{ ml: { xs: 4, sm: 8, md: 55 }, mr: 'auto' }}>
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                            Registro
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        variant="outlined"
                                        required
                                        value={userData.firstName}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            firstName: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Apellido"
                                        variant="outlined"
                                        required
                                        value={userData.lastName}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            lastName: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="RUT"
                                        variant="outlined"
                                        required
                                        value={userData.rut}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            rut: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        variant="outlined"
                                        type="tel"
                                        required
                                        value={userData.phone}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            phone: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        variant="outlined"
                                        type="email"
                                        required
                                        value={userData.email}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            email: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Contraseña"
                                        variant="outlined"
                                        type="password"
                                        required
                                        value={userData.password}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            password: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirmar Contraseña"
                                        variant="outlined"
                                        type="password"
                                        required
                                        value={userData.confirmPassword}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            confirmPassword: e.target.value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Edad"
                                        variant="outlined"
                                        type="number"
                                        required
                                        value={userData.age}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            age: e.target.value
                                        })}
                                        InputProps={{
                                            inputProps: { 
                                                min: 18,
                                                max: 100
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                Registrarse
                            </Button>
                        </form>

                        <Box textAlign="center" mt={2}>
                            <Button
                                onClick={() => navigate('/login')}
                                color="primary"
                            >
                                ¿Ya tienes una cuenta? Inicia sesión
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>

            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setShowSuccess(false)} 
                    severity="success" 
                    sx={{ width: '100%' }}
                >
                    Usuario registrado exitosamente
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Register;