const { z } = require("zod");

// USER SCHEMAS
const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phoneNumber: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    avatar: z.string().optional(),
  }),
});

const loginUserSchema = z.object({
  body: z.object({
    phoneNumber: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    password: z.string().min(1, "Password is required"),
  }),
});

const activationSchema = z.object({
  body: z.object({
    activation_token: z.string().min(1, "Activation token is required"),
  }),
});

const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must match"),
  }),
});

// SHOP SCHEMAS
const registerShopSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Shop name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().min(3, "Address is required"),
    phoneNumber: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    zipCode: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    avatar: z.string().optional(),
  }),
});

const loginShopSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

// PRODUCT SCHEMAS
const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name is required"),
    description: z.string().min(5, "Product description is required"),
    category: z.string().min(1, "Category is required"),
    originalPrice: z.union([z.string(), z.number()]).optional(),
    discountPrice: z.union([z.string(), z.number()]),
    stock: z.union([z.string(), z.number()]),
    shopId: z.string().min(1, "Shop ID is required"),
    images: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

// ORDER SCHEMAS
const createOrderSchema = z.object({
  body: z.object({
    cart: z.array(z.any()).min(1, "Cart cannot be empty"),
    shippingAddress: z.object({
      address1: z.string().optional(),
      address2: z.string().optional(),
      zipCode: z.union([z.string(), z.number()]).optional(),
      country: z.string().optional(),
      city: z.string().optional(),
    }).passthrough(),
    user: z.object({
      _id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
    }).passthrough(),
    totalPrice: z.number().positive("Total price must be positive"),
    paymentInfo: z.object({
      id: z.string().optional(),
      status: z.string().optional(),
      type: z.string(),
    }).passthrough().optional(),
  }),
});

// PAYMENT SCHEMAS
const processPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be greater than 0"),
  }),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  activationSchema,
  updatePasswordSchema,
  registerShopSchema,
  loginShopSchema,
  createProductSchema,
  createOrderSchema,
  processPaymentSchema,
};
