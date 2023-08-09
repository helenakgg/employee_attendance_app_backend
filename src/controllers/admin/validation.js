import * as Yup from "yup"
import YupPassword from 'yup-password';
YupPassword(Yup);

export const CreateEmployeeValidationSchema = Yup.object({
    email : Yup.string().email("Invalid email").required("Email is required"),
    password : Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters, 1 symbol, 1 uppercase.")
        .minUppercase(1, "Password must has at least 1 uppercase letter.")
        .minSymbols(1, "Password must has at least 1 symbol."),
    fullname : Yup.string().required("Full name is required."),
    birthdate : Yup.date().required("Birthdate is required."),
    joinDate : Yup.date().required("Join Date is required."),
    shiftId : Yup.string().required("Shift is required"),
    salary : Yup.string().required("Salary is required"),
})
