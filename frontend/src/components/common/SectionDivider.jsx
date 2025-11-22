import PropTypes from "prop-types";

const alignmentMap = {
  center: "justify-center",
  left: "justify-start",
  right: "justify-end",
};

const SectionDivider = ({ align = "center", className = "" }) => {
  const alignmentClass = alignmentMap[align] ?? alignmentMap.center;

  return (
    <div className={`w-full mt-4 mb-8 flex ${alignmentClass} ${className}`}>
      <div className="flex items-center gap-3">
        <span className="block h-px w-16 bg-gradient-to-r from-transparent via-primary to-primary/70" />
        <span className="relative flex items-center justify-center w-4 h-4 rounded-full bg-primary shadow-[0_0_18px_rgba(59,130,246,0.6)]" />
        <span className="block h-px w-16 bg-gradient-to-l from-transparent via-secondary to-secondary/70" />
      </div>
    </div>
  );
};

SectionDivider.propTypes = {
  align: PropTypes.oneOf(["left", "center", "right"]),
  className: PropTypes.string,
};

export default SectionDivider;

