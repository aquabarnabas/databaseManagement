INSERT INTO department (name) VALUES ('Sales'), ('Legal'), ('Finance'), ('Engineering');

INSERT INTO role (title, salary, department_id) VALUES
('Sales Rep', 80000, 1),
('Legal Team', 70000, 2),
('Finance Team', 90000, 3),
('Engineering Team', 100000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Hoppla', 'Doe', 1, NULL),
('SquidWard', 'Tentacles', 2, 1),
('Bob', 'Parr', 3, 1);
