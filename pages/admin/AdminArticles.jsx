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
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  FileText,
  Upload,
} from "lucide-react";
import adminService from "../../services/adminService";
import ArticleEditor from "../../components/admin/ArticleEditor";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    loadArticles();
    loadCategories();
  }, [
    currentPage,
    searchTerm,
    categoryFilter,
    publishedFilter,
    sortBy,
    sortOrder,
  ]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        category: categoryFilter,
        published: publishedFilter,
      };

      const response = await adminService.getArticlesList(
        filters,
        currentPage,
        20
      );
      setArticles(response.articles);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      console.error("Error loading articles:", err);
      setError("שגיאה בטעינת המאמרים");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminService.getCategoriesList();
      setCategories(response.categories);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setShowCreateModal(true);
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setShowEditModal(true);
  };

  const handleSaveArticle = async (articleData) => {
    try {
      if (selectedArticle) {
        await adminService.updateArticle(selectedArticle._id, articleData);
      } else {
        await adminService.createArticle(articleData);
      }
      setShowEditModal(false);
      setShowCreateModal(false);
      loadArticles();
    } catch (err) {
      console.error("Error saving article:", err);
      setError("שגיאה בשמירת המאמר");
    }
  };

  const handleTogglePublished = async (article) => {
    try {
      await adminService.updateArticle(article._id, {
        published: !article.published,
      });
      loadArticles();
    } catch (err) {
      console.error("Error toggling published status:", err);
      setError("שגיאה בעדכון סטטוס הפרסום");
    }
  };

  const handleDeleteArticle = async () => {
    try {
      await adminService.deleteArticle(selectedArticle._id);
      setShowDeleteModal(false);
      loadArticles();
    } catch (err) {
      console.error("Error deleting article:", err);
      setError("שגיאה במחיקת המאמר");
    }
  };

  const getCategoryName = (categoryKey) => {
    const category = categories.find((cat) => cat.key === categoryKey);
    return category ? category.title : categoryKey;
  };

  const getStatusBadge = (published) => {
    return published ? (
      <Badge bg="success">מפורסם</Badge>
    ) : (
      <Badge bg="warning">טיוטה</Badge>
    );
  };

  if (loading && articles.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">טוען מאמרים...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="admin-articles">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>ניהול מאמרים</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => setActiveTab("import")}
          >
            <Upload size={16} className="me-1" />
            ייבוא JSON
          </Button>
          <Button variant="primary" onClick={handleCreateArticle}>
            <Plus size={16} className="me-1" />
            מאמר חדש
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="list" title="רשימת מאמרים">
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
                      placeholder="חיפוש במאמרים..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">כל הקטגוריות</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.key}>
                        {category.title}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={publishedFilter}
                    onChange={(e) => setPublishedFilter(e.target.value)}
                  >
                    <option value="">כל המאמרים</option>
                    <option value="true">מפורסמים</option>
                    <option value="false">טיוטות</option>
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
                    <option value="updatedAt-desc">עדכון אחרון</option>
                    <option value="updatedAt-asc">עדכון ראשון</option>
                    <option value="title-asc">כותרת א-ת</option>
                    <option value="title-desc">כותרת ת-א</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Articles Table */}
          <Card>
            <Card.Body className="p-0">
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>מאמר</th>
                    <th>קטגוריה</th>
                    <th>סטטוס</th>
                    <th>תאריך עדכון</th>
                    <th>זמן קריאה</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{article.title}</div>
                          <small className="text-muted">
                            {article.summary}
                          </small>
                        </div>
                      </td>
                      <td>{getCategoryName(article.categoryKey)}</td>
                      <td>{getStatusBadge(article.published)}</td>
                      <td>
                        {new Date(article.updatedAt).toLocaleDateString(
                          "he-IL"
                        )}
                      </td>
                      <td>
                        {article.readingTimeMin
                          ? `${article.readingTimeMin} דק'`
                          : "-"}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                          >
                            <MoreVertical size={16} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleEditArticle(article)}
                            >
                              <Edit size={16} className="me-2" />
                              עריכה
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleTogglePublished(article)}
                            >
                              {article.published ? (
                                <>
                                  <EyeOff size={16} className="me-2" />
                                  הסתר
                                </>
                              ) : (
                                <>
                                  <Eye size={16} className="me-2" />
                                  פרסם
                                </>
                              )}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => {
                                setSelectedArticle(article);
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={
                        page === currentPage ? "primary" : "outline-primary"
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
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
        </Tab>

        <Tab eventKey="import" title="ייבוא מאמרים">
          <Card>
            <Card.Body>
              <h5>ייבוא מאמרים מקובץ JSON</h5>
              <p className="text-muted">
                העלה קובץ JSON עם מאמרים ליצירה מרובה
              </p>
              <Form.Group className="mb-3">
                <Form.Label>קובץ JSON</Form.Label>
                <Form.Control type="file" accept=".json" />
              </Form.Group>
              <Button variant="primary">
                <Upload size={16} className="me-1" />
                ייבא מאמרים
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Create/Edit Article Modal */}
      <Modal
        show={showEditModal || showCreateModal}
        onHide={() => {
          setShowEditModal(false);
          setShowCreateModal(false);
        }}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedArticle ? "עריכת מאמר" : "מאמר חדש"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ArticleEditor
            article={selectedArticle}
            categories={categories}
            onSave={handleSaveArticle}
            onCancel={() => {
              setShowEditModal(false);
              setShowCreateModal(false);
            }}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Article Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>מחיקת מאמר</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          האם אתה בטוח שברצונך למחוק את המאמר "{selectedArticle?.title}"?
          <br />
          <strong className="text-danger">פעולה זו לא ניתנת לביטול!</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            ביטול
          </Button>
          <Button variant="danger" onClick={handleDeleteArticle}>
            מחק מאמר
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminArticles;
