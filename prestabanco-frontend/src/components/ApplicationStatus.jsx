import { useEffect, useState } from 'react';
import { 
    Box, 
    Container, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Alert, 
    Chip,
    CircularProgress,
    Paper
} from '@mui/material';
import ApplicationService from '../services/application.service';
import UserService from '../services/user.service';

function ApplicationStatus() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = UserService.getCurrentUser();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await ApplicationService.getByUserId(currentUser.id);
                setApplications(response.data);
            } catch (err) {
                setError('Error al cargar las solicitudes');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusInfo = (status) => {
        const statusInfo = {
            IN_REVIEW: {
                label: 'En Revisión Inicial',
                description: 'Su solicitud está siendo revisada inicialmente.',
                color: 'primary'
            },
            PENDING_DOCUMENTS: {
                label: 'Pendiente de Documentación',
                description: 'Se requieren documentos adicionales.',
                color: 'warning'
            },
            IN_EVALUATION: {
                label: 'En Evaluación',
                description: 'Su solicitud está siendo evaluada por nuestro equipo.',
                color: 'info'
            },
            PRE_APPROVED: {
                label: 'Pre-Aprobada',
                description: 'Su solicitud ha sido pre-aprobada.',
                color: 'success'
            },
            FINAL_APPROVAL: {
                label: 'En Aprobación Final',
                description: 'Su solicitud está en aprobación final.',
                color: 'success'
            },
            APPROVED: {
                label: 'Aprobada',
                description: 'Su solicitud ha sido aprobada.',
                color: 'success'
            },
            REJECTED: {
                label: 'Rechazada',
                description: 'Lo sentimos, su solicitud no cumple con los requisitos.',
                color: 'error'
            },
            CANCELLED: {
                label: 'Cancelada',
                description: 'La solicitud ha sido cancelada.',
                color: 'default'
            },
            IN_DISBURSEMENT: {
                label: 'En Desembolso',
                description: 'Se está procesando el desembolso de su préstamo.',
                color: 'info'
            }
        };
        return statusInfo[status] || {
            label: 'Estado Desconocido',
            description: 'No se puede determinar el estado actual.',
            color: 'default'
        };
    };

    const getLoanTypeName = (type) => {
        const types = {
            'FIRST_HOME': 'Primera Vivienda',
            'SECOND_HOME': 'Segunda Vivienda',
            'COMMERCIAL': 'Propiedad Comercial',
            'REMODELING': 'Remodelación'
        };
        return types[type] || type;
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: 'background.default',
            pt: 10,
            pb: 4
        }}>
            <Container maxWidth="lg" sx={{ ml: { xs: 4, sm: 8, md: 40 }, mr: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="h4" gutterBottom>
                    Mis Solicitudes
                </Typography>

                {applications.length === 0 ? (
                    <Alert severity="info">
                        No tienes solicitudes de préstamo activas.
                    </Alert>
                ) : (
                    applications.map((application) => (
                        <Card key={application.id} sx={{ mb: 3, boxShadow: 3 }}>
                            <CardContent>
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Número de Solicitud
                                        </Typography>
                                        <Typography variant="h6">
                                            {application.id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Estado
                                        </Typography>
                                        <Chip 
                                            label={getStatusInfo(application.status).label}
                                            color={getStatusInfo(application.status).color}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Tipo de Préstamo
                                            </Typography>
                                            <Typography variant="body1">
                                                {application.propertyType}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Monto Solicitado
                                            </Typography>
                                            <Typography variant="body1">
                                                {application.requestedAmount}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Plazo
                                            </Typography>
                                            <Typography variant="body1">
                                                {application.term} años
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {getStatusInfo(application.status).description}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Container>
        </Box>
    );
}

export default ApplicationStatus;