import "./../styles/statcard.css";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  iconColor,
}) {
  return (
    <div className="stat-card">

      <div
        className="stat-icon"
        style={{
          background: color,
          color: iconColor || "#ffffff",
        }}
      >
        {icon}
      </div>

      <h2>
        {value}
      </h2>

      <h5>
        {title}
      </h5>

      <p>
        {subtitle}
      </p>

      <div className="stat-footer">
        <span>
          ● Live
        </span>
      </div>

    </div>
  );
}

export default StatCard;