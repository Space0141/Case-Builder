const sections = [
  "incident_overview",
  "dispatch_call_information",
  "suspect_information",
  "victim_information",
  "witness_statements",
  "evidence_collected",
  "probable_cause",
  "charges",
  "officer_narrative",
  "use_of_force",
  "arrest_details"
];

function cleanHtml(value) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compileReportText(caseData, report, suspects, charges, evidence) {
  const lines = [];
  lines.push(`Case Number: ${caseData.case_number}`);
  lines.push(`Case Title: ${caseData.case_title}`);
  lines.push(`Incident Type: ${caseData.incident_type}`);
  lines.push(`Location: ${caseData.incident_location}`);
  lines.push(`Date/Time: ${new Date(caseData.incident_datetime).toLocaleString()}`);
  lines.push(`Reporting Officer: ${caseData.reporting_officer}`);
  lines.push(`Units Involved: ${caseData.units_involved || "N/A"}`);
  lines.push(`Status: ${caseData.case_status}`);
  lines.push("");

  lines.push("Suspects:");
  if (!suspects.length) {
    lines.push("- None");
  } else {
    for (const suspect of suspects) {
      lines.push(`- ${suspect.full_name} (${suspect.arrest_status})`);
      if (suspect.alias) lines.push(`  Alias: ${suspect.alias}`);
      if (suspect.description) lines.push(`  Description: ${suspect.description}`);
      if (suspect.notes) lines.push(`  Notes: ${suspect.notes}`);
    }
  }
  lines.push("");

  lines.push("Charges:");
  if (!charges.length) {
    lines.push("- None");
  } else {
    for (const charge of charges) {
      lines.push(`- ${charge.charge_title} (${charge.statute_code})`);
      lines.push(`  Suspect: ${charge.suspect_name}`);
      if (charge.statute_text) lines.push(`  Statute: ${charge.statute_text}`);
      if (charge.explanation) lines.push(`  Explanation: ${charge.explanation}`);
    }
  }
  lines.push("");

  lines.push("Evidence:");
  if (!evidence.length) {
    lines.push("- None");
  } else {
    for (const item of evidence) {
      lines.push(`- ${item.evidence_name} (${item.file_type})`);
      if (item.description) lines.push(`  Description: ${item.description}`);
      if (item.suspect_name) lines.push(`  Linked Suspect: ${item.suspect_name}`);
      lines.push(`  Uploaded: ${new Date(item.uploaded_at).toLocaleString()}`);
    }
  }
  lines.push("");

  for (const key of sections) {
    const heading = key
      .split("_")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ");
    lines.push(heading + ":");
    lines.push(cleanHtml(report?.[key] || ""));
    lines.push("");
  }

  return lines.join("\n");
}
