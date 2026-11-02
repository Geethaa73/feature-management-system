import "../styles/sdk.css";
import {
  MdCode,
  MdContentCopy,
  MdCheckCircle,
  MdSettings,
  MdSecurity,
  MdCached,
  MdFlashOn,
  MdApi,
  MdIntegrationInstructions,
} from "react-icons/md";

import { useState } from "react";

function SDK() {
  const [copied, setCopied] = useState("");

  const copyCode = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (error) {
      console.error("Unable to copy code:", error);
    }
  };

  const installCode = "pip install feature-flag-sdk";

  const pythonCode = `from feature_flag_sdk import FeatureFlagClient

client = FeatureFlagClient()

enabled = client.is_enabled(
    "new_dashboard",
    user_id="user_101"
)

print(enabled)`;

  const configCode = `FLAG_API_URL=http://127.0.0.1:8001
API_KEY=your-featureops-api-key
CACHE_TTL=300
FLAG_ENVIRONMENT=Production`;

  const fastapiCode = `from fastapi import FastAPI, Request
from feature_flag_sdk import FeatureFlagMiddleware

app = FastAPI()

app.add_middleware(
    FeatureFlagMiddleware
)

@app.get("/dashboard")
def dashboard(request: Request):

    enabled = request.state.flag_client.is_enabled(
        "new_dashboard",
        user_id="user_101"
    )

    return {
        "feature": "new_dashboard",
        "enabled": enabled
    }`;

  const djangoCode = `# settings.py

MIDDLEWARE = [
    ...
    "feature_flag_sdk.middleware.DjangoFeatureFlagMiddleware",
]

# views.py

def dashboard_view(request):

    enabled = request.flag_client.is_enabled(
        "new_dashboard",
        user_id="user_101"
    )

    return {
        "feature": "new_dashboard",
        "enabled": enabled
    }`;

  const copyButton = (code, id) => (
    <button
      className="sdk-copy-button"
      onClick={() => copyCode(code, id)}
    >
      {copied === id ? (
        <>
          <MdCheckCircle />
          Copied
        </>
      ) : (
        <>
          <MdContentCopy />
          Copy
        </>
      )}
    </button>
  );

  return (
    <div className="sdk-page">

      {/* HEADER */}

      <div className="sdk-hero">
        <div className="sdk-hero-icon">
          <MdCode />
        </div>

        <div>
          <div className="sdk-eyebrow">
            DEVELOPER INTEGRATION
          </div>

          <h1>
            FeatureOps Python SDK
          </h1>

          <p>
            Integrate FeatureOps feature flags directly
            into your Python applications.
          </p>
        </div>
      </div>


      {/* QUICK OVERVIEW */}

      <div className="sdk-card-grid">

        <div className="sdk-info-card">
          <MdApi />

          <h3>
            Simple API
          </h3>

          <p>
            Evaluate feature flags with a single
            <code> is_enabled() </code>
            call.
          </p>
        </div>


        <div className="sdk-info-card">
          <MdCached />

          <h3>
            Local Cache
          </h3>

          <p>
            Temporary local caching reduces repeated
            API requests.
          </p>
        </div>


        <div className="sdk-info-card">
          <MdSecurity />

          <h3>
            API Key
          </h3>

          <p>
            Secure SDK requests using FeatureOps
            API-key authentication.
          </p>
        </div>


        <div className="sdk-info-card">
          <MdFlashOn />

          <h3>
            Fallback
          </h3>

          <p>
            Applications continue safely when the
            FeatureOps API is unavailable.
          </p>
        </div>

      </div>


      {/* INSTALLATION */}

      <section className="sdk-section">

        <div className="sdk-section-header">
          <MdIntegrationInstructions />

          <div>
            <h2>
              Installation
            </h2>

            <p>
              Install the FeatureOps Python SDK using pip.
            </p>
          </div>
        </div>


        <div className="sdk-code-block">

          <div className="sdk-code-header">
            <span>
              Terminal
            </span>

            {copyButton(
              installCode,
              "installation"
            )}
          </div>

          <pre>
            <code>
              {installCode}
            </code>
          </pre>

        </div>

      </section>


      {/* CONFIGURATION */}

      <section className="sdk-section">

        <div className="sdk-section-header">
          <MdSettings />

          <div>
            <h2>
              Configuration
            </h2>

            <p>
              Configure the SDK through environment
              variables.
            </p>
          </div>
        </div>


        <div className="sdk-config-grid">

          <div className="sdk-config-item">
            <strong>
              FLAG_API_URL
            </strong>

            <span>
              FeatureOps API endpoint.
            </span>
          </div>


          <div className="sdk-config-item">
            <strong>
              API_KEY
            </strong>

            <span>
              Authentication key for SDK requests.
            </span>
          </div>


          <div className="sdk-config-item">
            <strong>
              CACHE_TTL
            </strong>

            <span>
              Local cache lifetime in seconds.
            </span>
          </div>


          <div className="sdk-config-item">
            <strong>
              FLAG_ENVIRONMENT
            </strong>

            <span>
              Environment used for evaluation.
            </span>
          </div>

        </div>


        <div className="sdk-code-block">

          <div className="sdk-code-header">
            <span>
              .env
            </span>

            {copyButton(
              configCode,
              "configuration"
            )}
          </div>

          <pre>
            <code>
              {configCode}
            </code>
          </pre>

        </div>

      </section>


      {/* QUICK START */}

      <section className="sdk-section">

        <div className="sdk-section-header">
          <MdCode />

          <div>
            <h2>
              Quick Start
            </h2>

            <p>
              Create a client and evaluate a feature flag.
            </p>
          </div>
        </div>


        <div className="sdk-code-block">

          <div className="sdk-code-header">
            <span>
              Python
            </span>

            {copyButton(
              pythonCode,
              "python"
            )}
          </div>

          <pre>
            <code>
              {pythonCode}
            </code>
          </pre>

        </div>

      </section>


      {/* FASTAPI */}

      <section className="sdk-section">

        <div className="sdk-section-header">

          <div className="sdk-framework-badge">
            FastAPI
          </div>

          <div>
            <h2>
              FastAPI Integration
            </h2>

            <p>
              Attach the FeatureOps client automatically
              to every request.
            </p>
          </div>

        </div>


        <div className="sdk-code-block">

          <div className="sdk-code-header">
            <span>
              Python
            </span>

            {copyButton(
              fastapiCode,
              "fastapi"
            )}
          </div>

          <pre>
            <code>
              {fastapiCode}
            </code>
          </pre>

        </div>

      </section>


      {/* DJANGO */}

      <section className="sdk-section">

        <div className="sdk-section-header">

          <div className="sdk-framework-badge">
            Django
          </div>

          <div>
            <h2>
              Django Integration
            </h2>

            <p>
              Add the middleware to Django and access
              the client through the request.
            </p>
          </div>

        </div>


        <div className="sdk-code-block">

          <div className="sdk-code-header">
            <span>
              Python
            </span>

            {copyButton(
              djangoCode,
              "django"
            )}
          </div>

          <pre>
            <code>
              {djangoCode}
            </code>
          </pre>

        </div>

      </section>


      {/* CACHE + FALLBACK */}

      <section className="sdk-section">

        <div className="sdk-section-header">

          <MdCached />

          <div>
            <h2>
              Caching & Fallback
            </h2>

            <p>
              The SDK is designed to avoid unnecessary
              failures when the FeatureOps API is unavailable.
            </p>
          </div>

        </div>


        <div className="sdk-flow">

          <div className="sdk-flow-step">
            <span>
              1
            </span>

            <strong>
              Local Cache
            </strong>

            <small>
              Check for a valid cached evaluation.
            </small>
          </div>


          <div className="sdk-flow-arrow">
            →
          </div>


          <div className="sdk-flow-step">
            <span>
              2
            </span>

            <strong>
              FeatureOps API
            </strong>

            <small>
              Request a fresh evaluation.
            </small>
          </div>


          <div className="sdk-flow-arrow">
            →
          </div>


          <div className="sdk-flow-step">
            <span>
              3
            </span>

            <strong>
              Cache Result
            </strong>

            <small>
              Store the temporary evaluation.
            </small>
          </div>


          <div className="sdk-flow-arrow">
            →
          </div>


          <div className="sdk-flow-step">
            <span>
              4
            </span>

            <strong>
              Safe Fallback
            </strong>

            <small>
              Return the configured default if unavailable.
            </small>
          </div>

        </div>

      </section>


      {/* ARCHITECTURE */}

      <section className="sdk-section">

        <div className="sdk-section-header">

          <MdApi />

          <div>
            <h2>
              SDK Architecture
            </h2>

            <p>
              How an application communicates with FeatureOps.
            </p>
          </div>

        </div>


        <div className="sdk-architecture">

          <div className="sdk-architecture-box">
            <strong>
              Your Application
            </strong>

            <span>
              FastAPI / Django
            </span>
          </div>


          <div className="sdk-architecture-line">
            →
          </div>


          <div className="sdk-architecture-box">
            <strong>
              FeatureFlagClient
            </strong>

            <span>
              SDK
            </span>
          </div>


          <div className="sdk-architecture-line">
            →
          </div>


          <div className="sdk-architecture-box">
            <strong>
              FeatureOps API
            </strong>

            <span>
              /flags/evaluate
            </span>
          </div>

        </div>

      </section>


      {/* STATUS */}

      <section className="sdk-complete">

        <MdCheckCircle />

        <div>
          <strong>
            SDK Integration Ready
          </strong>

          <span>
            FeatureOps can now be integrated into
            external Python applications.
          </span>
        </div>

      </section>

    </div>
  );
}

export default SDK;