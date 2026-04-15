import { adminModule } from "./admin/index.js";
import { authModule } from "./auth/index.js";
import { studentModule } from "./student/index.js";
import { teacherModule } from "./teacher/index.js";

export const modules = [authModule, adminModule, teacherModule, studentModule];

