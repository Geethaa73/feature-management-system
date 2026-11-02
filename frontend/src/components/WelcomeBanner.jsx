import { MdWavingHand } from "react-icons/md";

function WelcomeBanner() {
  return (
    <div
      className="card border-0 shadow-sm mb-4"
      style={{
        background:
          "linear-gradient(135deg, #ECFDF9 0%, #EFF6FF 100%)",
        borderRadius: "16px",
      }}
    >
      <div className="card-body p-4">

        <div className="d-flex align-items-center">

          <div
            className="d-flex align-items-center justify-content-center me-3"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#14B8A6",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            <MdWavingHand size={28} />
          </div>

          <div>
            <h4
              className="mb-1"
              style={{
                color: "#0F172A",
                fontWeight: 700,
              }}
            >
              Welcome to FeatureOps
            </h4>

            <p
              className="mb-0"
              style={{
                color: "#64748B",
              }}
            >
              Manage your feature flags, environments,
              releases, and deployments from one place.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default WelcomeBanner;