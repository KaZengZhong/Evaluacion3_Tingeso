import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Stepper,
    Step,
    StepLabel,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Slider
} from '@mui/material';
import ApplicationService from '../services/application.service';
import UserService from '../services/user.service';

const LoanApplication = () => {
    const navigate = useNavigate();
    const currentUser = UserService.getCurrentUser();
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        user: currentUser,
        propertyType: '', 
        requestedAmount: '',
        term: '',
        interestRate: 0,
        status: 'IN_REVIEW',
        monthlyIncome: '',
        employmentYears: '',
        currentDebt: '0',
        propertyValue: '',
        documentationComplete: false,
        documents: {
            incomeProof: null,
            propertyAppraisal: null,
            creditHistory: null
        }
    });

    const [errors, setErrors] = useState({});

    const steps = [
        'Información Laboral', 
        'Detalles del Préstamo',
        'Documentación',
        'Confirmación'
    ];

    const propertyTypes = [
        { value: 'FIRST_HOME', label: 'Primera Vivienda', minRate: 3.5, maxRate: 5.0 },
        { value: 'SECOND_HOME', label: 'Segunda Vivienda', minRate: 4.0, maxRate: 6.0 },
        { value: 'COMMERCIAL', label: 'Propiedades Comerciales', minRate: 5.0, maxRate: 7.0 },
        { value: 'RENOVATION', label: 'Remodelación', minRate: 4.5, maxRate: 6.0 }
    ];

    const requiredDocuments = [
        { key: 'incomeProof', label: 'Comprobante de Ingresos' },
        { key: 'propertyAppraisal', label: 'Certificado de Avalúo' },
        { key: 'creditHistory', label: 'Historial Crediticio' }
    ];

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 0: // Información Laboral
                if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
                    newErrors.monthlyIncome = 'Ingrese un ingreso mensual válido';
                }
                if (!formData.employmentYears || formData.employmentYears < 0) {
                    newErrors.employmentYears = 'Ingrese años de empleo válidos';
                }
                break;

                case 1: // Detalles del Préstamo
                if (!formData.propertyType) {
                    newErrors.propertyType = 'Seleccione un tipo de propiedad';
                }
                if (!formData.propertyValue || formData.propertyValue <= 0) {
                    newErrors.propertyValue = 'Ingrese el valor total de la propiedad';
                }
                if (!formData.requestedAmount || formData.requestedAmount <= 0) {
                    newErrors.requestedAmount = 'Ingrese un monto válido';
                }
                if (formData.requestedAmount > formData.propertyValue) {
                    newErrors.requestedAmount = 'El monto solicitado no puede ser mayor al valor de la propiedad';
                }
                if (!formData.term || formData.term <= 0) {
                    newErrors.term = 'Ingrese un plazo válido';
                }
                if (!formData.interestRate || formData.interestRate <= 0) {
                    newErrors.interestRate = 'Ingrese una tasa de interés válida';
                }
                break;

            case 2: // Documentación
                requiredDocuments.forEach(doc => {
                    if (!formData.documents[doc.key]) {
                        newErrors[`document_${doc.key}`] = `El documento ${doc.label} es requerido`;
                    }
                });
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            if (activeStep === steps.length - 1) {
                setOpenDialog(true);
            } else {
                setActiveStep((prevStep) => prevStep + 1);
            }
        }
    };

    const handleLoanTypeChange = (event) => {
        const selectedType = propertyTypes.find(type => type.value === event.target.value);
        setFormData({
            ...formData,
            propertyType: event.target.value,
            interestRate: selectedType ? selectedType.minRate : 0
        });
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const applicationData = {
                user: currentUser,
                propertyType: formData.propertyType,
                requestedAmount: parseFloat(formData.requestedAmount),
                term: parseInt(formData.term),
                interestRate: parseFloat(formData.interestRate),
                status: 'IN_REVIEW',
                monthlyIncome: parseFloat(formData.monthlyIncome),
                employmentYears: parseInt(formData.employmentYears),
                currentDebt: parseFloat(formData.currentDebt || 0),
                propertyValue: parseFloat(formData.propertyValue),
                documentationComplete: true
            };

            await ApplicationService.create(applicationData);
            navigate('/applications');
        } catch (err) {
            setError('Error al enviar la solicitud');
            console.error(err);
        } finally {
            setLoading(false);
            setOpenDialog(false);
        }
    };
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Ingreso Mensual"
                                type="number"
                                required
                                value={formData.monthlyIncome}
                                onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                                error={!!errors.monthlyIncome}
                                helperText={errors.monthlyIncome}
                                InputProps={{
                                    startAdornment: '$'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Años de Empleo"
                                type="number"
                                required
                                value={formData.employmentYears}
                                onChange={(e) => setFormData({...formData, employmentYears: e.target.value})}
                                error={!!errors.employmentYears}
                                helperText={errors.employmentYears}
                            />
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Tipo de Préstamo"
                                required
                                value={formData.propertyType}
                                onChange={handleLoanTypeChange}
                                error={!!errors.propertyType}
                                helperText={errors.propertyType}
                            >
                                {propertyTypes.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label} - Tasa: {option.minRate}% - {option.maxRate}%
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Valor Total de la Propiedad"
                                type="number"
                                required
                                value={formData.propertyValue}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    propertyValue: e.target.value
                                })}
                                error={!!errors.propertyValue}
                                helperText={errors.propertyValue}
                                InputProps={{
                                    startAdornment: '$'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Monto Solicitado"
                                type="number"
                                required
                                value={formData.requestedAmount}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    requestedAmount: e.target.value
                                })}
                                error={!!errors.requestedAmount}
                                helperText={errors.requestedAmount}
                                InputProps={{
                                    startAdornment: '$'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Plazo (años)"
                                type="number"
                                required
                                value={formData.term}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    term: e.target.value
                                })}
                                error={!!errors.term}
                                helperText={errors.term}
                                InputProps={{
                                    inputProps: { min: 1, max: 30 }
                                }}
                            />
                        </Grid>
                        {formData.propertyType && (
                            <Grid item xs={12}>
                                <Typography gutterBottom>
                                    Tasa de Interés: {formData.interestRate}%
                                </Typography>
                                <Slider
                                    value={formData.interestRate}
                                    min={propertyTypes.find(type => type.value === formData.propertyType)?.minRate || 0}
                                    max={propertyTypes.find(type => type.value === formData.propertyType)?.maxRate || 0}
                                    step={0.1}
                                    onChange={(_, value) => setFormData({
                                        ...formData,
                                        interestRate: value
                                    })}
                                    valueLabelDisplay="auto"
                                />
                            </Grid>
                        )}
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        {requiredDocuments.map((doc) => (
                            <Grid item xs={12} key={doc.key}>
                                <TextField
                                    type="file"
                                    fullWidth
                                    label={doc.label}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        documents: {
                                            ...formData.documents,
                                            [doc.key]: e.target.files[0]
                                        }
                                    })}
                                    error={!!errors[`document_${doc.key}`]}
                                    helperText={errors[`document_${doc.key}`]}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Alert severity="info">
                                Todos los documentos deben estar en formato PDF o imagen (JPG, PNG)
                            </Alert>
                        </Grid>
                    </Grid>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Resumen de la Solicitud
                        </Typography>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">Información Laboral y Financiera</Typography>
                                    <Typography>Ingreso Mensual: ${formData.monthlyIncome}</Typography>
                                    <Typography>Años de Empleo: {formData.employmentYears}</Typography>
                                    <Typography>Tasa de Interés Anual: {formData.interestRate}%</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">Detalles del Préstamo</Typography>
                                    <Typography>Tipo de Propiedad: {
                                        propertyTypes.find(type => type.value === formData.propertyType)?.label
                                    }</Typography>
                                    <Typography>Monto Solicitado: ${formData.requestedAmount}</Typography>
                                    <Typography>Plazo: {formData.term} años</Typography>
                                    <Typography>Valor de la Propiedad: ${formData.propertyValue}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">Documentos Adjuntos</Typography>
                                    {requiredDocuments.map((doc) => (
                                        <Typography key={doc.key}>
                                            {doc.label}: {formData.documents[doc.key]?.name || 'No adjuntado'}
                                        </Typography>
                                    ))}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                );
            default:
                return 'Paso Desconocido';
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
            <Container maxWidth="md" sx={{ ml: { xs: 4, sm: 8, md: 45 }, mr: 'auto' }}>
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                            Solicitud de Préstamo
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {getStepContent(activeStep)}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                            {activeStep !== 0 && (
                                <Button
                                    onClick={handleBack}
                                    sx={{ mr: 1 }}
                                >
                                    Atrás
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={loading}
                            >
                                {activeStep === steps.length - 1 ? 'Enviar Solicitud' : 'Siguiente'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>Confirmar Envío</DialogTitle>
                    <DialogContent>
                        <Typography>¿Está seguro de que desea enviar la solicitud de préstamo?</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Una vez enviada, no podrá modificar la información proporcionada.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                            {loading ? 'Enviando...' : 'Confirmar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default LoanApplication;