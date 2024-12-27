import React, { useState } from 'react';
import { 
    Box, 
    Container, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Typography, 
    MenuItem,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Slider
} from '@mui/material';
import LoanService from '../services/loan.service';

const LoanSimulator = () => {
    const [loanData, setLoanData] = useState({
        loanType: '',
        amount: '',
        term: '',
        interestRate: 0
    });

    const [result, setResult] = useState(null);

    const loanTypes = [
        { value: 'FIRST_HOME', label: 'Primera Vivienda', minRate: 3.5, maxRate: 5.0 },
        { value: 'SECOND_HOME', label: 'Segunda Vivienda', minRate: 4.0, maxRate: 6.0 },
        { value: 'COMMERCIAL', label: 'Propiedades Comerciales', minRate: 5.0, maxRate: 7.0 },
        { value: 'RENOVATION', label: 'Remodelación', minRate: 4.5, maxRate: 6.0 }
    ];

    const handleLoanTypeChange = (event) => {
        const selectedType = loanTypes.find(type => type.value === event.target.value);
        setLoanData({
            ...loanData,
            loanType: event.target.value,
            interestRate: selectedType ? selectedType.minRate : 0
        });
    };

    const handleSimulate = async () => {
        try {
            console.log(loanData); // Verifica los datos antes de enviarlos
            const simulateResponse = await LoanService.simulate(loanData);
            const costResponse = await LoanService.calculateCost(loanData);
            setResult({
                monthlyPayment: simulateResponse.data.monthlyPayment,
                interestRate: loanData.interestRate,
                totalCost: costResponse.data.totalCost,
            });
        } catch (err) {
            console.error('Error al simular préstamo:', err);
        }
    };

    const getInterestRateRange = () => {
        const selectedType = loanTypes.find(type => type.value === loanData.loanType);
        return selectedType ? {
            min: selectedType.minRate,
            max: selectedType.maxRate
        } : { min: 0, max: 0 };
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
            <Container maxWidth="sm" sx={{ ml: { xs: 4, sm: 8, md: 60 }, mr: 'auto' }}>
                <Card sx={{ boxShadow: 3, mb: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                            Simulador de Préstamo
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Tipo de Préstamo"
                                    variant="outlined"
                                    value={loanData.loanType}
                                    onChange={handleLoanTypeChange}
                                >
                                    {loanTypes.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label} - Tasa: {option.minRate}% - {option.maxRate}%
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Monto del Préstamo"
                                    variant="outlined"
                                    type="number"
                                    value={loanData.amount}
                                    onChange={(e) => setLoanData({
                                        ...loanData,
                                        amount: e.target.value
                                    })}
                                    InputProps={{
                                        startAdornment: '$'
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Plazo (años)"
                                    variant="outlined"
                                    type="number"
                                    value={loanData.term}
                                    onChange={(e) => setLoanData({
                                        ...loanData,
                                        term: e.target.value
                                    })}
                                    InputProps={{
                                        inputProps: { min: 1, max: 30 }
                                    }}
                                />
                            </Grid>

                            {loanData.loanType && (
                                <Grid item xs={12}>
                                    <Typography gutterBottom>
                                        Tasa de Interés: {loanData.interestRate}%
                                    </Typography>
                                    <Slider
                                        value={loanData.interestRate}
                                        min={getInterestRateRange().min}
                                        max={getInterestRateRange().max}
                                        step={0.1}
                                        onChange={(_, value) => setLoanData({
                                            ...loanData,
                                            interestRate: value
                                        })}
                                        valueLabelDisplay="auto"
                                    />
                                </Grid>
                            )}
                        </Grid>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 4, py: 1.5 }}
                            onClick={handleSimulate}
                        >
                            Simular Préstamo (Chile)
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card sx={{ boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom textAlign="center">
                                Resultado de la Simulación
                            </Typography>
                            
                            <TableContainer component={Paper} sx={{ mt: 3 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Concepto</TableCell>
                                            <TableCell align="right">Valor</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Cuota Mensual</TableCell>
                                            <TableCell align="right">${result.monthlyPayment}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Tasa de Interés Anual</TableCell>
                                            <TableCell align="right">{result.interestRate}%</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Costo Total del Préstamo</TableCell>
                                            <TableCell align="right">${result.totalCost}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Container>
        </Box>
    );
};

export default LoanSimulator;