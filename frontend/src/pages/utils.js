import {toast} from 'react-toastify';
export const handleSuccess=(msg)=>{
    toast.success(msg, {
        position:'top-right',
        type:'success',
        theme:'colored'
    })
}
export const handleError=(error)=>{
    toast.error(error, {
        position:'top-right',
        type:'error',
        theme:'colored'
    })
}

// Single source of truth for password rules - used by signup and the reset-password
// flow so they can't drift apart.
export const PASSWORD_MIN_LENGTH = 6;
export const passwordValidationRules = {
    required: "Password is required",
    minLength: {
        value: PASSWORD_MIN_LENGTH,
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    }
};
