# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component     | Backend endpoints                           | Database SQL           |
| --------------------------------------------------- | ---------------------- | ---------------------------------------     | ---------------------- |
| View home page                                      | home.tsx               | none                                        | none                   |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx           | [POST] /api/auth                            | INSERT INTO user (name, email, password) VALUES (?, ?, ?) |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx              | [PUT] /api/auth                             | SELECT * FROM user WHERE email=?; SELECT * FROM userRole WHERE userId=?; |
| Order pizza                                         | menu.tsx               | [GET] /api/order/menu, [GET] /api/franchise | SELECT * FROM menu; SELECT id, name FROM franchise; |
| Verify pizza                                        | payment.tsx            | none                                        | none                   |
| View profile page                                   | dinerDashboard.tsx     | [GET] /api/order                            | SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=? LIMIT ${offset},${config.db.listPerPage}; SELECT id, menuId, description, price FROM orderItem WHERE orderId=?; |
| View franchise<br/>(as diner)                       | franchiseDashboard.tsx | [GET] /api/franchise/1                      | SELECT id, name FROM franchise; SELECT id, name FROM store WHERE franchiseId=?; |
| Logout                                              | logout.tsx             | [DELETE] /api/auth                          | DELETE FROM auth WHERE token=? |
| View About page                                     | about.tsx              | none                                        | none                   |
| View History page                                   | history.tsx            | none                                        | none                   |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx              | [PUT] /api/auth                             | SELECT * FROM user WHERE email=?; SELECT * FROM userRole WHERE userId=?; |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx | [GET] /api/franchise/3                      | SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee'; SELECT s.id, s.name, COALESCE(SUM(oi.price), 0) AS totalRevenue FROM dinerOrder AS do JOIN orderItem AS oi ON do.id=oi.orderId RIGHT JOIN store AS s ON s.id=do.storeId WHERE s.franchiseId=? GROUP BY s.id; |
| Create a store                                      | createStore.tsx        | [POST] /api/franchise/1/store               | INSERT INTO store (franchiseId, name) VALUES (?, ?) |
| Close a store                                       | closeStore.tsx         | [DELETE] /api/franchise/1/store/2           | DELETE FROM store WHERE franchiseId=? AND id=? |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx              | [PUT] /api/auth                             | SELECT * FROM user WHERE email=?; SELECT * FROM userRole WHERE userId=?; |
| View Admin page                                     | adminDashboard.tsx     | [GET] /api/franchise                        | SELECT id, name FROM franchise; SELECT id, name FROM store WHERE franchiseId=?; |
| Create a franchise for t@jwt.com                    | createFranchise.tsx    | [POST] /api/franchise                       | SELECT id, name FROM user WHERE email=? |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx     | [DELETE] /api/franchise/1                   | DELETE FROM store WHERE franchiseId=?; DELETE FROM userRole WHERE objectId=?; DELETE FROM franchise WHERE id=?; |
