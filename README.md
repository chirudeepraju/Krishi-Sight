# Krishi-Sight | APAC Agricultural Plant Pathology & Low-Cost Organic Remedies

Krishi-Sight is an AI-powered agricultural diagnosis platform designed for smallholder farmers across the Asia Pacific (APAC) region. It performs multimodal crop disease and pest identification from leaf photos and voice notes, computes severity ratings (1 to 5), and provides accessible, low-cost organic treatment remedies (e.g., neem oil emulsions, wood ash dusting, fermented buttermilk) alongside safe chemical controls and regional monsoon advisories.

---

## 1. Environment & Prerequisites

Ensure the Google Cloud SDK (`gcloud`) is installed and authenticated:

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your active project ID
gcloud config set project YOUR_PROJECT_ID

# Enable essential Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  generativelanguage.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup (Zero-Hardcoding Hygiene)

Create and bind the `GEMINI_API_KEY` secret within Google Cloud Secret Manager, granting the Cloud Run runtime service account access:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Obtain your Google Cloud Project Number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Cloud Firestore)

Krishi-Sight enforces user data isolation and role-bound access control. Deploy the following security rules to `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Cloud Run Deployment Flow

Build and deploy the unified container service to Google Cloud Run:

```bash
# Build and deploy the full-stack container directly with gcloud
gcloud run deploy krishi-sight \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production"
```

---

## 5. Required Campaign Labeling (Challenge Verification)

Apply the mandatory challenge registration label to your Cloud Run service:

```bash
gcloud run services update krishi-sight \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 6. Architecture & Resilient Model Fallback Ladder

To guarantee uninterrupted service in field conditions, Krishi-Sight implements a multi-tiered resilience protocol:

1. **Primary Model**: `gemini-3.6-flash`
2. **High-Availability Fallback**: `gemini-3.1-flash-lite`
3. **Dynamic Alias**: `gemini-flash-latest`
4. **Deep Reasoning Fallback**: `gemini-3.7-flash`
5. **Offline Agronomic Knowledge Engine**: In the event of service account invalidation (`401 UNAUTHENTICATED`), rate limits (`429`), or upstream service spikes (`503`), the backend engages Krishi-Sight's built-in APAC Agronomic Expert System to ensure smallholder farmers always receive actionable, life-saving crop remedies.
