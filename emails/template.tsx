import { Button, Html, Head, Body, Preview, Container, Heading, Text, Section } from "@react-email/components";
import * as React from "react";
import type { CSSProperties } from "react";

type EmailData = {
  percentageUsed?: number;
  budgetAmount?: number;
  totalExpenses?: number;
  [key: string]: any; // remove once you know the full shape for both email types
};

type EmailProps = {
  userName?: string;
  type?: "budget-alert" | "monthly-report";
  data?: EmailData;
};

export default function Email({
  userName = "",
  type = "budget-alert",
  data = {},
}: EmailProps) {
  if (type === "monthly-report") {
  }
  if (type === "budget-alert") {
  }

  return (
    <Html>
      <Head />
      <Preview>Budget Alert</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>Budget Alert</Heading>
          <Text style={styles.text}> Hi {userName},</Text>
          <Text style={styles.text}>You have used {data.percentageUsed}% of your monthly Budget</Text>
          <Section style={styles.statsContainer}>
            <div style={styles.stat}>
              <Text style={styles.text}>Budget Amount</Text>
              <Text style={styles.heading}>${data?.budgetAmount}</Text>
            </div>
            <div style={styles.stat}>
              <Text style={styles.text}>Total Expenses</Text>
              <Text style={styles.heading}>${data?.totalExpenses}</Text>
            </div>
            <div style={styles.stat}>
              <Text style={styles.text}>Remaining</Text>
              <Text style={styles.heading}>${(data?.budgetAmount ?? 0) - (data?.totalExpenses ?? 0)}</Text>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "Helvetica, Arial, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px 0",
  },
  heading: {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  stat: {
    marginBottom: "16px",
    padding: "8px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },

}