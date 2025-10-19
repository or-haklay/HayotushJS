import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Modal,
  Alert,
  Spinner,
  Badge,
  Dropdown,
} from "react-bootstrap";
import {
  Search,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  MoreVertical,
} from "lucide-react";
import adminService from "../../services/adminService";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUsers();
  }, [
    currentPage,
    searchTerm,
    subscriptionFilter,
    adminFilter,
    sortBy,
    sortOrder,
  ]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        subscriptionPlan: subscriptionFilter,
        isAdmin: adminFilter,
      };

      const response = await adminService.getUsersList(
        filters,
        currentPage,
        20
      );
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("שגיאה בטעינת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiresAt: user.subscriptionExpiresAt
        ? new Date(user.subscriptionExpiresAt).toISOString().split("T")[0]
        : "",
      points: user.points || 0,
      coins: user.coins || 0,
      isAdmin: user.isAdmin || false,
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      await adminService.updateUser(selectedUser._id, editForm);
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setError("שגיאה בעדכון המשתמש");
    }
  };

  const handleBlockUser = async (user) => {
    try {
      await adminService.blockUser(user._id, !user.blocked);
      loadUsers();
    } catch (err) {
      console.error("Error blocking user:", err);
      setError("שגיאה בחסימת המשתמש");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("שגיאה במחיקת המשתמש");
    }
  };

  const getSubscriptionBadge = (plan) => {
    const badges = {
      free: { variant: "secondary", text: "חינם" },
      premium: { variant: "success", text: "Premium" },
      gold: { variant: "warning", text: "Gold" },
    };
    const badge = badges[plan] || badges.free;
    return <Badge bg={badge.variant}>{badge.text}</Badge>;
  };

  const getStatusBadge = (user) => {
    if (user.blocked) {
      return <Badge bg="danger">חסום</Badge>;
    }
    if (user.isAdmin) {
      return <Badge bg="primary">אדמין</Badge>;
    }
    return <Badge bg="success">פעיל</Badge>;
  };

  if (loading && users.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">טוען משתמשים...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>ניהול משתמשים</h2>
        <div className="text-muted">סה"כ {users.length} משתמשים</div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="חיפוש לפי שם או אימייל..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={subscriptionFilter}
                onChange={(e) => setSubscriptionFilter(e.target.value)}
              >
                <option value="">כל המנויים</option>
                <option value="free">חינם</option>
                <option value="premium">Premium</option>
                <option value="gold">Gold</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
              >
                <option value="">כל המשתמשים</option>
                <option value="true">אדמינים</option>
                <option value="false">משתמשים רגילים</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="createdAt-desc">חדשים קודם</option>
                <option value="createdAt-asc">ישנים קודם</option>
                <option value="name-asc">שם א-ת</option>
                <option value="name-desc">שם ת-א</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body className="p-0">
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>משתמש</th>
                <th>אימייל</th>
                <th>מנוי</th>
                <th>סטטוס</th>
                <th>תאריך הצטרפות</th>
                <th>פעילות אחרונה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="rounded-circle"
                            style={{ width: "32px", height: "32px" }}
                          />
                        ) : (
                          <div
                            className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px" }}
                          >
                            <span className="text-white small">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="fw-bold">{user.name}</div>
                        {user.isAdmin && (
                          <small className="text-primary">אדמין</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getSubscriptionBadge(user.subscriptionPlan)}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("he-IL")}
                  </td>
                  <td>
                    {user.lastActive
                      ? new Date(user.lastActive).toLocaleDateString("he-IL")
                      : "לא ידוע"}
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <MoreVertical size={16} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEditUser(user)}>
                          <Edit size={16} className="me-2" />
                          עריכה
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleBlockUser(user)}
                          className={
                            user.blocked ? "text-success" : "text-warning"
                          }
                        >
                          {user.blocked ? (
                            <>
                              <UserCheck size={16} className="me-2" />
                              בטל חסימה
                            </>
                          ) : (
                            <>
                              <UserX size={16} className="me-2" />
                              חסום
                            </>
                          )}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-danger"
                        >
                          <Trash2 size={16} className="me-2" />
                          מחק
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <div className="btn-group">
            <Button
              variant="outline-primary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              הקודם
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "primary" : "outline-primary"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline-primary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              הבא
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>עריכת משתמש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>שם</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>אימייל</Form.Label>
                  <Form.Control
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>מנוי</Form.Label>
                  <Form.Select
                    value={editForm.subscriptionPlan || "free"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        subscriptionPlan: e.target.value,
                      })
                    }
                  >
                    <option value="free">חינם</option>
                    <option value="premium">Premium</option>
                    <option value="gold">Gold</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>תאריך פג תוקף מנוי</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.subscriptionExpiresAt || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        subscriptionExpiresAt: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>נקודות</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.points || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>מטבעות</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.coins || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        coins: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="אדמין"
                checked={editForm.isAdmin || false}
                onChange={(e) =>
                  setEditForm({ ...editForm, isAdmin: e.target.checked })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            שמור שינויים
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>מחיקת משתמש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          האם אתה בטוח שברצונך למחוק את המשתמש {selectedUser?.name}?
          <br />
          <strong className="text-danger">פעולה זו לא ניתנת לביטול!</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            ביטול
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            מחק משתמש
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsers;
