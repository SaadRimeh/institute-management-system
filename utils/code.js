import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/env.js";

export const LOGIN_CODE_REGEX = /^\d{6}$/;

export const generateLoginCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const validateLoginCodeFormat = (code) => LOGIN_CODE_REGEX.test(code);

export const hashLoginCode = async (code) => bcrypt.hash(code, 10);

export const compareLoginCode = async (code, hash) => bcrypt.compare(code, hash);

export const buildLoginCodeIndex = (code) =>
  crypto
    .createHmac("sha256", env.loginCodePepper)
    .update(code)
    .digest("hex");

