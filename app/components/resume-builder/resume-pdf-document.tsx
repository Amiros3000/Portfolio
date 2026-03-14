"use client";

import { Document, Page, View, Text, Link } from "@react-pdf/renderer";
import type { ResumeContent } from "@/app/lib/resume-content";
import { styles } from "./resume-pdf-styles";

type ResumePdfDocumentProps = {
  content: ResumeContent;
};

function ContactLine({ content }: { content: ResumeContent }) {
  const { email, phone, location } = content.personalInfo;
  const parts = [email, phone, location].filter(Boolean);
  return (
    <Text style={styles.headerContact}>{parts.join("  •  ")}</Text>
  );
}

function LinksLine({ content }: { content: ResumeContent }) {
  const { linkedinUrl, githubUrl, websiteUrl } = content.personalInfo;
  const links: { label: string; url: string }[] = [];

  if (linkedinUrl) {
    const display = linkedinUrl.replace(/^https?:\/\/(www\.)?/, "");
    links.push({ label: display, url: linkedinUrl });
  }
  if (githubUrl) {
    const display = githubUrl.replace(/^https?:\/\/(www\.)?/, "");
    links.push({ label: display, url: githubUrl });
  }
  if (websiteUrl) {
    const display = websiteUrl.replace(/^https?:\/\/(www\.)?/, "");
    links.push({ label: display, url: websiteUrl });
  }

  if (links.length === 0) return null;

  return (
    <Text style={styles.headerLinks}>
      {links.map((link, i) => (
        <Text key={link.url}>
          {i > 0 && "  •  "}
          <Link src={link.url} style={styles.link}>
            {link.label}
          </Link>
        </Text>
      ))}
    </Text>
  );
}

function SummarySection({ content }: { content: ResumeContent }) {
  if (!content.summary) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={styles.summary}>{content.summary}</Text>
    </View>
  );
}

function ExperienceSection({ content }: { content: ResumeContent }) {
  if (content.experience.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Experience</Text>
      {content.experience.map((entry, i) => (
        <View key={`${entry.company}-${entry.title}-${i}`}>
          <View style={styles.entryRow}>
            <View style={{ flex: 1 }}>
              <Text>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryCompany}>
                  {"  —  "}
                  {entry.company}
                </Text>
              </Text>
              <Text style={styles.entryMeta}>{entry.location}</Text>
            </View>
            <Text style={styles.entryDate}>
              {entry.startDate} – {entry.endDate}
            </Text>
          </View>
          <View style={styles.bulletList}>
            {entry.bullets.map((bullet, j) => (
              <Text key={j} style={styles.bullet}>
                •{"  "}
                {bullet}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function EducationSection({ content }: { content: ResumeContent }) {
  if (content.education.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Education</Text>
      {content.education.map((entry, i) => (
        <View key={`${entry.institution}-${i}`}>
          <View style={styles.entryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryTitle}>{entry.degree}</Text>
              <Text style={styles.entryMeta}>
                {entry.institution}
                {entry.location ? `, ${entry.location}` : ""}
                {entry.gpa ? `  •  GPA: ${entry.gpa}` : ""}
              </Text>
            </View>
            <Text style={styles.entryDate}>{entry.graduationDate}</Text>
          </View>
          {entry.relevantCourses.length > 0 && (
            <View style={{ marginTop: 2, marginLeft: 8 }}>
              <Text style={styles.courses}>
                <Text style={styles.coursesLabel}>Courses: </Text>
                {entry.relevantCourses.join(", ")}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ content }: { content: ResumeContent }) {
  if (content.skills.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Technical Skills</Text>
      <Text style={styles.skillsText}>{content.skills.join("  •  ")}</Text>
    </View>
  );
}

function ProjectsSection({ content }: { content: ResumeContent }) {
  if (content.projects.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Projects</Text>
      {content.projects.map((proj, i) => (
        <View key={`${proj.title}-${i}`} style={styles.projectRow}>
          <Text>
            <Text style={styles.projectTitle}>{proj.title}</Text>
            {proj.stack && (
              <Text style={styles.projectStack}>
                {"  ("}
                {proj.stack}
                {")"}
              </Text>
            )}
          </Text>
          <Text style={styles.projectDesc}>{proj.description}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ResumePdfDocument({ content }: ResumePdfDocumentProps) {
  return (
    <Document title={`${content.personalInfo.fullName} — Resume`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.headerName}>{content.personalInfo.fullName}</Text>
        <ContactLine content={content} />
        <LinksLine content={content} />

        {/* Sections */}
        <SummarySection content={content} />
        <ExperienceSection content={content} />
        <EducationSection content={content} />
        <SkillsSection content={content} />
        <ProjectsSection content={content} />
      </Page>
    </Document>
  );
}
