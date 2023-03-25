import { toast } from 'react-toastify';

interface toastProps {
    message: string,
    type?: "info" | "success" | "warning" | "error" | "default"
    theme?: "light" | "dark" | "colored"
}

export default function Toast({ message, type = "info", theme = "light" }: toastProps) {
    toast(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme,
        type,
    })
}
