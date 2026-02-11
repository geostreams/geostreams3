import { Alert, Snackbar, Fade } from "@mui/material";

const StatusMessage = ({
    open,
    message,
    severity = "success",
    onClose,
    autoHideDuration = 4000,
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            TransitionComponent={Fade}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    "& .MuiAlert-icon": {
                        fontSize: "1.2rem",
                    },
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default StatusMessage;
