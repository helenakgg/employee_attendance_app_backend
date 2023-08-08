import db from "../database/index.js"

export const User = db.sequelize.define("users", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    role_id : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    email: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    password: {
        type: db.Sequelize.STRING(255),
        allowNull : false
    },
    fullname: {
        type : db.Sequelize.STRING(45),
        allowNull : true
    },
    birthdate: {
        type : db.Sequelize.DATE,
        allowNull : true
    },
    join_date: {
        type : db.Sequelize.DATE,
        allowNull : true
    },
    invitation_token : {
        type : db.Sequelize.STRING(255),
        allowNull : true,
    },
    token_expiration : {
        type : db.Sequelize.TIME,
        allowNull : true,
    },
    salary : {
        type : db.Sequelize.INTEGER,
        allowNull : true
    },
    shift_id : {
        type : db.Sequelize.INTEGER,
        allowNull : true
    },
},
{ timestamps: false }
)

export const Role = db.sequelize.define("roles", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    role_name : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
},
{ timestamps: false }
)

export const Shift = db.sequelize.define("shifts", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    shift_name : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    start_time : {
        type : db.Sequelize.TIME,
        allowNull : false
    },
    end_time : {
        type : db.Sequelize.TIME,
        allowNull : false
    },
},
{ timestamps: false }
)

export const Attendance = db.sequelize.define("attendances", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    date : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    clock_in : {
        type : db.Sequelize.TIME,
        allowNull : true
    },
    clock_out : {
        type : db.Sequelize.TIME,
        allowNull : true
    },
},
{ timestamps: false }
)

export const PayrollReport = db.sequelize.define("payroll_reports", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    report_date : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    user_id : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    start_date : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    end_date : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    deduction : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    net_salary : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
},
{ timestamps: false }
)

// @relation
User.hasOne(Role, { foreignKey : 'role_id' });
User.hasOne(Shift, { foreignKey : 'shift_id' });
User.belongsTo(Attendance, { foreignKey : 'user_id' });
User.belongsTo(PayrollReport, { foreignKey : 'user_id' });

Role.belongsTo(User, { foreignKey : 'role_id' });
Shift.belongsTo(User, { foreignKey : 'shift_id' });
Attendance.hasMany(User, { foreignKey : 'user_id' });
PayrollReport.hasMany(User, { foreignKey : 'user_id' });