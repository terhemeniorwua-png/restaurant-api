const { z } = require("zod");

const registrationValidation = z.object({
    name: z.string().trim().min(2, "Name must be atleast 2 characters!"),
    email: z.string().trim().min(8, "Email must be atleast 8 characters!"),
    phone: z.string().trim().length(11, /^(\+234|0)(70|80|81|90|91)\d{8}$/ , "Phone number must be 11 digits!"),
    password: z.string().min(6, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/, "Password must be atleast 6 characters, include a special character, a number, uppercase and lowercase letters"),
    role: z.string().trim()
});

module.exports = registrationValidation;