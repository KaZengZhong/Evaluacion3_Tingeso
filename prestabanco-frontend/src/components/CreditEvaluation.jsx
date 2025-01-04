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
    Button,
    TextField
} from '@mui/material';
import ApplicationService from '../services/application.service';
import LoanService from '../services/loan.service';
import SavingsService from '../services/savings.service';

function CreditEvaluation() {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [evaluationResults, setEvaluationResults] = useState(null);
    const [totalCost, setTotalCost] = useState(null);

    const [savingsData, setSavingsData] = useState({
        accountNumber: '',
        currentBalance: '',
        monthlyDepositsCount: 0,
        monthlyDepositsAmount: '',
        largestWithdrawalLast6Months: '',
        consecutiveMonthsWithBalance: 0,
        significantWithdrawalsCount: 0,
        lastSixMonthsAverageBalance: 0,
        meetsSavingsCriteria: false, 
        openingDate: null,
        lastTransactionDate: null
    });

    const [savingsMessage, setSavingsMessage] = useState({ type: '', message: '' });

    const performEvaluation = async (applicationData) => {  // Recibir application como parámetro
        try {
            const evaluationResponse = await ApplicationService.evaluate(id);
            setEvaluationResults(evaluationResponse.data);
    
            const costResponse = await LoanService.calculateCost({
                amount: applicationData.requestedAmount,  
                interestRate: applicationData.interestRate,
                term: applicationData.term
            });
            setTotalCost(costResponse.data.totalCost);
        } catch (err) {
            setError('Error al realizar la evaluación');
            console.error('Error:', err);
        }
    };
    
    useEffect(() => {
        const fetchApplicationAndEvaluate = async () => {
            try {
                setLoading(true);
                // Obtener la solicitud
                const applicationResponse = await ApplicationService.get(id);
                const applicationData = applicationResponse.data;
                setApplication(applicationData);
                
                // Intentar obtener datos de ahorro existentes
                try {
                    const savingsResponse = await SavingsService.getByUserId(applicationData.user.id);
                    if (savingsResponse.data) {
                        setSavingsData({
                            accountNumber: savingsResponse.data.accountNumber || '',
                            currentBalance: savingsResponse.data.currentBalance || '',
                            monthlyDepositsCount: savingsResponse.data.monthlyDepositsCount || 0,
                            monthlyDepositsAmount: savingsResponse.data.monthlyDepositsAmount || 0,
                            largestWithdrawalLast6Months: savingsResponse.data.largestWithdrawalLast6Months || 0,
                            consecutiveMonthsWithBalance: savingsResponse.data.consecutiveMonthsWithBalance || 0,
                            significantWithdrawalsCount: savingsResponse.data.significantWithdrawalsCount || 0,
                            lastSixMonthsAverageBalance: savingsResponse.data.lastSixMonthsAverageBalance || 0,
                            meetsSavingsCriteria: savingsResponse.data.meetsSavingsCriteria || false,
                            openingDate: savingsResponse.data.openingDate,
                            lastTransactionDate: savingsResponse.data.lastTransactionDate
                        });
                    }
                } catch (err) {
                    console.log('No hay datos de ahorro previos');
                }
                
                // Realizar la evaluación inicial con los datos de la aplicación
                await performEvaluation(applicationData);
    
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
        <Box sx={{ 
                    position: 'absolute',
                    width: '100%',
                    left: 0,
                    minHeight: '100vh', 
                    bgcolor: 'background.default', 
                    pt: 10,
                    pb: 4 
                }}>
            <Container maxWidth="lg">
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
                        <Grid item xs={12} id="evaluation-results">
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

                    {/* Capacidad de Ahorro */}
                    <Grid item xs={12}>
                        <Card sx={{ mt: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Evaluación de Capacidad de Ahorro
                                </Typography>
                                
                                {savingsMessage.message && (
                                    <Alert severity={savingsMessage.type} sx={{ mb: 2 }}>
                                        {savingsMessage.message}
                                    </Alert>
                                )}

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Número de cuenta"
                                            value={savingsData.accountNumber}
                                            onChange={(e) => setSavingsData({
                                                ...savingsData,
                                                accountNumber: e.target.value
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Saldo en la cuenta"
                                            value={savingsData.currentBalance}
                                            onChange={(e) => setSavingsData({
                                                ...savingsData,
                                                currentBalance: e.target.value
                                            })}
                                            InputProps={{
                                                startAdornment: '$'
                                            }}
                                        />
                                    </Grid>
                                   
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Ingresos mensuales a la cuenta"
                                            value={savingsData.monthlyDepositsAmount}
                                            onChange={(e) => setSavingsData({
                                                ...savingsData,
                                                monthlyDepositsAmount: e.target.value
                                            })}
                                            InputProps={{
                                                startAdornment: '$'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Mayor retiro (Últimos 6 meses)"
                                            value={savingsData.largestWithdrawalLast6Months}
                                            onChange={(e) => setSavingsData({
                                                ...savingsData,
                                                largestWithdrawalLast6Months: e.target.value
                                            })}
                                            InputProps={{
                                                startAdornment: '$'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Meses consecutivos sin retiros significativos (>50% saldo)"
                                            value={savingsData.consecutiveMonthsWithBalance}
                                            onChange={(e) => setSavingsData({
                                                ...savingsData,
                                                consecutiveMonthsWithBalance: e.target.value
                                            })}
                                        />
                                    </Grid>                              
                                    
                                </Grid>

                                {savingsData.accountNumber && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Estado de Criterios de Ahorro
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: savingsData.currentBalance >= (application?.requestedAmount * 0.10) ? 'success.light' : 'error.light'
                                            }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    R71: Saldo Mínimo
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    El saldo debe ser al menos el 10% del monto solicitado (${(application?.requestedAmount * 0.10).toLocaleString()})
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {savingsData.currentBalance >= (application?.requestedAmount * 0.10) ? "CUMPLE" : "NO CUMPLE"}
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: (savingsData.consecutiveMonthsWithBalance >= 12 && savingsData.significantWithdrawalsCount === 0) ? 'success.light' : 'error.light'
                                            }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    R72: Historial de Ahorro Consistente
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    12 meses con balance y sin retiros significativos
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {(savingsData.consecutiveMonthsWithBalance >= 12 && savingsData.significantWithdrawalsCount === 0) ? "CUMPLE" : "NO CUMPLE"}
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: savingsData.monthlyDepositsAmount >= (application?.monthlyIncome * 0.05) ? 'success.light' : 'error.light'
                                            }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    R73: Depósitos Periódicos
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    Depósitos mensuales deben ser al menos 5% del ingreso (${(application?.monthlyIncome * 0.05).toLocaleString()})
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {savingsData.monthlyDepositsAmount >= (application?.monthlyIncome * 0.05) ? "CUMPLE" : "NO CUMPLE"}
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: savingsData.currentBalance >= (application?.requestedAmount * (savingsData.consecutiveMonthsWithBalance >= 24 ? 0.10 : 0.20)) ? 'success.light' : 'error.light'
                                            }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    R74: Relación Saldo/Años
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    {savingsData.consecutiveMonthsWithBalance >= 24 ? 
                                                        `Saldo debe ser al menos 10% del monto (${(application?.requestedAmount * 0.10).toLocaleString()})` :
                                                        `Saldo debe ser al menos 20% del monto (${(application?.requestedAmount * 0.20).toLocaleString()})`}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {savingsData.currentBalance >= (application?.requestedAmount * (savingsData.consecutiveMonthsWithBalance >= 24 ? 0.10 : 0.20)) ? "CUMPLE" : "NO CUMPLE"}
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: savingsData.largestWithdrawalLast6Months <= (savingsData.currentBalance * 0.30) ? 'success.light' : 'error.light'
                                            }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    R75: Retiros Recientes
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    Mayor retiro no debe superar 30% del saldo actual (${(savingsData.currentBalance * 0.30).toLocaleString()})
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {savingsData.largestWithdrawalLast6Months <= (savingsData.currentBalance * 0.30) ? "CUMPLE" : "NO CUMPLE"}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}   

                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default CreditEvaluation;