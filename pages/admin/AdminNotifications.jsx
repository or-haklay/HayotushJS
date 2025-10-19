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
  Tabs,
  Tab,
  Table,
  Badge,
  InputGroup,
} from "react-bootstrap";
import {
  Send,
  Users,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import adminService from "../../services/adminService";

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "medium",
    scheduledFor: "",
    targetType: "all", // all, premium, specific
    userIds: [],
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsersList({}, 1, 1000);
      setUsers(response.users);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAllUsers = (checked) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const notificationData = {
        ...notificationForm,
        userIds:
          notificationForm.targetType === "specific"
            ? selectedUsers
            : undefined,
        subscriptionPlan:
          notificationForm.targetType === "premium" ? "premium" : undefined,
      };

      if (notificationForm.targetType === "all") {
        await adminService.broadcastNotification(notificationData);
        setSuccess("ההודעה נשלחה לכל המשתמשים");
      } else {
        await adminService.sendNotification(notificationData);
        setSuccess(`ההודעה נשלחה ל-${selectedUsers.length} משתמשים`);
      }

      // Reset form
      setNotificationForm({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        scheduledFor: "",
        targetType: "all",
        userIds: [],
      });
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error sending notification:", err);
      setError("שגיאה בשליחת ההודעה");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      general: <Bell size={16} />,
      reminder: <Clock size={16} />,
      medical: <AlertCircle size={16} />,
      expense: <CheckCircle size={16} />,
    };
    return icons[type] || <Bell size={16} />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "success",
      medium: "warning",
      high: "danger",
    };
    return colors[priority] || "secondary";
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="admin-notifications">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>ניהול התראות</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="send" title="שליחת התראה">
          <Card>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>כותרת ההודעה *</Form.Label>
                      <Form.Control
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="כותרת ההודעה..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>סוג התראה</Form.Label>
                      <Form.Select
                        value={notificationForm.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                      >
                        <option value="general">כללי</option>
                        <option value="reminder">תזכורת</option>
                        <option value="medical">רפואי</option>
                        <option value="expense">הוצאה</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>תוכן ההודעה *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={notificationForm.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="תוכן ההודעה..."
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>עדיפות</Form.Label>
                      <Form.Select
                        value={notificationForm.priority}
                        onChange={(e) =>
                          handleInputChange("priority", e.target.value)
                        }
                      >
                        <option value="low">נמוכה</option>
                        <option value="medium">בינונית</option>
                        <option value="high">גבוהה</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>תזמון</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={notificationForm.scheduledFor}
                        onChange={(e) =>
                          handleInputChange("scheduledFor", e.target.value)
                        }
                      />
                      <Form.Text className="text-muted">
                        השאר ריק לשליחה מיידית
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>קהל יעד</Form.Label>
                      <Form.Select
                        value={notificationForm.targetType}
                        onChange={(e) =>
                          handleInputChange("targetType", e.target.value)
                        }
                      >
                        <option value="all">כל המשתמשים</option>
                        <option value="premium">משתמשי Premium</option>
                        <option value="specific">משתמשים ספציפיים</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {notificationForm.targetType === "specific" && (
                  <Card className="mt-3">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">בחירת משתמשים</h6>
                        <Form.Check
                          type="checkbox"
                          label="בחר הכל"
                          checked={selectedUsers.length === users.length}
                          onChange={(e) =>
                            handleSelectAllUsers(e.target.checked)
                          }
                        />
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <InputGroup className="mb-3">
                        <InputGroup.Text>
                          <Users size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="חיפוש משתמשים..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </InputGroup>

                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {filteredUsers.map((user) => (
                          <div
                            key={user._id}
                            className="d-flex align-items-center mb-2"
                          >
                            <Form.Check
                              type="checkbox"
                              id={`user-${user._id}`}
                              checked={selectedUsers.includes(user._id)}
                              onChange={(e) =>
                                handleUserSelection(user._id, e.target.checked)
                              }
                              className="me-2"
                            />
                            <div className="flex-grow-1">
                              <div className="fw-bold">{user.name}</div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                            <Badge
                              bg={
                                user.subscriptionPlan === "free"
                                  ? "secondary"
                                  : "success"
                              }
                            >
                              {user.subscriptionPlan === "free"
                                ? "חינם"
                                : user.subscriptionPlan}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2">
                        <small className="text-muted">
                          נבחרו {selectedUsers.length} משתמשים
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="primary"
                    onClick={handleSendNotification}
                    disabled={
                      loading ||
                      !notificationForm.title ||
                      !notificationForm.message
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        שולח...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="me-1" />
                        שלח התראה
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="history" title="היסטוריית התראות">
          <Card>
            <Card.Header>
              <h5 className="mb-0">התראות שנשלחו</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>תאריך</th>
                    <th>כותרת</th>
                    <th>סוג</th>
                    <th>עדיפות</th>
                    <th>נמענים</th>
                    <th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      אין התראות בהיסטוריה
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="templates" title="תבניות הודעות">
          <Card>
            <Card.Header>
              <h5 className="mb-0">תבניות הודעות מוכנות</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6>ברוכים הבאים</h6>
                      <p className="text-muted small">
                        הודעת ברכה למשתמשים חדשים
                      </p>
                      <Button size="sm" variant="outline-primary">
                        השתמש בתבנית
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6>עדכון אפליקציה</h6>
                      <p className="text-muted small">
                        הודעה על עדכון חדש באפליקציה
                      </p>
                      <Button size="sm" variant="outline-primary">
                        השתמש בתבנית
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6>תזכורת פעילות</h6>
                      <p className="text-muted small">
                        תזכורת למשתמשים שלא פעילים זמן רב
                      </p>
                      <Button size="sm" variant="outline-primary">
                        השתמש בתבנית
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6>מבצע מיוחד</h6>
                      <p className="text-muted small">
                        הודעה על מבצע או הנחה מיוחדת
                      </p>
                      <Button size="sm" variant="outline-primary">
                        השתמש בתבנית
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminNotifications;
