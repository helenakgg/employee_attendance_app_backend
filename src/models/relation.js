import { User, Role, Shift, Salary } from "./user.js";
import { Attendance, PayrollReport } from "./attendance.js";

User.belongsTo(Role, {foreignKey : 'roleId'});
User.belongsTo(Shift, {foreignKey : 'shiftId'});
User.hasOne(Salary, { foreignKey : 'userId' });
User.hasMany(Attendance, { foreignKey : 'userId' });
User.hasMany(PayrollReport, { foreignKey : 'userId' });

Role.hasMany(User, { foreignKey : 'roleId' });
Shift.hasMany(User, {foreignKey : 'shiftId'});
Salary.belongsTo(User, { foreignKey : 'userId' })
Attendance.belongsTo(User, {foreignKey : 'userId'});
PayrollReport.belongsTo(User, { foreignKey : 'userId' })

export { User, Role, Shift, Salary, Attendance, PayrollReport }