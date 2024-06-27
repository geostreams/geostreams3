import React from 'react';
import { Typography, Container, Box, Paper } from '@mui/material';

function UserProfile({ user }) {
    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        User Profile
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Username: {user.username}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Email: {user.email}
                    </Typography>
                    {/* Additional user info can be displayed here */}
                </Box>
            </Paper>
        </Container>
    );
}

export default UserProfile;
