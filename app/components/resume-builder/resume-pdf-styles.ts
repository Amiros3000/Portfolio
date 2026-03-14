import { StyleSheet } from "@react-pdf/renderer";

const colors = {
  black: "#1a1a1a",
  dark: "#333333",
  medium: "#555555",
  light: "#888888",
  rule: "#cccccc",
};

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.black,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
  },

  /* ── Header ── */
  headerName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 4,
  },
  headerContact: {
    fontSize: 9,
    color: colors.medium,
    textAlign: "center",
    marginBottom: 2,
  },
  headerLinks: {
    fontSize: 9,
    color: colors.medium,
    textAlign: "center",
    marginBottom: 12,
  },
  link: {
    color: colors.dark,
    textDecoration: "none",
  },

  /* ── Sections ── */
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.rule,
  },

  /* ── Summary ── */
  summary: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.5,
    marginBottom: 2,
  },

  /* ── Experience ── */
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  entryCompany: {
    fontSize: 10,
    color: colors.dark,
  },
  entryMeta: {
    fontSize: 9,
    color: colors.light,
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 9,
    color: colors.light,
    textAlign: "right",
    minWidth: 100,
  },
  bulletList: {
    marginTop: 2,
    marginLeft: 8,
  },
  bullet: {
    fontSize: 9.5,
    color: colors.dark,
    lineHeight: 1.45,
    marginBottom: 1.5,
  },

  /* ── Education ── */
  coursesLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginTop: 2,
  },
  courses: {
    fontSize: 9,
    color: colors.medium,
    lineHeight: 1.4,
  },

  /* ── Skills ── */
  skillsText: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.5,
    marginTop: 2,
  },

  /* ── Projects ── */
  projectRow: {
    marginTop: 4,
  },
  projectTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  projectStack: {
    fontSize: 9,
    color: colors.light,
  },
  projectDesc: {
    fontSize: 9.5,
    color: colors.dark,
    lineHeight: 1.4,
    marginTop: 1,
  },
});
