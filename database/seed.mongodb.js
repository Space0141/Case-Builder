import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: "backend/.env" });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "case_builder";

if (!uri) {
  console.error("Missing MONGODB_URI in backend/.env");
  process.exit(1);
}

const client = new MongoClient(uri);

function makeCaseNumber(sequence) {
  const year = new Date().getFullYear();
  return `CB-${year}-${String(sequence).padStart(6, "0")}`;
}

async function run() {
  await client.connect();
  const db = client.db(dbName);

  const users = db.collection("users");
  const cases = db.collection("cases");
  const reports = db.collection("reports");
  const suspects = db.collection("suspects");
  const charges = db.collection("charges");
  const timeline = db.collection("timeline_events");
  const settings = db.collection("system_settings");
  const counters = db.collection("counters");

  const now = new Date();

  await users.updateOne(
    { discord_id: "100000000000000003" },
    {
      $set: {
        username: "PatrolOfficer01",
        role: "Officer",
        discord_roles: ["Officer"],
        updated_at: now
      },
      $setOnInsert: { created_at: now }
    },
    { upsert: true }
  );

  const officer = await users.findOne({ discord_id: "100000000000000003" });

  const existingCase = await cases.findOne({ case_title: "Armed Robbery - North Transit Station" });
  if (!existingCase) {
    const seq = (await counters.findOneAndUpdate(
      { _id: "caseSequence" },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "after" }
    )).value?.value || 1;

    const caseInsert = await cases.insertOne({
      case_number: makeCaseNumber(seq),
      case_title: "Armed Robbery - North Transit Station",
      incident_type: "Robbery",
      incident_location: "North Transit Station, Sector 7",
      incident_datetime: now,
      reporting_officer: "Officer A. Delgado",
      units_involved: "Unit 12, Unit 19, K9-4",
      case_status: "Under Investigation",
      created_by: officer._id.toString(),
      created_at: now,
      updated_at: now
    });

    const caseId = caseInsert.insertedId.toString();

    await reports.insertOne({
      case_id: caseId,
      incident_overview: "<p>Units responded to an armed robbery in progress.</p>",
      dispatch_call_information: "<p>911 caller reported a masked suspect with a handgun.</p>",
      suspect_information: "",
      victim_information: "",
      witness_statements: "",
      evidence_collected: "",
      probable_cause: "<p>Video surveillance and witness IDs place suspect at scene.</p>",
      charges: "",
      officer_narrative: "<p>Officers established perimeter and canvassed witnesses.</p>",
      use_of_force: "",
      arrest_details: "",
      updated_by: officer._id.toString(),
      updated_at: now
    });

    const suspectInsert = await suspects.insertOne({
      case_id: caseId,
      full_name: "Darius Cole",
      alias: "D-Cole",
      description: "Male, approx 6'1, black hoodie, forearm tattoo",
      arrest_status: "Arrested",
      notes: "Detained after traffic stop near east bridge",
      created_at: now
    });

    await charges.insertOne({
      case_id: caseId,
      suspect_id: suspectInsert.insertedId.toString(),
      statute_code: "TX-29.02",
      charge_title: "Robbery",
      statute_text: "A person commits robbery if ...",
      explanation: "Suspect threatened victim with firearm while taking property.",
      created_at: now
    });

    await timeline.insertMany([
      { case_id: caseId, event_type: "Dispatch received", details: "Initial emergency call logged in CAD", created_at: now },
      { case_id: caseId, event_type: "Officer arrival", details: "Unit 12 arrived on scene within 4 minutes", created_at: new Date(now.getTime() + 60000) },
      { case_id: caseId, event_type: "Evidence collected", details: "Shell casings and CCTV footage secured", created_at: new Date(now.getTime() + 120000) }
    ]);
  }

  await settings.updateOne(
    { key: "department_name" },
    { $set: { key: "department_name", value: "Case Builder PD", updated_at: now } },
    { upsert: true }
  );

  console.log("Mongo seed complete");
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });
