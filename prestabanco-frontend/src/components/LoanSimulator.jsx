import React, { useState } from 'react';
import LoanService from '../services/loan.service';
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
    Slider,
    Alert
} from '@mui/material';

const LoanSimulator = () => {
    const [loanData, setLoanData] = useState({
        loanType: '',
        amount: '',
        term: '',
        interestRate: 0
    });

    const [formattedAmount, setFormattedAmount] = useState('');
    const [errors, setErrors] = useState({
        amount: '',
        term: '',
        form: ''
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
        setErrors({ ...errors, form: '' });
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-CL').format(value);
    };

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Solo permite números
        
        if (rawValue === '') {
            setFormattedAmount('');
            setLoanData({ ...loanData, amount: '' });
            setErrors({ ...errors, amount: '', form: '' });
            return;
        }

        const numberValue = parseInt(rawValue, 10);

        if (numberValue <= 0) {
            setErrors({
                ...errors,
                amount: 'El monto del préstamo debe ser mayor a 0',
                form: ''
            });
        } else {
            setErrors({
                ...errors,
                amount: '',
                form: ''
            });
        }

        setFormattedAmount(formatNumber(numberValue));
        setLoanData({
            ...loanData,
            amount: numberValue
        });
    };

    const handleTermChange = (e) => {
        const value = e.target.value;
        
        if (value === '') {
            setLoanData({ ...loanData, term: '' });
            setErrors({ ...errors, term: '', form: '' });
            return;
        }

        const numberValue = parseInt(value, 10);

        if (numberValue <= 0) {
            setErrors({
                ...errors,
                term: 'El plazo debe ser mayor a 0',
                form: ''
            });
        } else if (numberValue > 30) {
            setErrors({
                ...errors,
                term: 'El plazo máximo es de 30 años',
                form: ''
            });
        } else {
            setErrors({
                ...errors,
                term: '',
                form: ''
            });
        }

        setLoanData({
            ...loanData,
            term: numberValue
        });
    };

    const validateForm = () => {
        if (!loanData.loanType) {
            setErrors({ ...errors, form: 'Seleccione un tipo de préstamo' });
            return false;
        }
        if (!loanData.amount) {
            setErrors({ ...errors, form: 'Ingrese el monto del préstamo' });
            return false;
        }
        if (!loanData.term) {
            setErrors({ ...errors, form: 'Ingrese el plazo del préstamo' });
            return false;
        }
        if (loanData.term > 30) {
            setErrors({ ...errors, form: 'El plazo máximo es de 30 años' });
            return false;
        }
        return true;
    };

    const handleSimulate = async () => {
        if (!validateForm()) {
            return;
        }

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
            setErrors({
                ...errors,
                form: 'Error al procesar la simulación. Por favor, intente nuevamente.'
            });
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
            position: 'absolute',
            backgroundColor: '#fff',
            width: '100%',
            left: 0,
            display: 'flex', 
            justifyContent: 'center',
            mt: 8 
        }}>
            <Container maxWidth="sm">
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
                                    value={formattedAmount}
                                    onChange={handleAmountChange}
                                    error={!!errors.amount}
                                    helperText={errors.amount}
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
                                    onChange={handleTermChange}
                                    error={!!errors.term}
                                    helperText={errors.term}
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

                        {errors.form && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.form}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 4, py: 1.5 }}
                            onClick={handleSimulate}
                            disabled={!!errors.amount || !!errors.term}
                        >
                            Simular Préstamo
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
                                            <TableCell align="right">${formatNumber(Math.round(result.monthlyPayment))}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Tasa de Interés Anual</TableCell>
                                            <TableCell align="right">{result.interestRate}%</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Costo Total del Préstamo</TableCell>
                                            <TableCell align="right">${formatNumber(Math.round(result.totalCost))}</TableCell>
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