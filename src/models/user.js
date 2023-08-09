import db from "../database/index.js"

export const User = db.sequelize.define("users", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    roleId : {
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
    joinDate: {
        type : db.Sequelize.DATE,
        allowNull : true
    },
    invitationToken : {
        type : db.Sequelize.STRING(255),
        allowNull : true,
    },
    tokenExpiration : {
        type : db.Sequelize.TIME,
        allowNull : true,
    },
    shiftId : {
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
    roleName : {
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
    shiftName : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    startTime : {
        type : db.Sequelize.TIME,
        allowNull : false
    },
    endTime : {
        type : db.Sequelize.TIME,
        allowNull : false
    },
},
{ timestamps: false }
)

export const Salary = db.sequelize.define("salaries", {
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
    salary : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
},
{ timestamps: false }
)