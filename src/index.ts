import inq from "inquirer";

import { pool } from "./dbConnect";

async function menu() {
  inq
    .prompt({
      name: "select",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
      ],
    })
    .then((ans: any) => {
      switch (ans.select) {
        case "Add Employee":
          addEmployee();
          break;
        case "View All Employees":
          viewAllEmployees();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "Update Employee Role":
          updateEmpRole();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Department":
          addDepartment();
          break;
        default:
          menu();
          break;
      }
    });
}

async function addDepartment() {
  try {
    const res = await inq.prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department you would like to add?",
      },
    ]);

    await pool.query(`INSERT INTO department (name) VALUES ($1)`, [res.name]);
  } catch (e) {
    console.error(e);
  }

  menu();
}

async function addRole() {
  try {
    const departments = await pool.query(`SELECT id, name FROM department`);
    const selectedDep = [];

    for (var i = 0; i < departments.rows.length; i++) {
      selectedDep.push({
        name: departments.rows[i].name,
        value: departments.rows[i].id,
      });
    }

    const res = await inq.prompt([
      {
        type: "input",
        name: "title",
        message: "What is the name of the role?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the role?",
      },
      {
        type: "list",
        name: "department",
        message: "Which department does the role belong to?",
        choices: selectedDep,
      },
    ]);
    await pool.query(
      `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`,
      [res.title, res.salary, res.department]
    );

    console.log("\n");
    console.log(`Added ${res.title} to the database`);
  } catch (e) {
    console.error(e);
  }
  menu();
}

async function updateEmpRole() {
  try {
    const employees = await pool.query(
      `SELECT id, first_name, last_name FROM employee`
    );
    const selectedEmp = [];

    const roles = await pool.query(`SELECT id, title FROM role`);
    const role = [];

    for (var i = 0; i < roles.rows.length; i++) {
      role.push({
        name: roles.rows[i].title,
        value: roles.rows[i].id,
      });
    }

    for (var j = 0; j < employees.rows.length; j++) {
      selectedEmp.push({
        name: `${employees.rows[j].first_name} ${employees.rows[j].last_name}`,
        value: employees.rows[j].id,
      });
    }

    const res = await inq.prompt([
      {
        type: "list",
        name: "employee",
        message: "Which employee's role do you wish to update?",
        choices: selectedEmp,
      },
      {
        type: "list",
        name: "role",
        message: "Which role do you want to assign to the selected employee?",
        choices: role,
      },
    ]);

    await pool.query(`UPDATE employee SET role_id = $1 WHERE id =$2`, [
      res.role,
      res.employee,
    ]);

    console.log("\n");
    console.log("Updated employee's role.");
  } catch (e) {
    console.log(e);
  }
  menu();
}

async function addEmployee() {
  try {
    const roles = await pool.query(`SELECT id, title FROM role`);
    const role = [];

    const managers = await pool.query(
      `SELECT id, first_name, last_name FROM employee`
    );
    const manager = [];

    for (var i = 0; i < roles.rows.length; i++) {
      role.push({
        name: roles.rows[i].title,
        value: roles.rows[i].id,
      });
    }

    for (var j = 0; j < managers.rows.length; j++) {
      manager.push({
        name: `${managers.rows[j].first_name} ${managers.rows[j].last_name}`,
        value: managers.rows[j].id,
      });
    }

    const res = await inq.prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "role",
        message: "What is the employee's role?",
        choices: role,
      },
      {
        type: "list",
        name: "manager",
        message: "Who is the employee's manager",
        choices: manager,
      },
    ]);

    await pool.query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1,$2,$3,$4)`,
      [res.firstName, res.lastName, res.role, res.manager]
    );

    console.log("\n");
    console.log(
      "Added " + res.firstName + " " + res.lastName + " to the database"
    );
  } catch (e) {
    console.error(e);
  }

  menu();
}

async function viewAllRoles() {
  try {
    const res = await pool.query(`
      SELECT
        role.id,
        role.title
      FROM
        role
      `);
    console.log("\n");
    console.log("id   role");
    console.log("--   -------");
    res.rows.forEach((r) => {
      console.log(` ${r.id}   ${r.title}`);
    });
    console.log("\n");
  } catch (err) {
    console.error(err);
  }
  menu();
}

async function viewAllEmployees() {
  try {
    const res = await pool.query(`
      SELECT
        employee.id,
        employee.first_name,
        employee.last_name,
        role.title AS role,
        department.name AS department,
        role.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
      FROM
        employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee AS manager ON employee.manager_id = manager.id
      `);
    console.log("\n");
    console.log(
      "id   firstName   lastName   title        department          salary          manager"
    );
    console.log(
      "--   ----------  --------   --------     ------------        --------        -------------"
    );
    res.rows.forEach((r) => {
      console.log(
        ` ${r.id}   ${r.first_name}   ${r.last_name}   ${r.role}       ${
          r.department
        }        ${r.salary}          ${r.manager || "No Manager"}`
      );
    });
    console.log("\n");
  } catch (err) {
    console.error(err);
  }
  menu();
}

async function viewAllDepartments() {
  try {
    const res = await pool.query(`
      SELECT
        department.id,
        department.name
      FROM
        department
      `);
    console.log("\n");
    console.log("id   name");
    console.log("--   ----------");
    res.rows.forEach((r) => {
      console.log(` ${r.id}   ${r.name}`);
    });
    console.log("\n");
  } catch (err) {
    console.error(err);
  }
  menu();
}

// function addEmployees() {
//   inq
//     .prompt(
//       {
//         type: "input",
//         name: "firstName",
//         message: "What is the employee's first name?",
//       },
//       {
//         type: "input",
//         name: "lastName",
//         message: "What is the employee's first name?",
//       },
//       {
//         type: "input",
//         name: "empRole",
//         message: "What is the employee's role?",
//       },
//       {
//         type: "input",
//         name: "empManager",
//         message: "Who is the employee's manager?",
//       }
//     )
//     .then((answer: { department: any }) => {
//       console.log(answer.department);
//     });
// }
menu();
