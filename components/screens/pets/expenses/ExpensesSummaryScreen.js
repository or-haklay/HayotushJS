import React, { useCallback, useMemo, useState } from "react";
import { View, RefreshControl, ScrollView } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  Text,
  Card,
  SegmentedButtons,
  IconButton,
  Snackbar,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryGroup,
  VictoryStack,
  VictoryLegend,
  VictoryTheme,
} from "victory-native";
import { listExpenses } from "../../../../services/expensesService";
import { COLORS, FONTS } from "../../../../theme/theme";
import { styles } from "./styles";

const CATEGORIES = ["Vet", "Food", "Grooming", "Toys", "Insurance", "Other"];
const MONTHS = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

// צבעים לסדרות (תואם פלטה)
const CAT_COLORS = {
  Vet: "#017A82",
  Food: "#FFC107",
  Grooming: "#546E7A",
  Toys: "#8BC34A",
  Insurance: "#9C27B0",
  Other: "#FF7043",
};

const ExpensesSummaryScreen = () => {
  const { petId } = useLocalSearchParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState("stack");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    try {
      const from = `${year}-01-01`;
      const to = `${year}-12-31T23:59:59.999Z`;
      const data = await listExpenses({
        petId,
        from,
        to,
        sort: "date",
        order: "asc",
        limit: 200,
      });
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }, [petId, year]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // אגרגציה: סיכום לפי חודש וקטגוריה
  const { monthBuckets, totalYear, maxY } = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, m) => ({
      m,
      label: MONTHS[m],
      total: 0,
      ...Object.fromEntries(CATEGORIES.map((c) => [c, 0])),
    }));
    let yearSum = 0;

    for (const e of rows) {
      const d = new Date(e.date);
      if (d.getFullYear() !== year) continue;
      const m = d.getMonth();
      const amt = Number(e.amount) || 0;
      const cat = CATEGORIES.includes(e.category) ? e.category : "Other";
      buckets[m][cat] += amt;
      buckets[m].total += amt;
      yearSum += amt;
    }

    const peak = Math.max(
      1,
      ...buckets.map((b) =>
        mode === "total" ? b.total : CATEGORIES.reduce((s, c) => s + b[c], 0)
      )
    );
    return { monthBuckets: buckets, totalYear: yearSum, maxY: peak * 1.1 };
  }, [rows, year, mode]);

  const seriesByCat = useMemo(() => {
    // החזר מערך סדרות, כל סדרה = קטגוריה עם נקודות X/Y
    return CATEGORIES.map((cat) => ({
      cat,
      color: CAT_COLORS[cat],
      data: monthBuckets.map((b) => ({ x: b.label, y: b[cat] })),
    }));
  }, [monthBuckets]);

  const totalSeries = useMemo(
    () => monthBuckets.map((b) => ({ x: b.label, y: b.total })),
    [monthBuckets]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>סיכום הוצאות • {year}</Text>
          <View style={styles.yearControls}>
            <IconButton
              icon="chevron-right"
              onPress={() => setYear((y) => y - 1)}
            />
            <IconButton
              icon="chevron-left"
              onPress={() => setYear((y) => y + 1)}
            />
          </View>
        </View>

        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value)}
          buttons={[
            { value: "stack", label: "לפי קטגוריה" },
            { value: "total", label: "סה״כ חודשי" },
          ]}
          style={styles.modeSelector}
          theme={{
            colors: {
              secondaryContainer: COLORS.primary,
              onSecondaryContainer: COLORS.white,
            },
          }}
        />

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.totalAmount}>
              סה״כ {totalYear.toFixed(2)} ₪
            </Text>
            <Divider style={styles.divider} />
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : rows.length === 0 ? (
              <Text style={styles.noData}>אין נתונים לשנה זו.</Text>
            ) : (
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 18, y: 16 }}
                height={280}
                padding={{ top: 20, bottom: 50, left: 60, right: 20 }}
              >
                <VictoryAxis
                  style={{
                    tickLabels: { fontSize: 10, padding: 6 },
                    axis: { stroke: "#ddd" },
                    grid: { stroke: "transparent" },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => `${Math.round(t)}`}
                  style={{
                    tickLabels: { fontSize: 10, padding: 4 },
                    axis: { stroke: "#ddd" },
                    grid: { stroke: "#eee" },
                  }}
                  domain={[0, maxY]}
                />

                {mode === "total" ? (
                  <VictoryBar
                    data={totalSeries}
                    barRatio={0.8}
                    cornerRadius={{ top: 6 }}
                    style={{ data: { fill: COLORS.primary } }}
                    animate={{ duration: 500 }}
                  />
                ) : (
                  <>
                    <VictoryStack animate={{ duration: 500 }}>
                      {seriesByCat.map((s) => (
                        <VictoryBar
                          key={s.cat}
                          data={s.data}
                          barRatio={0.9}
                          cornerRadius={{ top: 4 }}
                          style={{ data: { fill: s.color } }}
                        />
                      ))}
                    </VictoryStack>
                    <VictoryLegend
                      x={40}
                      y={5}
                      orientation="horizontal"
                      gutter={12}
                      itemsPerRow={3}
                      style={{ labels: { fontSize: 10 } }}
                      data={CATEGORIES.map((c) => ({
                        name: c,
                        symbol: { fill: CAT_COLORS[c] },
                      }))}
                    />
                  </>
                )}
              </VictoryChart>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!err}
        onDismiss={() => setErr("")}
        duration={2500}
        style={styles.snackbar}
      >
        {err}
      </Snackbar>
    </View>
  );
};

export default ExpensesSummaryScreen;
