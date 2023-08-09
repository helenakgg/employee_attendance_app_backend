import db from "../database/index.js"

export const Attendance = db.sequelize.define("attendances", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    date : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    clockIn : {
        type : db.Sequelize.TIME,
        allowNull : true
    },
    clockOut : {
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
    reportDate : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    userId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    startDate : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    endDate : {
        type : db.Sequelize.DATEONLY,
        allowNull : false
    },
    deductions : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    netSalary : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
},
{ timestamps: false }
)