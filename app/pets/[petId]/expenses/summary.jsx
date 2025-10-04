import React, { useCallback, useMemo, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Text,
  Card,
  SegmentedButtons,
  IconButton,
  Snackbar,
  ActivityIndicator,
  Divider,
  Chip,
  Button,
} from "react-native-paper";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { listExpenses } from "../../../../services/expensesService";
import gamificationService from "../../../../services/gamificationService";
import { COLORS, FONTS, SIZING } from "../../../../theme/theme";

export default function ExpensesSummaryScreen() {
  const { t } = useTranslation();
  const { petId } = useLocalSearchParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [mode, setMode] = useState("stack");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [chartError, setChartError] = useState("");

  // סינונים חדשים
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [summaryType, setSummaryType] = useState("yearly"); // yearly או monthly
  const [chartType, setChartType] = useState("line"); // line או pie
  const [lineChartMode, setLineChartMode] = useState("cumulative"); // cumulative או daily

  const CATEGORIES = ["Vet", "Food", "Grooming", "Toys", "Insurance", "Other"];

  // העברת ה-MONTHS לתוך הקומפוננטה כדי ש-t יהיה זמין
  const MONTHS = useMemo(
    () => [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ],
    []
  );

  const CAT_COLORS = {
    Vet: "#017A82",
    Food: "#FFC107",
    Grooming: "#546E7A",
    Toys: "#8BC34A",
    Insurance: "#9C27B0",
    Other: "#FF7043",
  };

  // תרגומים לקטגוריות
  const getCategoryLabel = (category) => {
    try {
      switch (category) {
        case "Vet":
          return t("expenses.categories.vet");
        case "Food":
          return t("expenses.categories.food");
        case "Grooming":
          return t("expenses.categories.grooming");
        case "Toys":
          return t("expenses.categories.toys");
        case "Insurance":
          return t("expenses.categories.insurance");
        case "Other":
          return t("expenses.categories.other");
        default:
          return category;
      }
    } catch (error) {
      console.error("Category label error:", error);
      return category || "Unknown";
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setChartError("");
    try {
      let from, to;

      if (summaryType === "yearly") {
        from = `${year}-01-01`;
        to = `${year}-12-31T23:59:59.999Z`;
      } else {
        // monthly
        const monthStr = String(month + 1).padStart(2, "0");
        from = `${year}-${monthStr}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        to = `${year}-${monthStr}-${lastDay}T23:59:59.999Z`;
      }

      const data = await listExpenses({
        petId,
        from,
        to,
        sort: "date",
        order: "asc",
        limit: 5000,
      });
      setRows(data || []);

      // Gamification: daily mission for opening expenses summary
      try {
        await gamificationService.sendEvent(
          "OPEN_EXPENSES_SUMMARY",
          String(petId || "summary")
        );
      } catch {}
    } catch (e) {
      const errorMessage =
        e?.response?.data?.message ||
        t("expenses.load_error") ||
        "שגיאה בטעינת נתונים";
      setErr(errorMessage);
      console.error("Load expenses error:", e);
    } finally {
      setLoading(false);
    }
  }, [petId, year, month, summaryType, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // פונקציה לסינון הנתונים
  const filteredRows = useMemo(() => {
    try {
      if (!rows || !Array.isArray(rows)) return [];

      let filtered = [...rows];

      if (selectedCategory) {
        filtered = filtered.filter(
          (expense) => expense && expense.category === selectedCategory
        );
      }

      if (selectedPet) {
        filtered = filtered.filter(
          (expense) => expense && expense.petId === selectedPet
        );
      }

      return filtered;
    } catch (error) {
      console.error("Filter rows error:", error);
      return [];
    }
  }, [rows, selectedCategory, selectedPet]);

  // קבלת רשימת חיות ייחודיות מהוצאות
  const uniquePets = useMemo(() => {
    try {
      if (!rows || !Array.isArray(rows)) return [];

      const pets = [
        ...new Set(rows.map((expense) => expense?.petId).filter(Boolean)),
      ];
      return pets;
    } catch (error) {
      console.error("Unique pets error:", error);
      return [];
    }
  }, [rows]);

  // הכנת נתונים לגרף Line (חודשי או שנתי)
  const lineChartData = useMemo(() => {
    try {
      if (
        !filteredRows ||
        !Array.isArray(filteredRows) ||
        filteredRows.length === 0
      ) {
        return [];
      }

      if (summaryType === "yearly") {
        // נתונים שנתיים - כל חודש הוא נקודה
        const monthData = Array.from({ length: 12 }, (_, m) => ({
          x: MONTHS[m],
          y: 0,
        }));

        for (const expense of filteredRows) {
          if (!expense || !expense.date) continue;

          try {
            const d = new Date(expense.date);
            if (isNaN(d.getTime())) continue; // בדיקה שהתאריך תקין

            if (d.getFullYear() === year) {
              const m = d.getMonth();
              if (m >= 0 && m < 12) {
                monthData[m].y += Number(expense.amount || 0) || 0;
              }
            }
          } catch (dateError) {
            console.error("Date parsing error:", dateError);
            continue;
          }
        }

        return monthData;
      } else {
        // נתונים חודשיים - כל יום הוא נקודה
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayData = Array.from({ length: daysInMonth }, (_, d) => ({
          x: String(d + 1),
          y: 0,
        }));

        for (const expense of filteredRows) {
          if (!expense || !expense.date) continue;

          try {
            const d = new Date(expense.date);
            if (isNaN(d.getTime())) continue; // בדיקה שהתאריך תקין

            if (d.getFullYear() === year && d.getMonth() === month) {
              const day = d.getDate() - 1;
              if (day >= 0 && day < daysInMonth) {
                dayData[day].y += Number(expense.amount || 0) || 0;
              }
            }
          } catch (dateError) {
            console.error("Date parsing error:", dateError);
            continue;
          }
        }

        // בחירת סוג הגרף: רציף או יומי
        if (lineChartMode === "cumulative") {
          // הפוך את הגרף לרציף - כל יום מציג את הסכום המצטבר עד לאותו יום
          let cumulativeTotal = 0;
          const continuousData = dayData.map((day, index) => {
            cumulativeTotal += day.y;
            return {
              x: day.x,
              y: cumulativeTotal,
            };
          });
          return continuousData;
        } else {
          // גרף יומי רגיל - כל יום מציג את ההוצאות של אותו יום
          return dayData;
        }
      }
    } catch (error) {
      console.error("Line chart data error:", error);
      setChartError("שגיאה בהכנת נתוני הגרף");
      return [];
    }
  }, [filteredRows, year, month, summaryType, MONTHS, lineChartMode]);

  // הכנת נתונים לגרף Pie (חודשי או שנתי)
  const pieChartData = useMemo(() => {
    try {
      if (
        !filteredRows ||
        !Array.isArray(filteredRows) ||
        filteredRows.length === 0
      ) {
        return [];
      }

      const categoryTotals = {};

      for (const expense of filteredRows) {
        if (!expense || !expense.category) continue;

        const category = CATEGORIES.includes(expense.category)
          ? expense.category
          : "Other";
        categoryTotals[category] =
          (categoryTotals[category] || 0) + (Number(expense.amount || 0) || 0);
      }

      return Object.entries(categoryTotals).map(([category, value]) => ({
        label: category,
        value: value || 0,
        color: CAT_COLORS[category] || "#FF7043",
      }));
    } catch (error) {
      console.error("Pie chart data error:", error);
      setChartError("שגיאה בהכנת נתוני הגרף");
      return [];
    }
  }, [filteredRows]);

  // פונקציה לאיפוס הסינונים
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedPet(null);
  };

  // פונקציה לדפדוף בין חודשים
  const changeMonth = (direction) => {
    try {
      if (direction === "next") {
        if (month === 11) {
          setMonth(0);
          setYear(year + 1);
        } else {
          setMonth(month + 1);
        }
      } else {
        if (month === 0) {
          setMonth(11);
          setYear(year - 1);
        } else {
          setMonth(month - 1);
        }
      }
    } catch (error) {
      console.error("Change month error:", error);
    }
  };

  // פונקציה לדפדוף בין שנים
  const changeYear = (direction) => {
    try {
      setYear(direction === "next" ? year + 1 : year - 1);
    } catch (error) {
      console.error("Change year error:", error);
    }
  };

  // חישוב סה"כ לתקופה הנוכחית
  const currentTotal = useMemo(() => {
    try {
      if (!filteredRows || !Array.isArray(filteredRows)) return 0;

      return filteredRows.reduce(
        (sum, expense) => sum + (Number(expense?.amount || 0) || 0),
        0
      );
    } catch (error) {
      console.error("Current total error:", error);
      return 0;
    }
  }, [filteredRows]);

  // רכיב הגרף עם Error Boundary
  const renderChart = () => {
    try {
      if (chartError) {
        return (
          <View
            style={{
              height: 200,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.error, textAlign: "center" }}>
              {chartError}
            </Text>
            <Button
              mode="outlined"
              onPress={() => setChartError("")}
              style={{ marginTop: 16 }}
            >
              נסה שוב
            </Button>
          </View>
        );
      }

      if (chartType === "line") {
        if (!lineChartData || lineChartData.length === 0) {
          return (
            <View
              style={{
                height: 200,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.neutral, textAlign: "center" }}>
                אין נתונים להצגה
              </Text>
            </View>
          );
        }

        const screenWidth = Dimensions.get("window").width - 32;

        return (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              paddingVertical: 20,
            }}
          >
            <LineChart
              data={{
                labels: lineChartData.map((item) => {
                  // קיצור שמות החודשים ל-3 אותיות
                  if (summaryType === "yearly") {
                    return item.x ? item.x.substring(0, 3) : item.x;
                  } else {
                    // עבור חודשי - הצג רק כל יום שני
                    const dayNum = parseInt(item.x);
                    return dayNum % 2 === 0 ? item.x : "";
                  }
                }),
                datasets: [
                  {
                    data: lineChartData.map((item) => item.y),
                    color: (opacity = 1) =>
                      selectedCategory
                        ? (CAT_COLORS[selectedCategory] || COLORS.primary) +
                          Math.floor(opacity * 255)
                            .toString(16)
                            .padStart(2, "0")
                        : COLORS.primary +
                          Math.floor(opacity * 255)
                            .toString(16)
                            .padStart(2, "0"),
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              chartConfig={{
                decimalPlaces: 0,
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) =>
                  COLORS.primary +
                  Math.floor(opacity * 255)
                    .toString(16)
                    .padStart(2, "0"),
                labelColor: (opacity = 1) =>
                  COLORS.neutral +
                  Math.floor(opacity * 255)
                    .toString(16)
                    .padStart(2, "0"),
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: summaryType === "yearly" ? "4" : "0",
                  strokeWidth: "2",
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                backgroundColor: "transparent",
              }}
            />

            {/* Legend לגרף הקו */}
            {selectedCategory && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 16,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: CAT_COLORS[selectedCategory] || "#FF7043",
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                />
                <Text style={[FONTS.body, { color: COLORS.neutral }]}>
                  {getCategoryLabel(selectedCategory)}
                </Text>
              </View>
            )}
          </View>
        );
      } else {
        if (!pieChartData || pieChartData.length === 0) {
          return (
            <View
              style={{
                height: 200,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.neutral, textAlign: "center" }}>
                אין נתונים להצגה
              </Text>
            </View>
          );
        }

        const screenWidth = Dimensions.get("window").width - 32;

        return (
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <PieChart
              data={pieChartData.map((item, index) => ({
                name: getCategoryLabel(item.label),
                population: item.value,
                color: item.color,
                legendFontColor: COLORS.neutral,
                legendFontSize: 12,
              }))}
              width={screenWidth}
              height={220}
              chartConfig={{
                color: (opacity = 1) =>
                  COLORS.primary +
                  Math.floor(opacity * 255)
                    .toString(16)
                    .padStart(2, "0"),
                labelColor: (opacity = 1) =>
                  COLORS.neutral +
                  Math.floor(opacity * 255)
                    .toString(16)
                    .padStart(2, "0"),
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={true}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        );
      }
    } catch (error) {
      console.error("Render chart error:", error);
      setChartError("שגיאה בטעינת הגרף");
      return (
        <View
          style={{
            height: 200,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: COLORS.error, textAlign: "center" }}>
            שגיאה בטעינת הגרף
          </Text>
          <Button
            mode="outlined"
            onPress={() => setChartError("")}
            style={{ marginTop: 16 }}
          >
            נסה שוב
          </Button>
        </View>
      );
    }
  };

  // כותרת הגרף
  const getChartTitle = () => {
    try {
      if (chartType === "line") {
        if (summaryType === "yearly") {
          return `הוצאות שנתיות - ${year}`;
        } else {
          const modeText = lineChartMode === "cumulative" ? "מצטבר" : "יומי";
          return `הוצאות חודשיות ${modeText} - ${MONTHS[month]} ${year}`;
        }
      } else {
        if (summaryType === "yearly") {
          return `התפלגות הוצאות שנתיות - ${year}`;
        } else {
          return `התפלגות הוצאות חודשיות - ${MONTHS[month]} ${year}`;
        }
      }
    } catch (error) {
      console.error("Chart title error:", error);
      return "סיכום הוצאות";
    }
  };

  // כפתורי דפדוף
  const renderNavigationButtons = () => {
    try {
      if (summaryType === "yearly") {
        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              icon="chevron-right"
              onPress={() => changeYear("prev")}
            />
            <Text style={FONTS.h3}>{year}</Text>
            <IconButton
              icon="chevron-left"
              onPress={() => changeYear("next")}
            />
          </View>
        );
      } else {
        return (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              icon="chevron-right"
              onPress={() => changeMonth("prev")}
            />
            <Text style={FONTS.h3}>
              {MONTHS[month]} {year}
            </Text>
            <IconButton
              icon="chevron-left"
              onPress={() => changeMonth("next")}
            />
          </View>
        );
      }
    } catch (error) {
      console.error("Navigation buttons error:", error);
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={FONTS.h3}>{year}</Text>
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 150, flexGrow: 1 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={FONTS.h2}>{t("expenses.summary.title")}</Text>
          {renderNavigationButtons()}
        </View>

        {/* כפתור הסינונים */}
        <View style={{ marginTop: 16, alignItems: "flex-end" }}>
          <Button
            mode="outlined"
            icon={showFilters ? "filter-off" : "filter"}
            onPress={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "הסתר הגדרות" : "הגדרות גרף"}
          </Button>
        </View>

        {/* ממשק הסינונים והגדרות */}
        {showFilters && (
          <Card style={{ marginTop: 8, borderRadius: 8 }}>
            <Card.Content>
              {/* הגדרות גרף */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={[
                    FONTS.h3,
                    { marginBottom: 12, color: COLORS.primary },
                  ]}
                >
                  הגדרות גרף
                </Text>

                {/* בחירת סוג גרף */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={[FONTS.h4, { marginBottom: 8 }]}>סוג גרף:</Text>
                  <SegmentedButtons
                    value={chartType}
                    onValueChange={setChartType}
                    buttons={[
                      { value: "line", label: "גרף קו" },
                      { value: "pie", label: "גרף עוגה" },
                    ]}
                    style={{ marginTop: 4 }}
                    theme={{
                      colors: {
                        secondaryContainer: COLORS.primary,
                        onSecondaryContainer: COLORS.white,
                      },
                    }}
                  />
                </View>

                {/* בחירת סוג הסיכום */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={[FONTS.h4, { marginBottom: 8 }]}>
                    סוג סיכום:
                  </Text>
                  <SegmentedButtons
                    value={summaryType}
                    onValueChange={setSummaryType}
                    buttons={[
                      { value: "yearly", label: "שנתי" },
                      { value: "monthly", label: "חודשי" },
                    ]}
                    style={{ marginTop: 4 }}
                    theme={{
                      colors: {
                        secondaryContainer: COLORS.primary,
                        onSecondaryContainer: COLORS.white,
                      },
                    }}
                  />
                </View>

                {/* בחירת סוג הגרף הקו (רק כשיש גרף קו) */}
                {chartType === "line" && summaryType === "monthly" && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[FONTS.h4, { marginBottom: 8 }]}>
                      סוג גרף קו:
                    </Text>
                    <SegmentedButtons
                      value={lineChartMode}
                      onValueChange={setLineChartMode}
                      buttons={[
                        { value: "cumulative", label: "מצטבר" },
                        { value: "daily", label: "יומי" },
                      ]}
                      style={{ marginTop: 4 }}
                      theme={{
                        colors: {
                          secondaryContainer: COLORS.primary,
                          onSecondaryContainer: COLORS.white,
                        },
                      }}
                    />
                  </View>
                )}
              </View>

              {/* קו הפרדה */}
              <Divider style={{ marginVertical: 16 }} />

              {/* סינונים */}
              <View>
                <Text
                  style={[
                    FONTS.h3,
                    { marginBottom: 12, color: COLORS.primary },
                  ]}
                >
                  סינונים
                </Text>

                {/* סינון לפי קטגוריה - רק לגרף קו */}
                {chartType === "line" && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[FONTS.h4, { marginBottom: 8 }]}>
                      קטגוריה:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Chip
                        selected={!selectedCategory}
                        onPress={() => setSelectedCategory(null)}
                        style={{
                          marginRight: 8,
                          borderColor: COLORS.neutral,
                          borderWidth: 2,
                        }}
                        textStyle={{ color: COLORS.neutral }}
                        mode="outlined"
                      >
                        הכל
                      </Chip>
                      {CATEGORIES.map((category) => (
                        <Chip
                          key={category}
                          selected={selectedCategory === category}
                          onPress={() =>
                            setSelectedCategory(
                              selectedCategory === category ? null : category
                            )
                          }
                          style={[
                            {
                              marginRight: 8,
                              borderColor: CAT_COLORS[category] || "#FF7043",
                              borderWidth: 2,
                            },
                            selectedCategory === category && {
                              backgroundColor:
                                CAT_COLORS[category] || "#FF7043",
                            },
                          ]}
                          textStyle={
                            selectedCategory === category
                              ? { color: COLORS.white, fontWeight: "bold" }
                              : { color: CAT_COLORS[category] || "#FF7043" }
                          }
                          mode="outlined"
                        >
                          {getCategoryLabel(category) || category}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* סינון לפי בעל חיים */}
                {uniquePets && uniquePets.length > 1 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[FONTS.h4, { marginBottom: 8 }]}>
                      בעל חיים:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Chip
                        selected={!selectedPet}
                        onPress={() => setSelectedPet(null)}
                        style={{
                          marginRight: 8,
                          borderColor: COLORS.neutral,
                          borderWidth: 2,
                        }}
                        textStyle={{ color: COLORS.neutral }}
                        mode="outlined"
                      >
                        הכל
                      </Chip>
                      {uniquePets.map((petId) => (
                        <Chip
                          key={petId}
                          selected={selectedPet === petId}
                          onPress={() =>
                            setSelectedPet(selectedPet === petId ? null : petId)
                          }
                          style={[
                            {
                              marginRight: 8,
                              borderColor: COLORS.primary,
                              borderWidth: 2,
                            },
                            selectedPet === petId && {
                              backgroundColor: COLORS.primary,
                            },
                          ]}
                          textStyle={
                            selectedPet === petId
                              ? { color: COLORS.white, fontWeight: "bold" }
                              : { color: COLORS.primary }
                          }
                          mode="outlined"
                        >
                          {petId || "Unknown"}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* כפתור איפוס סינונים */}
                {(selectedCategory || selectedPet) && (
                  <View style={{ alignItems: "center", marginTop: 8 }}>
                    <Button mode="text" icon="refresh" onPress={resetFilters}>
                      איפוס סינונים
                    </Button>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={{ marginTop: 12, borderRadius: 12 }}>
          <Card.Content>
            <Text
              style={[FONTS.h3, { color: COLORS.primary, marginBottom: 8 }]}
            >
              {getChartTitle()}
            </Text>
            <Text
              style={[FONTS.body, { color: COLORS.neutral, marginBottom: 8 }]}
            >
              {filteredRows ? filteredRows.length : 0}{" "}
              {t("expenses.summary.records_found")}
              {selectedCategory || selectedPet
                ? ` (מתוך ${rows ? rows.length : 0})`
                : ""}
            </Text>
            <Divider style={{ marginVertical: 8 }} />
            {loading ? (
              <ActivityIndicator style={{ marginTop: 16 }} />
            ) : !filteredRows || filteredRows.length === 0 ? (
              <Text style={{ marginTop: 8 }}>
                {selectedCategory || selectedPet
                  ? "לא נמצאו הוצאות לפי הסינונים שנבחרו"
                  : t("expenses.summary.no_data")}
              </Text>
            ) : (
              renderChart()
            )}
          </Card.Content>
        </Card>

        {/* כרטיס נפרד לפירוט הוצאות לפי קטגוריה - רק לגרף עוגה */}
        {!loading &&
          filteredRows &&
          filteredRows.length > 0 &&
          chartType === "pie" && (
            <Card style={{ marginTop: 16, borderRadius: 12 }}>
              <Card.Content>
                <Text
                  style={[
                    FONTS.h3,
                    { color: COLORS.primary, marginBottom: 16 },
                  ]}
                >
                  פירוט הוצאות לפי קטגוריה
                </Text>

                {/* שורת כותרות */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.neutral + "20",
                    marginBottom: 12,
                  }}
                >
                  <Text style={[FONTS.h4, { color: COLORS.primary, flex: 2 }]}>
                    קטגוריה
                  </Text>
                  <Text
                    style={[
                      FONTS.h4,
                      { color: COLORS.primary, flex: 1, textAlign: "center" },
                    ]}
                  >
                    סכום
                  </Text>
                  <Text
                    style={[
                      FONTS.h4,
                      { color: COLORS.primary, flex: 1, textAlign: "center" },
                    ]}
                  >
                    אחוז
                  </Text>
                </View>

                {/* שורות הנתונים */}
                {pieChartData.map((item, index) => {
                  try {
                    if (!item || !item.label || typeof item.value !== "number")
                      return null;

                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 8,
                          borderBottomWidth:
                            index < pieChartData.length - 1 ? 1 : 0,
                          borderBottomColor: COLORS.neutral + "10",
                        }}
                      >
                        {/* צבע + שם הקטגוריה */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 2,
                          }}
                        >
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: item.color || "#FF7043",
                              borderRadius: 6,
                              marginRight: 8,
                            }}
                          />
                          <Text
                            style={[
                              FONTS.body,
                              {
                                color: COLORS.neutral,
                                fontWeight: "500",
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {getCategoryLabel(item.label)}
                          </Text>
                        </View>

                        {/* הסכום */}
                        <Text
                          style={[
                            FONTS.body,
                            {
                              color: COLORS.primary,
                              fontWeight: "bold",
                              flex: 1,
                              textAlign: "center",
                            },
                          ]}
                        >
                          {item.value >= 1000
                            ? `${(item.value / 1000).toFixed(1)}K ₪`
                            : `${item.value.toFixed(0)} ₪`}
                        </Text>

                        {/* אחוז מהסה"כ */}
                        <Text
                          style={[
                            FONTS.body,
                            {
                              color: COLORS.neutral,
                              fontWeight: "500",
                              flex: 1,
                              textAlign: "center",
                            },
                          ]}
                        >
                          {currentTotal > 0
                            ? ((item.value / currentTotal) * 100).toFixed(1)
                            : "0.0"}
                          %
                        </Text>
                      </View>
                    );
                  } catch (error) {
                    console.error("Pie chart item error:", error);
                    return null;
                  }
                })}
              </Card.Content>
            </Card>
          )}

        {/* סה"כ לתקופה הנוכחית */}
        {!loading && filteredRows && filteredRows.length > 0 && (
          <Card style={{ marginTop: 16, borderRadius: 12 }}>
            <Card.Content>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text style={[FONTS.h3, { color: COLORS.primary }]}>
                  {summaryType === "yearly"
                    ? `סה"כ שנתי ${year}`
                    : `סה"כ ${MONTHS[month]} ${year}`}
                  {selectedCategory &&
                    ` - ${getCategoryLabel(selectedCategory)}`}
                </Text>
                <Text
                  style={[
                    FONTS.h2,
                    { color: COLORS.primary, fontWeight: "bold" },
                  ]}
                >
                  {currentTotal ? currentTotal.toFixed(2) : "0.00"} ₪
                </Text>
              </View>

              {/* סטטיסטיקות נוספות */}
              <Divider style={{ marginVertical: 12 }} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  paddingVertical: 8,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={[FONTS.caption, { color: COLORS.neutral }]}>
                    ממוצע לרשומה
                  </Text>
                  <Text
                    style={[
                      FONTS.body,
                      { color: COLORS.primary, fontWeight: "bold" },
                    ]}
                  >
                    {filteredRows && filteredRows.length > 0 && currentTotal
                      ? (currentTotal / filteredRows.length).toFixed(2)
                      : "0.00"}{" "}
                    ₪
                  </Text>
                </View>

                <View style={{ alignItems: "center" }}>
                  <Text style={[FONTS.caption, { color: COLORS.neutral }]}>
                    {summaryType === "yearly" ? "ממוצע חודשי" : "ממוצע יומי"}
                  </Text>
                  <Text
                    style={[
                      FONTS.body,
                      { color: COLORS.primary, fontWeight: "bold" },
                    ]}
                  >
                    {(() => {
                      try {
                        if (summaryType === "yearly") {
                          return currentTotal
                            ? (currentTotal / 12).toFixed(2)
                            : "0.00";
                        } else {
                          const daysInMonth = new Date(
                            year,
                            month + 1,
                            0
                          ).getDate();
                          return currentTotal
                            ? (currentTotal / daysInMonth).toFixed(2)
                            : "0.00";
                        }
                      } catch (error) {
                        console.error("Average calculation error:", error);
                        return "0.00";
                      }
                    })()}{" "}
                    ₪
                  </Text>
                </View>

                <View style={{ alignItems: "center" }}>
                  <Text style={[FONTS.caption, { color: COLORS.neutral }]}>
                    מספר רשומות
                  </Text>
                  <Text
                    style={[
                      FONTS.body,
                      { color: COLORS.primary, fontWeight: "bold" },
                    ]}
                  >
                    {filteredRows ? filteredRows.length : 0}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={{ backgroundColor: COLORS.error }}
      >
        {err}
      </Snackbar>
    </View>
  );
}
