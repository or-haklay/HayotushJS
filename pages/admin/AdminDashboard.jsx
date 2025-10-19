import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import {
  Users,
  UserCheck,
  FileText,
  TrendingUp,
  Activity,
  DollarSign,
} from "lucide-react";
import adminService from "../../services/adminService";
import StatsCard from "../../components/admin/StatsCard";
import ChartWidget from "../../components/admin/ChartWidget";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminStats();
      setStats(response.stats);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">טוען נתונים...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!stats) {
    return <Alert variant="warning">לא נמצאו נתונים</Alert>;
  }

  return (
    <div className="admin-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>דשבורד ניהול</h2>
        <small className="text-muted">
          עודכן לאחרונה: {new Date().toLocaleString("he-IL")}
        </small>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <StatsCard
            title="סה״כ משתמשים"
            value={stats.users.total}
            icon={Users}
            color="primary"
            trend={stats.users.newLast7Days}
            trendLabel="השבוע האחרון"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatsCard
            title="משתמשי Premium"
            value={stats.users.premium}
            icon={UserCheck}
            color="success"
            percentage={Math.round(
              (stats.users.premium / stats.users.total) * 100
            )}
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatsCard
            title="מאמרים מפורסמים"
            value={stats.content.publishedArticles}
            icon={FileText}
            color="info"
            trend={stats.content.unpublishedArticles}
            trendLabel="ממתינים לפרסום"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatsCard
            title="משתמשים פעילים"
            value={stats.users.active}
            icon={Activity}
            color="warning"
            percentage={Math.round(
              (stats.users.active / stats.users.total) * 100
            )}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">גידול משתמשים לפי חודש</h5>
            </Card.Header>
            <Card.Body>
              <ChartWidget
                type="line"
                data={stats.charts.monthlyGrowth}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">התפלגות מנויים</h5>
            </Card.Header>
            <Card.Body>
              <ChartWidget
                type="doughnut"
                data={stats.charts.subscriptionDistribution}
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">משתמשים חדשים</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentActivity.users.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentActivity.users.map((user, index) => (
                    <div
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{user.name}</strong>
                        <br />
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge bg-${
                            user.subscriptionPlan === "free"
                              ? "secondary"
                              : "success"
                          }`}
                        >
                          {user.subscriptionPlan === "free"
                            ? "חינם"
                            : user.subscriptionPlan}
                        </span>
                        <br />
                        <small className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString("he-IL")}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">אין משתמשים חדשים</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">מאמרים אחרונים</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentActivity.articles.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentActivity.articles.map((article, index) => (
                    <div
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{article.title}</strong>
                        <br />
                        <small className="text-muted">
                          {article.categoryKey}
                        </small>
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge bg-${
                            article.published ? "success" : "warning"
                          }`}
                        >
                          {article.published ? "מפורסם" : "טיוטה"}
                        </span>
                        <br />
                        <small className="text-muted">
                          {new Date(article.updatedAt).toLocaleDateString(
                            "he-IL"
                          )}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">אין מאמרים אחרונים</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
