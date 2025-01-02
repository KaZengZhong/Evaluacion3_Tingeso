import React, { useEffect, useState } from 'react';
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
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    TextField
} from '@mui/material';
import ApplicationService from '../services/application.service';
import { useNavigate } from 'react-router-dom'; 
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';


function ApplicationManagement() {
    const navigate = useNavigate(); 
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); 
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [previewDialog, setPreviewDialog] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const handlePreviewFile = (fileData) => {
        setPreviewFile(fileData);
        setPreviewDialog(true);
    };

    const FilePreviewDialog = ({ file, open, onClose }) => {
        if (!file) return null;
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

    const applicationStatuses = [
        { value: 'IN_REVIEW', label: 'En Revisión Inicial' },
        { value: 'PENDING_DOCUMENTS', label: 'Pendiente de Documentación' },
        { value: 'IN_EVALUATION', label: 'En Evaluación' },
        { value: 'PRE_APPROVED', label: 'Pre-Aprobada' },
        { value: 'FINAL_APPROVAL', label: 'Aprobación Final' },
        { value: 'APPROVED', label: 'Aprobada' },
        { value: 'REJECTED', label: 'Rechazada' },
        { value: 'CANCELLED', label: 'Cancelada' },
        { value: 'IN_DISBURSEMENT', label: 'En Desembolso' }
    ];

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await ApplicationService.getAll();
            setApplications(response.data);
        } catch (err) {
            setError('Error al cargar las solicitudes');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await ApplicationService.updateStatus(applicationId, newStatus);
            await fetchApplications(); 
            setOpenDialog(false);
        } catch (err) {
            setError('Error al actualizar el estado');
            console.error('Error:', err);
        }
    };

    const handleEvaluateCredit = (applicationId) => {
        navigate(`/credit/${applicationId}`);
    };

    const getStatusInfo = (status) => {
        const statusInfo = {
            IN_REVIEW: { label: 'En Revisión Inicial', color: 'primary' },
            PENDING_DOCUMENTS: { label: 'Pendiente de Documentación', color: 'warning' },
            IN_EVALUATION: { label: 'En Evaluación', color: 'info' },
            PRE_APPROVED: { label: 'Pre-Aprobada', color: 'success' },
            FINAL_APPROVAL: { label: 'Aprobación Final', color: 'success' },
            APPROVED: { label: 'Aprobada', color: 'success' },
            REJECTED: { label: 'Rechazada', color: 'error' },
            CANCELLED: { label: 'Cancelada', color: 'default' },
            IN_DISBURSEMENT: { label: 'En Desembolso', color: 'info' }
        };
        return statusInfo[status] || { label: 'Desconocido', color: 'default' };
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
                {successMessage && ( // Mostrar mensaje de éxito
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {successMessage}
                    </Alert>
                )}

                <Typography variant="h4" gutterBottom>
                    Gestión de Solicitudes
                </Typography>

                {applications.map((application) => (
                    <Card key={application.id} sx={{ mb: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6">
                                        Solicitud #{application.id}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Cliente: {application.user.firstName} {application.user.lastName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setSelectedApplication(application);
                                            setOpenDialog(true);
                                        }}
                                    >
                                        Cambiar Estado
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary" 
                                        sx={{ ml: 2 }} 
                                        onClick={() => handleEvaluateCredit(application.id)} 
                                    >
                                        Evaluar Crédito
                                    </Button>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                <Grid item xs={12} md={3}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Estado Actual
                                        </Typography>
                                        <Chip
                                            label={getStatusInfo(application.status).label}
                                            color={getStatusInfo(application.status).color}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Tipo de Préstamo
                                        </Typography>
                                        <Typography>
                                            {getLoanTypeName(application.propertyType)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Monto Solicitado
                                        </Typography>
                                        <Typography>
                                            ${application.requestedAmount?.toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Tasa de Interés
                                        </Typography>
                                        <Typography>
                                            {application.interestRate}%
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Ingreso Mensual
                                        </Typography>
                                        <Typography>
                                            ${application.monthlyIncome?.toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Años de Empleo
                                        </Typography>
                                        <Typography>
                                            {application.employmentYears} años
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography color="text.secondary" gutterBottom>
                                            Valor de la Propiedad
                                        </Typography>
                                        <Typography>
                                            ${application.propertyValue?.toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>


                            {application.documents && (
                                <Grid container spacing={3} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>
                                            Documentos Adjuntos
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {Object.entries(JSON.parse(application.documents || '{}')).map(([key, doc]) => (
                                                <Grid item xs={12} md={4} key={key}>
                                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Box>
                                                                <Typography color="text.secondary" gutterBottom>
                                                                    {key === 'incomeProof' ? 'Comprobante de Ingresos' :
                                                                    key === 'propertyAppraisal' ? 'Certificado de Avalúo' :
                                                                    key === 'creditHistory' ? 'Historial Crediticio' :
                                                                    key === 'firstPropertyDeed' ? 'Escritura Primera Vivienda' :
                                                                    key === 'businessFinancials' ? 'Estado Financiero' :
                                                                    key === 'businessPlan' ? 'Plan de Negocios' :
                                                                    key === 'renovationBudget' ? 'Presupuesto Remodelación' :
                                                                    key === 'updatedAppraisal' ? 'Avalúo Actualizado' :
                                                                    key}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {doc.name}
                                                                </Typography>
                                                            </Box>
                                                            {doc.content && (
                                                                <Button 
                                                                    variant="outlined" 
                                                                    size="small"
                                                                    onClick={() => handlePreviewFile(doc)}
                                                                >
                                                                    Ver documento
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}                

                        </CardContent>
                    </Card>
                ))}

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>Cambiar Estado</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            label="Estado"
                            fullWidth
                            value={selectedApplication?.status || ''}
                            onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
                        >
                            {applicationStatuses.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                        <Button onClick={() => handleStatusChange(selectedApplication.id, selectedApplication.status)}>
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <FilePreviewDialog
                file={previewFile}
                open={previewDialog}
                onClose={() => {
                    setPreviewDialog(false);
                    setPreviewFile(null);
                }}
            />
        </Box>
    );
}

export default ApplicationManagement;
