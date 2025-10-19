import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Alert,
  Spinner,
  Badge,
  Table,
} from "react-bootstrap";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import adminService from "../../services/adminService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    key: "",
    title: "",
    description: "",
    icon: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategoriesList();
      setCategories(response.categories);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("שגיאה בטעינת הקטגוריות");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setEditForm({
      key: "",
      title: "",
      description: "",
      icon: "",
      order: categories.length + 1,
      active: true,
    });
    setShowEditModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditForm({
      key: category.key,
      title: category.title,
      description: category.description || "",
      icon: category.icon || "",
      order: category.order || 0,
      active: category.active !== false,
    });
    setShowEditModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (selectedCategory) {
        await adminService.updateCategory(selectedCategory._id, editForm);
      } else {
        await adminService.createCategory(editForm);
      }
      setShowEditModal(false);
      loadCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      setError("שגיאה בשמירת הקטגוריה");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await adminService.deleteCategory(selectedCategory._id);
      setShowDeleteModal(false);
      loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("שגיאה במחיקת הקטגוריה");
    }
  };

  const getStatusBadge = (active) => {
    return active ? (
      <Badge bg="success">פעיל</Badge>
    ) : (
      <Badge bg="secondary">לא פעיל</Badge>
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">טוען קטגוריות...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>ניהול קטגוריות</h2>
        <Button variant="primary" onClick={handleCreateCategory}>
          <Plus size={16} className="me-1" />
          קטגוריה חדשה
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Categories Grid */}
      <Row>
        {categories.map((category) => (
          <Col md={6} lg={4} className="mb-4" key={category._id}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      {category.icon ? (
                        <span className="fs-4">{category.icon}</span>
                      ) : (
                        <Folder size={24} className="text-muted" />
                      )}
                    </div>
                    <div>
                      <h5 className="mb-1">{category.title}</h5>
                      <small className="text-muted">{category.key}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-muted small mb-3">
                    {category.description}
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {getStatusBadge(category.active)}
                    <span className="ms-2 text-muted">
                      סדר: {category.order}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table View (Alternative) */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">תצוגת טבלה</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>קטגוריה</th>
                <th>מפתח</th>
                <th>תיאור</th>
                <th>סדר</th>
                <th>סטטוס</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        {category.icon ? (
                          <span>{category.icon}</span>
                        ) : (
                          <Folder size={16} className="text-muted" />
                        )}
                      </div>
                      <strong>{category.title}</strong>
                    </div>
                  </td>
                  <td>
                    <code>{category.key}</code>
                  </td>
                  <td>
                    {category.description || (
                      <span className="text-muted">אין תיאור</span>
                    )}
                  </td>
                  <td>{category.order}</td>
                  <td>{getStatusBadge(category.active)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCategory ? "עריכת קטגוריה" : "קטגוריה חדשה"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>מפתח (Key) *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.key}
                onChange={(e) =>
                  setEditForm({ ...editForm, key: e.target.value })
                }
                placeholder="medical, routine, etc."
                disabled={!!selectedCategory} // Don't allow editing key for existing categories
              />
              <Form.Text className="text-muted">
                מפתח ייחודי לקטגוריה (לא ניתן לשנות לאחר יצירה)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>שם הקטגוריה *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="רפואי, שגרה, וכו'"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>תיאור</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="תיאור קצר של הקטגוריה..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>אייקון</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.icon}
                    onChange={(e) =>
                      setEditForm({ ...editForm, icon: e.target.value })
                    }
                    placeholder="🏥, 🐕, וכו'"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סדר</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.order}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="פעיל"
                checked={editForm.active}
                onChange={(e) =>
                  setEditForm({ ...editForm, active: e.target.checked })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            שמור קטגוריה
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Category Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>מחיקת קטגוריה</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          האם אתה בטוח שברצונך למחוק את הקטגוריה "{selectedCategory?.title}"?
          <br />
          <strong className="text-danger">פעולה זו לא ניתנת לביטול!</strong>
          <br />
          <small className="text-muted">
            אם יש מאמרים בקטגוריה זו, המחיקה תיכשל.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            ביטול
          </Button>
          <Button variant="danger" onClick={handleDeleteCategory}>
            מחק קטגוריה
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCategories;
