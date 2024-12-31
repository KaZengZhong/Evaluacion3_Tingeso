import React, { useEffect } from 'react';
import { Box, Button, Card, CardContent, Container, Grid, Typography, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';

const Home = () => {
   const navigate = useNavigate();
   const [connectionStatus, setConnectionStatus] = React.useState(null);
   const [showAlert, setShowAlert] = React.useState(false);
   const isAuthenticated = UserService.getCurrentUser();

   const handleLoanRequest = () => {
       if (!isAuthenticated) {
           setShowAlert(true);
       } else {
           navigate('/loan-application');
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
            pb: 4
       }}>
           <Container maxWidth="lg">
               {connectionStatus && (
                   <Alert 
                       severity={connectionStatus.type} 
                       sx={{ mb: 2 }}
                   >
                       {connectionStatus.message}
                   </Alert>
               )}
               
               <Box textAlign="center" mb={6}>
                   <Typography variant="h3" component="h1" gutterBottom>
                       Bienvenido a PrestaBanco
                   </Typography>
                   <Typography variant="h6" color="text.secondary">
                       La mejor opción para tu crédito hipotecario
                   </Typography>
               </Box>

               <Grid container spacing={4}>
                   <Grid item xs={12} sm={6} md={4}>
                       <Card>
                           <CardContent>
                               <Typography variant="h5" component="h2" gutterBottom>
                                   Simula tu Préstamo
                               </Typography>
                               <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                   Calcula tus cuotas mensuales y conoce nuestras tasas.
                               </Typography>
                               <Button 
                                   variant="contained" 
                                   fullWidth 
                                   size="large"
                                   sx={{ py: 1.5 }}
                                   onClick={() => navigate('/loan-simulator')}
                               >
                                   Simular Ahora
                               </Button>
                           </CardContent>
                       </Card>
                   </Grid>

                   <Grid item xs={12} sm={6} md={4}>
                       <Card>
                           <CardContent>
                               <Typography variant="h5" component="h2" gutterBottom>
                                   Solicita tu Crédito
                               </Typography>
                               <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                   Comienza el proceso de tu préstamo hipotecario.
                               </Typography>
                               <Button 
                                   variant="contained" 
                                   fullWidth 
                                   size="large"
                                   sx={{ py: 1.5 }}
                                   onClick={handleLoanRequest}
                               >
                                   Solicitar
                               </Button>
                           </CardContent>
                       </Card>
                   </Grid>

                   <Grid item xs={12} sm={6} md={4}>
                       <Card>
                           <CardContent>
                               <Typography variant="h5" component="h2" gutterBottom>
                                   Seguimiento
                               </Typography>
                               <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                   Revisa el estado de tu solicitud.
                               </Typography>
                               <Button 
                                   variant="contained" 
                                   fullWidth 
                                   size="large"
                                   sx={{ py: 1.5 }}
                                   onClick={() => navigate('/applications')}
                               >
                                   Ver Estado
                               </Button>
                           </CardContent>
                       </Card>
                   </Grid>
               </Grid>
           </Container>

           <Snackbar
               open={showAlert}
               autoHideDuration={3000}
               onClose={() => setShowAlert(false)}
               anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
           >
               <Alert 
                   onClose={() => setShowAlert(false)} 
                   severity="info" 
                   sx={{ width: '100%' }}
               >
                   Para solicitar un préstamo, debes iniciar sesión primero
               </Alert>
           </Snackbar>
       </Box>
   );
};

export default Home;