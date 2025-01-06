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
    Slider,
    IconButton
} from '@mui/material';
import ApplicationService from '../services/application.service';
import UserService from '../services/user.service';
import CloseIcon from '@mui/icons-material/Close';

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
        }
    });

    const [errors, setErrors] = useState({});
 
    const formatNumber = (value) => {
        if (!value) return ''; 
        return new Intl.NumberFormat('es-CL').format(value);
    };

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

    const getRequiredDocuments = (propertyType) => {
        switch (propertyType) {
            case 'FIRST_HOME':
                return [
                    { key: 'incomeProof', label: 'Comprobante de ingresos' },
                    { key: 'propertyAppraisal', label: 'Certificado de avalúo' },
                    { key: 'creditHistory', label: 'Historial crediticio' }
                ];
            case 'SECOND_HOME':
                return [
                    { key: 'incomeProof', label: 'Comprobante de ingresos' },
                    { key: 'propertyAppraisal', label: 'Certificado de avalúo' },
                    { key: 'firstPropertyDeed', label: 'Escritura de la primera vivienda' },
                    { key: 'creditHistory', label: 'Historial crediticio' }
                ];
            case 'COMMERCIAL':
                return [
                    { key: 'businessFinancials', label: 'Estado financiero del negocio' },
                    { key: 'incomeProof', label: 'Comprobante de ingresos' },
                    { key: 'propertyAppraisal', label: 'Certificado de avalúo' },
                    { key: 'businessPlan', label: 'Plan de negocios' }
                ];
            case 'RENOVATION':
                return [
                    { key: 'incomeProof', label: 'Comprobante de ingresos' },
                    { key: 'renovationBudget', label: 'Presupuesto de la remodelación' },
                    { key: 'updatedAppraisal', label: 'Certificado de avalúo actualizado' }
                ];
            default:
                return [];
        }
    };

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
                const requestedAmount = parseFloat(formData.requestedAmount);
                const propertyValue = parseFloat(formData.propertyValue);

                if (!isNaN(requestedAmount) && !isNaN(propertyValue) && requestedAmount > propertyValue) {
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
                getRequiredDocuments(formData.propertyType).forEach(doc => {
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

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); 
            
            reader.onload = () => {
                console.log('Base64 generado:', reader.result.substring(0, 50) + '...'); // Para debug
                resolve(reader.result);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e, documentKey) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            console.log('Tipo de archivo:', file.type); // Para debug

            // Validar tipo de archivo
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    [`document_${documentKey}`]: 'Solo se permiten archivos PDF, JPG o PNG'
                }));
                return;
            }

            // Validar tamaño (5MB máximo)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    [`document_${documentKey}`]: 'El archivo no debe superar 5MB'
                }));
                return;
            }

            // Convertir a Base64
            const base64 = await convertToBase64(file);

            setFormData({
                ...formData,
                documents: {
                    ...formData.documents,
                    [documentKey]: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: base64 // Se guarda el archivo en Base64
                    }
                }
            });

            // Para debug
            console.log('Documento guardado:', {
                name: file.name,
                type: file.type,
                size: file.size,
                contentPreview: base64.substring(0, 50) + '...'
            });

        } catch (error) {
            console.error('Error al procesar el archivo:', error);
            setErrors(prev => ({
                ...prev,
                [`document_${documentKey}`]: 'Error al procesar el archivo'
            }));
        }
    };

    const [previewDialog, setPreviewDialog] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const handlePreviewFile = (fileData) => {
        setPreviewFile(fileData);
        setPreviewDialog(true);
    };

    const FilePreviewDialog = ({ file, open, onClose }) => {
        if (!file) return null;
    
        console.log('Intentando mostrar archivo:', {
            name: file.name,
            type: file.type,
            contentPreview: file.content?.substring(0, 50) + '...'
        });
    
        return (
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {file.name}
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {file.type.includes('image') ? (
                        <>
                            <Typography variant="caption" display="block" gutterBottom>
                                Tipo de archivo: {file.type}
                            </Typography>
                            <img 
                                src={file.content}
                                alt={file.name}
                                style={{ maxWidth: '100%', height: 'auto' }}
                                onError={(e) => {
                                    console.error('Error al cargar imagen:', e);
                                    e.target.src = ''; // Limpiar la fuente si hay error
                                    e.target.alt = 'Error al cargar la imagen';
                                }}
                            />
                        </>
                    ) : file.type === 'application/pdf' ? (
                        <>
                            <Typography variant="caption" display="block" gutterBottom>
                                PDF Preview
                            </Typography>
                            <object
                                data={file.content}
                                type="application/pdf"
                                width="100%"
                                height="500px"
                            >
                                <Typography>No se puede mostrar el PDF</Typography>
                            </object>
                        </>
                    ) : (
                        <Typography>
                            Tipo de archivo no soportado: {file.type}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        );
    };

    // En la sección de documentos se agrega botón de previsualización
    const renderDocumentUpload = (doc) => (
        <Grid item xs={12} key={doc.key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                    type="file"
                    fullWidth
                    label={doc.label}
                    onChange={(e) => handleFileChange(e, doc.key)}
                    error={!!errors[`document_${doc.key}`]}
                    helperText={errors[`document_${doc.key}`]}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                {formData.documents[doc.key] && (
                    <Button 
                        variant="outlined"
                        onClick={() => handlePreviewFile(formData.documents[doc.key])}
                    >
                        Ver archivo
                    </Button>
                )}
            </Box>
        </Grid>
    );

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

            // Crear un objeto limpio para los documentos
            const documentsToSend = {};
            
            // Procesar cada documento
            Object.entries(formData.documents).forEach(([key, doc]) => {
                if (doc && doc.content) {
                    documentsToSend[key] = {
                        name: doc.name,
                        type: doc.type,
                        content: doc.content
                    };
                }
            });

            const jsonString = JSON.stringify(documentsToSend);
            console.log('Tamaño de los documentos en bytes:', new Blob([jsonString]).size);

            if (new Blob([jsonString]).size > 1024 * 1024 * 10) { // 10MB límite
                throw new Error('Los documentos son demasiado grandes. El límite es 10MB.');
            }

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
                documentationComplete: true,
                documents: jsonString
            };

            console.log('Enviando aplicación:', applicationData);

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
                                type="text"
                                required
                                value={formData.monthlyIncome ? formatNumber(formData.monthlyIncome) : ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData({
                                        ...formData,
                                        monthlyIncome: value
                                    });
                                }}
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
                                type="text"
                                required
                                value={formData.propertyValue ? formatNumber(formData.propertyValue) : ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData({
                                        ...formData,
                                        propertyValue: value
                                    });
                                }}
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
                                type="text"
                                required
                                value={formData.requestedAmount ? formatNumber(formData.requestedAmount) : ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData({
                                        ...formData,
                                        requestedAmount: value
                                    });
                                }}
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
                            {getRequiredDocuments(formData.propertyType).map((doc) => 
                                renderDocumentUpload(doc)
                            )}
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
                                        {getRequiredDocuments(formData.propertyType).map((doc) => (
                                            <Box key={doc.key} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                <Typography>
                                                    {doc.label}: {formData.documents[doc.key]?.name || 'No adjuntado'}
                                                </Typography>
                                                {formData.documents[doc.key] && (
                                                    <Button 
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handlePreviewFile(formData.documents[doc.key])}
                                                    >
                                                        Ver archivo
                                                    </Button>
                                                )}
                                            </Box>
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
        <>
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
           <Container maxWidth="md">
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
        <FilePreviewDialog
                file={previewFile}
                open={previewDialog}
                onClose={() => {
                    setPreviewDialog(false);
                    setPreviewFile(null);
                }}
            />
        </>
    );
};

export default LoanApplication;