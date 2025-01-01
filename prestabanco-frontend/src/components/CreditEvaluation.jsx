// src/components/CreditEvaluation.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Paper,
    Button
} from '@mui/material';
import ApplicationService from '../services/application.service';
import LoanService from '../services/loan.service';

function CreditEvaluation() {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [evaluationResults, setEvaluationResults] = useState(null);
    const [totalCost, setTotalCost] = useState(null);

    useEffect(() => {
        const fetchApplicationAndEvaluate = async () => {
            try {
                setLoading(true);
                // Obtener la solicitud
                const applicationResponse = await ApplicationService.get(id);
                setApplication(applicationResponse.data);
                
                // Realizar la evaluación
                const evaluationResponse = await ApplicationService.evaluate(id);
                setEvaluationResults(evaluationResponse.data);

                // Calcular el costo total
                const costResponse = await LoanService.calculateCost({
                    amount: applicationResponse.data.requestedAmount,
                    interestRate: applicationResponse.data.interestRate,
                    term: applicationResponse.data.term
                });
                setTotalCost(costResponse.data.totalCost);

            } catch (err) {
                setError('Error al cargar los datos');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicationAndEvaluate();
    }, [id]);



    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 10, pb: 4 }}>
           <Container maxWidth="lg" sx={{ ml: { xs: 4, sm: 8, md: 20 }, mr: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="h4" gutterBottom>
                    Evaluación de Crédito - Solicitud #{id}
                </Typography>

                <Grid container spacing={3}>
                    {/* Información del solicitante */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Información del Solicitante
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Cliente
                                            </Typography>
                                            <Typography>
                                                {application?.user?.firstName} {application?.user?.lastName}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Ingreso Mensual
                                            </Typography>
                                            <Typography>
                                                ${application?.monthlyIncome?.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Años de Empleo
                                            </Typography>
                                            <Typography>
                                                {application?.employmentYears}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Información del préstamo */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Información del Préstamo
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Monto Solicitado
                                            </Typography>
                                            <Typography>
                                                ${application?.requestedAmount?.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Valor de Propiedad
                                            </Typography>
                                            <Typography>
                                                ${application?.propertyValue?.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Plazo
                                            </Typography>
                                            <Typography>
                                                {application?.term} años
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                            <Typography color="text.secondary" gutterBottom>
                                                Tasa de Interés
                                            </Typography>
                                            <Typography>
                                                {application?.interestRate}%
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* Costo Total */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Costo Total
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'info.light', textAlign: 'center' }}>
                                    <Typography variant="h5">
                                        ${totalCost?.toLocaleString()}
                                    </Typography>
                                </Paper>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Resultados de la evaluación */}
                    {evaluationResults && (
                    <Grid item xs={12}>
                        <Card sx={{ mt: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Resultados de la Evaluación
                                </Typography>
                                <Grid container spacing={2}>
                                    {evaluationResults.evaluationDetails.map((detail, index) => (
                                        <Grid item xs={12} md={6} key={index}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: detail.passed ? 'success.light' : 'error.light'
                                            }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {detail.rule}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    {detail.description}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {detail.passed ? "CUMPLE" : "NO CUMPLE"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}

                                    {/* Resultado Final */}
                                    <Grid item xs={12}>
                                        <Paper sx={{ 
                                            p: 3, 
                                            bgcolor: evaluationResults.approved ? 'success.light' : 'error.light',
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="h5" gutterBottom>
                                                Resultado Final
                                            </Typography>
                                            <Typography variant="h4" gutterBottom>
                                                {evaluationResults.approved ? "APROBADO" : "RECHAZADO"}
                                            </Typography>
                                            <Typography variant="body1">
                                                {evaluationResults.message}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

              
                </Grid>
            </Container>
        </Box>
    );
}

export default CreditEvaluation;