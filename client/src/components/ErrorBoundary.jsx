import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md" sx={{ mt: 8 }}>
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h4" gutterBottom color="error">
                            Oops! Something went wrong
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            The application encountered an unexpected error.
                        </Typography>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box sx={{ mb: 3, textAlign: 'left', bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
                                <Typography variant="body2" component="pre" sx={{ fontSize: 12 }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button variant="contained" onClick={this.handleReload}>
                                Reload Page
                            </Button>
                            <Button variant="outlined" onClick={this.handleGoHome}>
                                Go to Homepage
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
